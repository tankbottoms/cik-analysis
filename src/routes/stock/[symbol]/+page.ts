import type { PageLoad } from './$types';

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

interface Quote {
	price: number;
	change: number;
	changePercent: number;
	high: number;
	low: number;
	open: number;
	previousClose: number;
}

interface Earnings {
	actual: number;
	estimate: number;
	period: string;
	quarter: number;
	year: number;
	surprise: number;
	surprisePercent: number;
}

interface Recommendations {
	buy: number;
	hold: number;
	sell: number;
	strongBuy: number;
	strongSell: number;
	period: string;
}

interface OHLCV {
	date: string;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export interface StockPageData {
	symbol: string;
	profile: CompanyProfile | null;
	quote: Quote | null;
	earnings: Earnings[];
	recommendations: Recommendations | null;
	history: OHLCV[];
	error?: string;
}

export const load: PageLoad = async ({ params, fetch }): Promise<StockPageData> => {
	const { symbol } = params;

	const result: StockPageData = {
		symbol: symbol.toUpperCase(),
		profile: null,
		quote: null,
		earnings: [],
		recommendations: null,
		history: []
	};

	// Load profile
	try {
		const profileRes = await fetch(`/json/companies/${symbol}-profile.json`);
		if (profileRes.ok) {
			result.profile = await profileRes.json();
		}
	} catch {
		// Continue without profile
	}

	// Load metrics (quote, earnings, recommendations)
	try {
		const metricsRes = await fetch(`/json/companies/${symbol}-metrics.json`);
		if (metricsRes.ok) {
			const metrics = await metricsRes.json();
			result.quote = metrics.quote || null;
			result.earnings = metrics.earnings || [];
			result.recommendations = metrics.recommendations || null;
		}
	} catch {
		// Continue without metrics
	}

	// Load history
	try {
		const historyRes = await fetch(`/json/companies/${symbol}-history-5y.json`);
		if (historyRes.ok) {
			const historyData = await historyRes.json();
			result.history = historyData.data || [];
		}
	} catch {
		// Continue without history
	}

	// If we have no data at all, mark as error
	if (!result.profile && !result.quote && result.history.length === 0) {
		result.error = `No data available for ${symbol}`;
	}

	return result;
};

export const prerender = false;
