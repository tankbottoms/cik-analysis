#!/usr/bin/env bun
/**
 * 01-fetch-remote.ts
 * Fetches stock data from remote APIs (Alpha Vantage, SEC EDGAR)
 * Saves raw data to .cache/ directory
 */

import { mkdir } from 'node:fs/promises';
import { AlphaVantageClient, SECEdgarClient, YahooFinanceClient } from './lib/api-clients';
import { getEntitiesWithMarketData, ENTITIES } from './lib/entity-config';
import type { RawDataFile, EntityFilings } from './lib/data-types';

const CACHE_DIR = '.cache';
const SKIP_ALPHA_VANTAGE = process.argv.includes('--skip-av');
const SKIP_SEC = process.argv.includes('--skip-sec');
const SKIP_YAHOO = process.argv.includes('--skip-yahoo');

async function ensureCacheDir(): Promise<void> {
	await mkdir(CACHE_DIR, { recursive: true });
	await mkdir(`${CACHE_DIR}/alpha-vantage`, { recursive: true });
	await mkdir(`${CACHE_DIR}/sec-edgar`, { recursive: true });
	await mkdir(`${CACHE_DIR}/yahoo-finance`, { recursive: true });
}

async function fetchAlphaVantageData(): Promise<void> {
	if (SKIP_ALPHA_VANTAGE) {
		console.log('\n[Skip] Alpha Vantage fetching disabled via --skip-av flag\n');
		return;
	}

	console.log('\n========================================');
	console.log('Fetching Alpha Vantage Data');
	console.log('========================================\n');

	const client = new AlphaVantageClient();
	const entities = getEntitiesWithMarketData();

	for (const entity of entities) {
		for (const ticker of entity.tickers) {
			console.log(`\nProcessing ${ticker.symbol} (${entity.cik})...`);

			// Fetch daily data
			const dailyRecords = await client.getDailyTimeSeries(ticker.symbol, 'full');

			if (dailyRecords.length > 0) {
				const outputFile: RawDataFile = {
					cik: entity.cik,
					ticker: ticker.symbol,
					year: 0, // All years
					source: 'alpha-vantage',
					filePath: `${CACHE_DIR}/alpha-vantage/${entity.cik}-${ticker.symbol}-daily.json`,
					records: dailyRecords,
					fetchedAt: new Date().toISOString()
				};

				await Bun.write(outputFile.filePath, JSON.stringify(outputFile, null, 2));
				console.log(`  Saved ${dailyRecords.length} records to ${outputFile.filePath}`);
			}

			// For penny stocks, also try historical intraday if ticker was active in our date range
			const startYear = new Date(ticker.startDate).getFullYear();
			const endYear = ticker.endDate
				? new Date(ticker.endDate).getFullYear()
				: new Date().getFullYear();

			// Only fetch a sample of historical months (rate limits are strict)
			// For full history, we rely on local cache
			const sampleMonths = [`${startYear}-01`, `${endYear}-01`];

			for (const month of sampleMonths) {
				if (new Date(month) > new Date()) continue;

				const intradayRecords = await client.getIntradayForMonth(ticker.symbol, month);

				if (intradayRecords.length > 0) {
					const outputFile: RawDataFile = {
						cik: entity.cik,
						ticker: ticker.symbol,
						year: parseInt(month.split('-')[0], 10),
						source: 'alpha-vantage',
						filePath: `${CACHE_DIR}/alpha-vantage/${entity.cik}-${ticker.symbol}-intraday-${month}.json`,
						records: intradayRecords,
						fetchedAt: new Date().toISOString()
					};

					await Bun.write(outputFile.filePath, JSON.stringify(outputFile, null, 2));
					console.log(`  Saved ${intradayRecords.length} intraday records to ${outputFile.filePath}`);
				}
			}
		}
	}
}

