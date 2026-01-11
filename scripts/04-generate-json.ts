#!/usr/bin/env bun
/**
 * 04-generate-json.ts
 * Generates final static JSON and CSV files for the website
 * Outputs to static/json/ and static/csv/
 */

import { mkdir } from 'node:fs/promises';
import { getEntitiesWithMarketData, getCurrentName, ENTITIES } from './lib/entity-config';
import type {
	EntityStockData,
	EntitySummary,
	AllEntitiesSummary,
	DailyOHLCV,
	PeriodMetrics,
	DataSource,
	SECFiling
} from './lib/data-types';

const CACHE_DIR = '.cache';
const NORMALIZED_DIR = `${CACHE_DIR}/normalized`;
const OUTPUT_JSON_DIR = 'static/json';
const OUTPUT_CSV_DIR = 'static/csv';

interface NormalizedEntityData {
	cik: string;
	ticker: string;
	company: string;
	period: {
		start: string;
		end: string;
	};
	metrics: PeriodMetrics;
	dailyData: DailyOHLCV[];
	sources: DataSource[];
}

interface EntityFilingsData {
	cik: string;
	filings: SECFiling[];
}

async function ensureDirectories(): Promise<void> {
	await mkdir(OUTPUT_JSON_DIR, { recursive: true });
	await mkdir(`${OUTPUT_JSON_DIR}/entities`, { recursive: true });
	await mkdir(OUTPUT_CSV_DIR, { recursive: true });
}

async function loadNormalizedData(cik: string, ticker: string): Promise<NormalizedEntityData | null> {
	const filePath = `${NORMALIZED_DIR}/${cik}-${ticker}.json`;
	const file = Bun.file(filePath);

	if (!(await file.exists())) {
		return null;
	}

	return (await file.json()) as NormalizedEntityData;
}

async function loadSECFilings(cik: string): Promise<SECFiling[]> {
	const filePath = `${CACHE_DIR}/sec-edgar/${cik}-filings.json`;
	const file = Bun.file(filePath);

	if (!(await file.exists())) {
		return [];
	}

	const data = (await file.json()) as EntityFilingsData;
	return data.filings ?? [];
}

