/**
 * API Client Index
 *
 * Centralized exports for all financial data API clients
 */

// Individual API clients
export * as finnhub from './finnhub';
export * as twelvedata from './twelvedata';
export * as alphavantage from './alphavantage';
export * as massive from './massive';

// Cache utilities
export * as cache from './cache';
export { TTL, CacheKeys } from './cache';

// Re-export commonly used types
export type {
	FinnhubQuote,
	FinnhubCompanyProfile,
	FinnhubCompanyNews,
	FinnhubRecommendation,
	FinnhubEarnings,
	FinnhubSECFiling
} from './finnhub';

export type {
	TwelveDataTimeSeries,
	TwelveDataOHLCV,
	TwelveDataQuote,
	TimeInterval
} from './twelvedata';

export type {
	AlphaVantageGlobalQuote,
	AlphaVantageBatchQuote,
	AlphaVantageOverview
} from './alphavantage';

export type {
	MassiveTickerSnapshot,
	MassiveAggregates,
	MassiveTickerDetails
} from './massive';
