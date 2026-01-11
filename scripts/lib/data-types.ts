/**
 * Core data types for Historical Stock Data pipeline
 */

// ============================================================================
// Entity Configuration Types
// ============================================================================

export interface TickerPeriod {
	symbol: string;
	startDate: string; // ISO date string YYYY-MM-DD
	endDate: string | null; // null = current/unknown
	exchange: 'PINK' | 'OTCBB' | 'OTC' | 'NASDAQ' | 'NYSE' | 'UNKNOWN';
}

export interface NamePeriod {
	name: string;
	startDate: string;
	endDate: string | null;
}

export interface EntityConfig {
	cik: string; // CIK0000878146 format
	cikNumber: string; // 0000878146 format (for SEC API)
	tickers: TickerPeriod[];
	names: NamePeriod[];
	primaryTicker: string; // Most commonly used ticker
	category: 'corporate' | 'individual';
	relatedCiks?: string[]; // For entities that share CIKs over time
	notes?: string;
}

// ============================================================================
// Raw Data Types (from various sources)
// ============================================================================

export interface RawTradeRecord {
	datetime: string; // Original datetime string
	price: number;
	volume: number;
	bid?: number;
	bidSize?: number;
	ask?: number;
	askSize?: number;
	source: DataSource;
}

export type DataSource =
	| 'local-cache'
	| 'alpha-vantage'
	| 'massive'
	| 'sec-edgar'
	| 'yahoo-finance';

export interface RawDataFile {
	cik: string;
	ticker: string;
	year: number;
	source: DataSource;
	filePath: string;
	records: RawTradeRecord[];
	fetchedAt: string; // ISO timestamp
}

// ============================================================================
// Normalized Data Types
// ============================================================================

export interface NormalizedTradeRecord {
	date: string; // YYYY-MM-DD
	datetime: string; // Full ISO datetime
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	dollarVolume: number; // close * volume
	sources: DataSource[]; // Can have multiple sources for same data point
}

export interface DailyOHLCV {
	date: string;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	dollarVolume: number;
	tradeCount: number; // Number of intraday trades
	sources: DataSource[];
}

// ============================================================================
// Computed Metrics
// ============================================================================

export interface PeriodMetrics {
	peakPrice: number;
	peakDate: string;
	lowPrice: number;
	lowDate: string;
	avgPrice: number;
	highestVolumeDay: string;
	highestVolumeAmount: number;
	highestDollarVolumeDay: string;
	highestDollarVolumeAmount: number;
	totalVolume: number;
	totalDollarVolume: number;
	tradingDays: number;
	firstTradeDate: string;
	lastTradeDate: string;
	priceChange: number; // Last - First
	priceChangePercent: number;
}

// ============================================================================
// Final Output Types
// ============================================================================

export interface EntityStockData {
	cik: string;
	ticker: string;
	company: string;
	period: {
		start: string;
		end: string;
	};
	exchange: string;
	metrics: PeriodMetrics;
	dailyData: DailyOHLCV[];
	sources: DataSource[];
	generatedAt: string;
}

export interface EntitySummary {
	cik: string;
	ticker: string;
	company: string;
	periods: Array<{
		ticker: string;
		start: string;
		end: string;
		tradingDays: number;
		peakPrice: number;
		totalVolume: number;
	}>;
	hasData: boolean;
}

export interface AllEntitiesSummary {
	entities: EntitySummary[];
	totalRecords: number;
	dateRange: {
		earliest: string;
		latest: string;
	};
	generatedAt: string;
}

// ============================================================================
// SEC Filing Types
// ============================================================================

export interface SECFiling {
	accessionNumber: string;
	filingDate: string;
	form: string;
	description: string;
	documentUrl: string;
	size?: number;
}

export interface EntityFilings {
	cik: string;
	filings: SECFiling[];
	fetchedAt: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface AlphaVantageTimeSeriesResponse {
	'Meta Data': {
		'1. Information': string;
		'2. Symbol': string;
		'3. Last Refreshed': string;
		'4. Output Size': string;
		'5. Time Zone': string;
	};
	'Time Series (Daily)'?: Record<
		string,
		{
			'1. open': string;
			'2. high': string;
			'3. low': string;
			'4. close': string;
			'5. volume': string;
		}
	>;
	'Time Series (5min)'?: Record<
		string,
		{
			'1. open': string;
			'2. high': string;
			'3. low': string;
			'4. close': string;
			'5. volume': string;
		}
	>;
}

export interface MassiveTickerResponse {
	ticker: string;
	name: string;
	market: string;
	locale: string;
	primary_exchange: string;
	type: string;
	active: boolean;
	currency_name: string;
}
