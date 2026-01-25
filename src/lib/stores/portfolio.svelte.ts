/**
 * Portfolio Store - Svelte 5 Runes with localStorage persistence
 *
 * Manages user portfolio holdings and watchlist using browser localStorage.
 * No backend required - all data stays client-side.
 */

import { browser } from '$app/environment';
import type { Portfolio, Holding, WatchlistItem } from '$lib/types/portfolio';

const STORAGE_KEY = 'stock-portfolio';
const STORAGE_VERSION = 1;

/**
 * Load portfolio from localStorage
 */
function loadFromStorage(): Portfolio {
	if (!browser) {
		return getDefaultPortfolio();
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) {
			return getDefaultPortfolio();
		}

		const parsed = JSON.parse(stored) as Portfolio;

		// Version migration if needed
		if (parsed.version !== STORAGE_VERSION) {
			console.log(`Migrating portfolio from v${parsed.version} to v${STORAGE_VERSION}`);
			// Future: add migration logic here
		}

		return parsed;
	} catch (error) {
		console.error('Failed to load portfolio from localStorage:', error);
		return getDefaultPortfolio();
	}
}

/**
 * Save portfolio to localStorage
 */
function saveToStorage(portfolio: Portfolio): void {
	if (!browser) return;

	try {
		portfolio.lastUpdated = new Date().toISOString();
		localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
	} catch (error) {
		console.error('Failed to save portfolio to localStorage:', error);
	}
}

/**
 * Sample holdings for demonstration portfolio
 */
const SAMPLE_HOLDINGS: Omit<Holding, 'id'>[] = [
	{ symbol: 'AAPL', shares: 50, avgCost: 175.00, purchaseDate: '2023-06-15', notes: 'Apple Inc' },
	{ symbol: 'MSFT', shares: 30, avgCost: 320.00, purchaseDate: '2023-07-20', notes: 'Microsoft Corp' },
	{ symbol: 'GOOGL', shares: 20, avgCost: 130.00, purchaseDate: '2023-08-10', notes: 'Alphabet Inc' },
	{ symbol: 'AMZN', shares: 25, avgCost: 145.00, purchaseDate: '2023-09-05', notes: 'Amazon.com Inc' },
	{ symbol: 'NVDA', shares: 40, avgCost: 450.00, purchaseDate: '2024-01-15', notes: 'NVIDIA Corp' },
	{ symbol: 'META', shares: 15, avgCost: 320.00, purchaseDate: '2024-03-01', notes: 'Meta Platforms Inc' },
	{ symbol: 'TSLA', shares: 35, avgCost: 250.00, purchaseDate: '2024-02-10', notes: 'Tesla Inc' },
	{ symbol: 'JPM', shares: 20, avgCost: 150.00, purchaseDate: '2023-11-20', notes: 'JPMorgan Chase' }
];

const SAMPLE_WATCHLIST: Omit<WatchlistItem, 'addedAt'>[] = [
	{ symbol: 'AVGO', name: 'Broadcom Inc' },
	{ symbol: 'V', name: 'Visa Inc' },
	{ symbol: 'MA', name: 'Mastercard Inc' },
	{ symbol: 'NFLX', name: 'Netflix Inc' },
	{ symbol: 'CRM', name: 'Salesforce Inc' }
];

/**
 * Generate default portfolio with sample holdings
 */
function getDefaultPortfolio(): Portfolio {
	const holdings = SAMPLE_HOLDINGS.map(h => ({
		...h,
		id: generateId()
	}));

	const watchlist = SAMPLE_WATCHLIST.map(w => ({
		...w,
		addedAt: new Date().toISOString()
	}));

	return {
		holdings,
		watchlist,
		lastUpdated: new Date().toISOString(),
		version: STORAGE_VERSION
	};
}

/**
 * Generate unique ID for holdings
 */
function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create the portfolio store
 * Returns reactive state and mutation functions
 */
