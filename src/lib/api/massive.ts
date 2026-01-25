/**
 * Massive.com (formerly Polygon.io) API Client
 *
 * Primary use: Real-time quotes, snapshots, historical OHLCV, market gainers/losers
 * Rate limit: Varies by plan
 * Documentation: https://massive.com/docs
 */

const MASSIVE_BASE_URL = 'https://api.polygon.io';

// Simple rate limiting - adjust based on plan
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 100; // 10 requests per second max

/**
 * Rate limiter - simple throttle to avoid overwhelming API
 */
async function waitForRateLimit(): Promise<void> {
	const now = Date.now();
	const timeSinceLastRequest = now - lastRequestTime;

	if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
		await new Promise(resolve =>
			setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest)
		);
	}

	lastRequestTime = Date.now();
}

/**
 * Make authenticated request to Massive/Polygon API
 */
async function massiveFetch<T>(endpoint: string, apiKey: string): Promise<T> {
	await waitForRateLimit();

	const url = `${MASSIVE_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apiKey=${apiKey}`;

	const response = await fetch(url);

	if (response.status === 429) {
		// Rate limited - wait and retry
		console.log('Massive.com rate limited, waiting 1 second...');
		await new Promise(resolve => setTimeout(resolve, 1000));
		return massiveFetch<T>(endpoint, apiKey);
	}

	if (response.status === 403) {
		throw new Error('Massive.com API: Access denied. This endpoint may require a premium subscription.');
	}

	if (!response.ok) {
		throw new Error(`Massive.com API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();

	if (data.status === 'ERROR') {
		throw new Error(`Massive.com API error: ${data.error || 'Unknown error'}`);
	}

	return data;
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface MassiveTickerSnapshot {
	ticker: {
		ticker: string;
		todaysChange: number;
		todaysChangePerc: number;
		updated: number;
		day: {
			o: number;
			h: number;
			l: number;
			c: number;
			v: number;
			vw: number;
		};
		min: {
			av: number;
			t: number;
			n: number;
			o: number;
			h: number;
			l: number;
			c: number;
			v: number;
			vw: number;
		};
		prevDay: {
			o: number;
			h: number;
			l: number;
			c: number;
			v: number;
			vw: number;
		};
	};
	status: string;
	request_id: string;
}

export interface MassiveAllTickersSnapshot {
	tickers: MassiveTickerSnapshot['ticker'][];
	status: string;
	request_id: string;
	count: number;
}

export interface MassiveGainersLosers {
	tickers: MassiveTickerSnapshot['ticker'][];
	status: string;
	request_id: string;
}

export interface MassiveAggregates {
	ticker: string;
	queryCount: number;
	resultsCount: number;
	adjusted: boolean;
	results: {
		v: number;   // Volume
		vw: number;  // Volume weighted average price
		o: number;   // Open
		c: number;   // Close
		h: number;   // High
		l: number;   // Low
		t: number;   // Timestamp (Unix ms)
		n: number;   // Number of transactions
	}[];
	status: string;
	request_id: string;
}

export interface MassiveTicker {
	ticker: string;
	name: string;
	market: string;
	locale: string;
	primary_exchange: string;
	type: string;
	active: boolean;
	currency_name: string;
	cik: string;
	composite_figi: string;
	share_class_figi: string;
	last_updated_utc: string;
}

export interface MassiveTickerDetails {
	results: {
		ticker: string;
		name: string;
		market: string;
		locale: string;
		primary_exchange: string;
		type: string;
		active: boolean;
		currency_name: string;
		cik: string;
		composite_figi: string;
		share_class_figi: string;
		market_cap: number;
		phone_number: string;
		address: {
			address1: string;
			city: string;
			state: string;
			postal_code: string;
		};
		description: string;
		sic_code: string;
		sic_description: string;
		ticker_root: string;
		homepage_url: string;
		total_employees: number;
		list_date: string;
		branding: {
			logo_url: string;
			icon_url: string;
		};
		share_class_shares_outstanding: number;
		weighted_shares_outstanding: number;
		round_lot: number;
	};
	status: string;
	request_id: string;
}

export interface MassiveMarketStatus {
	afterHours: boolean;
	currencies: {
		crypto: string;
		fx: string;
	};
	earlyHours: boolean;
	exchanges: {
		nasdaq: string;
		nyse: string;
		otc: string;
	};
	market: string;
	serverTime: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get snapshot for a single ticker
 */
export async function getTickerSnapshot(ticker: string, apiKey: string): Promise<MassiveTickerSnapshot> {
	return massiveFetch<MassiveTickerSnapshot>(
		`/v2/snapshot/locale/us/markets/stocks/tickers/${ticker.toUpperCase()}`,
		apiKey
	);
}

/**
 * Get snapshots for all tickers
 * Note: This returns a lot of data and may be rate-limited on free tier
 */
export async function getAllTickersSnapshot(
	apiKey: string,
	options?: { tickers?: string[] }
): Promise<MassiveAllTickersSnapshot> {
	let endpoint = '/v2/snapshot/locale/us/markets/stocks/tickers';
	if (options?.tickers && options.tickers.length > 0) {
		endpoint += `?tickers=${options.tickers.join(',')}`;
	}
	return massiveFetch<MassiveAllTickersSnapshot>(endpoint, apiKey);
}

/**
 * Get top gainers
 */
export async function getGainers(apiKey: string): Promise<MassiveGainersLosers> {
	return massiveFetch<MassiveGainersLosers>(
		'/v2/snapshot/locale/us/markets/stocks/gainers',
		apiKey
	);
}

/**
 * Get top losers
 */
export async function getLosers(apiKey: string): Promise<MassiveGainersLosers> {
	return massiveFetch<MassiveGainersLosers>(
		'/v2/snapshot/locale/us/markets/stocks/losers',
		apiKey
	);
}

/**
 * Get historical aggregates (OHLCV bars)
 * @param ticker - Stock ticker symbol
 * @param multiplier - Size of the timespan multiplier
 * @param timespan - Size of the time window (minute, hour, day, week, month, quarter, year)
 * @param from - Start date (YYYY-MM-DD)
 * @param to - End date (YYYY-MM-DD)
 */
export async function getAggregates(
	ticker: string,
	multiplier: number,
	timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year',
	from: string,
	to: string,
	apiKey: string,
	options?: { adjusted?: boolean; sort?: 'asc' | 'desc'; limit?: number }
): Promise<MassiveAggregates> {
	let endpoint = `/v2/aggs/ticker/${ticker.toUpperCase()}/range/${multiplier}/${timespan}/${from}/${to}`;
	const params: string[] = [];

	if (options?.adjusted !== undefined) params.push(`adjusted=${options.adjusted}`);
	if (options?.sort) params.push(`sort=${options.sort}`);
	if (options?.limit) params.push(`limit=${options.limit}`);

	if (params.length > 0) {
		endpoint += '?' + params.join('&');
	}

	return massiveFetch<MassiveAggregates>(endpoint, apiKey);
}

/**
 * Get ticker details (includes branding/logo)
 */
export async function getTickerDetails(ticker: string, apiKey: string): Promise<MassiveTickerDetails> {
	return massiveFetch<MassiveTickerDetails>(`/v3/reference/tickers/${ticker.toUpperCase()}`, apiKey);
}

/**
 * Get list of tickers
 */
export async function getTickers(
	apiKey: string,
	options?: {
		ticker?: string;
		type?: string;
		market?: string;
		exchange?: string;
		active?: boolean;
		limit?: number;
	}
): Promise<{ results: MassiveTicker[]; status: string; count: number; next_url?: string }> {
	const params: string[] = [];
	if (options?.ticker) params.push(`ticker=${options.ticker}`);
	if (options?.type) params.push(`type=${options.type}`);
	if (options?.market) params.push(`market=${options.market}`);
	if (options?.exchange) params.push(`exchange=${options.exchange}`);
	if (options?.active !== undefined) params.push(`active=${options.active}`);
	if (options?.limit) params.push(`limit=${options.limit}`);

	let endpoint = '/v3/reference/tickers';
	if (params.length > 0) {
		endpoint += '?' + params.join('&');
	}

	return massiveFetch(endpoint, apiKey);
}

/**
 * Get market status
 */
export async function getMarketStatus(apiKey: string): Promise<MassiveMarketStatus> {
	return massiveFetch<MassiveMarketStatus>('/v1/marketstatus/now', apiKey);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format snapshot to standardized quote format
 */
export function formatSnapshot(snapshot: MassiveTickerSnapshot['ticker']) {
	return {
		symbol: snapshot.ticker,
		price: snapshot.day.c,
		open: snapshot.day.o,
		high: snapshot.day.h,
		low: snapshot.day.l,
		volume: snapshot.day.v,
		vwap: snapshot.day.vw,
		change: snapshot.todaysChange,
		changePercent: snapshot.todaysChangePerc,
		previousClose: snapshot.prevDay.c,
		timestamp: new Date(snapshot.updated).toISOString()
	};
}

/**
 * Format aggregates to standardized OHLCV array
 */
export function formatAggregates(data: MassiveAggregates) {
	return data.results.map(bar => ({
		date: new Date(bar.t).toISOString().split('T')[0],
		open: bar.o,
		high: bar.h,
		low: bar.l,
		close: bar.c,
		volume: bar.v,
		vwap: bar.vw,
		transactions: bar.n
	}));
}

/**
 * Get 1-year daily history for a symbol
 */
export async function get1YearHistory(ticker: string, apiKey: string): Promise<MassiveAggregates> {
	const to = new Date().toISOString().split('T')[0];
	const from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

	return getAggregates(ticker, 1, 'day', from, to, apiKey, {
		adjusted: true,
		sort: 'asc',
		limit: 365
	});
}

/**
 * Get 5-year daily history for a symbol
 */
export async function get5YearHistory(ticker: string, apiKey: string): Promise<MassiveAggregates> {
	const to = new Date().toISOString().split('T')[0];
	const from = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

	return getAggregates(ticker, 1, 'day', from, to, apiKey, {
		adjusted: true,
		sort: 'asc',
		limit: 5000
	});
}