async function fetchSECFilings(): Promise<void> {
	if (SKIP_SEC) {
		console.log('\n[Skip] SEC EDGAR fetching disabled via --skip-sec flag\n');
		return;
	}

	console.log('\n========================================');
	console.log('Fetching SEC EDGAR Filings');
	console.log('========================================\n');

	const client = new SECEdgarClient();

	for (const entity of ENTITIES) {
		console.log(`\nProcessing ${entity.cik} (${entity.names[entity.names.length - 1]?.name})...`);

		// Fetch company info
		const companyInfo = await client.getCompanyInfo(entity.cikNumber);
		if (companyInfo) {
			const infoFile = `${CACHE_DIR}/sec-edgar/${entity.cik}-company-info.json`;
			await Bun.write(infoFile, JSON.stringify(companyInfo, null, 2));
			console.log(`  Saved company info to ${infoFile}`);
		}

		// Fetch filings
		const filings = await client.getFilings(entity.cikNumber);
		if (filings.length > 0) {
			const filingsData: EntityFilings = {
				cik: entity.cik,
				filings,
				fetchedAt: new Date().toISOString()
			};

			const filingsFile = `${CACHE_DIR}/sec-edgar/${entity.cik}-filings.json`;
			await Bun.write(filingsFile, JSON.stringify(filingsData, null, 2));
			console.log(`  Saved ${filings.length} filings to ${filingsFile}`);

			// Log interesting filing types
			const formCounts: Record<string, number> = {};
			for (const filing of filings) {
				formCounts[filing.form] = (formCounts[filing.form] ?? 0) + 1;
			}
			console.log('  Filing types:', formCounts);
		}
	}
}

async function fetchYahooFinanceData(): Promise<void> {
	if (SKIP_YAHOO) {
		console.log('\n[Skip] Yahoo Finance fetching disabled via --skip-yahoo flag\n');
		return;
	}

	console.log('\n========================================');
	console.log('Fetching Yahoo Finance Data');
	console.log('========================================\n');

	const client = new YahooFinanceClient();
	const entities = getEntitiesWithMarketData();

	for (const entity of entities) {
		for (const ticker of entity.tickers) {
			console.log(`\nProcessing ${ticker.symbol} (${entity.cik})...`);

			// Use the ticker's date range, extend end date to capture more recent data if available
			const startDate = ticker.startDate;
			const endDate = ticker.endDate ?? new Date().toISOString().split('T')[0];

			const records = await client.getHistoricalData(ticker.symbol, startDate, endDate);

			if (records.length > 0) {
				const outputFile: RawDataFile = {
					cik: entity.cik,
					ticker: ticker.symbol,
					year: 0, // All years
					source: 'yahoo-finance',
					filePath: `${CACHE_DIR}/yahoo-finance/${entity.cik}-${ticker.symbol}-daily.json`,
					records,
					fetchedAt: new Date().toISOString()
				};

				await Bun.write(outputFile.filePath, JSON.stringify(outputFile, null, 2));
				console.log(`  Saved ${records.length} records to ${outputFile.filePath}`);
			}
		}
	}
}

async function main(): Promise<void> {
	console.log('========================================');
	console.log('01-fetch-remote.ts - Remote Data Fetch');
	console.log('========================================');
	console.log(`Started: ${new Date().toISOString()}`);

	await ensureCacheDir();

	// Yahoo Finance is fast and has good coverage for active tickers
	await fetchYahooFinanceData();

	// Note: Alpha Vantage has strict rate limits (5 calls/minute on free tier)
	// For a full fetch, this will take a while
	// Consider running with --skip-av for subsequent runs if data is cached
	await fetchAlphaVantageData();

	// SEC EDGAR is more lenient (10 requests/second)
	await fetchSECFilings();

	console.log('\n========================================');
	console.log('Remote fetch complete!');
	console.log(`Finished: ${new Date().toISOString()}`);
	console.log('========================================\n');
}

main().catch(console.error);
