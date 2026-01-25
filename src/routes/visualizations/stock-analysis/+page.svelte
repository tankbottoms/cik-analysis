<script lang="ts">
	import type { PageData } from './$types';
	import type { StockWithHistory } from './+page';
	import { goto } from '$app/navigation';
	import { educationTerms, getEducationLink } from '$lib/education';
	import StockCard from '$lib/components/StockCard.svelte';

	let { data } = $props();

	// Navigate to education link (for use inside anchor elements where nested <a> is invalid)
	function navigateToEducation(e: MouseEvent, term: string) {
		e.preventDefault();
		e.stopPropagation();
		goto(getEducationLink(term));
	}

	// Filter to only entities with data
	const entitiesWithData = $derived(
		data.summary?.entities?.filter((e) => e.hasData) ?? []
	);

	// Stocks with history data
	const stocksWithHistory = $derived(data.stocksWithHistory ?? []);

	function formatPrice(value: number): string {
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

	function formatMarketCap(value: number): string {
		const inBillions = value / 1000;
		if (inBillions >= 1000) return `$${(inBillions / 1000).toFixed(1)}T`;
		if (inBillions >= 1) return `$${inBillions.toFixed(0)}B`;
		return `$${value.toFixed(0)}M`;
	}

	function formatDate(dateStr: string | undefined): string {
		if (!dateStr) return 'N/A';
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short'
		});
	}
</script>

<svelte:head>
	<title>Stock Analysis | Historical Stock Data</title>
</svelte:head>

<a href="/" class="back-link">
	<i class="fat fa-arrow-left"></i> Back to Home
</a>

<h1>Stock Analysis</h1>

<p class="text-muted">
	Select an entity to view detailed stock price analysis, volume metrics, and SEC filing timeline.
</p>

<div class="edu-intro">
	<p>
		<i class="fat fa-graduation-cap"></i>
		<strong>About Historical Stock Analysis:</strong>
		This page presents trading data with 5-year price history and SEC filing timelines.
		View detailed charts, analyst recommendations, and earnings data for major stocks.
	</p>
</div>

