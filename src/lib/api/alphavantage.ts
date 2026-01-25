/**
 * Alpha Vantage API Client
 *
 * Primary use: Bulk quotes (100 symbols), technical indicators
 * Rate limit: 25 requests/day, 5 requests/minute (free tier)
 * Documentation: https://www.alphavantage.co/documentation/
 */

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Rate limiting: 5 requests per minute, 25 per day
let minuteRequests: number[] = [];
let dailyRequests = 0;
let lastDayReset = new Date().toDateString();

const MINUTE_LIMIT = 5;
const DAILY_LIMIT = 25;
const MINUTE_MS = 60000;

/**
 * Rate limiter - ensures we don't exceed 5 requests/minute or 25/day
 */
async function waitForRateLimit(): Promise<void> {
	// Reset daily counter if it's a new day
	const today = new Date().toDateString();
	if (today !== lastDayReset) {
		dailyRequests = 0;
		lastDayReset = today;
	}

	// Check daily limit
	if (dailyRequests >= DAILY_LIMIT) {
		throw new Error('Alpha Vantage daily limit (25 requests) exceeded. Try again tomorrow.');
	}

	const now = Date.now();
	// Remove requests older than 1 minute
	minuteRequests = minuteRequests.filter(time => now - time < MINUTE_MS);

	if (minuteRequests.length >= MINUTE_LIMIT) {
		// Wait until the oldest request expires
		const oldestRequest = minuteRequests[0];
		const waitTime = MINUTE_MS - (now - oldestRequest) + 100;
		console.log(`Alpha Vantage rate limit: waiting ${waitTime}ms`);
		await new Promise(resolve => setTimeout(resolve, waitTime));
		return waitForRateLimit();
	}

	minuteRequests.push(Date.now());
	dailyRequests++;
}

/**
 * Make authenticated request to Alpha Vantage API
 */
