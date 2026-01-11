/**
 * Entity Configuration
 * Defines all tracked entities with their CIKs, tickers, and operating periods
 */

import type { EntityConfig } from './data-types';

export const ENTITIES: EntityConfig[] = [
	// ========================================================================
	// ENTITIES WITH MARKET DATA (5)
	// ========================================================================

	{
		cik: 'CIK0000878146',
		cikNumber: '0000878146',
		primaryTicker: 'LGAL',
		category: 'corporate',
		tickers: [
			{
				symbol: 'LGAL',
				startDate: '2001-06-12', // Post-reverse merger
				endDate: '2010-12-02',
				exchange: 'PINK'
			}
		],
		names: [
			{
				name: 'Dynamic Associates Inc.',
				startDate: '1993-01-01',
				endDate: '2001-06-11'
			},
			{
				name: 'Legal Access Technologies Inc.',
				startDate: '2001-06-12',
				endDate: null
			}
		],
		relatedCiks: ['CIK0001144030'], // Kyleen E Cane was director
		notes: 'Reverse merger with Tele-Lawyer Inc. on June 12, 2001. 153:1 reverse split.'
	},

	{
		cik: 'CIK0000013156',
		cikNumber: '0000013156',
		primaryTicker: 'GLXZ',
		category: 'corporate',
		tickers: [
			{
				symbol: 'SDVF',
				startDate: '2000-01-01',
				endDate: '2007-12-31',
				exchange: 'OTCBB'
			},
			{
				symbol: 'SDFD',
				startDate: '2000-01-01',
				endDate: '2007-12-31',
				exchange: 'OTCBB'
			},
			{
				symbol: 'GLXZ',
				startDate: '2009-08-04',
				endDate: null,
				exchange: 'PINK'
			}
		],
		names: [
			{
				name: 'Book Corp of America',
				startDate: '1980-01-01',
				endDate: '1999-12-31'
			},
			{
				name: 'Secured Diversified Investment Ltd',
				startDate: '2000-01-01',
				endDate: '2009-08-03'
			},
			{
				name: 'Galaxy Gaming, Inc.',
				startDate: '2009-08-04',
				endDate: null
			}
		],
		notes: 'Multiple name changes. Galaxy Gaming focused on casino gaming equipment.'
	},

	{
		cik: 'CIK0001059577',
		cikNumber: '0001059577',
		primaryTicker: 'DAVN',
		category: 'corporate',
		tickers: [
			{
				symbol: 'DAVN',
				startDate: '2006-01-01',
				endDate: '2008-12-31',
				exchange: 'OTCBB'
			},
			{
				symbol: 'DAVNE',
				startDate: '2008-01-01',
				endDate: '2008-12-31',
				exchange: 'OTCBB'
			}
		],
		names: [
			{
				name: 'MW Medical Inc.',
				startDate: '1997-01-01',
				endDate: '2006-12-31'
			},
			{
				name: 'Davi Skin Inc.',
				startDate: '2007-01-01',
				endDate: null
			}
		],
		relatedCiks: ['CIK0001286757'], // Jan Wallace was CEO
		notes: 'Bankruptcy reorganization. Wallace became sole secured creditor.'
	},

	{
		cik: 'CIK0001543098',
		cikNumber: '0001543098',
		primaryTicker: 'FFSL',
		category: 'corporate',
		tickers: [
			{
				symbol: 'FFSL',
				startDate: '2008-01-01',
				endDate: '2012-12-31',
				exchange: 'OTCBB'
			},
			{
				symbol: 'ITEN',
				startDate: '2013-01-01',
				endDate: null,
				exchange: 'OTC'
			}
		],
		names: [
			{
				name: 'First Independence Corp.',
				startDate: '2008-01-01',
				endDate: '2012-12-31'
			},
			{
				name: 'CodeSmart Holdings, Inc.',
				startDate: '2013-01-01',
				endDate: null
			}
		],
		notes: 'Renamed to CodeSmart Holdings. Technology company.'
	},

	{
		cik: 'CIK0001487659',
		cikNumber: '0001487659',
		primaryTicker: 'SNPD',
		category: 'corporate',
		tickers: [
			{
				symbol: 'SNPD',
				startDate: '2011-01-01',
				endDate: '2012-12-31',
				exchange: 'PINK'
			},
			{
				symbol: 'XCLK',
				startDate: '2013-01-01',
				endDate: null,
				exchange: 'OTC'
			}
		],
		names: [
			{
				name: 'Southern Products, Inc.',
				startDate: '2009-01-01',
				endDate: '2012-12-31'
			},
			{
				name: 'Co-Signer, Inc.',
				startDate: '2013-01-01',
				endDate: null
			}
		],
		notes: 'Limited trading activity. Only 3 quotes in 2011.'
	},

	// ========================================================================
	// ENTITIES WITHOUT MARKET DATA (but tracked for SEC filings)
	// ========================================================================

	{
		cik: 'CIK0001103993',
		cikNumber: '0001103993',
		primaryTicker: 'LVGI',
		category: 'corporate',
		tickers: [
			{
				symbol: 'LVGI',
				startDate: '2000-01-01',
				endDate: null,
				exchange: 'UNKNOWN'
			}
		],
		names: [
			{
				name: 'Las Vegas Gaming, Inc.',
				startDate: '2000-01-01',
				endDate: null
			}
		],
		notes: 'No trading data found in 2008-2011 archives.'
	},

	{
		cik: 'CIK0001100131',
		cikNumber: '0001100131',
		primaryTicker: 'SSSI',
		category: 'corporate',
		tickers: [
			{
				symbol: 'SSSI',
				startDate: '2000-01-01',
				endDate: null,
				exchange: 'UNKNOWN'
			}
		],
		names: [
			{
				name: 'Sedona Software Solutions, Inc.',
				startDate: '2000-01-01',
				endDate: null
			}
		],
		notes: 'No trading data found.'
	},

	{
		cik: 'CIK0001507718',
		cikNumber: '0001507718',
		primaryTicker: 'CRPT',
		category: 'corporate',
		tickers: [
			{
				symbol: 'CRPT',
				startDate: '2010-01-01',
				endDate: null,
				exchange: 'OTC'
			}
		],
		names: [
			{
				name: 'Northwest Resources, Inc.',
				startDate: '2010-01-01',
				endDate: '2012-12-31'
			},
			{
				name: 'Cubed, Inc.',
				startDate: '2013-01-01',
				endDate: null
			}
		],
		notes: 'No trading data found in archives.'
	},

	{
		cik: 'CIK0001561622',
		cikNumber: '0001561622',
		primaryTicker: 'TSGL',
		category: 'corporate',
		tickers: [
			{
				symbol: 'TSGL',
				startDate: '2012-01-01',
				endDate: null,
				exchange: 'OTC'
			}
		],
		names: [
			{
				name: 'Staffing Group Ltd.',
				startDate: '2012-01-01',
				endDate: null
			},
			{
				name: 'Aviana Corp.',
				startDate: '2014-01-01',
				endDate: null
			}
		],
		notes: 'No trading data found.'
	},

	// ========================================================================
	// INDIVIDUAL FILERS
	// ========================================================================

	{
		cik: 'CIK0001144030',
		cikNumber: '0001144030',
		primaryTicker: 'LGAL', // Associated company
		category: 'individual',
		tickers: [],
		names: [
			{
				name: 'Michael A. Cane',
				startDate: '1990-01-01',
				endDate: '2001-06-27'
			},
			{
				name: 'Kyleen E Cane',
				startDate: '2001-06-28', // Name change date
				endDate: null
			}
		],
		relatedCiks: ['CIK0000878146', 'CIK0001059577'],
		notes:
			'Name changed from Michael A. Cane to Kyleen E Cane on June 28, 2001. Director of multiple entities.'
	},

	{
		cik: 'CIK0001286757',
		cikNumber: '0001286757',
		primaryTicker: 'DAVN', // Associated company
		category: 'individual',
		tickers: [],
		names: [
			{
				name: 'Jan Wallace',
				startDate: '2000-01-01',
				endDate: null
			}
		],
		relatedCiks: ['CIK0001059577', 'CIK0000878146'],
		notes: 'CEO of MW Medical/Davi Skin. Sole secured creditor in bankruptcy.'
	},

	{
		cik: 'CIK0001255294',
		cikNumber: '0001255294',
		primaryTicker: 'SSSI', // Associated filing
		category: 'corporate',
		tickers: [],
		names: [
			{
				name: 'Cane Clark LLP',
				startDate: '2003-01-01',
				endDate: null
			}
		],
		notes: 'Law firm. Not publicly traded. SEC filings related to client companies.'
	}
];

