<script lang="ts">
	import type { PageData } from './$types';

	let { data } = $props();

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
		'#fff3cd'  // yellow-1 (Warning)
	];

	function formatVolume(value: number): string {
		if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
		if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
		if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
		return value.toString();
	}

	function formatPrice(value: number): string {
		return `$${value.toFixed(4)}`;
	}

	function getEntityStats(entity: typeof entitiesWithData[0]) {
		const totalVolume = entity.periods.reduce((sum, p) => sum + p.totalVolume, 0);
		const tradingDays = entity.periods.reduce((sum, p) => sum + p.tradingDays, 0);
		const peakPrice = Math.max(...entity.periods.map((p) => p.peakPrice));
		return { totalVolume, tradingDays, peakPrice };
	}
</script>

<svelte:head>
	<title>Historical Stock Data | Home</title>
</svelte:head>

<h1><i class="fat fa-chart-candlestick"></i> Historical Stock Data Analysis</h1>

<p class="text-muted">
	Forensic analysis of historical stock trading data for SEC-related entities.
	This tool provides comprehensive stock price analysis, volume metrics, and SEC filing integration.
</p>

<section class="mt-3">
	<h2><i class="fat fa-chart-line"></i> Quick Stats</h2>

	<div class="card-grid">
		<div class="section-box stats-card">
			<div class="stat-number">{data.summary?.entities?.length ?? 0}</div>
			<div class="stat-label">Entities Tracked</div>
		</div>
		<div class="section-box stats-card">
			<div class="stat-number">{(data.summary?.totalRecords ?? 0).toLocaleString()}</div>
			<div class="stat-label">Trading Days</div>
		</div>
		<div class="section-box stats-card">
			<div class="stat-number">{data.summary?.dateRange?.earliest?.split('-')[0] ?? 'N/A'}</div>
			<div class="stat-label">Earliest Year</div>
		</div>
		<div class="section-box stats-card">
			<div class="stat-number">{data.summary?.dateRange?.latest?.split('-')[0] ?? 'N/A'}</div>
			<div class="stat-label">Latest Year</div>
		</div>
	</div>
</section>

