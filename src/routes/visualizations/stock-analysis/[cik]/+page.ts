import type { PageLoad } from './$types';

interface DailyOHLCV {
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

interface PeriodMetrics {
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

interface EntityStockData {
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

interface SECFiling {
	accessionNumber: string;
	filingDate: string;
	form: string;
	description: string;
	documentUrl: string;
}

interface EntityFilings {
	cik: string;
	company: string;
	filings: SECFiling[];
}

interface EntitySummary {
	cik: string;
	ticker: string;
	company: string;
	periods: Array<{
		ticker: string;
		start: string;
		end: string;
	}>;
}

export const load: PageLoad = async ({ params, fetch }) => {
	const cik = params.cik;

	// Try to load stock data
	let stockData: EntityStockData | null = null;
	let filings: SECFiling[] = [];

	// First, get the summary to find the correct file name
	try {
		const summaryResponse = await fetch('/json/entities-summary.json');
		if (summaryResponse.ok) {
			const summary = await summaryResponse.json();
			const entity = summary.entities?.find((e: EntitySummary) => e.cik === cik);

			if (entity && entity.periods.length > 0) {
				// Build the file name from the entity data
				const period = entity.periods[0];
				const startYear = period.start.split('-')[0];
				const endYear = period.end.split('-')[0];
				const fileName = `${cik}-${period.ticker}-${startYear}-${endYear}.json`;

				const stockResponse = await fetch(`/json/entities/${fileName}`);
				if (stockResponse.ok) {
					stockData = await stockResponse.json();
				}
			}
		}
	} catch {
		// Continue without stock data
	}

	// Try to load SEC filings
	try {
		const filingsResponse = await fetch(`/json/entities/${cik}-filings.json`);
		if (filingsResponse.ok) {
			const filingsData: EntityFilings = await filingsResponse.json();
			filings = filingsData.filings ?? [];
		}
	} catch {
		// Continue without filings
	}

	return {
		cik,
		stockData,
		filings
	};
};

export const prerender = true;
