#!/usr/bin/env bun
/**
 * Generate aggregated ticker data for the TickerStrip component
 * Combines profile and metrics data into a single JSON file
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface TickerItem {
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
	sector?: string;
}

interface Profile {
	symbol: string;
	name: string;
	sector?: string;
	marketCap?: number;
}

interface Metrics {
	quote?: {
		price: number;
		change: number;
		changePercent: number;
	};
}

const COMPANIES_DIR = './static/json/companies';
const MARKET_DIR = './static/json/market';
const OUTPUT_FILE = './static/json/market/ticker-data.json';

async function main() {
	console.log('Generating ticker data...');

	// Load profiles from sp500-profiles.json
	const profilesPath = join(MARKET_DIR, 'sp500-profiles.json');
	let profiles: Profile[] = [];

	try {
		const profilesData = JSON.parse(await readFile(profilesPath, 'utf-8'));
		profiles = profilesData.profiles || [];
		console.log(`Loaded ${profiles.length} profiles from sp500-profiles.json`);
	} catch (error) {
		console.error('Failed to load profiles:', error);
		return;
	}

	// Get list of available metrics files
	const files = await readdir(COMPANIES_DIR);
	const metricsFiles = files.filter(f => f.endsWith('-metrics.json'));
	const symbolsWithMetrics = new Set(metricsFiles.map(f => f.replace('-metrics.json', '')));

	console.log(`Found ${symbolsWithMetrics.size} symbols with metrics`);

	// Build ticker data
	const tickerData: TickerItem[] = [];

	for (const profile of profiles) {
		if (!symbolsWithMetrics.has(profile.symbol)) {
			continue;
		}

		try {
			const metricsPath = join(COMPANIES_DIR, `${profile.symbol}-metrics.json`);
			const metrics: Metrics = JSON.parse(await readFile(metricsPath, 'utf-8'));

			if (metrics.quote) {
				tickerData.push({
					symbol: profile.symbol,
					name: profile.name,
					price: metrics.quote.price,
					change: metrics.quote.change,
					changePercent: metrics.quote.changePercent,
					sector: profile.sector
				});
			}
		} catch (error) {
			console.warn(`Failed to load metrics for ${profile.symbol}:`, error);
		}
	}

	// Sort by market cap order (profiles are already sorted)
	// Take top 25
	const top25 = tickerData.slice(0, 25);

	const output = {
		tickers: top25,
		generatedAt: new Date().toISOString(),
		count: top25.length
	};

	await writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));
	console.log(`Generated ticker data with ${top25.length} stocks to ${OUTPUT_FILE}`);
}

main().catch(console.error);
