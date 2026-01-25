/**
 * Twelve Data API Client
 *
 * Primary use: Historical OHLCV data (back to 1980), cryptocurrency data
 * Rate limit: 8 credits/minute, 800 credits/day (free tier)
 * Documentation: https://twelvedata.com/docs
 */

const TWELVE_DATA_BASE_URL = 'https://api.twelvedata.com';

// Rate limiting: 8 credits per minute
let creditUsage: { timestamp: number; credits: number }[] = [];
const CREDITS_PER_MINUTE = 8;
const MINUTE_MS = 60000;

/**
 * Rate limiter - ensures we don't exceed 8 credits/minute
 */
async function waitForRateLimit(creditsNeeded: number = 1): Promise<void> {
	const now = Date.now();
	// Remove usage older than 1 minute
	creditUsage = creditUsage.filter(u => now - u.timestamp < MINUTE_MS);

	const usedCredits = creditUsage.reduce((sum, u) => sum + u.credits, 0);

	if (usedCredits + creditsNeeded > CREDITS_PER_MINUTE) {
		// Wait until oldest usage expires
		const oldestUsage = creditUsage[0];
		const waitTime = MINUTE_MS - (now - oldestUsage.timestamp) + 100;
		console.log(`Twelve Data rate limit: waiting ${waitTime}ms`);
		await new Promise(resolve => setTimeout(resolve, waitTime));
		return waitForRateLimit(creditsNeeded);
	}

	creditUsage.push({ timestamp: Date.now(), credits: creditsNeeded });
}

/**
 * Make authenticated request to Twelve Data API
 */
