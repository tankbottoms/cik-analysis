<script lang="ts">
	import type { PageData } from './$types';

	let { data } = $props();

	// Filter to only entities with data
	const entitiesWithData = $derived(
		data.summary?.entities?.filter((e) => e.hasData) ?? []
	);
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
							<div class="text-muted" style="font-size: 0.65rem; text-transform: uppercase;">
								Trading Days
							</div>
							<div style="font-weight: 600;">{totalDays.toLocaleString()}</div>
						</div>
						<div>
							<div class="text-muted" style="font-size: 0.65rem; text-transform: uppercase;">
								Peak Price
							</div>
							<div style="font-weight: 600; color: var(--color-accent-green);">
								${peakPrice.toFixed(4)}
							</div>
						</div>
						<div>
							<div class="text-muted" style="font-size: 0.65rem; text-transform: uppercase;">
								Total Volume
							</div>
							<div style="font-weight: 600;">{totalVolume.toLocaleString()}</div>
						</div>
						<div>
							<div class="text-muted" style="font-size: 0.65rem; text-transform: uppercase;">
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
						<th>CIK</th>
						<th>Ticker</th>
						<th>Company</th>
						<th class="text-right">Days</th>
						<th class="text-right">Peak</th>
						<th class="text-right">Volume</th>
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
{:else}
	<div class="callout mt-3">
		<p>
			<i class="fat fa-triangle-exclamation"></i>
			No stock data available. Run the data pipeline first:
		</p>
		<pre
			style="background: var(--color-code-bg); padding: 0.5rem; border-radius: 3px; margin-top: 0.5rem;">bun run data:pipeline</pre>
	</div>
{/if}

<style>
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
</style>
