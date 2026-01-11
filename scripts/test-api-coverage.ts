#!/usr/bin/env bun
/**
 * Test script to check data coverage from all remote sources
 * Tests: Alpha Vantage, SEC EDGAR, Massive, Yahoo Finance
 */

const SYMBOLS_TO_TEST = ['LGAL', 'GLXZ', 'DAVN', 'FFSL', 'SNPD'];

// API Keys from .env
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'DJDR6JUCLKOJMY8I';
const MASSIVE_API_KEY = process.env.MASSIVE_API_KEY || 'PY7snkQv6tu4SB41rrpUgI3EjDpU4kyf';

interface CoverageResult {
	source: string;
	symbol: string;
	hasData: boolean;
	recordCount: number;
	dateRange?: { earliest: string; latest: string };
	notes?: string;
}

const results: CoverageResult[] = [];

// ============================================================================
// Test Alpha Vantage
// ============================================================================
async function testAlphaVantage(symbol: string): Promise<CoverageResult> {
	const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${ALPHA_VANTAGE_KEY}`;

	console.log(`[Alpha Vantage] Testing ${symbol}...`);

	try {
		const response = await fetch(url);
		const data = await response.json();

		if (data['Error Message'] || data['Note']) {
			return {
				source: 'Alpha Vantage',
				symbol,
				hasData: false,
				recordCount: 0,
				notes: data['Error Message'] || data['Note'] || 'No data'
			};
		}

		const timeSeries = data['Time Series (Daily)'];
		if (!timeSeries) {
			return {
				source: 'Alpha Vantage',
				symbol,
				hasData: false,
				recordCount: 0,
				notes: 'No time series data returned'
			};
		}

		const dates = Object.keys(timeSeries).sort();
		return {
			source: 'Alpha Vantage',
			symbol,
			hasData: true,
			recordCount: dates.length,
			dateRange: {
				earliest: dates[0],
				latest: dates[dates.length - 1]
			}
		};
	} catch (error) {
		return {
			source: 'Alpha Vantage',
			symbol,
			hasData: false,
			recordCount: 0,
			notes: `Error: ${error}`
		};
	}
}

// ============================================================================
// Test Yahoo Finance (via public API)
// ============================================================================
async function testYahooFinance(symbol: string): Promise<CoverageResult> {
	// Yahoo Finance v8 API for historical data
	// Period from Jan 1, 2007 to Dec 31, 2012 (covers our target range)
	const period1 = Math.floor(new Date('2007-01-01').getTime() / 1000);
	const period2 = Math.floor(new Date('2012-12-31').getTime() / 1000);

	const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d`;

	console.log(`[Yahoo Finance] Testing ${symbol}...`);

	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
			}
		});

		const data = await response.json();

		if (data.chart?.error) {
			return {
				source: 'Yahoo Finance',
				symbol,
				hasData: false,
				recordCount: 0,
				notes: data.chart.error.description || 'Symbol not found'
			};
		}

		const result = data.chart?.result?.[0];
		if (!result?.timestamp) {
			return {
				source: 'Yahoo Finance',
				symbol,
				hasData: false,
				recordCount: 0,
				notes: 'No historical data available'
			};
		}

		const timestamps = result.timestamp as number[];
		const dates = timestamps.map((ts) => new Date(ts * 1000).toISOString().split('T')[0]);

		return {
			source: 'Yahoo Finance',
			symbol,
			hasData: true,
			recordCount: timestamps.length,
			dateRange: {
				earliest: dates[0],
				latest: dates[dates.length - 1]
			}
		};
	} catch (error) {
		return {
			source: 'Yahoo Finance',
			symbol,
			hasData: false,
			recordCount: 0,
			notes: `Error: ${error}`
		};
	}
}