<!-- Stocks with 5-Year History -->
{#if stocksWithHistory.length > 0}
	<section class="mt-3">
		<h2><i class="fat fa-chart-line"></i> 5-Year Historical Data</h2>

		<p class="text-muted" style="margin-bottom: 1rem;">
			Stocks with complete 5-year price history, analyst ratings, and earnings data.
		</p>

		<div class="stock-grid">
			{#each stocksWithHistory as stock (stock.symbol)}
				<StockCard
					symbol={stock.symbol}
					name={stock.name}
					price={stock.price}
					change={stock.change}
					changePercent={stock.changePercent}
					sector={stock.sector}
					marketCap={stock.marketCap}
					logo={stock.logo}
					href="/stock/{stock.symbol}"
				/>
			{/each}
		</div>
	</section>
{/if}

<!-- SEC Entity Analysis -->
{#if entitiesWithData.length > 0}
	<section class="mt-3">
		<h2><i class="fat fa-chart-candlestick"></i> Available Entities</h2>

		<div class="card-grid">
			{#each entitiesWithData as entity}
				{@const totalDays = entity.periods.reduce((sum, p) => sum + p.tradingDays, 0)}
				{@const peakPrice = Math.max(...entity.periods.map((p) => p.peakPrice))}
				{@const totalVolume = entity.periods.reduce((sum, p) => sum + p.totalVolume, 0)}
				{@const dateRange =
					entity.periods.length > 0
						? `${entity.periods[0].start} to ${entity.periods[entity.periods.length - 1].end}`
						: 'N/A'}

				<a
					href="/visualizations/stock-analysis/{entity.cik}"
					class="section-box featured"
					style="text-decoration: none; color: inherit;"
				>
					<div class="header-row">
						<h3 style="margin: 0;">{entity.ticker}</h3>
						<span class="badge badge-blue">{entity.cik.replace('CIK', '')}</span>
					</div>

					<div class="text-muted" style="font-size: 0.875rem; margin-top: 0.5rem;">
						{entity.company}
					</div>

					<div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
						<div>
							<div class="text-muted stat-label">
								Trading Days
								<span role="button" tabindex="0" class="edu-tooltip" title={educationTerms['trading-days'].short} onclick={(e) => navigateToEducation(e, 'trading-days')} onkeydown={(e) => e.key === 'Enter' && navigateToEducation(e, 'trading-days')}>
									<i class="fat fa-circle-info"></i>
								</span>
							</div>
							<div style="font-weight: 600;">{totalDays.toLocaleString()}</div>
						</div>
						<div>
							<div class="text-muted stat-label">
								Peak Price
								<span role="button" tabindex="0" class="edu-tooltip" title={educationTerms['peak-price'].short} onclick={(e) => navigateToEducation(e, 'peak-price')} onkeydown={(e) => e.key === 'Enter' && navigateToEducation(e, 'peak-price')}>
									<i class="fat fa-circle-info"></i>
								</span>
							</div>
							<div style="font-weight: 600; color: var(--color-accent-green);">
								${peakPrice.toFixed(4)}
							</div>
						</div>
						<div>
							<div class="text-muted stat-label">
								Total Volume
								<span role="button" tabindex="0" class="edu-tooltip" title={educationTerms['volume'].short} onclick={(e) => navigateToEducation(e, 'volume')} onkeydown={(e) => e.key === 'Enter' && navigateToEducation(e, 'volume')}>
									<i class="fat fa-circle-info"></i>
								</span>
							</div>
							<div style="font-weight: 600;">{totalVolume.toLocaleString()}</div>
						</div>
						<div>
							<div class="text-muted stat-label">
								Date Range
							</div>
							<div style="font-weight: 600; font-size: 0.75rem;">{dateRange.split(' to ')[0]}</div>
						</div>
					</div>

					<div class="card-link-indicator">
						<i class="fat fa-arrow-up-right-from-square"></i>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<section class="mt-3">
		<h2><i class="fat fa-table"></i> Comparison Table</h2>

		<div class="section-box" style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>
							CIK
							<a href={getEducationLink('cik')} class="edu-tooltip" title={educationTerms['cik'].short}>
								<i class="fat fa-circle-info"></i>
							</a>
						</th>
						<th>
							Ticker
							<a href={getEducationLink('ticker')} class="edu-tooltip" title={educationTerms['ticker'].short}>
								<i class="fat fa-circle-info"></i>
							</a>
						</th>
						<th>Company</th>
						<th class="text-right">
							Days
							<a href={getEducationLink('trading-days')} class="edu-tooltip" title={educationTerms['trading-days'].short}>
								<i class="fat fa-circle-info"></i>
							</a>
						</th>
						<th class="text-right">
							Peak
							<a href={getEducationLink('peak-price')} class="edu-tooltip" title={educationTerms['peak-price'].short}>
								<i class="fat fa-circle-info"></i>
							</a>
						</th>
						<th class="text-right">
							Volume
							<a href={getEducationLink('volume')} class="edu-tooltip" title={educationTerms['volume'].short}>
								<i class="fat fa-circle-info"></i>
							</a>
						</th>
						<th>Period</th>
					</tr>
				</thead>
				<tbody>
					{#each entitiesWithData as entity}
						{@const totalDays = entity.periods.reduce((sum, p) => sum + p.tradingDays, 0)}
						{@const peakPrice = Math.max(...entity.periods.map((p) => p.peakPrice))}
						{@const totalVolume = entity.periods.reduce((sum, p) => sum + p.totalVolume, 0)}
						<tr>
							<td>
								<a href="/visualizations/stock-analysis/{entity.cik}">
									<code>{entity.cik.replace('CIK', '')}</code>
								</a>
							</td>
							<td><strong>{entity.ticker}</strong></td>
							<td>{entity.company}</td>
							<td class="text-right">{totalDays.toLocaleString()}</td>
							<td class="text-right" style="color: var(--color-accent-green);">
								${peakPrice.toFixed(4)}
							</td>
							<td class="text-right">{totalVolume.toLocaleString()}</td>
							<td>
								{#if entity.periods.length > 0}
									{entity.periods[0].start.split('-')[0]}-{entity.periods[
										entity.periods.length - 1
									].end.split('-')[0]}
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
{/if}

{#if stocksWithHistory.length === 0 && entitiesWithData.length === 0}
	<div class="callout mt-3">
		<p>
			<i class="fat fa-triangle-exclamation"></i>
			No stock data available. Run the data pipeline first:
		</p>
		<pre style="background: var(--color-code-bg); padding: 0.5rem; border-radius: 3px; margin-top: 0.5rem;">bun run prefetch:top25</pre>
		<p class="text-muted" style="margin-top: 0.5rem;">Or for SEC entity data:</p>
		<pre style="background: var(--color-code-bg); padding: 0.5rem; border-radius: 3px; margin-top: 0.5rem;">bun run data:pipeline</pre>
	</div>
{/if}

<style>
	/* Stock Grid - matches landing page */
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

	.card-link-indicator {
		position: absolute;
		bottom: 0.75rem;
		right: 0.75rem;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		transition: color 0.15s ease;
	}

	.card-link-indicator i:hover {
		color: var(--color-link);
	}

	.section-box.featured {
		position: relative;
	}

	/* Education integration styles */
	.edu-intro {
		background: var(--color-bg-secondary);
		border-left: 4px solid var(--color-border-dark);
		padding: 1rem;
		margin: 1.5rem 0;
		border-radius: 0 5px 5px 0;
	}

	.edu-intro p {
		margin: 0;
		line-height: 1.6;
	}

	.edu-intro i.fa-graduation-cap {
		color: var(--color-text-muted);
		margin-right: 0.25rem;
	}

	.edu-intro a {
		color: var(--color-link);
		text-decoration: none;
	}

	.edu-intro a:hover {
		text-decoration: underline;
	}

	.edu-tooltip {
		color: var(--color-text-muted);
		text-decoration: none;
		margin-left: 0.25rem;
		font-size: 0.75rem;
		cursor: pointer;
	}

	.edu-tooltip:hover {
		color: var(--color-link);
	}

	.edu-tooltip:focus {
		outline: 1px dotted var(--color-link);
		outline-offset: 2px;
	}

	.stat-label {
		font-size: 0.65rem;
		text-transform: uppercase;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	th .edu-tooltip {
		font-size: 0.65rem;
	}

	.stock-logo-small {
		width: 28px;
		height: 28px;
		border-radius: 3px;
		object-fit: contain;
	}

	.positive {
		color: var(--color-chart-up);
		font-weight: 500;
	}

	.negative {
		color: var(--color-chart-down);
		font-weight: 500;
	}
</style>