async function alphaVantageFetch<T>(params: Record<string, string>, apiKey: string): Promise<T> {
	await waitForRateLimit();

	const queryParams = new URLSearchParams({ ...params, apikey: apiKey });
	const url = `${ALPHA_VANTAGE_BASE_URL}?${queryParams}`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Alpha Vantage API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();

	// Check for API error in response body
	if (data['Error Message']) {
		throw new Error(`Alpha Vantage API error: ${data['Error Message']}`);
	}

	if (data['Note']) {
		// Rate limit warning
		console.warn(`Alpha Vantage warning: ${data['Note']}`);
	}

	if (data['Information']) {
		// Usually indicates rate limiting
		throw new Error(`Alpha Vantage rate limit: ${data['Information']}`);
	}

	return data;
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface AlphaVantageGlobalQuote {
	'Global Quote': {
		'01. symbol': string;
		'02. open': string;
		'03. high': string;
		'04. low': string;
		'05. price': string;
		'06. volume': string;
		'07. latest trading day': string;
		'08. previous close': string;
		'09. change': string;
		'10. change percent': string;
	};
}

export interface AlphaVantageBatchQuote {
	symbol: string;
	open: string;
	high: string;
	low: string;
	price: string;
	volume: string;
	latestTradingDay: string;
	previousClose: string;
	change: string;
	changePercent: string;
}

export interface AlphaVantageTimeSeries {
	'Meta Data': {
		'1. Information': string;
		'2. Symbol': string;
		'3. Last Refreshed': string;
		'4. Output Size': string;
		'5. Time Zone': string;
	};
	'Time Series (Daily)': Record<string, {
		'1. open': string;
		'2. high': string;
		'3. low': string;
		'4. close': string;
		'5. volume': string;
	}>;
}

export interface AlphaVantageOverview {
	Symbol: string;
	AssetType: string;
	Name: string;
	Description: string;
	CIK: string;
	Exchange: string;
	Currency: string;
	Country: string;
	Sector: string;
	Industry: string;
	Address: string;
	FiscalYearEnd: string;
	LatestQuarter: string;
	MarketCapitalization: string;
	EBITDA: string;
	PERatio: string;
	PEGRatio: string;
	BookValue: string;
	DividendPerShare: string;
	DividendYield: string;
	EPS: string;
	RevenuePerShareTTM: string;
	ProfitMargin: string;
	OperatingMarginTTM: string;
	ReturnOnAssetsTTM: string;
	ReturnOnEquityTTM: string;
	RevenueTTM: string;
	GrossProfitTTM: string;
	DilutedEPSTTM: string;
	QuarterlyEarningsGrowthYOY: string;
	QuarterlyRevenueGrowthYOY: string;
	AnalystTargetPrice: string;
	AnalystRatingStrongBuy: string;
	AnalystRatingBuy: string;
	AnalystRatingHold: string;
	AnalystRatingSell: string;
	AnalystRatingStrongSell: string;
	TrailingPE: string;
	ForwardPE: string;
	PriceToSalesRatioTTM: string;
	PriceToBookRatio: string;
	EVToRevenue: string;
	EVToEBITDA: string;
	Beta: string;
	'52WeekHigh': string;
	'52WeekLow': string;
	'50DayMovingAverage': string;
	'200DayMovingAverage': string;
	SharesOutstanding: string;
	DividendDate: string;
	ExDividendDate: string;
}

export interface AlphaVantageSymbolSearch {
	bestMatches: {
		'1. symbol': string;
		'2. name': string;
		'3. type': string;
		'4. region': string;
		'5. marketOpen': string;
		'6. marketClose': string;
		'7. timezone': string;
		'8. currency': string;
		'9. matchScore': string;
	}[];
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get real-time quote for a single symbol
 */
export async function getQuote(symbol: string, apiKey: string): Promise<AlphaVantageGlobalQuote> {
	return alphaVantageFetch({ function: 'GLOBAL_QUOTE', symbol }, apiKey);
}

/**
 * Get bulk quotes for multiple symbols (up to 100)
 * This is the most efficient way to get quotes on the free tier
 */
export async function getBulkQuotes(
	symbols: string[],
	apiKey: string
): Promise<AlphaVantageBatchQuote[]> {
	if (symbols.length > 100) {
		throw new Error('Alpha Vantage batch quotes limited to 100 symbols');
	}

	const data = await alphaVantageFetch<{ 'Stock Quotes': AlphaVantageBatchQuote[] }>(
		{ function: 'BATCH_STOCK_QUOTES', symbols: symbols.join(',') },
		apiKey
	);

	return data['Stock Quotes'] || [];
}

/**
 * Get daily time series (full 20+ year history)
 */
export async function getTimeSeriesDaily(
	symbol: string,
	apiKey: string,
	outputsize: 'compact' | 'full' = 'compact'
): Promise<AlphaVantageTimeSeries> {
	return alphaVantageFetch(
		{ function: 'TIME_SERIES_DAILY', symbol, outputsize },
		apiKey
	);
}

/**
 * Get company overview (fundamentals)
 */
export async function getOverview(symbol: string, apiKey: string): Promise<AlphaVantageOverview> {
	return alphaVantageFetch({ function: 'OVERVIEW', symbol }, apiKey);
}

/**
 * Search for symbols by keywords
 */
export async function searchSymbols(keywords: string, apiKey: string): Promise<AlphaVantageSymbolSearch> {
	return alphaVantageFetch({ function: 'SYMBOL_SEARCH', keywords }, apiKey);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format Global Quote to standardized format
 */
export function formatGlobalQuote(data: AlphaVantageGlobalQuote) {
	const quote = data['Global Quote'];
	return {
		symbol: quote['01. symbol'],
		open: parseFloat(quote['02. open']),
		high: parseFloat(quote['03. high']),
		low: parseFloat(quote['04. low']),
		price: parseFloat(quote['05. price']),
		volume: parseInt(quote['06. volume'], 10),
		latestTradingDay: quote['07. latest trading day'],
		previousClose: parseFloat(quote['08. previous close']),
		change: parseFloat(quote['09. change']),
		changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
	};
}

/**
 * Format batch quote to standardized format
 */
export function formatBatchQuote(quote: AlphaVantageBatchQuote) {
	return {
		symbol: quote.symbol,
		open: parseFloat(quote.open),
		high: parseFloat(quote.high),
		low: parseFloat(quote.low),
		price: parseFloat(quote.price),
		volume: parseInt(quote.volume, 10),
		latestTradingDay: quote.latestTradingDay,
		previousClose: parseFloat(quote.previousClose),
		change: parseFloat(quote.change),
		changePercent: parseFloat(quote.changePercent.replace('%', ''))
	};
}

/**
 * Convert time series to standardized OHLCV array
 */
export function formatTimeSeries(data: AlphaVantageTimeSeries) {
	const timeSeries = data['Time Series (Daily)'];
	return Object.entries(timeSeries)
		.map(([date, values]) => ({
			date,
			open: parseFloat(values['1. open']),
			high: parseFloat(values['2. high']),
			low: parseFloat(values['3. low']),
			close: parseFloat(values['4. close']),
			volume: parseInt(values['5. volume'], 10)
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get remaining daily API calls
 */
export function getRemainingDailyQuota(): number {
	return DAILY_LIMIT - dailyRequests;
}

/**
 * Check if we can make API calls today
 */
export function canMakeRequest(): boolean {
	const today = new Date().toDateString();
	if (today !== lastDayReset) {
		return true; // New day, quota reset
	}
	return dailyRequests < DAILY_LIMIT;
}
