#!/usr/bin/env bun
/**
 * 02-consolidate-local.ts
 * Consolidates local Penny-Stocks-Market-Data cache with remote API data
 * Merges all sources into unified data files
 */

import { mkdir } from 'node:fs/promises';
import { LocalCacheReader } from './lib/api-clients';
import { getEntitiesWithMarketData, getCurrentName } from './lib/entity-config';
import type { RawTradeRecord, RawDataFile, DataSource } from './lib/data-types';

const CACHE_DIR = '.cache';
const CONSOLIDATED_DIR = `${CACHE_DIR}/consolidated`;

interface ConsolidatedData {
	cik: string;
	ticker: string;
	company: string;
	records: RawTradeRecord[];
	sources: DataSource[];
	dateRange: {
		start: string;
		end: string;
	};
	consolidatedAt: string;
}

async function ensureDirectories(): Promise<void> {
	await mkdir(CONSOLIDATED_DIR, { recursive: true });
}

async function loadRemoteCache(cik: string, ticker: string): Promise<RawTradeRecord[]> {
	const records: RawTradeRecord[] = [];

	// Load Yahoo Finance daily data (best coverage for active tickers)
	try {
		const yahooFile = Bun.file(`${CACHE_DIR}/yahoo-finance/${cik}-${ticker}-daily.json`);
		if (await yahooFile.exists()) {
			const data = (await yahooFile.json()) as RawDataFile;
			records.push(...data.records);
			console.log(`  [Remote] Loaded ${data.records.length} Yahoo Finance daily records`);
		}
	} catch {
		// File not found, continue
	}

	// Load Alpha Vantage daily data
	try {
		const dailyFile = Bun.file(`${CACHE_DIR}/alpha-vantage/${cik}-${ticker}-daily.json`);
		if (await dailyFile.exists()) {
			const data = (await dailyFile.json()) as RawDataFile;
			records.push(...data.records);
			console.log(`  [Remote] Loaded ${data.records.length} Alpha Vantage daily records`);
		}
	} catch {
		// File not found, continue
	}

	// Load Alpha Vantage intraday data
	try {
		const glob = new Bun.Glob(`${CACHE_DIR}/alpha-vantage/${cik}-${ticker}-intraday-*.json`);
		for await (const filePath of glob.scan('.')) {
			const file = Bun.file(filePath);
			const data = (await file.json()) as RawDataFile;
			records.push(...data.records);
			console.log(`  [Remote] Loaded ${data.records.length} records from ${filePath}`);
		}
	} catch {
		// No intraday files
	}

	return records;
}

async function consolidateEntity(
	cik: string,
	ticker: string,
	years: number[],
	companyName: string
): Promise<ConsolidatedData | null> {
	console.log(`\nConsolidating ${ticker} (${cik})...`);

	const allRecords: RawTradeRecord[] = [];
	const sources = new Set<DataSource>();

	// Load local cache data
	const localReader = new LocalCacheReader();
	for (const year of years) {
		const localRecords = await localReader.readEntityCSV(ticker, year);
		if (localRecords.length > 0) {
			allRecords.push(...localRecords);
			sources.add('local-cache');
		}
	}

	// Load remote API data
	const remoteRecords = await loadRemoteCache(cik, ticker);
	if (remoteRecords.length > 0) {
		allRecords.push(...remoteRecords);
		for (const record of remoteRecords) {
			sources.add(record.source);
		}
	}

	if (allRecords.length === 0) {
		console.log(`  No data found for ${ticker}`);
		return null;
	}

	// Sort by datetime
	allRecords.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

	// Deduplicate records (same datetime, keep the one with most data)
	const deduped = deduplicateRecords(allRecords);

	// Calculate date range
	const dates = deduped.map((r) => r.datetime.split(' ')[0]);
	const uniqueDates = [...new Set(dates)].sort();

	console.log(`  Total records: ${allRecords.length} -> ${deduped.length} (after dedup)`);
	console.log(`  Date range: ${uniqueDates[0]} to ${uniqueDates[uniqueDates.length - 1]}`);
	console.log(`  Sources: ${[...sources].join(', ')}`);

	return {
		cik,
		ticker,
		company: companyName,
		records: deduped,
		sources: [...sources],
		dateRange: {
			start: uniqueDates[0],
			end: uniqueDates[uniqueDates.length - 1]
		},
		consolidatedAt: new Date().toISOString()
	};
}