function createPortfolioStore() {
	let portfolio = $state<Portfolio>(loadFromStorage());

	// Auto-save on changes (using $effect in component context)
	// Note: $effect must be called from component context, so we expose a save function

	return {
		// Getters (reactive)
		get holdings() {
			return portfolio.holdings;
		},
		get watchlist() {
			return portfolio.watchlist;
		},
		get lastUpdated() {
			return portfolio.lastUpdated;
		},

		// Computed values
		get totalHoldings() {
			return portfolio.holdings.length;
		},
		get totalWatchlist() {
			return portfolio.watchlist.length;
		},
		get symbols() {
			return portfolio.holdings.map((h) => h.symbol);
		},
		get watchlistSymbols() {
			return portfolio.watchlist.map((w) => w.symbol);
		},

		// Holding operations
		addHolding(holding: Omit<Holding, 'id'>): string {
			const id = generateId();
			const newHolding: Holding = { ...holding, id };
			portfolio.holdings = [...portfolio.holdings, newHolding];
			saveToStorage(portfolio);
			return id;
		},

		updateHolding(id: string, updates: Partial<Omit<Holding, 'id'>>): boolean {
			const index = portfolio.holdings.findIndex((h) => h.id === id);
			if (index === -1) return false;

			portfolio.holdings = portfolio.holdings.map((h) =>
				h.id === id ? { ...h, ...updates } : h
			);
			saveToStorage(portfolio);
			return true;
		},

		removeHolding(id: string): boolean {
			const before = portfolio.holdings.length;
			portfolio.holdings = portfolio.holdings.filter((h) => h.id !== id);
			if (portfolio.holdings.length !== before) {
				saveToStorage(portfolio);
				return true;
			}
			return false;
		},

		getHolding(id: string): Holding | undefined {
			return portfolio.holdings.find((h) => h.id === id);
		},

		getHoldingBySymbol(symbol: string): Holding | undefined {
			return portfolio.holdings.find((h) => h.symbol.toUpperCase() === symbol.toUpperCase());
		},

		// Watchlist operations
		addToWatchlist(item: Omit<WatchlistItem, 'addedAt'>): boolean {
			const exists = portfolio.watchlist.some(
				(w) => w.symbol.toUpperCase() === item.symbol.toUpperCase()
			);
			if (exists) return false;

			const newItem: WatchlistItem = {
				...item,
				symbol: item.symbol.toUpperCase(),
				addedAt: new Date().toISOString()
			};
			portfolio.watchlist = [...portfolio.watchlist, newItem];
			saveToStorage(portfolio);
			return true;
		},

		removeFromWatchlist(symbol: string): boolean {
			const before = portfolio.watchlist.length;
			portfolio.watchlist = portfolio.watchlist.filter(
				(w) => w.symbol.toUpperCase() !== symbol.toUpperCase()
			);
			if (portfolio.watchlist.length !== before) {
				saveToStorage(portfolio);
				return true;
			}
			return false;
		},

		isInWatchlist(symbol: string): boolean {
			return portfolio.watchlist.some(
				(w) => w.symbol.toUpperCase() === symbol.toUpperCase()
			);
		},

		// Bulk operations
		importHoldings(holdings: Omit<Holding, 'id'>[]): number {
			let imported = 0;
			for (const holding of holdings) {
				const id = generateId();
				portfolio.holdings = [...portfolio.holdings, { ...holding, id }];
				imported++;
			}
			if (imported > 0) {
				saveToStorage(portfolio);
			}
			return imported;
		},

		clearAllHoldings(): void {
			portfolio.holdings = [];
			saveToStorage(portfolio);
		},

		clearWatchlist(): void {
			portfolio.watchlist = [];
			saveToStorage(portfolio);
		},

		// Full reset
		reset(): void {
			portfolio = getDefaultPortfolio();
			saveToStorage(portfolio);
		},

		// Export for backup
		exportData(): string {
			return JSON.stringify(portfolio, null, 2);
		},

		// Import from backup
		importData(json: string): boolean {
			try {
				const imported = JSON.parse(json) as Portfolio;
				if (!imported.holdings || !imported.watchlist) {
					throw new Error('Invalid portfolio format');
				}
				portfolio = {
					...imported,
					version: STORAGE_VERSION,
					lastUpdated: new Date().toISOString()
				};
				saveToStorage(portfolio);
				return true;
			} catch (error) {
				console.error('Failed to import portfolio:', error);
				return false;
			}
		}
	};
}

// Export singleton store instance
export const portfolioStore = createPortfolioStore();

// Export type for external use
export type PortfolioStore = ReturnType<typeof createPortfolioStore>;