// ============================================================================
// Test Massive.com API
// ============================================================================
async function testMassive(symbol: string): Promise<CoverageResult> {
	// Massive API uses Polygon.io-style endpoints
	const url = `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${MASSIVE_API_KEY}`;

	console.log(`[Massive/Polygon] Testing ${symbol}...`);

	try {
		const response = await fetch(url);
		const data = await response.json();

		if (data.status === 'ERROR' || !data.results) {
			// Try alternate endpoint for historical aggregates
			const aggUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/2008-01-01/2012-12-31?apiKey=${MASSIVE_API_KEY}`;
			const aggResponse = await fetch(aggUrl);
			const aggData = await aggResponse.json();

			if (aggData.results && aggData.results.length > 0) {
				const results = aggData.results;
				return {
					source: 'Massive/Polygon',
					symbol,
					hasData: true,
					recordCount: results.length,
					dateRange: {
						earliest: new Date(results[0].t).toISOString().split('T')[0],
						latest: new Date(results[results.length - 1].t).toISOString().split('T')[0]
					}
				};
			}

			return {
				source: 'Massive/Polygon',
				symbol,
				hasData: false,
				recordCount: 0,
				notes: data.error || 'No data found'
			};
		}

		// Symbol exists, now check for historical data
		const aggUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/2008-01-01/2012-12-31?apiKey=${MASSIVE_API_KEY}`;
		const aggResponse = await fetch(aggUrl);
		const aggData = await aggResponse.json();

		if (aggData.results && aggData.results.length > 0) {
			const aggResults = aggData.results;
			return {
				source: 'Massive/Polygon',
				symbol,
				hasData: true,
				recordCount: aggResults.length,
				dateRange: {
					earliest: new Date(aggResults[0].t).toISOString().split('T')[0],
					latest: new Date(aggResults[aggResults.length - 1].t).toISOString().split('T')[0]
				},
				notes: `Ticker found: ${data.results.name}`
			};
		}

		return {
			source: 'Massive/Polygon',
			symbol,
			hasData: false,
			recordCount: 0,
			notes: `Ticker exists (${data.results.name}) but no historical data in range`
		};
	} catch (error) {
		return {
			source: 'Massive/Polygon',
			symbol,
			hasData: false,
			recordCount: 0,
			notes: `Error: ${error}`
		};
	}
}

// ============================================================================
// Test SEC EDGAR (for filings, not price data)
// ============================================================================
async function testSECEdgar(cik: string, symbol: string): Promise<CoverageResult> {
	const paddedCik = cik.replace(/^0+/, '').padStart(10, '0');
	const url = `https://data.sec.gov/submissions/CIK${paddedCik}.json`;

	console.log(`[SEC EDGAR] Testing CIK ${paddedCik} (${symbol})...`);

	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'HistoricalStockData/1.0 (test@example.com)'
			}
		});

		if (!response.ok) {
			return {
				source: 'SEC EDGAR',
				symbol,
				hasData: false,
				recordCount: 0,
				notes: `HTTP ${response.status}`
			};
		}

		const data = await response.json();
		const filings = data.filings?.recent;

		if (!filings?.accessionNumber) {
			return {
				source: 'SEC EDGAR',
				symbol,
				hasData: false,
				recordCount: 0,
				notes: 'No recent filings'
			};
		}

		const filingDates = filings.filingDate as string[];
		return {
			source: 'SEC EDGAR',
			symbol,
			hasData: true,
			recordCount: filings.accessionNumber.length,
			dateRange: {
				earliest: filingDates[filingDates.length - 1],
				latest: filingDates[0]
			},
			notes: `Company: ${data.name}`
		};
	} catch (error) {
		return {
			source: 'SEC EDGAR',
			symbol,
			hasData: false,
			recordCount: 0,
			notes: `Error: ${error}`
		};
	}
}

// ============================================================================
// Check Local Cache
// ============================================================================
async function checkLocalCache(symbol: string): Promise<CoverageResult> {
	const basePath = '../Penny-Stocks-Market-Data/cane_entities';
	const folderMapping: Record<string, string> = {
		LGAL: 'LGAL_Legal_Access_Technologies',
		GLXZ: 'GLXZ_Galaxy_Gaming',
		DAVN: 'DAVN_Davi_Skin',
		FFSL: 'FFSL_First_Independence',
		SNPD: 'SNPD_Southern_Products'
	};

	const folder = folderMapping[symbol];
	if (!folder) {
		return {
			source: 'Local Cache',
			symbol,
			hasData: false,
			recordCount: 0,
			notes: 'No folder mapping'
		};
	}

	console.log(`[Local Cache] Checking ${symbol}...`);

	try {
		const { readdir } = await import('node:fs/promises');
		const folderPath = `${basePath}/${folder}`;
		const files = await readdir(folderPath);
		const csvFiles = files.filter((f) => f.endsWith('.csv'));

		let totalRecords = 0;
		const years: string[] = [];

		for (const file of csvFiles) {
			const yearMatch = file.match(/_(\d{4})\.csv$/);
			if (yearMatch) {
				years.push(yearMatch[1]);
				const content = await Bun.file(`${folderPath}/${file}`).text();
				totalRecords += content.trim().split('\n').length;
			}
		}

		if (csvFiles.length === 0) {
			return {
				source: 'Local Cache',
				symbol,
				hasData: false,
				recordCount: 0,
				notes: 'No CSV files found'
			};
		}

		years.sort();
		return {
			source: 'Local Cache',
			symbol,
			hasData: true,
			recordCount: totalRecords,
			dateRange: {
				earliest: `${years[0]}-01-01`,
				latest: `${years[years.length - 1]}-12-31`
			},
			notes: `${csvFiles.length} CSV files`
		};
	} catch (error) {
		return {
			source: 'Local Cache',
			symbol,
			hasData: false,
			recordCount: 0,
			notes: `Error: ${error}`
		};
	}
}