function generateCSV(dailyData: DailyOHLCV[]): string {
	const headers = ['date', 'open', 'high', 'low', 'close', 'volume', 'dollar_volume', 'trade_count', 'sources'];
	const rows = dailyData.map((d) => [
		d.date,
		d.open.toFixed(6),
		d.high.toFixed(6),
		d.low.toFixed(6),
		d.close.toFixed(6),
		d.volume.toString(),
		d.dollarVolume.toFixed(2),
		d.tradeCount.toString(),
		d.sources.join(';')
	]);

	return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

async function generateEntityFiles(): Promise<EntitySummary[]> {
	const summaries: EntitySummary[] = [];
	const entities = getEntitiesWithMarketData();

	for (const entity of entities) {
		console.log(`\nGenerating files for ${entity.cik}...`);

		const periods: EntitySummary['periods'] = [];

		for (const ticker of entity.tickers) {
			const data = await loadNormalizedData(entity.cik, ticker.symbol);

			if (!data) {
				console.log(`  No data for ${ticker.symbol}`);
				continue;
			}

			console.log(`  ${ticker.symbol}: ${data.dailyData.length} days`);

			// Calculate period years for filename
			const startYear = new Date(data.period.start).getFullYear();
			const endYear = new Date(data.period.end).getFullYear();
			const fileName = `${entity.cik}-${ticker.symbol}-${startYear}-${endYear}`;

			// Load SEC filings
			const filings = await loadSECFilings(entity.cik);

			// Filter filings to this period
			const periodFilings = filings.filter((f) => {
				const filingDate = f.filingDate;
				return filingDate >= data.period.start && filingDate <= data.period.end;
			});

			// Generate entity stock data
			const stockData: EntityStockData = {
				cik: entity.cik,
				ticker: ticker.symbol,
				company: data.company,
				period: data.period,
				exchange: ticker.exchange,
				metrics: data.metrics,
				dailyData: data.dailyData,
				sources: data.sources,
				generatedAt: new Date().toISOString()
			};

			// Save JSON
			const jsonPath = `${OUTPUT_JSON_DIR}/entities/${fileName}.json`;
			await Bun.write(jsonPath, JSON.stringify(stockData, null, 2));
			console.log(`  Saved ${jsonPath}`);

			// Save CSV
			const csvPath = `${OUTPUT_CSV_DIR}/${fileName}.csv`;
			await Bun.write(csvPath, generateCSV(data.dailyData));
			console.log(`  Saved ${csvPath}`);

			// Save SEC filings for this entity
			if (filings.length > 0) {
				const filingsPath = `${OUTPUT_JSON_DIR}/entities/${entity.cik}-filings.json`;
				await Bun.write(
					filingsPath,
					JSON.stringify(
						{
							cik: entity.cik,
							company: data.company,
							filings,
							generatedAt: new Date().toISOString()
						},
						null,
						2
					)
				);
				console.log(`  Saved ${filingsPath} (${filings.length} filings)`);
			}

			periods.push({
				ticker: ticker.symbol,
				start: data.period.start,
				end: data.period.end,
				tradingDays: data.metrics.tradingDays,
				peakPrice: data.metrics.peakPrice,
				totalVolume: data.metrics.totalVolume
			});
		}

		summaries.push({
			cik: entity.cik,
			ticker: entity.primaryTicker,
			company: getCurrentName(entity),
			periods,
			hasData: periods.length > 0
		});
	}

	// Also add entities without market data (for completeness)
	for (const entity of ENTITIES) {
		if (!summaries.find((s) => s.cik === entity.cik)) {
			// Load SEC filings even if no market data
			const filings = await loadSECFilings(entity.cik);
			if (filings.length > 0) {
				const filingsPath = `${OUTPUT_JSON_DIR}/entities/${entity.cik}-filings.json`;
				await Bun.write(
					filingsPath,
					JSON.stringify(
						{
							cik: entity.cik,
							company: getCurrentName(entity),
							filings,
							generatedAt: new Date().toISOString()
						},
						null,
						2
					)
				);
				console.log(`  Saved ${filingsPath} (${filings.length} filings, no market data)`);
			}

			summaries.push({
				cik: entity.cik,
				ticker: entity.primaryTicker,
				company: getCurrentName(entity),
				periods: [],
				hasData: false
			});
		}
	}

	return summaries;
}

async function generateMasterSummary(entities: EntitySummary[]): Promise<void> {
	// Calculate totals
	let totalRecords = 0;
	let earliest = '9999-12-31';
	let latest = '0000-01-01';

	for (const entity of entities) {
		for (const period of entity.periods) {
			totalRecords += period.tradingDays;
			if (period.start < earliest) earliest = period.start;
			if (period.end > latest) latest = period.end;
		}
	}

	const summary: AllEntitiesSummary = {
		entities,
		totalRecords,
		dateRange: {
			earliest: earliest !== '9999-12-31' ? earliest : '',
			latest: latest !== '0000-01-01' ? latest : ''
		},
		generatedAt: new Date().toISOString()
	};

	await Bun.write(`${OUTPUT_JSON_DIR}/entities-summary.json`, JSON.stringify(summary, null, 2));
	console.log(`\nSaved master summary: ${OUTPUT_JSON_DIR}/entities-summary.json`);
}

async function main(): Promise<void> {
	console.log('========================================');
	console.log('04-generate-json.ts - Static File Generation');
	console.log('========================================');
	console.log(`Started: ${new Date().toISOString()}`);

	await ensureDirectories();

	const entities = await generateEntityFiles();
	await generateMasterSummary(entities);

	// Print summary
	console.log('\n========================================');
	console.log('Generation complete!');
	console.log('========================================');

	const withData = entities.filter((e) => e.hasData);
	const withoutData = entities.filter((e) => !e.hasData);

	console.log(`\nEntities with market data (${withData.length}):`);
	for (const entity of withData) {
		const totalDays = entity.periods.reduce((sum, p) => sum + p.tradingDays, 0);
		console.log(`  ${entity.cik} (${entity.ticker}): ${totalDays} trading days`);
	}

	console.log(`\nEntities without market data (${withoutData.length}):`);
	for (const entity of withoutData) {
		console.log(`  ${entity.cik} (${entity.ticker}): ${entity.company}`);
	}

	console.log(`\nOutput directories:`);
	console.log(`  JSON: ${OUTPUT_JSON_DIR}/`);
	console.log(`  CSV: ${OUTPUT_CSV_DIR}/`);
	console.log(`\nFinished: ${new Date().toISOString()}`);
}

main().catch(console.error);
