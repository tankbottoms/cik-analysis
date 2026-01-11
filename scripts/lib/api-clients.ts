/**
 * API Clients for fetching stock data from various sources
 */

import type {
	AlphaVantageTimeSeriesResponse,
	RawTradeRecord,
	SECFiling,
	DataSource
} from './data-types';

// ============================================================================
// Environment Configuration
// ============================================================================

function getEnv(key: string, defaultValue?: string): string {
	const value = process.env[key] ?? Bun.env[key] ?? defaultValue;
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

// ============================================================================
// Alpha Vantage Client
// ============================================================================

export class AlphaVantageClient {
	private apiKey: string;
	private baseUrl = 'https://www.alphavantage.co/query';
	private requestDelay = 12000; // 5 calls per minute = 12 seconds between calls
	private lastRequestTime = 0;

	constructor() {
		this.apiKey = getEnv('ALPHA_VANTAGE_API_KEY');
	}

	private async throttle(): Promise<void> {
		const now = Date.now();
		const timeSinceLastRequest = now - this.lastRequestTime;
		if (timeSinceLastRequest < this.requestDelay) {
			const waitTime = this.requestDelay - timeSinceLastRequest;
			console.log(`  [Alpha Vantage] Rate limiting: waiting ${waitTime}ms`);
			await new Promise((resolve) => setTimeout(resolve, waitTime));
		}
		this.lastRequestTime = Date.now();
	}

	async getDailyTimeSeries(
		symbol: string,
		outputSize: 'compact' | 'full' = 'full'
	): Promise<RawTradeRecord[]> {
		await this.throttle();

		const url = new URL(this.baseUrl);
		url.searchParams.set('function', 'TIME_SERIES_DAILY');
		url.searchParams.set('symbol', symbol);
		url.searchParams.set('outputsize', outputSize);
		url.searchParams.set('apikey', this.apiKey);

		console.log(`  [Alpha Vantage] Fetching daily data for ${symbol}...`);

		try {
			const response = await fetch(url.toString());
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = (await response.json()) as AlphaVantageTimeSeriesResponse;

			if (!data['Time Series (Daily)']) {
				console.log(`  [Alpha Vantage] No data returned for ${symbol}`);
				return [];
			}

			const records: RawTradeRecord[] = [];
			for (const [date, values] of Object.entries(data['Time Series (Daily)'])) {
				records.push({
					datetime: `${date} 16:00:00`, // Market close
					price: parseFloat(values['4. close']),
					volume: parseInt(values['5. volume'], 10),
					source: 'alpha-vantage' as DataSource
				});
			}

			console.log(`  [Alpha Vantage] Retrieved ${records.length} records for ${symbol}`);
			return records;
		} catch (error) {
			console.error(`  [Alpha Vantage] Error fetching ${symbol}:`, error);
			return [];
		}
	}

	async getIntradayForMonth(
		symbol: string,
		month: string, // YYYY-MM format
		interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'
	): Promise<RawTradeRecord[]> {
		await this.throttle();

		const url = new URL(this.baseUrl);
		url.searchParams.set('function', 'TIME_SERIES_INTRADAY');
		url.searchParams.set('symbol', symbol);
		url.searchParams.set('interval', interval);
		url.searchParams.set('month', month);
		url.searchParams.set('outputsize', 'full');
		url.searchParams.set('apikey', this.apiKey);

		console.log(`  [Alpha Vantage] Fetching intraday data for ${symbol} (${month})...`);

		try {
			const response = await fetch(url.toString());
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = (await response.json()) as AlphaVantageTimeSeriesResponse;
			const timeSeriesKey = `Time Series (${interval})` as keyof typeof data;

			if (!data[timeSeriesKey]) {
				console.log(`  [Alpha Vantage] No intraday data for ${symbol} (${month})`);
				return [];
			}

			const records: RawTradeRecord[] = [];
			const timeSeries = data[timeSeriesKey] as Record<string, Record<string, string>>;

			for (const [datetime, values] of Object.entries(timeSeries)) {
				records.push({
					datetime,
					price: parseFloat(values['4. close']),
					volume: parseInt(values['5. volume'], 10),
					source: 'alpha-vantage' as DataSource
				});
			}

			console.log(`  [Alpha Vantage] Retrieved ${records.length} intraday records for ${symbol} (${month})`);
			return records;
		} catch (error) {
			console.error(`  [Alpha Vantage] Error fetching intraday ${symbol}:`, error);
			return [];
		}
	}
}

// ============================================================================
// SEC EDGAR Client
// ============================================================================

export class SECEdgarClient {
	private userAgent: string;
	private baseUrl = 'https://data.sec.gov';
	private requestDelay = 100; // 10 requests per second max
	private lastRequestTime = 0;

	constructor() {
		this.userAgent = getEnv('SEC_EDGAR_USER_AGENT', 'HistoricalStockData/1.0');
	}

	private async throttle(): Promise<void> {
		const now = Date.now();
		const timeSinceLastRequest = now - this.lastRequestTime;
		if (timeSinceLastRequest < this.requestDelay) {
			await new Promise((resolve) => setTimeout(resolve, this.requestDelay - timeSinceLastRequest));
		}
		this.lastRequestTime = Date.now();
	}

	async getFilings(cikNumber: string): Promise<SECFiling[]> {
		await this.throttle();

		// Remove leading zeros for the URL, then pad to 10 digits
		const paddedCik = cikNumber.replace(/^0+/, '').padStart(10, '0');
		const url = `${this.baseUrl}/submissions/CIK${paddedCik}.json`;

		console.log(`  [SEC EDGAR] Fetching filings for CIK ${paddedCik}...`);

		try {
			const response = await fetch(url, {
				headers: {
					'User-Agent': this.userAgent,
					Accept: 'application/json'
				}
			});

			if (!response.ok) {
				if (response.status === 404) {
					console.log(`  [SEC EDGAR] No filings found for CIK ${paddedCik}`);
					return [];
				}
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			const filings: SECFiling[] = [];

			// The response has a complex structure with recent and older filings
			const recentFilings = data.filings?.recent;
			if (recentFilings) {
				const count = recentFilings.accessionNumber?.length ?? 0;
				for (let i = 0; i < count; i++) {
					filings.push({
						accessionNumber: recentFilings.accessionNumber[i],
						filingDate: recentFilings.filingDate[i],
						form: recentFilings.form[i],
						description: recentFilings.primaryDocument?.[i] ?? '',
						documentUrl: `https://www.sec.gov/Archives/edgar/data/${paddedCik}/${recentFilings.accessionNumber[i].replace(/-/g, '')}/${recentFilings.primaryDocument?.[i] ?? ''}`,
						size: recentFilings.size?.[i]
					});
				}
			}

			console.log(`  [SEC EDGAR] Retrieved ${filings.length} filings for CIK ${paddedCik}`);
			return filings;
		} catch (error) {
			console.error(`  [SEC EDGAR] Error fetching CIK ${paddedCik}:`, error);
			return [];
		}
	}

	async getCompanyInfo(cikNumber: string): Promise<Record<string, unknown> | null> {
		await this.throttle();

		const paddedCik = cikNumber.replace(/^0+/, '').padStart(10, '0');
		const url = `${this.baseUrl}/submissions/CIK${paddedCik}.json`;

		try {
			const response = await fetch(url, {
				headers: {
					'User-Agent': this.userAgent,
					Accept: 'application/json'
				}
			});

			if (!response.ok) {
				return null;
			}

			const data = await response.json();
			return {
				cik: data.cik,
				name: data.name,
				sic: data.sic,
				sicDescription: data.sicDescription,
				tickers: data.tickers,
				exchanges: data.exchanges,
				stateOfIncorporation: data.stateOfIncorporation,
				fiscalYearEnd: data.fiscalYearEnd
			};
		} catch (error) {
			console.error(`  [SEC EDGAR] Error fetching company info for CIK ${paddedCik}:`, error);
			return null;
		}
	}
}

// ============================================================================
// Yahoo Finance Client
// ============================================================================

export class YahooFinanceClient {
	private requestDelay = 500; // Be polite to Yahoo
	private lastRequestTime = 0;

	private async throttle(): Promise<void> {
		const now = Date.now();
		const timeSinceLastRequest = now - this.lastRequestTime;
		if (timeSinceLastRequest < this.requestDelay) {
			await new Promise((resolve) => setTimeout(resolve, this.requestDelay - timeSinceLastRequest));
		}
		this.lastRequestTime = Date.now();
	}

	async getHistoricalData(
		symbol: string,
		startDate: string,
		endDate: string
	): Promise<RawTradeRecord[]> {
		await this.throttle();

		const period1 = Math.floor(new Date(startDate).getTime() / 1000);
		const period2 = Math.floor(new Date(endDate).getTime() / 1000);
		const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d`;

		console.log(`  [Yahoo Finance] Fetching ${symbol} (${startDate} to ${endDate})...`);

		try {
			const response = await fetch(url, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();

			if (data.chart?.error) {
				console.log(`  [Yahoo Finance] Error for ${symbol}: ${data.chart.error.description}`);
				return [];
			}

			const result = data.chart?.result?.[0];
			if (!result?.timestamp) {
				console.log(`  [Yahoo Finance] No historical data for ${symbol}`);
				return [];
			}

			const timestamps = result.timestamp as number[];
			const quotes = result.indicators?.quote?.[0];

			if (!quotes) {
				console.log(`  [Yahoo Finance] No quote data for ${symbol}`);
				return [];
			}

			const records: RawTradeRecord[] = [];
			for (let i = 0; i < timestamps.length; i++) {
				const close = quotes.close?.[i];
				const volume = quotes.volume?.[i];

				if (close != null && volume != null) {
					const date = new Date(timestamps[i] * 1000);
					records.push({
						datetime: date.toISOString(),
						price: close,
						volume: volume,
						source: 'yahoo-finance' as DataSource
					});
				}
			}

			console.log(`  [Yahoo Finance] Retrieved ${records.length} records for ${symbol}`);
			return records;
		} catch (error) {
			console.error(`  [Yahoo Finance] Error fetching ${symbol}:`, error);
			return [];
		}
	}
}

// ============================================================================
// Massive.com Client (for future use)
// ============================================================================

export class MassiveClient {
	private apiKey: string;
	private baseUrl = 'https://api.massive.com/v3';

	constructor() {
		this.apiKey = getEnv('MASSIVE_API_KEY', '');
	}

	async getTicker(symbol: string): Promise<Record<string, unknown> | null> {
		if (!this.apiKey) {
			console.log('  [Massive] No API key configured, skipping');
			return null;
		}

		const url = `${this.baseUrl}/reference/tickers/${symbol}`;

		try {
			const response = await fetch(url, {
				headers: {
					Authorization: `Bearer ${this.apiKey}`
				}
			});

			if (!response.ok) {
				return null;
			}

			return await response.json();
		} catch (error) {
			console.error(`  [Massive] Error fetching ${symbol}:`, error);
			return null;
		}
	}

	// Note: For historical data, Massive uses S3 flat files
	// This would require AWS SDK integration
}

// ============================================================================
// Local Cache Reader
// ============================================================================

export class LocalCacheReader {
	private basePath: string;

	constructor() {
		this.basePath = getEnv('PENNY_STOCKS_DATA_PATH', '../Penny-Stocks-Market-Data');
	}

	async readEntityCSV(ticker: string, year: number): Promise<RawTradeRecord[]> {
		const possiblePaths = [
			`${this.basePath}/cane_entities/${ticker}_*/`,
			`${this.basePath}/${year}/`
		];

		// Try to find the file
		const fileName = `${ticker}_${year}.csv`;

		for (const basePath of possiblePaths) {
			try {
				const glob = new Bun.Glob(`${basePath}${fileName}`);
				for await (const filePath of glob.scan('.')) {
					console.log(`  [Local Cache] Reading ${filePath}...`);
					return await this.parseCSV(filePath);
				}
			} catch {
				// Continue to next path
			}
		}

		// Try direct path
		const directPath = `${this.basePath}/cane_entities/${this.findEntityFolder(ticker)}/${fileName}`;
		try {
			const file = Bun.file(directPath);
			if (await file.exists()) {
				console.log(`  [Local Cache] Reading ${directPath}...`);
				return await this.parseCSV(directPath);
			}
		} catch {
			// File not found
		}

		console.log(`  [Local Cache] No data found for ${ticker} ${year}`);
		return [];
	}

	private findEntityFolder(ticker: string): string {
		const mapping: Record<string, string> = {
			LGAL: 'LGAL_Legal_Access_Technologies',
			GLXZ: 'GLXZ_Galaxy_Gaming',
			DAVN: 'DAVN_Davi_Skin',
			DAVNE: 'DAVN_Davi_Skin',
			FFSL: 'FFSL_First_Independence',
			SNPD: 'SNPD_Southern_Products'
		};
		return mapping[ticker] ?? ticker;
	}

	private async parseCSV(filePath: string): Promise<RawTradeRecord[]> {
		const file = Bun.file(filePath);
		const content = await file.text();
		const lines = content.trim().split('\n');
		const records: RawTradeRecord[] = [];

		for (const line of lines) {
			// Parse quoted CSV: "DATETIME","PRICE","VOLUME","BID","BID_SIZE","ASK","ASK_SIZE"
			const match = line.match(/"([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)"/);
			if (match) {
				const [, datetime, price, volume, bid, bidSize, ask, askSize] = match;
				records.push({
					datetime,
					price: parseFloat(price),
					volume: parseInt(volume, 10),
					bid: parseFloat(bid),
					bidSize: parseInt(bidSize, 10),
					ask: parseFloat(ask),
					askSize: parseInt(askSize, 10),
					source: 'local-cache' as DataSource
				});
			}
		}

		console.log(`  [Local Cache] Parsed ${records.length} records from ${filePath}`);
		return records;
	}

	async listAvailableData(): Promise<Array<{ ticker: string; year: number; path: string }>> {
		const results: Array<{ ticker: string; year: number; path: string }> = [];
		const entitiesPath = `${this.basePath}/cane_entities`;

		try {
			const glob = new Bun.Glob('**/*.csv');
			for await (const filePath of glob.scan(entitiesPath)) {
				const match = filePath.match(/([A-Z]+)_(\d{4})\.csv$/);
				if (match) {
					results.push({
						ticker: match[1],
						year: parseInt(match[2], 10),
						path: `${entitiesPath}/${filePath}`
					});
				}
			}
		} catch (error) {
			console.error('[Local Cache] Error scanning directory:', error);
		}

		return results;
	}
}
