/**
 * Finnhub API Client
 *
 * Primary use: Company profiles, logos, news, SEC filings, real-time quotes
 * Rate limit: 30 requests/second (free tier)
 * Documentation: https://finnhub.io/docs/api
 */

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_LOGO_CDN = 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo';

// Rate limiting: 30 requests per second
let requestQueue: number[] = [];
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 1000;

/**
 * Rate limiter - ensures we don't exceed 30 requests/second
 */
async function waitForRateLimit(): Promise<void> {
	const now = Date.now();
	// Remove requests older than 1 second
	requestQueue = requestQueue.filter(time => now - time < RATE_WINDOW_MS);

	if (requestQueue.length >= RATE_LIMIT) {
		// Wait until the oldest request expires
		const oldestRequest = requestQueue[0];
		const waitTime = RATE_WINDOW_MS - (now - oldestRequest) + 10;
		await new Promise(resolve => setTimeout(resolve, waitTime));
	}

	requestQueue.push(Date.now());
}

/**
 * Make authenticated request to Finnhub API
 */
async function finnhubFetch<T>(endpoint: string, apiKey: string): Promise<T> {
	await waitForRateLimit();

	const url = `${FINNHUB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${apiKey}`;

	const response = await fetch(url);

	if (response.status === 429) {
		// Rate limited - wait and retry
		await new Promise(resolve => setTimeout(resolve, 1000));
		return finnhubFetch<T>(endpoint, apiKey);
	}

	if (!response.ok) {
		throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
	}

	return response.json();
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface FinnhubQuote {
	c: number;   // Current price
	d: number;   // Change
	dp: number;  // Percent change
	h: number;   // High of day
	l: number;   // Low of day
	o: number;   // Open
	pc: number;  // Previous close
	t: number;   // Timestamp
}

export interface FinnhubCompanyProfile {
	country: string;
	currency: string;
	exchange: string;
	finnhubIndustry: string;
	ipo: string;
	logo: string;
	marketCapitalization: number;
	name: string;
	phone: string;
	shareOutstanding: number;
	ticker: string;
	weburl: string;
}

export interface FinnhubCompanyNews {
	category: string;
	datetime: number;
	headline: string;
	id: number;
	image: string;
	related: string;
	source: string;
	summary: string;
	url: string;
}

export interface FinnhubRecommendation {
	buy: number;
	hold: number;
	period: string;
	sell: number;
	strongBuy: number;
	strongSell: number;
	symbol: string;
}

export interface FinnhubEarnings {
	actual: number | null;
	estimate: number | null;
	period: string;
	quarter: number;
	surprise: number | null;
	surprisePercent: number | null;
	symbol: string;
	year: number;
}

export interface FinnhubInsiderTransaction {
	name: string;
	share: number;
	change: number;
	filingDate: string;
	transactionDate: string;
	transactionCode: string;
	transactionPrice: number;
}

export interface FinnhubSECFiling {
	acceptedDate: string;
	accessNumber: string;
	cik: string;
	filedDate: string;
	form: string;
	reportUrl: string;
	symbol: string;
}

export interface FinnhubSymbolSearch {
	description: string;
	displaySymbol: string;
	symbol: string;
	type: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get real-time quote for a symbol
 */
export async function getQuote(symbol: string, apiKey: string): Promise<FinnhubQuote> {
	return finnhubFetch<FinnhubQuote>(`/quote?symbol=${symbol}`, apiKey);
}

/**
 * Get company profile (includes logo URL)
 */
export async function getCompanyProfile(symbol: string, apiKey: string): Promise<FinnhubCompanyProfile> {
	return finnhubFetch<FinnhubCompanyProfile>(`/stock/profile2?symbol=${symbol}`, apiKey);
}

/**
 * Get company news (1 year history on free tier)
 * @param from - Start date (YYYY-MM-DD)
 * @param to - End date (YYYY-MM-DD)
 */
export async function getCompanyNews(
	symbol: string,
	from: string,
	to: string,
	apiKey: string
): Promise<FinnhubCompanyNews[]> {
	return finnhubFetch<FinnhubCompanyNews[]>(`/company-news?symbol=${symbol}&from=${from}&to=${to}`, apiKey);
}

/**
 * Get analyst recommendations
 */
export async function getRecommendations(symbol: string, apiKey: string): Promise<FinnhubRecommendation[]> {
	return finnhubFetch<FinnhubRecommendation[]>(`/stock/recommendation?symbol=${symbol}`, apiKey);
}

/**
 * Get earnings history (last 4 quarters)
 */
export async function getEarnings(symbol: string, apiKey: string): Promise<FinnhubEarnings[]> {
	return finnhubFetch<FinnhubEarnings[]>(`/stock/earnings?symbol=${symbol}`, apiKey);
}

/**
 * Get insider transactions
 */
export async function getInsiderTransactions(symbol: string, apiKey: string): Promise<{ data: FinnhubInsiderTransaction[] }> {
	return finnhubFetch<{ data: FinnhubInsiderTransaction[] }>(`/stock/insider-transactions?symbol=${symbol}`, apiKey);
}

/**
 * Get SEC filings
 */
export async function getSECFilings(symbol: string, apiKey: string): Promise<FinnhubSECFiling[]> {
	return finnhubFetch<FinnhubSECFiling[]>(`/stock/filings?symbol=${symbol}`, apiKey);
}

/**
 * Get peer companies
 */
export async function getPeers(symbol: string, apiKey: string): Promise<string[]> {
	return finnhubFetch<string[]>(`/stock/peers?symbol=${symbol}`, apiKey);
}

/**
 * Search for symbols by name
 */
export async function searchSymbols(query: string, apiKey: string): Promise<{ result: FinnhubSymbolSearch[] }> {
	return finnhubFetch<{ result: FinnhubSymbolSearch[] }>(`/search?q=${encodeURIComponent(query)}`, apiKey);
}

/**
 * Get market status
 */
export async function getMarketStatus(exchange: string, apiKey: string): Promise<{ exchange: string; holiday: string | null; isOpen: boolean; session: string; timezone: string }> {
	return finnhubFetch(`/stock/market-status?exchange=${exchange}`, apiKey);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get logo URL for a symbol
 * Note: Logo URLs follow a predictable pattern on Finnhub CDN
 */
export function getLogoUrl(symbol: string): string {
	return `${FINNHUB_LOGO_CDN}/${symbol.toUpperCase()}.png`;
}

/**
 * Format a Finnhub quote into a standardized format
 */
export function formatQuote(quote: FinnhubQuote, symbol: string) {
	return {
		symbol,
		price: quote.c,
		change: quote.d,
		changePercent: quote.dp,
		high: quote.h,
		low: quote.l,
		open: quote.o,
		previousClose: quote.pc,
		timestamp: new Date(quote.t * 1000).toISOString()
	};
}

/**
 * Get recent news (last 7 days)
 */
export async function getRecentNews(symbol: string, apiKey: string): Promise<FinnhubCompanyNews[]> {
	const to = new Date().toISOString().split('T')[0];
	const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
	return getCompanyNews(symbol, from, to, apiKey);
}
