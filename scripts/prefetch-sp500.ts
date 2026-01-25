#!/usr/bin/env bun
/**
 * Prefetch S&P 500 Stock Data
 *
 * Fetches the S&P 500 constituent list and basic profiles for each stock.
 * Saves to static/json/market/ for use by the SvelteKit app.
 *
 * Usage: bun run scripts/prefetch-sp500.ts
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// S&P 500 constituents (top 100 by market cap as of 2025)
// Full list can be fetched from various sources; this is a curated subset
const SP500_TOP100 = [
	{ symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
	{ symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
	{ symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
	{ symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary' },
	{ symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
	{ symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
	{ symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary' },
	{ symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', sector: 'Financials' },
	{ symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare' },
	{ symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
	{ symbol: 'V', name: 'Visa Inc.', sector: 'Financials' },
	{ symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy' },
	{ symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials' },
	{ symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financials' },
	{ symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Staples' },
	{ symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Discretionary' },
	{ symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy' },
	{ symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare' },
	{ symbol: 'MRK', name: 'Merck & Co. Inc.', sector: 'Healthcare' },
	{ symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare' },
	{ symbol: 'COST', name: 'Costco Wholesale Corporation', sector: 'Consumer Staples' },
	{ symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology' },
	{ symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Staples' },
	{ symbol: 'KO', name: 'Coca-Cola Company', sector: 'Consumer Staples' },
	{ symbol: 'TMO', name: 'Thermo Fisher Scientific', sector: 'Healthcare' },
	{ symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples' },
	{ symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financials' },
	{ symbol: 'MCD', name: "McDonald's Corporation", sector: 'Consumer Discretionary' },
	{ symbol: 'CSCO', name: 'Cisco Systems Inc.', sector: 'Technology' },
	{ symbol: 'ACN', name: 'Accenture plc', sector: 'Technology' },
	{ symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare' },
	{ symbol: 'DHR', name: 'Danaher Corporation', sector: 'Healthcare' },
	{ symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology' },
	{ symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology' },
	{ symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology' },
	{ symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services' },
	{ symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology' },
	{ symbol: 'DIS', name: 'Walt Disney Company', sector: 'Communication Services' },
	{ symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare' },
	{ symbol: 'NKE', name: 'NIKE Inc.', sector: 'Consumer Discretionary' },
	{ symbol: 'VZ', name: 'Verizon Communications', sector: 'Communication Services' },
	{ symbol: 'CMCSA', name: 'Comcast Corporation', sector: 'Communication Services' },
	{ symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology' },
	{ symbol: 'TXN', name: 'Texas Instruments Inc.', sector: 'Technology' },
	{ symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy' },
	{ symbol: 'PM', name: 'Philip Morris International', sector: 'Consumer Staples' },
	{ symbol: 'QCOM', name: 'QUALCOMM Inc.', sector: 'Technology' },
	{ symbol: 'NEE', name: 'NextEra Energy Inc.', sector: 'Utilities' },
	{ symbol: 'RTX', name: 'RTX Corporation', sector: 'Industrials' },
	{ symbol: 'HON', name: 'Honeywell International', sector: 'Industrials' },
	{ symbol: 'UNP', name: 'Union Pacific Corporation', sector: 'Industrials' },
	{ symbol: 'IBM', name: 'International Business Machines', sector: 'Technology' },
	{ symbol: 'LOW', name: "Lowe's Companies Inc.", sector: 'Consumer Discretionary' },
	{ symbol: 'SPGI', name: 'S&P Global Inc.', sector: 'Financials' },
	{ symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials' },
	{ symbol: 'BA', name: 'Boeing Company', sector: 'Industrials' },
	{ symbol: 'GE', name: 'General Electric Company', sector: 'Industrials' },
	{ symbol: 'AMGN', name: 'Amgen Inc.', sector: 'Healthcare' },
	{ symbol: 'DE', name: 'Deere & Company', sector: 'Industrials' },
	{ symbol: 'GS', name: 'Goldman Sachs Group', sector: 'Financials' },
	{ symbol: 'INTU', name: 'Intuit Inc.', sector: 'Technology' },
	{ symbol: 'ELV', name: 'Elevance Health Inc.', sector: 'Healthcare' },
	{ symbol: 'BKNG', name: 'Booking Holdings Inc.', sector: 'Consumer Discretionary' },
	{ symbol: 'AXP', name: 'American Express Company', sector: 'Financials' },
	{ symbol: 'MDLZ', name: 'Mondelez International', sector: 'Consumer Staples' },
	{ symbol: 'ISRG', name: 'Intuitive Surgical Inc.', sector: 'Healthcare' },
	{ symbol: 'LMT', name: 'Lockheed Martin Corporation', sector: 'Industrials' },
	{ symbol: 'BLK', name: 'BlackRock Inc.', sector: 'Financials' },
	{ symbol: 'GILD', name: 'Gilead Sciences Inc.', sector: 'Healthcare' },
	{ symbol: 'SYK', name: 'Stryker Corporation', sector: 'Healthcare' },
	{ symbol: 'ADI', name: 'Analog Devices Inc.', sector: 'Technology' },
	{ symbol: 'MMC', name: 'Marsh McLennan Companies', sector: 'Financials' },
	{ symbol: 'TJX', name: 'TJX Companies Inc.', sector: 'Consumer Discretionary' },
	{ symbol: 'VRTX', name: 'Vertex Pharmaceuticals', sector: 'Healthcare' },
	{ symbol: 'CVS', name: 'CVS Health Corporation', sector: 'Healthcare' },
	{ symbol: 'REGN', name: 'Regeneron Pharmaceuticals', sector: 'Healthcare' },
	{ symbol: 'PGR', name: 'Progressive Corporation', sector: 'Financials' },
	{ symbol: 'ADP', name: 'Automatic Data Processing', sector: 'Industrials' },
	{ symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer Discretionary' },
	{ symbol: 'ZTS', name: 'Zoetis Inc.', sector: 'Healthcare' },
	{ symbol: 'NOW', name: 'ServiceNow Inc.', sector: 'Technology' },
	{ symbol: 'MMM', name: '3M Company', sector: 'Industrials' },
	{ symbol: 'CI', name: 'Cigna Group', sector: 'Healthcare' },
	{ symbol: 'C', name: 'Citigroup Inc.', sector: 'Financials' },
	{ symbol: 'SCHW', name: 'Charles Schwab Corporation', sector: 'Financials' },
	{ symbol: 'SO', name: 'Southern Company', sector: 'Utilities' },
	{ symbol: 'DUK', name: 'Duke Energy Corporation', sector: 'Utilities' },
	{ symbol: 'LRCX', name: 'Lam Research Corporation', sector: 'Technology' },
	{ symbol: 'EQIX', name: 'Equinix Inc.', sector: 'Real Estate' },
	{ symbol: 'KLAC', name: 'KLA Corporation', sector: 'Technology' },
	{ symbol: 'FI', name: 'Fiserv Inc.', sector: 'Financials' },
	{ symbol: 'MO', name: 'Altria Group Inc.', sector: 'Consumer Staples' },
	{ symbol: 'ICE', name: 'Intercontinental Exchange', sector: 'Financials' },
	{ symbol: 'CME', name: 'CME Group Inc.', sector: 'Financials' },
	{ symbol: 'SHW', name: 'Sherwin-Williams Company', sector: 'Materials' },
	{ symbol: 'CL', name: 'Colgate-Palmolive Company', sector: 'Consumer Staples' },
	{ symbol: 'EOG', name: 'EOG Resources Inc.', sector: 'Energy' },
	{ symbol: 'BSX', name: 'Boston Scientific Corporation', sector: 'Healthcare' },
	{ symbol: 'SNPS', name: 'Synopsys Inc.', sector: 'Technology' },
	{ symbol: 'CDNS', name: 'Cadence Design Systems', sector: 'Technology' }
];

// Paths
const PROJECT_ROOT = join(import.meta.dir, '..');
const OUTPUT_DIR = join(PROJECT_ROOT, 'static', 'json', 'market');
const COMPANIES_DIR = join(PROJECT_ROOT, 'static', 'json', 'companies');

// API configuration from environment
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';

// Rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface CompanyProfile {
	symbol: string;
	name: string;
	sector: string;
	exchange?: string;
	industry?: string;
	marketCap?: number;
	logo?: string;
	website?: string;
	description?: string;
}

async function fetchCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
	if (!FINNHUB_API_KEY) {
		console.log(`  [SKIP] No FINNHUB_API_KEY, using static data for ${symbol}`);
		return null;
	}

	try {
		const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
		const response = await fetch(url);

		if (response.status === 429) {
			console.log(`  [RATE] Rate limited, waiting 2 seconds...`);
			await delay(2000);
			return fetchCompanyProfile(symbol);
		}

		if (!response.ok) {
			console.log(`  [WARN] Failed to fetch profile for ${symbol}: ${response.status}`);
			return null;
		}

		const data = await response.json();

		if (!data.name) {
			return null;
		}

		return {
			symbol: data.ticker || symbol,
			name: data.name,
			sector: data.finnhubIndustry || 'Unknown',
			exchange: data.exchange,
			industry: data.finnhubIndustry,
			marketCap: data.marketCapitalization,
			logo: data.logo,
			website: data.weburl
		};
	} catch (error) {
		console.log(`  [ERROR] Error fetching profile for ${symbol}:`, error);
		return null;
	}
}

async function main() {
	console.log('='.repeat(60));
	console.log('S&P 500 Data Prefetch Script');
	console.log('='.repeat(60));
	console.log('');

	// Ensure output directories exist
	if (!existsSync(OUTPUT_DIR)) {
		mkdirSync(OUTPUT_DIR, { recursive: true });
		console.log(`Created directory: ${OUTPUT_DIR}`);
	}
	if (!existsSync(COMPANIES_DIR)) {
		mkdirSync(COMPANIES_DIR, { recursive: true });
		console.log(`Created directory: ${COMPANIES_DIR}`);
	}

	// Save the S&P 500 list (static data)
	const sp500List = {
		stocks: SP500_TOP100,
		count: SP500_TOP100.length,
		generatedAt: new Date().toISOString(),
		source: 'static'
	};

	const listPath = join(OUTPUT_DIR, 'sp500-list.json');
	writeFileSync(listPath, JSON.stringify(sp500List, null, 2));
	console.log(`[SAVE] Saved S&P 500 list to ${listPath}`);
	console.log('');

	// Fetch profiles for each stock (if API key available)
	if (FINNHUB_API_KEY) {
		console.log('Fetching company profiles from Finnhub...');
		console.log('(Rate limit: 30 req/sec, adding 50ms delay between requests)');
		console.log('');

		const profiles: CompanyProfile[] = [];

		for (let i = 0; i < SP500_TOP100.length; i++) {
			const stock = SP500_TOP100[i];
			console.log(`[${i + 1}/${SP500_TOP100.length}] Fetching ${stock.symbol}...`);

			const profile = await fetchCompanyProfile(stock.symbol);

			if (profile) {
				profiles.push(profile);

				// Save individual profile
				const profilePath = join(COMPANIES_DIR, `${stock.symbol}-profile.json`);
				writeFileSync(profilePath, JSON.stringify({
					...profile,
					generatedAt: new Date().toISOString(),
					source: 'finnhub'
				}, null, 2));
			} else {
				// Use static data as fallback
				profiles.push({
					symbol: stock.symbol,
					name: stock.name,
					sector: stock.sector
				});
			}

			// Rate limit: 50ms delay = 20 req/sec (under 30 limit)
			await delay(50);
		}

		// Save combined profiles
		const profilesPath = join(OUTPUT_DIR, 'sp500-profiles.json');
		writeFileSync(profilesPath, JSON.stringify({
			profiles,
			count: profiles.length,
			generatedAt: new Date().toISOString(),
			source: 'finnhub'
		}, null, 2));
		console.log('');
		console.log(`[SAVE] Saved ${profiles.length} profiles to ${profilesPath}`);
	} else {
		console.log('[WARN] FINNHUB_API_KEY not set, skipping profile fetch');
		console.log('       Set FINNHUB_API_KEY in .env to fetch real profiles');
	}

	console.log('');
	console.log('='.repeat(60));
	console.log('Prefetch complete!');
	console.log('='.repeat(60));
}

main().catch(console.error);