// ============================================================================
// Main execution
// ============================================================================
async function main() {
	console.log('='.repeat(70));
	console.log('DATA SOURCE COVERAGE TEST');
	console.log('Testing historical data availability for penny stocks (2008-2012)');
	console.log('='.repeat(70));
	console.log();

	const CIK_MAPPING: Record<string, string> = {
		LGAL: '0000878146',
		GLXZ: '0000013156',
		DAVN: '0001059577',
		FFSL: '0001543098',
		SNPD: '0001487659'
	};

	// Test each symbol across all sources
	for (const symbol of SYMBOLS_TO_TEST) {
		console.log(`\n${'─'.repeat(70)}`);
		console.log(`Testing: ${symbol}`);
		console.log('─'.repeat(70));

		// Run tests sequentially to respect rate limits
		results.push(await checkLocalCache(symbol));
		results.push(await testYahooFinance(symbol));
		results.push(await testMassive(symbol));
		results.push(await testSECEdgar(CIK_MAPPING[symbol], symbol));

		// Only test Alpha Vantage for one symbol to avoid rate limit
		if (symbol === 'GLXZ') {
			results.push(await testAlphaVantage(symbol));
		}

		// Small delay between symbols
		await new Promise((r) => setTimeout(r, 500));
	}

	// Print summary
	console.log('\n' + '='.repeat(70));
	console.log('COVERAGE SUMMARY');
	console.log('='.repeat(70));

	// Group by source
	const bySource: Record<string, CoverageResult[]> = {};
	for (const r of results) {
		if (!bySource[r.source]) bySource[r.source] = [];
		bySource[r.source].push(r);
	}

	for (const [source, sourceResults] of Object.entries(bySource)) {
		console.log(`\n${source}:`);
		console.log('─'.repeat(50));
		for (const r of sourceResults) {
			const status = r.hasData ? 'OK' : 'NO DATA';
			const range = r.dateRange ? `${r.dateRange.earliest} to ${r.dateRange.latest}` : '-';
			console.log(`  ${r.symbol.padEnd(6)} [${status.padEnd(7)}] ${r.recordCount.toString().padStart(6)} records  ${range}`);
			if (r.notes && !r.hasData) {
				console.log(`         ${r.notes.substring(0, 60)}`);
			}
		}
	}

	// Coverage matrix
	console.log('\n' + '='.repeat(70));
	console.log('COVERAGE MATRIX (records per source)');
	console.log('='.repeat(70));
	console.log('\nSymbol   | Local Cache | Yahoo  | Massive | SEC EDGAR | Alpha V');
	console.log('─'.repeat(70));

	for (const symbol of SYMBOLS_TO_TEST) {
		const local = results.find((r) => r.source === 'Local Cache' && r.symbol === symbol);
		const yahoo = results.find((r) => r.source === 'Yahoo Finance' && r.symbol === symbol);
		const massive = results.find((r) => r.source === 'Massive/Polygon' && r.symbol === symbol);
		const sec = results.find((r) => r.source === 'SEC EDGAR' && r.symbol === symbol);
		const alpha = results.find((r) => r.source === 'Alpha Vantage' && r.symbol === symbol);

		const formatCount = (r: CoverageResult | undefined) => (r?.hasData ? r.recordCount.toString().padStart(6) : '     -');

		console.log(
			`${symbol.padEnd(8)} | ${formatCount(local).padStart(11)} | ${formatCount(yahoo).padStart(6)} | ${formatCount(massive).padStart(7)} | ${formatCount(sec).padStart(9)} | ${formatCount(alpha).padStart(7)}`
		);
	}

	console.log('\n' + '='.repeat(70));
	console.log('CONCLUSION');
	console.log('='.repeat(70));

	const localTotal = results
		.filter((r) => r.source === 'Local Cache' && r.hasData)
		.reduce((sum, r) => sum + r.recordCount, 0);
	const remoteTotal = results
		.filter((r) => r.source !== 'Local Cache' && r.source !== 'SEC EDGAR' && r.hasData)
		.reduce((sum, r) => sum + r.recordCount, 0);

	console.log(`\nLocal cache provides: ${localTotal.toLocaleString()} records`);
	console.log(`Remote sources add:   ${remoteTotal.toLocaleString()} records`);
	console.log(
		`\nNote: SEC EDGAR provides filings (metadata), not price data.`
	);
	console.log(
		`Most historical penny stock data for delisted securities is`
	);
	console.log(`not available through free API tiers.`);
}

main().catch(console.error);
