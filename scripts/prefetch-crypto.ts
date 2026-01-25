#!/usr/bin/env bun
/**
 * Prefetch Cryptocurrency Data
 *
 * Fetches 5-year daily history for Bitcoin (BTC) and Ethereum (ETH)
 * from Twelve Data API.
 *
 * Usage: bun run scripts/prefetch-crypto.ts
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Cryptocurrencies to fetch
const CRYPTOS = [
	{ symbol: 'BTC/USD', name: 'Bitcoin', ticker: 'BTC' },
	{ symbol: 'ETH/USD', name: 'Ethereum', ticker: 'ETH' }
];

// Paths
const PROJECT_ROOT = join(import.meta.dir, '..');
const CRYPTO_DIR = join(PROJECT_ROOT, 'static', 'json', 'crypto');

// API configuration
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || '';

// Rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface CryptoHistory {
	symbol: string;
	name: string;
	interval: string;
	data: Array<{
		date: string;
		open: number;
		high: number;
		low: number;
		close: number;
		volume: number;
	}>;
	startDate: string;
	endDate: string;
	source: string;
	generatedAt: string;
}

async function fetchCryptoHistory(symbol: string, name: string, years: number): Promise<CryptoHistory | null> {
	if (!TWELVE_DATA_API_KEY) {
		console.log(`  [SKIP] No TWELVE_DATA_API_KEY`);
		return null;
	}

	try {
		const endDate = new Date().toISOString().split('T')[0];
		const startDate = new Date(Date.now() - years * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

		console.log(`  Fetching ${years}-year history from ${startDate} to ${endDate}...`);

		const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&start_date=${startDate}&end_date=${endDate}&outputsize=${years * 365}&apikey=${TWELVE_DATA_API_KEY}`;

		const response = await fetch(url);

		if (response.status === 429) {
			console.log(`  [RATE] Rate limited, waiting 60 seconds...`);
			await delay(60000);
			return fetchCryptoHistory(symbol, name, years);
		}

		if (!response.ok) {
			console.log(`  [WARN] Failed to fetch: ${response.status}`);
			return null;
		}

		const data = await response.json();

		if (data.status === 'error') {
			console.log(`  [ERROR] API error: ${data.message}`);
			return null;
		}

		if (!data.values || data.values.length === 0) {
			console.log(`  [WARN] No data returned`);
			return null;
		}

		// Convert to standard format
		const history = data.values.map((v: any) => ({
			date: v.datetime,
			open: parseFloat(v.open),
			high: parseFloat(v.high),
			low: parseFloat(v.low),
			close: parseFloat(v.close),
			volume: parseFloat(v.volume) || 0
		})).sort((a: any, b: any) => a.date.localeCompare(b.date));

		return {
			symbol,
			name,
			interval: '1day',
			data: history,
			startDate: history[0]?.date || startDate,
			endDate: history[history.length - 1]?.date || endDate,
			source: 'twelvedata',
			generatedAt: new Date().toISOString()
		};
	} catch (error) {
		console.log(`  [ERROR] Error fetching:`, error);
		return null;
	}
}

function computeStats(data: CryptoHistory['data']) {
	if (data.length === 0) return null;

	const prices = data.map(d => d.close);
	const volumes = data.map(d => d.volume);

	return {
		high: Math.max(...data.map(d => d.high)),
		low: Math.min(...data.map(d => d.low)),
		avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
		totalVolume: volumes.reduce((a, b) => a + b, 0),
		tradingDays: data.length,
		startPrice: data[0].close,
		endPrice: data[data.length - 1].close,
		priceChange: data[data.length - 1].close - data[0].close,
		priceChangePercent: ((data[data.length - 1].close - data[0].close) / data[0].close) * 100
	};
}

async function main() {
	console.log('='.repeat(60));
	console.log('Cryptocurrency Data Prefetch');
	console.log('='.repeat(60));
	console.log('');

	if (!TWELVE_DATA_API_KEY) {
		console.log('[ERROR] TWELVE_DATA_API_KEY not set in environment');
		console.log('        Add TWELVE_DATA_API_KEY to .env file');
		process.exit(1);
	}

	// Ensure output directory exists
	if (!existsSync(CRYPTO_DIR)) {
		mkdirSync(CRYPTO_DIR, { recursive: true });
		console.log(`Created directory: ${CRYPTO_DIR}`);
	}

	console.log('');

	for (const crypto of CRYPTOS) {
		console.log(`Processing ${crypto.name} (${crypto.symbol})...`);

		const history = await fetchCryptoHistory(crypto.symbol, crypto.name, 5);

		if (history) {
			// Save history
			const historyPath = join(CRYPTO_DIR, `${crypto.ticker}-history-5y.json`);
			writeFileSync(historyPath, JSON.stringify(history, null, 2));
			console.log(`  [SAVE] Saved ${history.data.length} days of history`);

			// Compute and save summary
			const stats = computeStats(history.data);
			if (stats) {
				const summaryPath = join(CRYPTO_DIR, `${crypto.ticker}-summary.json`);
				writeFileSync(summaryPath, JSON.stringify({
					symbol: crypto.symbol,
					name: crypto.name,
					ticker: crypto.ticker,
					stats,
					period: {
						start: history.startDate,
						end: history.endDate
					},
					source: 'twelvedata',
					generatedAt: new Date().toISOString()
				}, null, 2));
				console.log(`  [SAVE] Saved summary stats`);
				console.log(`         5yr change: ${stats.priceChangePercent.toFixed(2)}%`);
			}
		}

		// Rate limit: 8 credits/min for Twelve Data
		console.log('  Waiting 8 seconds for rate limit...');
		await delay(8000);
		console.log('');
	}

	console.log('='.repeat(60));
	console.log('Crypto prefetch complete!');
	console.log('='.repeat(60));
}

main().catch(console.error);
