#!/usr/bin/env bun
/**
 * Prefetch Top 25 Stocks - Full Data
 *
 * Fetches complete historical data for the top 25 best-performing stocks:
 * - 5-year daily OHLCV history
 * - Company profiles
 * - Key financial metrics
 *
 * Usage: bun run scripts/prefetch-top25.ts
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Top 25 stocks for deep data collection
const TOP25_STOCKS = [
	'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN',
	'META', 'TSLA', 'BRK.B', 'UNH', 'JNJ',
	'V', 'MA', 'JPM', 'PG', 'HD',
	'COST', 'AVGO', 'AMD', 'CRM', 'ADBE',
	'NFLX', 'ORCL', 'INTC', 'DIS', 'PFE'
];

// Paths
const PROJECT_ROOT = join(import.meta.dir, '..');
const COMPANIES_DIR = join(PROJECT_ROOT, 'static', 'json', 'companies');

// API configuration
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || '';
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';

// Rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface HistoryData {
	symbol: string;
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

async function fetchTwelveDataHistory(symbol: string, years: number): Promise<HistoryData | null> {
	if (!TWELVE_DATA_API_KEY) {
		console.log(`  [SKIP] No TWELVE_DATA_API_KEY for ${symbol}`);
		return null;
	}

	try {
		const endDate = new Date().toISOString().split('T')[0];
		const startDate = new Date(Date.now() - years * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

		const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&start_date=${startDate}&end_date=${endDate}&outputsize=${years * 365}&apikey=${TWELVE_DATA_API_KEY}`;

		const response = await fetch(url);

		if (response.status === 429) {
			console.log(`  [RATE] Rate limited, waiting 60 seconds...`);
			await delay(60000);
			return fetchTwelveDataHistory(symbol, years);
		}

		if (!response.ok) {
			console.log(`  [WARN] Failed to fetch history for ${symbol}: ${response.status}`);
			return null;
		}

		const data = await response.json();

		if (data.status === 'error') {
			console.log(`  [ERROR] API error for ${symbol}: ${data.message}`);
			return null;
		}

		if (!data.values || data.values.length === 0) {
			console.log(`  [WARN] No data returned for ${symbol}`);
			return null;
		}

		// Convert to standard format
		const history = data.values.map((v: any) => ({
			date: v.datetime,
			open: parseFloat(v.open),
			high: parseFloat(v.high),
			low: parseFloat(v.low),
			close: parseFloat(v.close),
			volume: parseInt(v.volume, 10)
		})).sort((a: any, b: any) => a.date.localeCompare(b.date));

		return {
			symbol,
			interval: '1day',
			data: history,
			startDate: history[0]?.date || startDate,
			endDate: history[history.length - 1]?.date || endDate,
			source: 'twelvedata',
			generatedAt: new Date().toISOString()
		};
	} catch (error) {
		console.log(`  [ERROR] Error fetching history for ${symbol}:`, error);
		return null;
	}
}

async function fetchFinnhubMetrics(symbol: string): Promise<any> {
	if (!FINNHUB_API_KEY) {
		return null;
	}

	try {
		// Get basic quote
		const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
		const quoteResponse = await fetch(quoteUrl);

		if (!quoteResponse.ok) {
			return null;
		}

		const quote = await quoteResponse.json();

		// Get earnings
		await delay(50);
		const earningsUrl = `https://finnhub.io/api/v1/stock/earnings?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
		const earningsResponse = await fetch(earningsUrl);
		const earnings = earningsResponse.ok ? await earningsResponse.json() : [];

		// Get recommendations
		await delay(50);
		const recUrl = `https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
		const recResponse = await fetch(recUrl);
		const recommendations = recResponse.ok ? await recResponse.json() : [];

		return {
			quote: {
				price: quote.c,
				change: quote.d,
				changePercent: quote.dp,
				high: quote.h,
				low: quote.l,
				open: quote.o,
				previousClose: quote.pc
			},
			earnings: earnings.slice(0, 4), // Last 4 quarters
			recommendations: recommendations.slice(0, 1)?.[0] || null,
			source: 'finnhub',
			generatedAt: new Date().toISOString()
		};
	} catch (error) {
		console.log(`  [ERROR] Error fetching metrics for ${symbol}:`, error);
		return null;
	}
}

async function main() {
	console.log('='.repeat(60));
	console.log('Top 25 Stocks - Full Data Prefetch');
	console.log('='.repeat(60));
	console.log('');

	// Ensure output directory exists
	if (!existsSync(COMPANIES_DIR)) {
		mkdirSync(COMPANIES_DIR, { recursive: true });
	}

	// Track API usage
	let twelveDataCalls = 0;
	const maxTwelveDataCallsPerRun = 10; // Stay well under 800/day limit

	console.log(`Fetching data for ${TOP25_STOCKS.length} stocks...`);
	console.log(`Twelve Data rate limit: ${maxTwelveDataCallsPerRun} calls this run`);
	console.log('');

	for (let i = 0; i < TOP25_STOCKS.length; i++) {
		const symbol = TOP25_STOCKS[i];
		console.log(`[${i + 1}/${TOP25_STOCKS.length}] Processing ${symbol}...`);

		// Fetch 5-year history from Twelve Data (if under limit)
		if (twelveDataCalls < maxTwelveDataCallsPerRun && TWELVE_DATA_API_KEY) {
			console.log(`  Fetching 5-year history...`);
			const history = await fetchTwelveDataHistory(symbol, 5);

			if (history) {
				const historyPath = join(COMPANIES_DIR, `${symbol}-history-5y.json`);
				writeFileSync(historyPath, JSON.stringify(history, null, 2));
				console.log(`  [SAVE] Saved ${history.data.length} days of history`);
				twelveDataCalls++;

				// Twelve Data: 8 credits/min, wait 8 seconds between calls
				console.log(`  Waiting 8 seconds for rate limit...`);
				await delay(8000);
			}
		} else if (twelveDataCalls >= maxTwelveDataCallsPerRun) {
			console.log(`  [SKIP] Twelve Data limit reached for this run`);
		}

		// Fetch metrics from Finnhub
		if (FINNHUB_API_KEY) {
			console.log(`  Fetching metrics...`);
			const metrics = await fetchFinnhubMetrics(symbol);

			if (metrics) {
				const metricsPath = join(COMPANIES_DIR, `${symbol}-metrics.json`);
				writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
				console.log(`  [SAVE] Saved metrics`);
			}

			// Finnhub: 30/sec, 100ms delay is safe
			await delay(100);
		}

		console.log('');
	}

	console.log('='.repeat(60));
	console.log('Prefetch complete!');
	console.log(`Twelve Data API calls used: ${twelveDataCalls}/${maxTwelveDataCallsPerRun}`);
	console.log('');
	console.log('TIP: Run this script multiple times to fetch all 25 stocks');
	console.log('     (rate limited to preserve daily API quota)');
	console.log('='.repeat(60));
}

main().catch(console.error);