<section class="mt-3">
	<h2><i class="fat fa-chart-tree-map"></i> Volume by Entity</h2>
	<p class="text-muted" style="margin-bottom: 1rem;">
		Entity size represents relative trading volume. Click an entity to view detailed analysis.
	</p>

	{#if entitiesWithData.length >= 4}
		{@const stats0 = getEntityStats(entitiesWithData[0])}
		{@const stats1 = getEntityStats(entitiesWithData[1])}
		{@const stats2 = getEntityStats(entitiesWithData[2])}
		{@const stats3 = getEntityStats(entitiesWithData[3])}
		<div class="section-box">
			<div class="treemap-demo">
				<a href="/visualizations/stock-analysis/{entitiesWithData[0].cik}" class="treemap-cell treemap-cell-large" style="flex: 3; background: {treemapColors[0]};">
					<span class="treemap-label">{entitiesWithData[0].ticker}</span>
					<span class="treemap-value">Vol: {formatVolume(stats0.totalVolume)}</span>
					<span class="treemap-value">Days: {stats0.tradingDays.toLocaleString()}</span>
					<span class="treemap-value">Peak: {formatPrice(stats0.peakPrice)}</span>
					<span class="treemap-value treemap-company">{entitiesWithData[0].company}</span>
				</a>
				<div style="flex: 2; display: flex; flex-direction: column; gap: 4px;">
					<a href="/visualizations/stock-analysis/{entitiesWithData[1].cik}" class="treemap-cell" style="flex: 1; background: {treemapColors[1]};">
						<span class="treemap-label">{entitiesWithData[1].ticker}</span>
						<span class="treemap-value">Vol: {formatVolume(stats1.totalVolume)}</span>
					</a>
					<div style="flex: 1; display: flex; gap: 4px;">
						<a href="/visualizations/stock-analysis/{entitiesWithData[2].cik}" class="treemap-cell treemap-cell-small" style="flex: 1; background: {treemapColors[2]};">
							<span class="treemap-label">{entitiesWithData[2].ticker}</span>
						</a>
						<a href="/visualizations/stock-analysis/{entitiesWithData[3].cik}" class="treemap-cell treemap-cell-small" style="flex: 0.8; background: {treemapColors[3]};">
							<span class="treemap-label">{entitiesWithData[3].ticker}</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	{:else if entitiesWithData.length > 0}
		<div class="section-box">
			<div class="treemap-demo">
				{#each entitiesWithData as entity, i}
					{@const stats = getEntityStats(entity)}
					<a href="/visualizations/stock-analysis/{entity.cik}" class="treemap-cell" style="flex: 1; background: {treemapColors[i % treemapColors.length]};">
						<span class="treemap-label">{entity.ticker}</span>
						<span class="treemap-value">Vol: {formatVolume(stats.totalVolume)}</span>
					</a>
				{/each}
			</div>
		</div>
	{:else}
		<div class="callout">
			<p><i class="fat fa-circle-info"></i> No entity data available for visualization.</p>
		</div>
	{/if}
</section>

<section class="mt-3">
	<h2><i class="fat fa-building"></i> Entities Overview</h2>

	{#if data.summary?.entities}
		<div class="card-grid">
			{#each data.summary.entities.filter(e => e.hasData) as entity}
				<a href="/visualizations/stock-analysis/{entity.cik}" class="section-box" style="text-decoration: none; color: inherit;">
					<div class="header-row">
						<h3 style="margin: 0;">{entity.ticker}</h3>
						<span class="badge badge-green">Has Data</span>
					</div>
					<div class="text-muted" style="font-size: 0.875rem; margin-top: 0.5rem;">
						{entity.company}
					</div>
					<div class="text-muted" style="font-size: 0.75rem; margin-top: 0.25rem;">
						CIK: {entity.cik}
					</div>
					{#if entity.periods.length > 0}
						<div style="margin-top: 0.75rem; font-size: 0.75rem;">
							<span class="text-muted">Trading Days:</span>
							<strong>{entity.periods.reduce((sum, p) => sum + p.tradingDays, 0).toLocaleString()}</strong>
						</div>
						<div style="font-size: 0.75rem;">
							<span class="text-muted">Peak Price:</span>
							<strong>${Math.max(...entity.periods.map(p => p.peakPrice)).toFixed(4)}</strong>
						</div>
					{/if}
				</a>
			{/each}
		</div>

		{#if data.summary.entities.filter(e => !e.hasData).length > 0}
			<h3 class="mt-3">Entities Without Market Data</h3>
			<div class="section-box">
				<table>
					<thead>
						<tr>
							<th>CIK</th>
							<th>Ticker</th>
							<th>Company</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{#each data.summary.entities.filter(e => !e.hasData) as entity}
							<tr>
								<td><code>{entity.cik}</code></td>
								<td>{entity.ticker}</td>
								<td>{entity.company}</td>
								<td><span class="badge badge-amber">No Trading Data</span></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{:else}
		<div class="callout">
			<p>
				<i class="fat fa-triangle-exclamation"></i>
				No data available. Run the data pipeline to generate entity data:
			</p>
			<pre style="background: var(--color-code-bg); padding: 0.5rem; border-radius: 3px; margin-top: 0.5rem;">bun run data:pipeline</pre>
		</div>
	{/if}
</section>

<section class="mt-3">
	<h2><i class="fat fa-terminal"></i> Getting Started</h2>

	<div class="section-box">
		<h3>Data Pipeline Commands</h3>
		<table>
			<thead>
				<tr>
					<th>Command</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>bun run data:fetch</code></td>
					<td>Fetch data from Alpha Vantage and SEC EDGAR APIs</td>
				</tr>
				<tr>
					<td><code>bun run data:consolidate</code></td>
					<td>Merge local cache with remote API data</td>
				</tr>
				<tr>
					<td><code>bun run data:normalize</code></td>
					<td>Convert to daily OHLCV and calculate metrics</td>
				</tr>
				<tr>
					<td><code>bun run data:generate</code></td>
					<td>Generate final JSON/CSV for the website</td>
				</tr>
				<tr>
					<td><code>bun run data:pipeline</code></td>
					<td>Run all steps in sequence</td>
				</tr>
			</tbody>
		</table>
	</div>
</section>

<style>
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
</style>
