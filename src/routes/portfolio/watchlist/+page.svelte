<script lang="ts">
	import { portfolioStore } from '$lib/stores/portfolio.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';

	interface Stock {
		symbol: string;
		name: string;
		sector?: string;
	}

	// Watchlist with mock prices
	const watchlistWithPrices = $derived(() => {
		return portfolioStore.watchlist.map((w) => ({
			...w,
			currentPrice: generateMockPrice(w.symbol),
			change: generateMockChange(),
			changePercent: generateMockChangePercent()
		}));
	});

	function generateMockPrice(symbol: string): number {
		const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
		return 50 + (hash % 200) + Math.random() * 10;
	}

	function generateMockChange(): number {
		return (Math.random() - 0.5) * 10;
	}

	function generateMockChangePercent(): number {
		return (Math.random() - 0.5) * 4;
	}

	function handleAddToWatchlist(stock: Stock) {
		portfolioStore.addToWatchlist({
			symbol: stock.symbol,
			name: stock.name
		});
	}

	function handleAddToPortfolio(stock: Stock) {
		// Navigate to portfolio with pre-filled form
		window.location.href = `/portfolio?add=${stock.symbol}`;
	}

	function handleRemove(symbol: string) {
		portfolioStore.removeFromWatchlist(symbol);
	}

	function handleClearAll() {
		if (confirm('Remove all stocks from watchlist?')) {
			portfolioStore.clearWatchlist();
		}
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(value);
	}

	function formatChange(value: number): string {
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(2)}`;
	}

	function formatPercent(value: number): string {
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(2)}%`;
	}

	function formatDate(isoDate: string): string {
		return new Date(isoDate).toLocaleDateString();
	}
</script>

<svelte:head>
	<title>Watchlist | Portfolio</title>
</svelte:head>

<a href="/portfolio" class="back-link">
	<i class="fat fa-arrow-left"></i> Back to Portfolio
</a>

<h1><i class="fat fa-eye"></i> Watchlist</h1>

<p class="text-muted">
	Track stocks you're interested in without adding them to your portfolio.
</p>

<!-- Add to Watchlist -->
<section class="mt-2">
	<div class="search-section">
		<SearchInput
			placeholder="Search stocks to watch..."
			onSelect={handleAddToWatchlist}
			onAddToWatchlist={handleAddToWatchlist}
			onAddToPortfolio={handleAddToPortfolio}
		/>
	</div>
</section>

<!-- Watchlist -->
<section class="mt-3">
	<div class="section-header">
		<h2><i class="fat fa-star"></i> Watching ({portfolioStore.totalWatchlist})</h2>
		{#if portfolioStore.totalWatchlist > 0}
			<button type="button" class="button button-small" onclick={handleClearAll}>
				Clear All
			</button>
		{/if}
	</div>

	{#if portfolioStore.totalWatchlist === 0}
		<div class="empty-state">
			<i class="fat fa-eye-slash"></i>
			<p>Your watchlist is empty</p>
			<p class="text-muted">Search for stocks to add them to your watchlist</p>
		</div>
	{:else}
		<div class="card-grid">
			{#each watchlistWithPrices() as item}
				<div class="section-box watchlist-card">
					<div class="card-header">
						<a href="/stock/{item.symbol}" class="symbol-link">{item.symbol}</a>
						<button
							type="button"
							class="remove-button"
							onclick={() => handleRemove(item.symbol)}
							title="Remove from watchlist"
						>
							<i class="fat fa-xmark"></i>
						</button>
					</div>

					<div class="company-name">{item.name || '-'}</div>

					<div class="price-row">
						<span class="price">{formatCurrency(item.currentPrice)}</span>
						<span
							class="change"
							class:positive={item.change >= 0}
							class:negative={item.change < 0}
						>
							{formatChange(item.change)} ({formatPercent(item.changePercent)})
						</span>
					</div>

					<div class="card-footer">
						<span class="text-muted">Added {formatDate(item.addedAt)}</span>
						<button
							type="button"
							class="button button-small"
							onclick={() => handleAddToPortfolio({ symbol: item.symbol, name: item.name || '' })}
						>
							<i class="fat fa-plus"></i> Add to Portfolio
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	.search-section {
		max-width: 400px;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.section-header h2 {
		margin: 0;
	}

	.watchlist-card {
		position: relative;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.symbol-link {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-link);
		text-decoration: none;
	}

	.symbol-link:hover {
		text-decoration: underline;
	}

	.remove-button {
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		color: var(--color-text-muted);
		font-size: 1rem;
	}

	.remove-button:hover {
		color: var(--color-accent-red);
	}

	.company-name {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		margin-top: 0.25rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.price-row {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.price {
		font-size: 1.125rem;
		font-weight: 600;
	}

	.change {
		font-size: 0.8125rem;
		font-weight: 500;
	}

	.change.positive {
		color: var(--color-chart-up);
	}

	.change.negative {
		color: var(--color-chart-down);
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--color-border);
	}

	.card-footer .text-muted {
		font-size: 0.75rem;
	}

	.button-small {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--color-text-muted);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 5px;
	}

	.empty-state i {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.empty-state p {
		margin: 0.25rem 0;
	}
</style>
