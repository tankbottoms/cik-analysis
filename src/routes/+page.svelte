<script lang="ts">
	import type { PageData } from './$types';
	import type { StockData } from './+page';
	import { portfolioStore } from '$lib/stores/portfolio.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import PortfolioTreemap from '$lib/components/PortfolioTreemap.svelte';
	import StockCard from '$lib/components/StockCard.svelte';
	import ActivityGraph from '$lib/components/ActivityGraph.svelte';

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { data } = $props();

	// Portfolio treemap responsive sizing
	let portfolioTreemapWrapper: HTMLDivElement | null = $state(null);
	let portfolioTreemapWidth = $state(600);

	// Activity graph responsive sizing
	let activityGraphWrapper: HTMLDivElement | null = $state(null);
	let activityGraphWidth = $state(800);

	// Update width when wrapper element is bound or window resizes
	$effect(() => {
		if (browser && portfolioTreemapWrapper) {
			const updateWidth = () => {
				if (portfolioTreemapWrapper) {
					portfolioTreemapWidth = portfolioTreemapWrapper.clientWidth;
				}
			};
			updateWidth();
			window.addEventListener('resize', updateWidth);
			return () => window.removeEventListener('resize', updateWidth);
		}
	});

	// Update activity graph width
	$effect(() => {
		if (browser && activityGraphWrapper) {
			const updateWidth = () => {
				if (activityGraphWrapper) {
					activityGraphWidth = activityGraphWrapper.clientWidth;
				}
			};
			updateWidth();
			window.addEventListener('resize', updateWidth);
			return () => window.removeEventListener('resize', updateWidth);
		}
	});

	// Stocks to display (show up to 12 for a nice grid)
	const displayStocks = $derived(data.stocks?.slice(0, 12) ?? []);

	interface Stock {
		symbol: string;
		name: string;
		sector?: string;
	}

	// Excluded individual names (not corporate entities with trading data)
	const excludedNames = ['cane', 'cane clark', 'jan wallace', 'kyleen', 'michael'];

	// Get entities with data, excluding individuals
	const entitiesWithData = $derived(
		data.summary?.entities?.filter((e) => {
			if (!e.hasData || e.periods.length === 0) return false;
			const companyLower = e.company.toLowerCase();
			return !excludedNames.some((name) => companyLower.includes(name));
		}) ?? []
	);

	// Primary category colors for treemap (from UX spec)
	const treemapColors = [
		'#d4edda', // green-1 (Success)
		'#cce5ff', // blue-1 (Information)
		'#e8d5f0', // purple-1 (Special)
		'#fff3cd' // yellow-1 (Warning)
	];

	// Portfolio holdings with mock prices
	const holdingsWithPrices = $derived(() => {
		return portfolioStore.holdings.map((h) => ({
			...h,
			currentPrice: generateMockPrice(h.symbol),
			companyName: h.notes || undefined
		}));
	});

	// Portfolio treemap items
	const portfolioTreemapItems = $derived(() => {
		return holdingsWithPrices().map((h) => ({
			symbol: h.symbol,
			name: h.companyName,
			value: h.shares * (h.currentPrice ?? h.avgCost),
			gainLossPercent: h.currentPrice ? ((h.currentPrice - h.avgCost) / h.avgCost) * 100 : 0
		}));
	});

	// Portfolio stats
	const portfolioStats = $derived(() => {
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

	function generateMockPrice(symbol: string): number {
		const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
		return 50 + (hash % 200) + Math.random() * 10;
	}

	function formatVolume(value: number): string {
		if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
		if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
		if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
		return value.toString();
	}

	function formatPrice(value: number): string {
		return `$${value.toFixed(4)}`;
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

	function getEntityStats(entity: (typeof entitiesWithData)[0]) {
		const totalVolume = entity.periods.reduce((sum, p) => sum + p.totalVolume, 0);
		const tradingDays = entity.periods.reduce((sum, p) => sum + p.tradingDays, 0);
		const peakPrice = Math.max(...entity.periods.map((p) => p.peakPrice));
		return { totalVolume, tradingDays, peakPrice };
	}

	function getStockColor(index: number): string {
		// Use the UX spec treemap color palette
		return treemapColors[index % treemapColors.length];
	}

	function handleAddToPortfolio(stock: Stock) {
		window.location.href = `/portfolio?add=${stock.symbol}`;
	}

	function handleAddToWatchlist(stock: Stock) {
		portfolioStore.addToWatchlist({
			symbol: stock.symbol,
			name: stock.name
		});
	}

	function handleSelectStock(stock: Stock) {
		window.location.href = `/stock/${stock.symbol}`;
	}
</script>

<svelte:head>
	<title>Historical Stock Data | Home</title>
</svelte:head>

<h1><i class="fat fa-chart-candlestick"></i> Historical Stock Data Analysis</h1>

<p class="text-muted">
	Stock analysis platform with portfolio tracking, interactive D3 visualizations, and SEC forensic
	analysis tools.
</p>

<!-- Search -->
<section class="mt-2">
	<div class="search-section">
		<SearchInput
			placeholder="Search S&P 500 stocks..."
			onSelect={handleSelectStock}
			onAddToPortfolio={handleAddToPortfolio}
			onAddToWatchlist={handleAddToWatchlist}
		/>
	</div>
</section>

<!-- Quick Navigation -->
<section class="mt-3">
	<div class="card-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
		<a href="/portfolio" class="section-box nav-card">
			<div class="nav-icon"><i class="fat fa-briefcase"></i></div>
			<div class="nav-title">Portfolio</div>
			<div class="nav-desc">Track your holdings</div>
			{#if portfolioStore.totalHoldings > 0}
				<div class="nav-badge">{portfolioStore.totalHoldings} holdings</div>
			{/if}
		</a>

		<a href="/portfolio/watchlist" class="section-box nav-card">
			<div class="nav-icon"><i class="fat fa-eye"></i></div>
			<div class="nav-title">Watchlist</div>
			<div class="nav-desc">Stocks you're watching</div>
			{#if portfolioStore.totalWatchlist > 0}
				<div class="nav-badge">{portfolioStore.totalWatchlist} stocks</div>
			{/if}
		</a>

		<a href="/visualizations/stock-analysis" class="section-box nav-card">
			<div class="nav-icon"><i class="fat fa-chart-line"></i></div>
			<div class="nav-title">SEC Analysis</div>
			<div class="nav-desc">Forensic entity data</div>
			{#if data.summary?.entities}
				<div class="nav-badge">{data.summary.entities.filter((e) => e.hasData).length} entities</div>
			{/if}
		</a>

		<a href="/education" class="section-box nav-card">
			<div class="nav-icon"><i class="fat fa-graduation-cap"></i></div>
			<div class="nav-title">Education</div>
			<div class="nav-desc">Learn investing basics</div>
		</a>
	</div>
</section>

<!-- Top Stocks Section -->
{#if displayStocks.length > 0}
	<section class="mt-3">
		<h2><i class="fat fa-chart-mixed"></i> Top Stocks</h2>
		<p class="text-muted" style="margin-bottom: 1rem;">
			Real-time quotes and analyst recommendations for major market leaders.
		</p>
		<div class="stock-grid">
			{#each displayStocks as stock (stock.symbol)}
				<StockCard
					symbol={stock.symbol}
					name={stock.name}
					price={stock.price}
					change={stock.change}
					changePercent={stock.changePercent}
					sector={stock.sector}
					marketCap={stock.marketCap}
					logo={stock.logo}
					recommendation={stock.recommendation}
					href="/stock/{stock.symbol}"
				/>
			{/each}
		</div>
	</section>
{/if}

<!-- Portfolio Overview (if user has holdings) -->
{#if portfolioStore.totalHoldings > 0}
	<section class="mt-3">
		<h2><i class="fat fa-briefcase"></i> Your Portfolio</h2>

		<p class="portfolio-narrative">
			Your portfolio of <strong>{portfolioStore.totalHoldings} holdings</strong> is currently valued at
			<strong>{formatCurrency(portfolioStats().totalValue)}</strong>,
			{#if portfolioStats().gainLoss >= 0}
				reflecting a gain of <span class="narrative-positive">{formatCurrency(portfolioStats().gainLoss)}</span>
				(<span class="narrative-positive">{formatPercent(portfolioStats().gainLossPercent)}</span> return)
			{:else}
				reflecting a loss of <span class="narrative-negative">{formatCurrency(Math.abs(portfolioStats().gainLoss))}</span>
				(<span class="narrative-negative">{formatPercent(portfolioStats().gainLossPercent)}</span> return)
			{/if}
			from your total cost basis of {formatCurrency(portfolioStats().totalCost)}.
		</p>

		{#if portfolioTreemapItems().length > 0}
			<div class="section-box treemap-box mt-2" bind:this={portfolioTreemapWrapper}>
				<PortfolioTreemap
					items={portfolioTreemapItems()}
					width={portfolioTreemapWidth}
					height={260}
					onItemClick={(item) => {
						window.location.href = `/stock/${item.symbol}`;
					}}
				/>
			</div>
		{/if}

		<div class="mt-2">
			<a href="/portfolio" class="button">
				<i class="fat fa-arrow-right"></i> Manage Portfolio
			</a>
		</div>
	</section>
{/if}

<!-- Sample Portfolio Treemap -->
{#if displayStocks.length >= 6}
	<section class="mt-3">
		<h2><i class="fat fa-chart-treemap"></i> Sample Portfolio</h2>

		<p class="text-muted" style="margin-bottom: 1rem;">
			Example diversified portfolio weighted by market capitalization. Click any stock to view details.
		</p>

		<div class="section-box treemap-box">
			<div class="treemap-demo">
				<a
					href="/stock/{displayStocks[0].symbol}"
					class="treemap-cell treemap-cell-large"
					style="flex: 3; background: {getStockColor(0)};"
				>
					<span class="treemap-label">{displayStocks[0].symbol}</span>
					<span class="treemap-value">{formatCurrency(displayStocks[0].price ?? 0)}</span>
					<span class="treemap-value" class:positive={(displayStocks[0].changePercent ?? 0) >= 0} class:negative={(displayStocks[0].changePercent ?? 0) < 0}>
						{formatPercent(displayStocks[0].changePercent ?? 0)}
					</span>
					<span class="treemap-value treemap-company">{displayStocks[0].name}</span>
				</a>
				<div style="flex: 2; display: flex; flex-direction: column; gap: 4px;">
					<a
						href="/stock/{displayStocks[1].symbol}"
						class="treemap-cell"
						style="flex: 1; background: {getStockColor(1)};"
					>
						<span class="treemap-label">{displayStocks[1].symbol}</span>
						<span class="treemap-value">{formatCurrency(displayStocks[1].price ?? 0)}</span>
						<span class="treemap-value" class:positive={(displayStocks[1].changePercent ?? 0) >= 0} class:negative={(displayStocks[1].changePercent ?? 0) < 0}>
							{formatPercent(displayStocks[1].changePercent ?? 0)}
						</span>
					</a>
					<div style="flex: 1; display: flex; gap: 4px;">
						<a
							href="/stock/{displayStocks[2].symbol}"
							class="treemap-cell treemap-cell-small"
							style="flex: 1; background: {getStockColor(2)};"
						>
							<span class="treemap-label">{displayStocks[2].symbol}</span>
							<span class="treemap-value" class:positive={(displayStocks[2].changePercent ?? 0) >= 0} class:negative={(displayStocks[2].changePercent ?? 0) < 0}>
								{formatPercent(displayStocks[2].changePercent ?? 0)}
							</span>
						</a>
						<a
							href="/stock/{displayStocks[3].symbol}"
							class="treemap-cell treemap-cell-small"
							style="flex: 0.8; background: {getStockColor(3)};"
						>
							<span class="treemap-label">{displayStocks[3].symbol}</span>
							<span class="treemap-value" class:positive={(displayStocks[3].changePercent ?? 0) >= 0} class:negative={(displayStocks[3].changePercent ?? 0) < 0}>
								{formatPercent(displayStocks[3].changePercent ?? 0)}
							</span>
						</a>
					</div>
				</div>
			</div>

			<!-- Second row of 4 smaller stocks -->
			<div class="treemap-demo mt-1" style="height: 80px;">
				{#each displayStocks.slice(4, 8) as stock, i}
					<a
						href="/stock/{stock.symbol}"
						class="treemap-cell treemap-cell-small"
						style="flex: 1; background: {getStockColor(4 + i)};"
					>
						<span class="treemap-label">{stock.symbol}</span>
						<span class="treemap-value" class:positive={(stock.changePercent ?? 0) >= 0} class:negative={(stock.changePercent ?? 0) < 0}>
							{formatPercent(stock.changePercent ?? 0)}
						</span>
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- Data Overview - GitHub Activity Style -->
<section class="mt-3">
	<h2><i class="fat fa-chart-simple"></i> Data Overview</h2>

	<div bind:this={activityGraphWrapper}>
		<ActivityGraph
			entitiesCount={data.summary?.entities?.length ?? 0}
			tradingDays={data.summary?.totalRecords ?? 0}
			earliestYear={data.summary?.dateRange?.earliest?.split('-')[0] ?? 'N/A'}
			latestYear={data.summary?.dateRange?.latest?.split('-')[0] ?? 'N/A'}
			width={activityGraphWidth}
		/>
	</div>
</section>

<!-- Data Commands -->
<section class="mt-3">
	<h2><i class="fat fa-terminal"></i> Data Pipeline</h2>

	<div class="section-box">
		<table>
			<thead>
				<tr>
					<th>Command</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>bun run prefetch:sp500</code></td>
					<td>Fetch S&P 500 company profiles from Finnhub</td>
				</tr>
				<tr>
					<td><code>bun run prefetch:top25</code></td>
					<td>Fetch detailed history for top 25 stocks</td>
				</tr>
				<tr>
					<td><code>bun run prefetch:crypto</code></td>
					<td>Fetch BTC and ETH cryptocurrency history</td>
				</tr>
				<tr>
					<td><code>bun run data:pipeline</code></td>
					<td>Run full SEC forensic data pipeline</td>
				</tr>
			</tbody>
		</table>
	</div>
</section>

<style>
	.search-section {
		max-width: 400px;
	}

	/* Stock Grid */
	.stock-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 1rem;
	}

	@media (min-width: 1200px) {
		.stock-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (max-width: 640px) {
		.stock-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Navigation Cards */
	.nav-card {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		padding: 1.25rem;
		position: relative;
	}

	.nav-icon {
		font-size: 1.5rem;
		color: var(--color-text-muted);
		margin-bottom: 0.5rem;
	}

	.nav-title {
		font-size: 1rem;
		font-weight: 600;
	}

	.nav-desc {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-top: 0.25rem;
	}

	.nav-badge {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		background: var(--color-accent-blue);
		color: white;
		font-size: 0.65rem;
		padding: 0.15rem 0.5rem;
		border-radius: 3px;
	}


	/* Treemap Demo */
	.treemap-demo {
		display: flex;
		gap: 4px;
		height: 180px;
	}

	.treemap-cell {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		padding: 8px 10px;
		color: #000000;
		cursor: pointer;
		transition: opacity 0.15s ease;
		text-decoration: none;
	}

	.treemap-cell:hover {
		opacity: 0.8;
	}

	.treemap-label {
		font-size: 13px;
	}

	.treemap-value {
		font-size: 11px;
	}

	.treemap-cell-small .treemap-label {
		font-size: 12px;
	}

	.treemap-company {
		font-size: 10px;
		margin-top: 2px;
	}

	.treemap-value.positive {
		color: #2e7d32;
		font-weight: 600;
	}

	.treemap-value.negative {
		color: #c62828;
		font-weight: 600;
	}

	/* Portfolio Narrative */
	.portfolio-narrative {
		font-size: 0.9375rem;
		line-height: 1.7;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.narrative-positive {
		color: var(--color-chart-up);
		font-weight: 600;
	}

	.narrative-negative {
		color: var(--color-chart-down);
		font-weight: 600;
	}

	/* Treemap container - remove padding so SVG fills full width */
	.treemap-box {
		padding: 0;
		overflow: hidden;
	}
</style>