// ========================================================================
// Helper Functions
// ========================================================================

export function getEntityByCik(cik: string): EntityConfig | undefined {
	return ENTITIES.find((e) => e.cik === cik);
}

export function getEntityByTicker(ticker: string): EntityConfig | undefined {
	return ENTITIES.find((e) => e.tickers.some((t) => t.symbol === ticker) || e.primaryTicker === ticker);
}

export function getCorporateEntities(): EntityConfig[] {
	return ENTITIES.filter((e) => e.category === 'corporate');
}

export function getEntitiesWithMarketData(): EntityConfig[] {
	// These are the entities we have actual trading data for
	const withData = ['CIK0000878146', 'CIK0000013156', 'CIK0001059577', 'CIK0001543098', 'CIK0001487659'];
	return ENTITIES.filter((e) => withData.includes(e.cik));
}

export function getCurrentName(entity: EntityConfig, asOfDate?: string): string {
	const targetDate = asOfDate ? new Date(asOfDate) : new Date();
	const sorted = [...entity.names].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

	for (const period of sorted) {
		const start = new Date(period.startDate);
		const end = period.endDate ? new Date(period.endDate) : new Date('2099-12-31');
		if (targetDate >= start && targetDate <= end) {
			return period.name;
		}
	}

	return sorted[0]?.name ?? 'Unknown';
}

export function getTickerForDate(entity: EntityConfig, date: string): string | null {
	const targetDate = new Date(date);

	for (const ticker of entity.tickers) {
		const start = new Date(ticker.startDate);
		const end = ticker.endDate ? new Date(ticker.endDate) : new Date('2099-12-31');
		if (targetDate >= start && targetDate <= end) {
			return ticker.symbol;
		}
	}

	return null;
}

// File naming helpers
export function generateFileName(cik: string, ticker: string, startYear: number, endYear: number): string {
	return `${cik}-${ticker}-${startYear}-${endYear}`;
}
