/**
 * Portfolio Type Definitions
 *
 * Types for portfolio management, holdings, and watchlist
 */

import type { Quote, OHLCV, CompanyProfile } from './market';

// ============================================================================
// Portfolio Core Types
// ============================================================================

/**
 * Stock holding position
 */
export interface Holding {
	id: string; // Unique identifier for the position
	symbol: string;
	shares: number;
	avgCost: number; // Average cost per share
	purchaseDate: string; // YYYY-MM-DD
	notes?: string;
	source?: 'manual' | 'csv' | 'ocr';
}

/**
 * Holding with computed values
 */
export interface HoldingWithMetrics extends Holding {
	currentPrice: number;
	currentValue: number;
	costBasis: number;
	gainLoss: number;
	gainLossPercent: number;
	dayChange: number;
	dayChangePercent: number;
}

/**
 * Watchlist item
 */
export interface WatchlistItem {
	symbol: string;
	name?: string;
	addedAt: string;
	targetPrice?: number;
	notes?: string;
}

/**
 * Portfolio state
 */
export interface Portfolio {
	holdings: Holding[];
	watchlist: WatchlistItem[];
	lastUpdated: string;
	version: number; // For migration purposes
}

// ============================================================================
// Portfolio Summary Types
// ============================================================================

/**
 * Portfolio summary stats
 */
export interface PortfolioSummary {
	totalValue: number;
	totalCostBasis: number;
	totalGainLoss: number;
	totalGainLossPercent: number;
	dayChange: number;
	dayChangePercent: number;
	holdingsCount: number;
	watchlistCount: number;
}

/**
 * Portfolio allocation by sector
 */
export interface SectorAllocation {
	sector: string;
	value: number;
	percentage: number;
	holdings: string[]; // Symbols
}

/**
 * Portfolio allocation by stock
 */
export interface StockAllocation {
	symbol: string;
	name?: string;
	value: number;
	percentage: number;
	shares: number;
}

// ============================================================================
// Portfolio History Types
// ============================================================================

/**
 * Portfolio value at a point in time
 */
export interface PortfolioSnapshot {
	date: string;
	totalValue: number;
	costBasis: number;
	dayChange?: number;
}

/**
 * Portfolio performance over time
 */
export interface PortfolioPerformance {
	snapshots: PortfolioSnapshot[];
	startDate: string;
	endDate: string;
	totalReturn: number;
	totalReturnPercent: number;
	cagr?: number; // Compound Annual Growth Rate
}

// ============================================================================
// Import/Export Types
// ============================================================================

/**
 * CSV import row (from brokerage statement)
 */
export interface ImportRow {
	symbol: string;
	shares: number;
	avgCost?: number;
	purchaseDate?: string;
	action?: 'buy' | 'sell' | 'dividend';
	price?: number;
	total?: number;
}

/**
 * Import result
 */
export interface ImportResult {
	success: boolean;
	holdings: Holding[];
	errors: string[];
	warnings: string[];
}

/**
 * Export format
 */
export type ExportFormat = 'json' | 'csv';

// ============================================================================
// Transaction Types
// ============================================================================

/**
 * Transaction (buy/sell)
 */
export interface Transaction {
	id: string;
	symbol: string;
	type: 'buy' | 'sell';
	shares: number;
	price: number;
	date: string;
	fees?: number;
	notes?: string;
}

/**
 * Dividend payment
 */
export interface Dividend {
	id: string;
	symbol: string;
	amount: number;
	date: string;
	shares: number; // Shares held at time of dividend
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Add holding form state
 */
export interface AddHoldingForm {
	symbol: string;
	shares: string;
	avgCost: string;
	purchaseDate: string;
	notes: string;
}

/**
 * Portfolio view mode
 */
export type PortfolioView = 'grid' | 'table' | 'treemap';

/**
 * Sort options for holdings
 */
export type HoldingsSortField =
	| 'symbol'
	| 'value'
	| 'gainLoss'
	| 'gainLossPercent'
	| 'dayChange'
	| 'shares';

export type SortDirection = 'asc' | 'desc';

/**
 * Holdings sort state
 */
export interface HoldingsSort {
	field: HoldingsSortField;
	direction: SortDirection;
}

// ============================================================================
// localStorage Schema
// ============================================================================

/**
 * Full localStorage schema for portfolio
 */
export interface PortfolioStorage {
	portfolio: Portfolio;
	settings: PortfolioSettings;
	lastQuoteUpdate?: string;
	cachedQuotes?: Record<string, Quote>;
}

/**
 * Portfolio settings
 */
export interface PortfolioSettings {
	view: PortfolioView;
	sort: HoldingsSort;
	showGainLossPercent: boolean;
	showDayChange: boolean;
	currency: string;
	theme?: 'light' | 'dark';
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_PORTFOLIO: Portfolio = {
	holdings: [],
	watchlist: [],
	lastUpdated: new Date().toISOString(),
	version: 1
};

export const DEFAULT_SETTINGS: PortfolioSettings = {
	view: 'grid',
	sort: { field: 'value', direction: 'desc' },
	showGainLossPercent: true,
	showDayChange: true,
	currency: 'USD'
};

export const DEFAULT_STORAGE: PortfolioStorage = {
	portfolio: DEFAULT_PORTFOLIO,
	settings: DEFAULT_SETTINGS
};

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Enriched holding with full company info and current quote
 */
export interface EnrichedHolding extends HoldingWithMetrics {
	profile?: CompanyProfile;
	history?: OHLCV[];
}

/**
 * Portfolio with all computed data
 */
export interface EnrichedPortfolio {
	holdings: EnrichedHolding[];
	watchlist: (WatchlistItem & { quote?: Quote; profile?: CompanyProfile })[];
	summary: PortfolioSummary;
	sectorAllocations: SectorAllocation[];
	stockAllocations: StockAllocation[];
}
