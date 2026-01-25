/**
 * Caching Utilities
 *
 * Provides caching mechanisms for API responses:
 * - File-based cache for build-time data
 * - Memory cache for runtime data
 * - Browser localStorage integration
 */

import { browser } from '$app/environment';

// ============================================================================
// Types
// ============================================================================

export interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number; // Time to live in milliseconds
}

export interface CacheOptions {
	ttl?: number; // Default: 15 minutes
	prefix?: string; // Key prefix for namespacing
}

// Default TTL values
export const TTL = {
	QUOTE: 15 * 1000,           // 15 seconds for real-time quotes
	MINUTE: 60 * 1000,          // 1 minute
	HOURLY: 60 * 60 * 1000,     // 1 hour
	DAILY: 24 * 60 * 60 * 1000, // 24 hours
	WEEKLY: 7 * 24 * 60 * 60 * 1000, // 7 days
	PERMANENT: Infinity         // Never expires
} as const;

// ============================================================================
// Memory Cache (for server-side and runtime)
// ============================================================================

const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Get item from memory cache
 */
export function getFromMemory<T>(key: string): T | null {
	const entry = memoryCache.get(key) as CacheEntry<T> | undefined;

	if (!entry) return null;

	// Check if expired
	if (Date.now() - entry.timestamp > entry.ttl) {
		memoryCache.delete(key);
		return null;
	}

	return entry.data;
}

/**
 * Set item in memory cache
 */
export function setInMemory<T>(key: string, data: T, ttl: number = TTL.MINUTE): void {
	memoryCache.set(key, {
		data,
		timestamp: Date.now(),
		ttl
	});
}

/**
 * Delete item from memory cache
 */
export function deleteFromMemory(key: string): void {
	memoryCache.delete(key);
}

/**
 * Clear all items from memory cache
 */
export function clearMemoryCache(): void {
	memoryCache.clear();
}

/**
 * Get memory cache stats
 */
export function getMemoryCacheStats() {
	let validCount = 0;
	let expiredCount = 0;
	const now = Date.now();

	memoryCache.forEach((entry, key) => {
		if (now - entry.timestamp > entry.ttl) {
			expiredCount++;
		} else {
			validCount++;
		}
	});

	return {
		total: memoryCache.size,
		valid: validCount,
		expired: expiredCount
	};
}

// ============================================================================
// Browser localStorage Cache
// ============================================================================

const STORAGE_PREFIX = 'stock_cache_';

/**
 * Get item from localStorage
 */
export function getFromStorage<T>(key: string): T | null {
	if (!browser) return null;

	try {
		const raw = localStorage.getItem(STORAGE_PREFIX + key);
		if (!raw) return null;

		const entry: CacheEntry<T> = JSON.parse(raw);

		// Check if expired
		if (Date.now() - entry.timestamp > entry.ttl) {
			localStorage.removeItem(STORAGE_PREFIX + key);
			return null;
		}

		return entry.data;
	} catch (e) {
		console.error('Error reading from localStorage:', e);
		return null;
	}
}

/**
 * Set item in localStorage
 */
export function setInStorage<T>(key: string, data: T, ttl: number = TTL.HOURLY): void {
	if (!browser) return;

	try {
		const entry: CacheEntry<T> = {
			data,
			timestamp: Date.now(),
			ttl
		};
		localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
	} catch (e) {
		console.error('Error writing to localStorage:', e);
		// If storage is full, try to clear old entries
		clearExpiredStorage();
	}
}

/**
 * Delete item from localStorage
 */
export function deleteFromStorage(key: string): void {
	if (!browser) return;
	localStorage.removeItem(STORAGE_PREFIX + key);
}

/**
 * Clear all cached items from localStorage
 */
export function clearStorage(): void {
	if (!browser) return;

	const keysToRemove: string[] = [];
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key?.startsWith(STORAGE_PREFIX)) {
			keysToRemove.push(key);
		}
	}

	keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Clear expired items from localStorage
 */
export function clearExpiredStorage(): void {
	if (!browser) return;

	const now = Date.now();
	const keysToRemove: string[] = [];

	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key?.startsWith(STORAGE_PREFIX)) {
			try {
				const raw = localStorage.getItem(key);
				if (raw) {
					const entry: CacheEntry<unknown> = JSON.parse(raw);
					if (now - entry.timestamp > entry.ttl) {
						keysToRemove.push(key);
					}
				}
			} catch {
				// Invalid entry, remove it
				keysToRemove.push(key);
			}
		}
	}

	keysToRemove.forEach(key => localStorage.removeItem(key));
}

// ============================================================================
// Unified Cache Interface
// ============================================================================

export type CacheLayer = 'memory' | 'storage' | 'both';

/**
 * Get from cache (checks memory first, then storage)
 */
export function get<T>(key: string, layer: CacheLayer = 'both'): T | null {
	if (layer === 'memory' || layer === 'both') {
		const memResult = getFromMemory<T>(key);
		if (memResult !== null) return memResult;
	}

	if (layer === 'storage' || layer === 'both') {
		const storageResult = getFromStorage<T>(key);
		if (storageResult !== null) {
			// Also store in memory for faster subsequent access
			if (layer === 'both') {
				setInMemory(key, storageResult, TTL.MINUTE);
			}
			return storageResult;
		}
	}

	return null;
}

/**
 * Set in cache
 */
export function set<T>(
	key: string,
	data: T,
	options: { ttl?: number; layer?: CacheLayer } = {}
): void {
	const { ttl = TTL.MINUTE, layer = 'both' } = options;

	if (layer === 'memory' || layer === 'both') {
		setInMemory(key, data, ttl);
	}

	if (layer === 'storage' || layer === 'both') {
		setInStorage(key, data, ttl);
	}
}

/**
 * Delete from cache
 */
export function del(key: string, layer: CacheLayer = 'both'): void {
	if (layer === 'memory' || layer === 'both') {
		deleteFromMemory(key);
	}

	if (layer === 'storage' || layer === 'both') {
		deleteFromStorage(key);
	}
}

/**
 * Get or fetch with cache
 */
export async function getOrFetch<T>(
	key: string,
	fetcher: () => Promise<T>,
	options: { ttl?: number; layer?: CacheLayer } = {}
): Promise<T> {
	const { ttl = TTL.MINUTE, layer = 'both' } = options;

	// Try cache first
	const cached = get<T>(key, layer);
	if (cached !== null) {
		return cached;
	}

	// Fetch fresh data
	const data = await fetcher();

	// Store in cache
	set(key, data, { ttl, layer });

	return data;
}

// ============================================================================
// Cache Key Generators
// ============================================================================

export const CacheKeys = {
	quote: (symbol: string) => `quote:${symbol.toUpperCase()}`,
	profile: (symbol: string) => `profile:${symbol.toUpperCase()}`,
	history: (symbol: string, range: string) => `history:${symbol.toUpperCase()}:${range}`,
	news: (symbol: string) => `news:${symbol.toUpperCase()}`,
	earnings: (symbol: string) => `earnings:${symbol.toUpperCase()}`,
	financials: (symbol: string) => `financials:${symbol.toUpperCase()}`,
	filings: (symbol: string) => `filings:${symbol.toUpperCase()}`,
	marketSnapshot: () => 'market:snapshot',
	sp500List: () => 'market:sp500',
	gainers: () => 'market:gainers',
	losers: () => 'market:losers'
};