function deduplicateRecords(records: RawTradeRecord[]): RawTradeRecord[] {
	const byDatetime = new Map<string, RawTradeRecord>();

	for (const record of records) {
		const key = record.datetime;
		const existing = byDatetime.get(key);

		if (!existing) {
			byDatetime.set(key, record);
		} else {
			// Keep the record with more data (volume > 0, has bid/ask, etc.)
			const existingScore = scoreRecord(existing);
			const newScore = scoreRecord(record);

			if (newScore > existingScore) {
				// Merge sources
				const mergedRecord: RawTradeRecord = {
					...record,
					source: record.source // Primary source
				};
				byDatetime.set(key, mergedRecord);
			}
		}
	}

	return [...byDatetime.values()];
}

function scoreRecord(record: RawTradeRecord): number {
	let score = 0;
	if (record.volume > 0) score += 2;
	if (record.price > 0) score += 1;
	if (record.bid && record.bid > 0) score += 1;
	if (record.ask && record.ask > 0) score += 1;
	// Prefer local cache (more complete for penny stocks)
	if (record.source === 'local-cache') score += 1;
	return score;
}

async function main(): Promise<void> {
	console.log('========================================');
	console.log('02-consolidate-local.ts - Data Consolidation');
	console.log('========================================');
	console.log(`Started: ${new Date().toISOString()}`);

	await ensureDirectories();

	const entities = getEntitiesWithMarketData();

	// Define year ranges for each entity based on known data availability
	// Note: GLXZ includes 2012 due to Yahoo Finance coverage
	const entityYears: Record<string, number[]> = {
		CIK0000878146: [2008, 2009, 2010], // LGAL
		CIK0000013156: [2009, 2010, 2011, 2012], // GLXZ - extended with Yahoo Finance
		CIK0001059577: [2008], // DAVN
		CIK0001543098: [2008, 2009, 2010, 2011], // FFSL
		CIK0001487659: [2011] // SNPD
	};

	const consolidated: ConsolidatedData[] = [];

	for (const entity of entities) {
		const years = entityYears[entity.cik] ?? [];
		const companyName = getCurrentName(entity);

		for (const ticker of entity.tickers) {
			const data = await consolidateEntity(entity.cik, ticker.symbol, years, companyName);

			if (data) {
				consolidated.push(data);

				// Save consolidated file
				const outputPath = `${CONSOLIDATED_DIR}/${entity.cik}-${ticker.symbol}.json`;
				await Bun.write(outputPath, JSON.stringify(data, null, 2));
				console.log(`  Saved to ${outputPath}`);
			}
		}
	}

	// Save summary
	const summary = {
		entities: consolidated.map((c) => ({
			cik: c.cik,
			ticker: c.ticker,
			company: c.company,
			records: c.records.length,
			dateRange: c.dateRange,
			sources: c.sources
		})),
		totalRecords: consolidated.reduce((sum, c) => sum + c.records.length, 0),
		consolidatedAt: new Date().toISOString()
	};

	await Bun.write(`${CONSOLIDATED_DIR}/summary.json`, JSON.stringify(summary, null, 2));

	console.log('\n========================================');
	console.log('Consolidation complete!');
	console.log(`Total entities: ${consolidated.length}`);
	console.log(`Total records: ${summary.totalRecords}`);
	console.log(`Finished: ${new Date().toISOString()}`);
	console.log('========================================\n');
}

main().catch(console.error);
