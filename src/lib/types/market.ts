/**
 * Market Data Type Definitions
 *
 * Standardized types for market data across all providers
 */

// ============================================================================
// Core Market Types
// ============================================================================

/**
 * Standardized quote format (normalized from all providers)
 */
export interface Quote {
	symbol: string;
	price: number;
	open: number;
	high: number;
	low: number;
	volume: number;
	change: number;
	changePercent: number;
	previousClose: number;
	timestamp: string; // ISO 8601
}

/**
 * OHLCV bar data (candlestick)
 */
export interface OHLCV {
	date: string; // YYYY-MM-DD
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

/**
 * Extended OHLCV with additional metrics
 */
export interface OHLCVExtended extends OHLCV {
	vwap?: number;       // Volume weighted average price
	transactions?: number; // Number of transactions
	source?: DataSource;
}

/**
 * Data source identifier
 */
export type DataSource =
	| 'finnhub'
	| 'twelvedata'
	| 'alphavantage'
	| 'massive'
	| 'yahoo'
	| 'sec-edgar'
	| 'local-cache'
	| 'computed';

// ============================================================================
// Company Information
// ============================================================================

/**
 * Company profile (standardized from Finnhub/Massive)
 */
export interface CompanyProfile {
	symbol: string;
	name: string;
	exchange: string;
	industry: string;
	sector?: string;
	description?: string;
	ceo?: string;
	employees?: number;
	founded?: string;
	website?: string;
	phone?: string;
	address?: {
		street?: string;
		city?: string;
		state?: string;
		zip?: string;
		country?: string;
	};
	logo?: string;
	marketCap?: number;
	sharesOutstanding?: number;
	source: DataSource;
	lastUpdated: string;
}

/**
 * Company key statistics
 */
export interface KeyStats {
	symbol: string;
	marketCap: number;
	peRatio?: number;
	forwardPE?: number;
	pegRatio?: number;
	priceToBook?: number;
	priceToSales?: number;
	dividendYield?: number;
	eps?: number;
	epsGrowth?: number;
	revenueGrowth?: number;
	grossMargin?: number;
	netMargin?: number;
	roe?: number;
	roa?: number;
	debtToEquity?: number;
	currentRatio?: number;
	beta?: number;
	week52High: number;
	week52Low: number;
	avgVolume?: number;
	source: DataSource;
	lastUpdated: string;
}

// ============================================================================
// News and Events
// ============================================================================

/**
 * News article
 */
export interface NewsArticle {
	id: string | number;
	headline: string;
	summary?: string;
	source: string;
	url: string;
	image?: string;
	timestamp: string;
	symbols?: string[];
	category?: string;
}

/**
 * Earnings data
 */
export interface Earnings {
	symbol: string;
	quarter: number;
	year: number;
	date: string;
	epsEstimate?: number;
	epsActual?: number;
	surprise?: number;
	surprisePercent?: number;
	revenueEstimate?: number;
	revenueActual?: number;
}

/**
 * Analyst recommendation
 */
export interface AnalystRating {
	symbol: string;
	period: string;
	strongBuy: number;
	buy: number;
	hold: number;
	sell: number;
	strongSell: number;
	total: number;
	averageRating?: number; // 1-5 scale
}

// ============================================================================
// SEC Filings
// ============================================================================

/**
 * SEC filing metadata
 */
export interface SECFilingMeta {
	symbol: string;
	cik: string;
	accessionNumber: string;
	form: string;
	filedDate: string;
	acceptedDate: string;
	reportUrl: string;
	description?: string;
}

// ============================================================================
// Market Overview
// ============================================================================

/**
 * Market index data
 */
export interface MarketIndex {
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
	timestamp: string;
}

/**
 * Market status
 */
export interface MarketStatus {
	isOpen: boolean;
	session: 'pre-market' | 'regular' | 'after-hours' | 'closed';
	nextOpen?: string;
	nextClose?: string;
	timezone: string;
}

/**
 * Sector performance
 */
export interface SectorPerformance {
	sector: string;
	changePercent: number;
	marketCap?: number;
	stockCount?: number;
}

/**
 * Top mover (gainer/loser)
 */
export interface TopMover {
	symbol: string;
	name?: string;
	price: number;
	change: number;
	changePercent: number;
	volume: number;
}

// ============================================================================
// S&P 500 Specific
// ============================================================================

/**
 * S&P 500 constituent
 */
export interface SP500Stock {
	symbol: string;
	name: string;
	sector: string;
	subIndustry?: string;
	headquartersLocation?: string;
	dateAdded?: string;
	cik?: string;
	founded?: string;
}

/**
 * S&P 500 snapshot (cached market data)
 */
export interface SP500Snapshot {
	stocks: (SP500Stock & Quote)[];
	generatedAt: string;
	source: DataSource;
}

// ============================================================================
// Benchmark Data
// ============================================================================

/**
 * Benchmark range for a metric
 */
export interface BenchmarkRange {
	metric: string;
	low: number;
	median: number;
	high: number;
	description?: string;
}

/**
 * Market benchmark collection
 */
export interface MarketBenchmarks {
	peRatio: BenchmarkRange;
	forwardPE: BenchmarkRange;
	priceToSales: BenchmarkRange;
	priceToBook: BenchmarkRange;
	dividendYield: BenchmarkRange;
	grossMargin: BenchmarkRange;
	netMargin: BenchmarkRange;
	roe: BenchmarkRange;
	revenueGrowth: BenchmarkRange;
	epsGrowth: BenchmarkRange;
	generatedAt: string;
	sampleSize: number;
}

// ============================================================================
// Time Series Data
// ============================================================================

/**
 * Historical data with metadata
 */
export interface HistoricalData {
	symbol: string;
	interval: '1min' | '5min' | '15min' | '30min' | '1h' | '1day' | '1week' | '1month';
	data: OHLCV[];
	startDate: string;
	endDate: string;
	source: DataSource;
	lastUpdated: string;
}

/**
 * Time range options for charts
 */
export type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '2Y' | '5Y' | 'MAX';

/**
 * Computed metrics for a historical period
 */
export interface PeriodStats {
	startPrice: number;
	endPrice: number;
	highPrice: number;
	lowPrice: number;
	change: number;
	changePercent: number;
	totalVolume: number;
	avgVolume: number;
	tradingDays: number;
	volatility?: number;
}
