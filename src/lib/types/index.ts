/**
 * Shared TypeScript types for the application
 */

export interface DailyOHLCV {
	date: string;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	dollarVolume: number;
	tradeCount: number;
	sources: string[];
}

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
	priceChange: number;
	priceChangePercent: number;
}

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
	sources: string[];
	generatedAt: string;
}

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
	company: string;
	filings: SECFiling[];
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

export type DataSource =
	| 'local-cache'
	| 'alpha-vantage'
	| 'massive'
	| 'sec-edgar'
	| 'yahoo-finance';
