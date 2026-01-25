import type { PageLoad } from './$types';

interface EntitySummary {
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

interface AllEntitiesSummary {
	entities: EntitySummary[];
	totalRecords: number;
	dateRange: {
		earliest: string;
		latest: string;
	};
	generatedAt: string;
}

interface CompanyProfile {
	symbol: string;
	name: string;
	sector?: string;
	exchange?: string;
	industry?: string;
	marketCap?: number;
	logo?: string;
	website?: string;
}

interface CompanyMetrics {
	quote?: {
		price: number;
		change: number;
		changePercent: number;
		high: number;
		low: number;
		open: number;
		previousClose: number;
	};
	recommendations?: {
		buy: number;
		hold: number;
		sell: number;
		strongBuy: number;
		strongSell: number;
	};
}

export interface StockData {
	symbol: string;
	name: string;
	sector?: string;
	marketCap?: number;
	logo?: string;
	price?: number;
	change?: number;
	changePercent?: number;
	recommendation?: {
		buy: number;
		hold: number;
		sell: number;
	};
	hasHistory?: boolean;
}

// Top 25 symbols we have detailed data for
const TOP_SYMBOLS = [
	'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B',
	'UNH', 'JNJ', 'V', 'JPM', 'MA', 'PG', 'HD', 'COST',
	'AVGO', 'ADBE', 'NFLX', 'CRM', 'ORCL', 'AMD', 'INTC', 'DIS', 'PFE'
];

export const load: PageLoad = async ({ fetch }) => {
	// Load entities summary
	let summary: AllEntitiesSummary | null = null;
	try {
		const response = await fetch('/json/entities-summary.json');
		if (response.ok) {
			summary = await response.json();
		}
	} catch {
		// Continue without summary
	}

	// Load top stocks data
	const stocks: StockData[] = [];

	// Load profiles from sp500-profiles.json first for basic info
	const profilesMap = new Map<string, CompanyProfile>();
	try {
		const profilesRes = await fetch('/json/market/sp500-profiles.json');
		if (profilesRes.ok) {
			const data = await profilesRes.json();
			for (const p of data.profiles || []) {
				profilesMap.set(p.symbol, p);
			}
		}
	} catch {
		// Continue without profiles
	}

	// Load individual company data for top symbols
	const loadPromises = TOP_SYMBOLS.map(async (symbol) => {
		const stock: StockData = {
			symbol,
			name: profilesMap.get(symbol)?.name || symbol,
			sector: profilesMap.get(symbol)?.sector,
			marketCap: profilesMap.get(symbol)?.marketCap,
			logo: profilesMap.get(symbol)?.logo
		};

		// Try to load profile if not in profiles map
		if (!profilesMap.has(symbol)) {
			try {
				const profileRes = await fetch(`/json/companies/${symbol}-profile.json`);
				if (profileRes.ok) {
					const profile: CompanyProfile = await profileRes.json();
					stock.name = profile.name;
					stock.sector = profile.sector;
					stock.marketCap = profile.marketCap;
					stock.logo = profile.logo;
				}
			} catch {
				// Continue without profile
			}
		}

		// Load metrics for quote data
		try {
			const metricsRes = await fetch(`/json/companies/${symbol}-metrics.json`);
			if (metricsRes.ok) {
				const metrics: CompanyMetrics = await metricsRes.json();
				if (metrics.quote) {
					stock.price = metrics.quote.price;
					stock.change = metrics.quote.change;
					stock.changePercent = metrics.quote.changePercent;
				}
				if (metrics.recommendations) {
					stock.recommendation = {
						buy: metrics.recommendations.buy + metrics.recommendations.strongBuy,
						hold: metrics.recommendations.hold,
						sell: metrics.recommendations.sell + metrics.recommendations.strongSell
					};
				}
			}
		} catch {
			// Continue without metrics
		}

		// Check if history exists
		try {
			const historyRes = await fetch(`/json/companies/${symbol}-history-5y.json`, { method: 'HEAD' });
			stock.hasHistory = historyRes.ok;
		} catch {
			stock.hasHistory = false;
		}

		return stock;
	});

	const loadedStocks = await Promise.all(loadPromises);

	// Filter to only stocks with price data and sort by market cap
	const stocksWithData = loadedStocks
		.filter(s => s.price !== undefined)
		.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

	return {
		summary,
		stocks: stocksWithData
	};
};

export const prerender = true;
