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

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch('/json/entities-summary.json');
		if (!response.ok) {
			return { summary: null };
		}
		const summary: AllEntitiesSummary = await response.json();
		return { summary };
	} catch {
		return { summary: null };
	}
};

export const prerender = true;