async function twelveDataFetch<T>(endpoint: string, apiKey: string, credits: number = 1): Promise<T> {
	await waitForRateLimit(credits);

	const url = `${TWELVE_DATA_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${apiKey}`;

	const response = await fetch(url);

	if (response.status === 429) {
		// Rate limited - wait a full minute and retry
		console.log('Twelve Data rate limited, waiting 60 seconds...');
		await new Promise(resolve => setTimeout(resolve, 60000));
		return twelveDataFetch<T>(endpoint, apiKey, credits);
	}

	if (!response.ok) {
		throw new Error(`Twelve Data API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();

	// Check for API error in response body
	if (data.status === 'error') {
		throw new Error(`Twelve Data API error: ${data.message}`);
	}

	return data;
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface TwelveDataTimeSeries {
	meta: {
		symbol: string;
		interval: string;
		currency: string;
		exchange_timezone: string;
		exchange: string;
		mic_code: string;
		type: string;
	};
	values: TwelveDataOHLCV[];
}

export interface TwelveDataOHLCV {
	datetime: string;
	open: string;
	high: string;
	low: string;
	close: string;
	volume: string;
}

export interface TwelveDataQuote {
	symbol: string;
	name: string;
	exchange: string;
	mic_code: string;
	currency: string;
	datetime: string;
	timestamp: number;
	open: string;
	high: string;
	low: string;
	close: string;
	volume: string;
	previous_close: string;
	change: string;
	percent_change: string;
	average_volume: string;
	is_market_open: boolean;
	fifty_two_week: {
		low: string;
		high: string;
		low_change: string;
		high_change: string;
		low_change_percent: string;
		high_change_percent: string;
		range: string;
	};
}

export interface TwelveDataEOD {
	symbol: string;
	exchange: string;
	mic_code: string;
	currency: string;
	datetime: string;
	close: string;
}

export interface TwelveDataSymbol {
	symbol: string;
	instrument_name: string;
	exchange: string;
	mic_code: string;
	exchange_timezone: string;
	instrument_type: string;
	country: string;
	currency: string;
}

export type TimeInterval =
	| '1min' | '5min' | '15min' | '30min' | '45min'
	| '1h' | '2h' | '4h' | '8h'
	| '1day' | '1week' | '1month';

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get historical time series data
 * @param symbol - Stock symbol (e.g., 'AAPL') or crypto (e.g., 'BTC/USD')
 * @param interval - Time interval (1day for daily data)
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param outputsize - Number of data points (default 5000, max 5000)
 */
export async function getTimeSeries(
	symbol: string,
	interval: TimeInterval,
	apiKey: string,
	options?: {
		startDate?: string;
		endDate?: string;
		outputsize?: number;
	}
): Promise<TwelveDataTimeSeries> {
	let endpoint = `/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}`;

	if (options?.startDate) {
		endpoint += `&start_date=${options.startDate}`;
	}
	if (options?.endDate) {
		endpoint += `&end_date=${options.endDate}`;
	}
	if (options?.outputsize) {
		endpoint += `&outputsize=${options.outputsize}`;
	}

	return twelveDataFetch<TwelveDataTimeSeries>(endpoint, apiKey);
}

/**
 * Get real-time quote
 */
export async function getQuote(symbol: string, apiKey: string): Promise<TwelveDataQuote> {
	return twelveDataFetch<TwelveDataQuote>(`/quote?symbol=${encodeURIComponent(symbol)}`, apiKey);
}

/**
 * Get end-of-day price
 */
export async function getEOD(symbol: string, apiKey: string): Promise<TwelveDataEOD> {
	return twelveDataFetch<TwelveDataEOD>(`/eod?symbol=${encodeURIComponent(symbol)}`, apiKey);
}

/**
 * Get earliest available timestamp for a symbol
 */
export async function getEarliestTimestamp(
	symbol: string,
	interval: TimeInterval,
	apiKey: string
): Promise<{ datetime: string; unix_time: number }> {
	return twelveDataFetch(`/earliest_timestamp?symbol=${encodeURIComponent(symbol)}&interval=${interval}`, apiKey);
}

/**
 * Search for symbols
 */
export async function searchSymbols(
	query: string,
	apiKey: string,
	options?: { outputsize?: number; show_plan?: boolean }
): Promise<{ data: TwelveDataSymbol[] }> {
	let endpoint = `/symbol_search?symbol=${encodeURIComponent(query)}`;
	if (options?.outputsize) {
		endpoint += `&outputsize=${options.outputsize}`;
	}
	return twelveDataFetch(endpoint, apiKey);
}

/**
 * Get list of all available stocks
 */
export async function getStocks(
	apiKey: string,
	options?: { exchange?: string; mic_code?: string; country?: string; type?: string }
): Promise<{ data: TwelveDataSymbol[] }> {
	let endpoint = '/stocks?';
	const params: string[] = [];
	if (options?.exchange) params.push(`exchange=${options.exchange}`);
	if (options?.mic_code) params.push(`mic_code=${options.mic_code}`);
	if (options?.country) params.push(`country=${options.country}`);
	if (options?.type) params.push(`type=${options.type}`);
	endpoint += params.join('&');

	return twelveDataFetch(endpoint, apiKey);
}

/**
 * Get list of available cryptocurrencies
 */
export async function getCryptocurrencies(
	apiKey: string,
	options?: { exchange?: string }
): Promise<{ data: TwelveDataSymbol[] }> {
	let endpoint = '/cryptocurrencies';
	if (options?.exchange) {
		endpoint += `?exchange=${options.exchange}`;
	}
	return twelveDataFetch(endpoint, apiKey);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert Twelve Data OHLCV to standardized format
 */
export function formatOHLCV(data: TwelveDataOHLCV) {
	return {
		date: data.datetime,
		open: parseFloat(data.open),
		high: parseFloat(data.high),
		low: parseFloat(data.low),
		close: parseFloat(data.close),
		volume: parseInt(data.volume, 10)
	};
}

/**
 * Get 5-year daily history for a symbol
 */
export async function get5YearHistory(symbol: string, apiKey: string): Promise<TwelveDataTimeSeries> {
	const endDate = new Date().toISOString().split('T')[0];
	const startDate = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

	return getTimeSeries(symbol, '1day', apiKey, {
		startDate,
		endDate,
		outputsize: 5000
	});
}

/**
 * Get 1-year daily history for a symbol
 */
export async function get1YearHistory(symbol: string, apiKey: string): Promise<TwelveDataTimeSeries> {
	const endDate = new Date().toISOString().split('T')[0];
	const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

	return getTimeSeries(symbol, '1day', apiKey, {
		startDate,
		endDate,
		outputsize: 365
	});
}

/**
 * Get cryptocurrency history (BTC/USD or ETH/USD format)
 */
export async function getCryptoHistory(
	crypto: 'BTC' | 'ETH',
	years: number,
	apiKey: string
): Promise<TwelveDataTimeSeries> {
	const symbol = `${crypto}/USD`;
	const endDate = new Date().toISOString().split('T')[0];
	const startDate = new Date(Date.now() - years * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

	return getTimeSeries(symbol, '1day', apiKey, {
		startDate,
		endDate,
		outputsize: years * 365
	});
}
