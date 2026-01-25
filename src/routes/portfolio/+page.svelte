<script lang="ts">
	import { portfolioStore } from '$lib/stores/portfolio.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import HoldingsTable from '$lib/components/HoldingsTable.svelte';
	import PortfolioTreemap from '$lib/components/PortfolioTreemap.svelte';
	import PortfolioStreamgraph from '$lib/components/PortfolioStreamgraph.svelte';
	import { browser } from '$app/environment';

	interface Stock {
		symbol: string;
		name: string;
		sector?: string;
	}

	let showAddModal = $state(false);
	let editingHolding = $state<string | null>(null);

	// Treemap responsive sizing (match holdings table width)
	let treemapWrapper: HTMLDivElement | null = $state(null);
	let treemapWidth = $state(600);

	// Update width when wrapper element is bound or window resizes
	$effect(() => {
		if (browser && treemapWrapper) {
			const updateWidth = () => {
				if (treemapWrapper) {
					treemapWidth = treemapWrapper.clientWidth;
				}
			};
			updateWidth();
			window.addEventListener('resize', updateWidth);
			return () => window.removeEventListener('resize', updateWidth);
		}
	});

	// Form state for adding holdings
	let addForm = $state({
		symbol: '',
		name: '',
		shares: 1,
		avgCost: 0,
		purchaseDate: new Date().toISOString().split('T')[0]
	});

	// Compute holdings with mock prices for display
	const holdingsWithPrices = $derived(() => {
		return portfolioStore.holdings.map((h) => ({
			...h,
			currentPrice: generateMockPrice(h.symbol),
			companyName: h.notes || undefined
		}));
	});

	// Compute treemap items
	const treemapItems = $derived(() => {
		return holdingsWithPrices().map((h) => ({
			symbol: h.symbol,
			name: h.companyName,
			value: h.shares * (h.currentPrice ?? h.avgCost),
			gainLossPercent: h.currentPrice
				? ((h.currentPrice - h.avgCost) / h.avgCost) * 100
				: 0
		}));
	});

	// Portfolio stats
	const stats = $derived(() => {
		let totalValue = 0;
		let totalCost = 0;

		for (const h of holdingsWithPrices()) {
			totalCost += h.shares * h.avgCost;
			totalValue += h.shares * (h.currentPrice ?? h.avgCost);
		}

		const gainLoss = totalValue - totalCost;
		const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

		return { totalValue, totalCost, gainLoss, gainLossPercent };
	});

	// Mock price generator (replace with real API in production)
	function generateMockPrice(symbol: string): number {
		const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
		return 50 + (hash % 200) + Math.random() * 10;
	}

	function handleAddToPortfolio(stock: Stock) {
		addForm.symbol = stock.symbol;
		addForm.name = stock.name;
		showAddModal = true;
	}

	function handleAddToWatchlist(stock: Stock) {
		const added = portfolioStore.addToWatchlist({
			symbol: stock.symbol,
			name: stock.name
		});
		if (added) {
			console.log(`Added ${stock.symbol} to watchlist`);
		}
	}

	function submitAddHolding() {
		if (!addForm.symbol || addForm.shares <= 0 || addForm.avgCost <= 0) {
			return;
		}

		portfolioStore.addHolding({
			symbol: addForm.symbol.toUpperCase(),
			shares: addForm.shares,
			avgCost: addForm.avgCost,
			purchaseDate: addForm.purchaseDate,
			notes: addForm.name,
			source: 'manual'
		});

		// Reset form
		addForm = {
			symbol: '',
			name: '',
			shares: 1,
			avgCost: 0,
			purchaseDate: new Date().toISOString().split('T')[0]
		};
		showAddModal = false;
	}

	function handleRemoveHolding(id: string) {
		if (confirm('Remove this holding from your portfolio?')) {
			portfolioStore.removeHolding(id);
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

	function formatPercent(value: number): string {
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(2)}%`;
	}
</script>

<svelte:head>
	<title>Portfolio | Historical Stock Data</title>
</svelte:head>

<a href="/" class="back-link">
	<i class="fat fa-arrow-left"></i> Back to Home
</a>

<h1><i class="fat fa-briefcase"></i> Portfolio</h1>

<p class="text-muted">
	Manage your stock holdings and track portfolio performance. Data is stored locally in your browser.
</p>

<!-- Portfolio Performance Streamgraph -->
<section class="mt-2">
	<div class="streamgraph-wrapper" bind:this={treemapWrapper}>
		<PortfolioStreamgraph
			holdings={holdingsWithPrices().map(h => ({
				symbol: h.symbol,
				shares: h.shares,
				avgCost: h.avgCost,
				currentPrice: h.currentPrice ?? h.avgCost
			}))}
			width={treemapWidth}
			height={140}
			totalValue={stats().totalValue}
			totalCost={stats().totalCost}
			gainLoss={stats().gainLoss}
			gainLossPercent={stats().gainLossPercent}
		/>
	</div>
	<p class="stats-narrative">
		Your portfolio of <strong>{portfolioStore.totalHoldings} holdings</strong> is valued at
		<strong>{formatCurrency(stats().totalValue)}</strong>,
		{#if stats().gainLoss >= 0}
			reflecting a gain of <span class="positive">{formatCurrency(stats().gainLoss)}</span>
			(<span class="positive">{formatPercent(stats().gainLossPercent)}</span> return)
		{:else}
			reflecting a loss of <span class="negative">{formatCurrency(Math.abs(stats().gainLoss))}</span>
			(<span class="negative">{formatPercent(stats().gainLossPercent)}</span> return)
		{/if}
		from your cost basis of {formatCurrency(stats().totalCost)}.
	</p>
</section>

<!-- Search and Add -->
<section class="mt-3">
	<h2><i class="fat fa-plus-circle"></i> Add Holdings</h2>

	<div class="search-section">
		<SearchInput
			placeholder="Search S&P 500 stocks..."
			onSelect={handleAddToPortfolio}
			onAddToPortfolio={handleAddToPortfolio}
			onAddToWatchlist={handleAddToWatchlist}
		/>
	</div>

	<div class="quick-actions mt-2">
		<button type="button" class="button" onclick={() => (showAddModal = true)}>
			<i class="fat fa-plus"></i> Add Custom Holding
		</button>
		<a href="/portfolio/holdings" class="button">
			<i class="fat fa-list"></i> View All Holdings
		</a>
		<a href="/portfolio/watchlist" class="button">
			<i class="fat fa-eye"></i> Watchlist ({portfolioStore.totalWatchlist})
		</a>
	</div>
</section>

<!-- Treemap Visualization -->
{#if portfolioStore.totalHoldings > 0}
	<section class="mt-3">
		<h2><i class="fat fa-chart-tree-map"></i> Portfolio Allocation</h2>
		<p class="text-muted mb-2">
			Holdings sized by value. Click a stock for details.
		</p>

		<div class="section-box treemap-container" bind:this={treemapWrapper}>
			<PortfolioTreemap
				items={treemapItems()}
				width={treemapWidth}
				height={300}
				onItemClick={(item) => {
					window.location.href = `/stock/${item.symbol}`;
				}}
			/>
		</div>
	</section>
{/if}

<!-- Holdings Table -->
<section class="mt-3">
	<h2><i class="fat fa-table"></i> Holdings</h2>

	<div class="section-box">
		<HoldingsTable
			holdings={holdingsWithPrices()}
			onRemove={handleRemoveHolding}
			showActions={true}
		/>
	</div>
</section>

<!-- Add Holding Modal -->
{#if showAddModal}
	<div
		class="modal-overlay"
		onclick={() => (showAddModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showAddModal = false)}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="modal" role="presentation" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>Add Holding</h3>
				<button type="button" class="close-button" aria-label="Close modal" onclick={() => (showAddModal = false)}>
					<i class="fat fa-xmark"></i>
				</button>
			</div>

			<form class="modal-body" onsubmit={(e) => { e.preventDefault(); submitAddHolding(); }}>
				<div class="form-group">
					<label for="symbol">Symbol</label>
					<input
						type="text"
						id="symbol"
						bind:value={addForm.symbol}
						placeholder="AAPL"
						required
					/>
				</div>

				<div class="form-group">
					<label for="name">Company Name (optional)</label>
					<input
						type="text"
						id="name"
						bind:value={addForm.name}
						placeholder="Apple Inc."
					/>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="shares">Shares</label>
						<input
							type="number"
							id="shares"
							bind:value={addForm.shares}
							min="0.0001"
							step="0.0001"
							required
						/>
					</div>

					<div class="form-group">
						<label for="avgCost">Avg Cost per Share</label>
						<input
							type="number"
							id="avgCost"
							bind:value={addForm.avgCost}
							min="0.01"
							step="0.01"
							required
						/>
					</div>
				</div>

				<div class="form-group">
					<label for="purchaseDate">Purchase Date</label>
					<input
						type="date"
						id="purchaseDate"
						bind:value={addForm.purchaseDate}
					/>
				</div>

				<div class="form-actions">
					<button type="button" class="button" onclick={() => (showAddModal = false)}>
						Cancel
					</button>
					<button type="submit" class="button button-primary">
						Add Holding
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.search-section {
		max-width: 400px;
	}

	.quick-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.streamgraph-wrapper {
		width: 100%;
	}

	.stats-narrative {
		margin-top: 0.75rem;
		font-size: 0.875rem;
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.stats-narrative strong {
		color: var(--color-text);
	}

	.treemap-container {
		padding: 0;
		overflow: hidden;
	}

	/* Stats colors */
	.positive {
		color: var(--color-chart-up) !important;
	}

	.negative {
		color: var(--color-chart-down) !important;
	}

	/* Modal styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-dark);
		border-radius: 5px;
		box-shadow: 4px 4px 0px var(--color-shadow);
		width: 100%;
		max-width: 450px;
		margin: 1rem;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.modal-header h3 {
		margin: 0;
	}

	.close-button {
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		color: var(--color-text-muted);
		font-size: 1.25rem;
	}

	.close-button:hover {
		color: var(--color-text);
	}

	.modal-body {
		padding: 1rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.25rem;
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.form-group input {
		width: 100%;
		padding: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 3px;
		color: var(--color-text);
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--color-border-dark);
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border);
	}

	.button-primary {
		background: var(--color-border-dark);
		color: var(--color-bg);
	}

	.button-primary:hover {
		background: var(--color-text-muted);
	}

	@media (max-width: 640px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>
