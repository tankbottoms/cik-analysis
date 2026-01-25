// Education definitions for tooltips and info badges throughout the application
// Links to /education route with anchor fragments for deep-linking

export interface EducationTerm {
	term: string;
	short: string;
	icon: string;
	category: string;
	categoryColor: string;
	anchor: string;
}

// Education categories
export const educationCategories = {
	'financial-analysis': { label: 'Financial Analysis', icon: 'fa-file-invoice-dollar', color: 'badge-blue' },
	'business-quality': { label: 'Business Quality', icon: 'fa-building', color: 'badge-purple' },
	'valuation': { label: 'Valuation', icon: 'fa-calculator', color: 'badge-green' },
	'portfolio': { label: 'Portfolio', icon: 'fa-chart-pie', color: 'badge-cyan' },
	'income': { label: 'Income Investing', icon: 'fa-coins', color: 'badge-amber' },
	'capital': { label: 'Capital Allocation', icon: 'fa-sitemap', color: 'badge-teal' },
	'derivatives': { label: 'Derivatives', icon: 'fa-exchange', color: 'badge-red' },
	'wealth': { label: 'Wealth Building', icon: 'fa-piggy-bank', color: 'badge-gray' }
} as const;

// Education terms with tooltips
export const educationTerms: Record<string, EducationTerm> = {
	// Trading & Volume
	'volume': {
		term: 'Trading Volume',
		short: 'Number of shares traded during a period. High volume indicates strong interest; low volume suggests limited activity.',
		icon: 'fa-chart-bar',
		category: 'financial-analysis',
		categoryColor: 'badge-blue',
		anchor: 'cash-flow'
	},
	'dollar-volume': {
		term: 'Dollar Volume',
		short: 'Total value of shares traded (price x volume). Better indicator of actual capital flow than share volume alone.',
		icon: 'fa-dollar-sign',
		category: 'financial-analysis',
		categoryColor: 'badge-blue',
		anchor: 'cash-flow'
	},
	'trading-days': {
		term: 'Trading Days',
		short: 'Days when the stock exchange is open for trading. Excludes weekends, holidays, and days the stock was halted.',
		icon: 'fa-calendar',
		category: 'financial-analysis',
		categoryColor: 'badge-blue',
		anchor: 'financial-analysis'
	},

	// Price Metrics
	'peak-price': {
		term: 'Peak Price',
		short: 'Highest trading price during the analyzed period. May indicate market euphoria or fundamental strength.',
		icon: 'fa-arrow-up',
		category: 'valuation',
		categoryColor: 'badge-green',
		anchor: 'valuation'
	},
	'low-price': {
		term: 'Low Price',
		short: 'Lowest trading price during the analyzed period. May indicate distress, capitulation, or buying opportunity.',
		icon: 'fa-arrow-down',
		category: 'valuation',
		categoryColor: 'badge-green',
		anchor: 'valuation'
	},
	'price-change': {
		term: 'Price Change',
		short: 'Percentage change from first to last trading price. Positive indicates appreciation; negative indicates decline.',
		icon: 'fa-percent',
		category: 'valuation',
		categoryColor: 'badge-green',
		anchor: 'valuation'
	},
	'avg-price': {
		term: 'Average Price',
		short: 'Mean trading price over the period. Useful for understanding typical trading levels and cost basis analysis.',
		icon: 'fa-chart-line',
		category: 'valuation',
		categoryColor: 'badge-green',
		anchor: 'valuation'
	},

	// SEC Filings
	'sec-filing': {
		term: 'SEC Filing',
		short: 'Documents submitted to the Securities and Exchange Commission. Required by law for public companies.',
		icon: 'fa-file-lines',
		category: 'financial-analysis',
		categoryColor: 'badge-blue',
		anchor: 'financial-analysis'
	},
	'10-k': {
		term: 'Form 10-K',
		short: 'Annual report with audited financial statements, business description, and risk factors. Most comprehensive SEC filing.',
		icon: 'fa-file-invoice',
		category: 'financial-analysis',
		categoryColor: 'badge-blue',
		anchor: 'income-statements'
	},
	'10-q': {
		term: 'Form 10-Q',
		short: 'Quarterly report with unaudited financial statements. Filed three times per year (Q1, Q2, Q3).',
		icon: 'fa-file-invoice',
		category: 'financial-analysis',
		categoryColor: 'badge-blue',
		anchor: 'income-statements'
	},
	'8-k': {
		term: 'Form 8-K',
		short: 'Current report for material events: acquisitions, executive changes, bankruptcy, or other significant developments.',
		icon: 'fa-file-exclamation',
		category: 'financial-analysis',
		categoryColor: 'badge-blue',
		anchor: 'financial-analysis'
	},
	'form-4': {
		term: 'Form 4',
		short: 'Insider transaction report. Filed within 2 business days when officers, directors, or 10%+ owners buy/sell stock.',
		icon: 'fa-user-tie',
		category: 'capital',
		categoryColor: 'badge-teal',
		anchor: 'shareholder-returns'
	},
	'form-3': {
		term: 'Form 3',
		short: 'Initial statement of beneficial ownership. Filed when becoming an insider (officer, director, or 10%+ owner).',
		icon: 'fa-user-plus',
		category: 'capital',
		categoryColor: 'badge-teal',
		anchor: 'shareholder-returns'
	},
	'form-5': {
		term: 'Form 5',
		short: 'Annual statement of changes in beneficial ownership. Reports transactions not previously reported on Form 4.',
		icon: 'fa-user-check',
		category: 'capital',
		categoryColor: 'badge-teal',
		anchor: 'shareholder-returns'
	},
	'def-14a': {
		term: 'DEF 14A (Proxy Statement)',
		short: 'Definitive proxy statement for shareholder meetings. Contains executive compensation, board info, and voting matters.',
		icon: 'fa-vote-yea',
		category: 'capital',
		categoryColor: 'badge-teal',
		anchor: 'management-decisions'
	},
	's-1': {
		term: 'Form S-1',
		short: 'Registration statement for initial public offerings (IPOs). Contains prospectus with detailed company information.',
		icon: 'fa-rocket',
		category: 'financial-analysis',
		categoryColor: 'badge-blue',
		anchor: 'financial-analysis'
	},
	'sc-13d': {
		term: 'Schedule 13D',
		short: 'Beneficial ownership report filed within 10 days of acquiring 5%+ of a public company with intent to influence.',
		icon: 'fa-hand-holding-dollar',
		category: 'capital',
		categoryColor: 'badge-teal',
		anchor: 'shareholder-returns'
	},

	// Financial Metrics
	'cik': {
		term: 'CIK (Central Index Key)',
		short: 'Unique identifier assigned by the SEC to companies and individuals who file documents.',
		icon: 'fa-fingerprint',
		category: 'financial-analysis',
		categoryColor: 'badge-blue',
		anchor: 'financial-analysis'
	},
	'ticker': {
		term: 'Ticker Symbol',
		short: 'Short alphabetic code identifying a publicly traded stock on an exchange (e.g., AAPL, MSFT).',
		icon: 'fa-tags',
		category: 'financial-analysis',
		categoryColor: 'badge-blue',
		anchor: 'financial-analysis'
	},
	'exchange': {
		term: 'Stock Exchange',
		short: 'Marketplace where securities are bought and sold. Major exchanges include NYSE, NASDAQ, OTC Markets.',
		icon: 'fa-building-columns',
		category: 'financial-analysis',
		categoryColor: 'badge-blue',
		anchor: 'financial-analysis'
	},

	// Business Quality
	'moat': {
		term: 'Economic Moat',
		short: 'Durable competitive advantage protecting profitability. Sources: brand, cost, network effects, IP, switching costs.',
		icon: 'fa-shield-halved',
		category: 'business-quality',
		categoryColor: 'badge-purple',
		anchor: 'competitive-advantages'
	},
	'margin': {
		term: 'Profit Margin',
		short: 'Percentage of revenue retained as profit. Higher margins indicate pricing power and operational efficiency.',
		icon: 'fa-percent',
		category: 'business-quality',
		categoryColor: 'badge-purple',
		anchor: 'margin-economics'
	},

	// Valuation
	'pe-ratio': {
		term: 'P/E Ratio',
		short: 'Price-to-Earnings ratio. Stock price divided by earnings per share. Higher = growth expectations or overvaluation.',
		icon: 'fa-calculator',
		category: 'valuation',
		categoryColor: 'badge-green',
		anchor: 'growth-companies'
	},
	'ps-ratio': {
		term: 'P/S Ratio',
		short: 'Price-to-Sales ratio. Market cap divided by revenue. Useful when earnings are negative or volatile.',
		icon: 'fa-chart-simple',
		category: 'valuation',
		categoryColor: 'badge-green',
		anchor: 'revenue-metrics'
	},

	// Income
	'dividend-yield': {
		term: 'Dividend Yield',
		short: 'Annual dividend as percentage of stock price. Higher yields may signal value or distress.',
		icon: 'fa-coins',
		category: 'income',
		categoryColor: 'badge-amber',
		anchor: 'dividend-fundamentals'
	},

	// Capital Allocation
	'roic': {
		term: 'ROIC (Return on Invested Capital)',
		short: 'Net operating profit divided by invested capital. Measures efficiency of capital deployment. >15% is strong.',
		icon: 'fa-chart-pie',
		category: 'capital',
		categoryColor: 'badge-teal',
		anchor: 'shareholder-returns'
	},
	'buyback': {
		term: 'Share Buyback',
		short: 'Company repurchasing its own shares. Reduces share count, increases EPS. Value depends on purchase price.',
		icon: 'fa-rotate-left',
		category: 'capital',
		categoryColor: 'badge-teal',
		anchor: 'shareholder-returns'
	},

	// Wealth Building
	'compounding': {
		term: 'Compounding',
		short: 'Growth where returns generate their own returns. Einstein called it the "eighth wonder of the world."',
		icon: 'fa-chart-area',
		category: 'wealth',
		categoryColor: 'badge-gray',
		anchor: 'compounding'
	}
};

// Get tooltip content for a term
export function getTooltip(termKey: string): string {
	const term = educationTerms[termKey];
	return term ? term.short : '';
}

// Get education link for a term
export function getEducationLink(termKey: string): string {
	const term = educationTerms[termKey];
	return term ? `/education#${term.anchor}` : '/education';
}

// Get category info
export function getCategoryInfo(categoryKey: string) {
	return educationCategories[categoryKey as keyof typeof educationCategories];
}
