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

export interface StockWithHistory {
	symbol: string;
	name: string;
	sector?: string;
	marketCap?: number;
	logo?: string;
	price?: number;
	change?: number;
	changePercent?: number;
	historyDays: number;
	historyStart?: string;
	historyEnd?: string;
}

// Stocks that have 5-year history data
const STOCKS_WITH_HISTORY = [
	'AAPL', 'AMZN', 'BRK.B', 'GOOGL', 'JNJ', 'META', 'MSFT', 'NVDA', 'TSLA', 'UNH'
];

export const load: PageLoad = async ({ fetch }) => {
	// Load SEC entities summary
	let summary: AllEntitiesSummary | null = null;
	try {
		const response = await fetch('/json/entities-summary.json');
		if (response.ok) {
			summary = await response.json();
		}
	} catch {
		// Continue without entities
	}

	// Load stocks with history
	const stocksWithHistory: StockWithHistory[] = [];

	// Load profiles
	const profilesMap = new Map<string, { name: string; sector?: string; marketCap?: number; logo?: string }>();
	try {
		const profilesRes = await fetch('/json/market/sp500-profiles.json');
		if (profilesRes.ok) {
			const data = await profilesRes.json();
			for (const p of data.profiles || []) {
				profilesMap.set(p.symbol, {
					name: p.name,
					sector: p.sector,
					marketCap: p.marketCap,
					logo: p.logo
				});
			}
		}
	} catch {
		// Continue without profiles
	}

	// Load each stock's data in parallel
	const loadPromises = STOCKS_WITH_HISTORY.map(async (symbol) => {
		const stock: StockWithHistory = {
			symbol,
			name: profilesMap.get(symbol)?.name || symbol,
			sector: profilesMap.get(symbol)?.sector,
			marketCap: profilesMap.get(symbol)?.marketCap,
			logo: profilesMap.get(symbol)?.logo,
			historyDays: 0
		};

		// Load metrics
		try {
			const metricsRes = await fetch(`/json/companies/${symbol}-metrics.json`);
			if (metricsRes.ok) {
				const metrics = await metricsRes.json();
				if (metrics.quote) {
					stock.price = metrics.quote.price;
					stock.change = metrics.quote.change;
					stock.changePercent = metrics.quote.changePercent;
				}
			}
		} catch {
			// Continue without metrics
		}

		// Load history metadata
		try {
			const historyRes = await fetch(`/json/companies/${symbol}-history-5y.json`);
			if (historyRes.ok) {
				const history = await historyRes.json();
				const data = history.data || [];
				stock.historyDays = data.length;
				if (data.length > 0) {
					stock.historyStart = data[0].date;
					stock.historyEnd = data[data.length - 1].date;
				}
			}
		} catch {
			// Continue without history
		}

		return stock;
	});

	const loadedStocks = await Promise.all(loadPromises);
	stocksWithHistory.push(...loadedStocks.filter(s => s.historyDays > 0));

	// Sort by market cap
	stocksWithHistory.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

	return {
		summary,
		stocksWithHistory
	};
};

export const prerender = true;
