<script lang="ts">
	import { browser } from '$app/environment';
	import type { StockPageData } from './+page';

	let { data }: { data: StockPageData } = $props();

	// D3 for charts
	let d3: typeof import('d3') | null = $state(null);
	let chartEl: HTMLDivElement | null = $state(null);
	let loading = $state(true);

	// Computed metrics from historical data
	const historyMetrics = $derived(() => {
		if (data.history.length === 0) return null;

		const closes = data.history.map((d) => d.close);
		const volumes = data.history.map((d) => d.volume);
		const highs = data.history.map((d) => d.high);
		const lows = data.history.map((d) => d.low);

		// 52-week data (last 252 trading days)
		const last52Weeks = data.history.slice(-252);
		const high52Week = last52Weeks.length > 0 ? Math.max(...last52Weeks.map((d) => d.high)) : null;
		const low52Week = last52Weeks.length > 0 ? Math.min(...last52Weeks.map((d) => d.low)) : null;

		// All-time high/low
		const allTimeHigh = Math.max(...highs);
		const allTimeLow = Math.min(...lows);

		// Average volume
		const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
		const recentVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;

		// YTD performance
		const currentYear = new Date().getFullYear();
		const ytdData = data.history.filter((d) => new Date(d.date).getFullYear() === currentYear);
		let ytdChange = null;
		let ytdPercent = null;
		if (ytdData.length > 1) {
			const startPrice = ytdData[0].close;
			const endPrice = ytdData[ytdData.length - 1].close;
			ytdChange = endPrice - startPrice;
			ytdPercent = ((endPrice - startPrice) / startPrice) * 100;
		}

		// 1-year performance
		const oneYearData = data.history.slice(-252);
		let oneYearChange = null;
		let oneYearPercent = null;
		if (oneYearData.length > 1) {
			const startPrice = oneYearData[0].close;
			const endPrice = oneYearData[oneYearData.length - 1].close;
			oneYearChange = endPrice - startPrice;
			oneYearPercent = ((endPrice - startPrice) / startPrice) * 100;
		}

		// Volatility (annualized standard deviation of daily returns)
		const dailyReturns: number[] = [];
		for (let i = 1; i < closes.length; i++) {
			dailyReturns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
		}
		const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
		const variance =
			dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length;
		const dailyVolatility = Math.sqrt(variance);
		const annualizedVolatility = dailyVolatility * Math.sqrt(252) * 100;

		// Date range
		const startDate = data.history[0].date;
		const endDate = data.history[data.history.length - 1].date;
		const tradingDays = data.history.length;

		return {
			high52Week,
			low52Week,
			allTimeHigh,
			allTimeLow,
			avgVolume,
			recentVolume,
			ytdChange,
			ytdPercent,
			oneYearChange,
			oneYearPercent,
			volatility: annualizedVolatility,
			startDate,
			endDate,
			tradingDays
		};
	});

	$effect(() => {
		if (browser && !d3) {
			import('d3').then((module) => {
				d3 = module;
				loading = false;
			});
		}
	});

	$effect(() => {
		if (browser && d3 && chartEl && data.history.length > 0) {
			renderChart();
		}
	});

	function renderChart() {
		if (!d3 || !chartEl) return;

		// Clear previous
		d3.select(chartEl).selectAll('*').remove();

		const margin = { top: 20, right: 30, bottom: 40, left: 60 };
		const width = chartEl.clientWidth - margin.left - margin.right;
		const height = 300 - margin.top - margin.bottom;

		const svg = d3
			.select(chartEl)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const parseDate = (dateStr: string) => {
			if (dateStr.includes('T')) return new Date(dateStr);
			const [y, m, day] = dateStr.split('-').map(Number);
			return new Date(y, m - 1, day);
		};

		const chartData = data.history.map((d) => ({
			date: parseDate(d.date),
			close: d.close
		}));

		const x = d3
			.scaleTime()
			.domain(d3.extent(chartData, (d) => d.date) as [Date, Date])
			.range([0, width]);

		const y = d3
			.scaleLinear()
			.domain([d3.min(chartData, (d) => d.close) as number * 0.95, d3.max(chartData, (d) => d.close) as number * 1.05])
			.range([height, 0]);

		// Grid lines
		svg
			.append('g')
			.attr('class', 'grid')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x).tickSize(-height).tickFormat(() => ''))
			.selectAll('line')
			.style('stroke', 'var(--color-chart-grid)')
			.style('stroke-opacity', 0.5);

		svg
			.append('g')
			.attr('class', 'grid')
			.call(d3.axisLeft(y).tickSize(-width).tickFormat(() => ''))
			.selectAll('line')
			.style('stroke', 'var(--color-chart-grid)')
			.style('stroke-opacity', 0.5);

		// Line
		const line = d3
			.line<{ date: Date; close: number }>()
			.x((d) => x(d.date))
			.y((d) => y(d.close));

		const isPositive = chartData.length > 1 && chartData[chartData.length - 1].close >= chartData[0].close;

		svg
			.append('path')
			.datum(chartData)
			.attr('fill', 'none')
			.attr('stroke', isPositive ? 'var(--color-chart-up)' : 'var(--color-chart-down)')
			.attr('stroke-width', 2)
			.attr('d', line);

		// Area
		const area = d3
			.area<{ date: Date; close: number }>()
			.x((d) => x(d.date))
			.y0(height)
			.y1((d) => y(d.close));

		svg
			.append('path')
			.datum(chartData)
			.attr('fill', isPositive ? 'var(--color-chart-up)' : 'var(--color-chart-down)')
			.attr('fill-opacity', 0.1)
			.attr('d', area);

		// X axis
		svg
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x).ticks(6))
			.selectAll('text')
			.style('font-family', 'var(--font-mono)')
			.style('font-size', '11px');

		// Y axis
		svg
			.append('g')
			.call(d3.axisLeft(y).ticks(5).tickFormat((d) => `$${d}`))
			.selectAll('text')
			.style('font-family', 'var(--font-mono)')
			.style('font-size', '11px');
	}

	function formatPrice(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(value);
	}

	function formatPercent(value: number): string {
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(2)}%`;
	}

	function formatMarketCap(value: number): string {
		const inBillions = value / 1000;
		if (inBillions >= 1000) return `$${(inBillions / 1000).toFixed(2)}T`;
		if (inBillions >= 1) return `$${inBillions.toFixed(0)}B`;
		return `$${value.toFixed(0)}M`;
	}

	function formatVolume(value: number): string {
		if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
		if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
		if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
		return value.toFixed(0);
	}

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}

	const isPositive = $derived((data.quote?.change ?? 0) >= 0);
	const totalAnalysts = $derived(
		data.recommendations
			? data.recommendations.strongBuy +
				data.recommendations.buy +
				data.recommendations.hold +
				data.recommendations.sell +
				data.recommendations.strongSell
			: 0
	);
</script>

<svelte:head>
	<title>{data.symbol} | Stock Details</title>
</svelte:head>

<a href="/" class="back-link mb-2">
	<i class="fat fa-arrow-left"></i> Back to Home
</a>

{#if data.error}
	<div class="callout">
		<p><i class="fat fa-circle-exclamation"></i> {data.error}</p>
		<p class="text-muted mt-1">This stock may not be in our database yet. Try running the data prefetch scripts.</p>
	</div>
{:else}
	<!-- Header -->
	<div class="stock-header">
		{#if data.profile?.logo}
			<img src={data.profile.logo} alt={data.symbol} class="stock-logo" />
		{/if}
		<div class="stock-title">
			<h1>{data.symbol}</h1>
			<p class="company-name">{data.profile?.name ?? data.symbol}</p>
			{#if data.profile?.sector}
				<span class="badge badge-muted">{data.profile.sector}</span>
			{/if}
		</div>
	</div>

	<!-- Quote -->
	{#if data.quote}
		<section class="section-box featured mt-2">
			<div class="quote-main">
				<span class="price">{formatPrice(data.quote.price)}</span>
				<span class="change" class:positive={isPositive} class:negative={!isPositive}>
					{data.quote.change >= 0 ? '+' : ''}{data.quote.change.toFixed(2)} ({formatPercent(data.quote.changePercent)})
				</span>
			</div>
			<div class="quote-details">
				<div class="quote-item">
					<span class="label">Open</span>
					<span class="value">{formatPrice(data.quote.open)}</span>
				</div>
				<div class="quote-item">
					<span class="label">High</span>
					<span class="value">{formatPrice(data.quote.high)}</span>
				</div>
				<div class="quote-item">
					<span class="label">Low</span>
					<span class="value">{formatPrice(data.quote.low)}</span>
				</div>
				<div class="quote-item">
					<span class="label">Prev Close</span>
					<span class="value">{formatPrice(data.quote.previousClose)}</span>
				</div>
				{#if data.profile?.marketCap}
					<div class="quote-item">
						<span class="label">Market Cap</span>
						<span class="value">{formatMarketCap(data.profile.marketCap)}</span>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<!-- Trading Statistics (computed from history) -->
	{#if historyMetrics()}
		{@const metrics = historyMetrics()}
		<section class="mt-3">
			<h2><i class="fat fa-chart-mixed-up-circle-dollar"></i> Trading Statistics</h2>
			<div class="stats-grid">
				<!-- 52-Week Range -->
				<div class="section-box stats-box">
					<h3 class="stats-title"><i class="fat fa-calendar"></i> 52-Week Range</h3>
					<div class="stats-row">
						<div class="stats-item">
							<span class="label">High</span>
							<span class="value price-high">{metrics?.high52Week ? formatPrice(metrics.high52Week) : 'N/A'}</span>
						</div>
						<div class="stats-item">
							<span class="label">Low</span>
							<span class="value price-low">{metrics?.low52Week ? formatPrice(metrics.low52Week) : 'N/A'}</span>
						</div>
					</div>
					{#if metrics?.high52Week && metrics?.low52Week && data.quote}
						{@const range = metrics.high52Week - metrics.low52Week}
						{@const position = ((data.quote.price - metrics.low52Week) / range) * 100}
						<div class="range-bar">
							<div class="range-track">
								<div class="range-fill" style="width: {Math.min(100, Math.max(0, position))}%"></div>
							</div>
							<div class="range-labels">
								<span class="range-low">{formatPrice(metrics.low52Week)}</span>
								<span class="range-high">{formatPrice(metrics.high52Week)}</span>
							</div>
						</div>
					{/if}
				</div>

				<!-- Performance -->
				<div class="section-box stats-box">
					<h3 class="stats-title"><i class="fat fa-chart-line-up"></i> Performance</h3>
					<div class="stats-row">
						{#if metrics?.ytdPercent !== null}
							<div class="stats-item">
								<span class="label">YTD</span>
								<span class="value" class:positive={metrics.ytdPercent >= 0} class:negative={metrics.ytdPercent < 0}>
									{formatPercent(metrics.ytdPercent)}
								</span>
							</div>
						{/if}
						{#if metrics?.oneYearPercent !== null}
							<div class="stats-item">
								<span class="label">1 Year</span>
								<span class="value" class:positive={metrics.oneYearPercent >= 0} class:negative={metrics.oneYearPercent < 0}>
									{formatPercent(metrics.oneYearPercent)}
								</span>
							</div>
						{/if}
					</div>
				</div>

				<!-- Volume -->
				<div class="section-box stats-box">
					<h3 class="stats-title"><i class="fat fa-chart-bar"></i> Volume</h3>
					<div class="stats-row">
						<div class="stats-item">
							<span class="label">Avg Volume</span>
							<span class="value">{formatVolume(metrics?.avgVolume ?? 0)}</span>
						</div>
						<div class="stats-item">
							<span class="label">20-Day Avg</span>
							<span class="value">{formatVolume(metrics?.recentVolume ?? 0)}</span>
						</div>
					</div>
				</div>

				<!-- Risk -->
				<div class="section-box stats-box">
					<h3 class="stats-title"><i class="fat fa-triangle-exclamation"></i> Risk Metrics</h3>
					<div class="stats-row">
						<div class="stats-item">
							<span class="label">Volatility (Annualized)</span>
							<span class="value">{metrics?.volatility.toFixed(1)}%</span>
						</div>
					</div>
					<p class="stats-note">Based on {metrics?.tradingDays.toLocaleString()} trading days</p>
				</div>

				<!-- Data Range -->
				<div class="section-box stats-box">
					<h3 class="stats-title"><i class="fat fa-database"></i> Historical Data</h3>
					<div class="stats-row">
						<div class="stats-item">
							<span class="label">From</span>
							<span class="value">{metrics?.startDate ? formatDate(metrics.startDate) : 'N/A'}</span>
						</div>
						<div class="stats-item">
							<span class="label">To</span>
							<span class="value">{metrics?.endDate ? formatDate(metrics.endDate) : 'N/A'}</span>
						</div>
					</div>
					<div class="stats-row mt-half">
						<div class="stats-item">
							<span class="label">All-Time High</span>
							<span class="value price-high">{metrics?.allTimeHigh ? formatPrice(metrics.allTimeHigh) : 'N/A'}</span>
						</div>
						<div class="stats-item">
							<span class="label">All-Time Low</span>
							<span class="value price-low">{metrics?.allTimeLow ? formatPrice(metrics.allTimeLow) : 'N/A'}</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	{/if}

	<!-- Price Chart -->
	{#if data.history.length > 0}
		<section class="mt-3">
			<h2><i class="fat fa-chart-line"></i> Price History (5Y)</h2>
			<div class="chart-container">
				{#if loading}
					<div class="chart-loading">
						<i class="fat fa-spinner-third fa-spin"></i> Loading chart...
					</div>
				{/if}
				<div bind:this={chartEl} class="chart-area"></div>
			</div>
		</section>
	{/if}

	<!-- Analyst Recommendations -->
	{#if data.recommendations && totalAnalysts > 0}
		<section class="mt-3">
			<h2><i class="fat fa-users"></i> Analyst Ratings</h2>
			<div class="section-box">
				<div class="ratings-bar">
					<div class="rating-segment strong-buy" style="flex: {data.recommendations.strongBuy}">
						{#if data.recommendations.strongBuy > 0}
							<span class="rating-count">{data.recommendations.strongBuy}</span>
						{/if}
					</div>
					<div class="rating-segment buy" style="flex: {data.recommendations.buy}">
						{#if data.recommendations.buy > 0}
							<span class="rating-count">{data.recommendations.buy}</span>
						{/if}
					</div>
					<div class="rating-segment hold" style="flex: {data.recommendations.hold}">
						{#if data.recommendations.hold > 0}
							<span class="rating-count">{data.recommendations.hold}</span>
						{/if}
					</div>
					<div class="rating-segment sell" style="flex: {data.recommendations.sell}">
						{#if data.recommendations.sell > 0}
							<span class="rating-count">{data.recommendations.sell}</span>
						{/if}
					</div>
					<div class="rating-segment strong-sell" style="flex: {data.recommendations.strongSell}">
						{#if data.recommendations.strongSell > 0}
							<span class="rating-count">{data.recommendations.strongSell}</span>
						{/if}
					</div>
				</div>
				<div class="ratings-legend">
					<span class="legend-item"><span class="dot strong-buy"></span> Strong Buy</span>
					<span class="legend-item"><span class="dot buy"></span> Buy</span>
					<span class="legend-item"><span class="dot hold"></span> Hold</span>
					<span class="legend-item"><span class="dot sell"></span> Sell</span>
					<span class="legend-item"><span class="dot strong-sell"></span> Strong Sell</span>
				</div>
				<p class="text-muted" style="font-size: 0.75rem; margin-top: 0.5rem;">
					Based on {totalAnalysts} analyst{totalAnalysts !== 1 ? 's' : ''} as of {data.recommendations.period}
				</p>
			</div>
		</section>
	{/if}

	<!-- Earnings -->
	{#if data.earnings.length > 0}
		<section class="mt-3">
			<h2><i class="fat fa-chart-bar"></i> Recent Earnings</h2>
			<div class="section-box">
				<table>
					<thead>
						<tr>
							<th>Quarter</th>
							<th>EPS Est.</th>
							<th>EPS Actual</th>
							<th>Surprise</th>
						</tr>
					</thead>
					<tbody>
						{#each data.earnings.slice(0, 4) as earning}
							<tr>
								<td>Q{earning.quarter} {earning.year}</td>
								<td>{formatPrice(earning.estimate)}</td>
								<td>{formatPrice(earning.actual)}</td>
								<td class:positive={earning.surprisePercent >= 0} class:negative={earning.surprisePercent < 0}>
									{formatPercent(earning.surprisePercent)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}

	<!-- Company Info -->
	{#if data.profile?.website}
		<section class="mt-3">
			<h2><i class="fat fa-building"></i> Company Info</h2>
			<div class="section-box">
				<div class="info-grid">
					{#if data.profile.exchange}
						<div class="info-item">
							<span class="label">Exchange</span>
							<span class="value">{data.profile.exchange}</span>
						</div>
					{/if}
					{#if data.profile.industry}
						<div class="info-item">
							<span class="label">Industry</span>
							<span class="value">{data.profile.industry}</span>
						</div>
					{/if}
					{#if data.profile.website}
						<div class="info-item">
							<span class="label">Website</span>
							<a href={data.profile.website} target="_blank" rel="noopener">{data.profile.website}</a>
						</div>
					{/if}
				</div>
			</div>
		</section>
	{/if}
{/if}

<style>
	.stock-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.stock-logo {
		width: 64px;
		height: 64px;
		border-radius: 5px;
		object-fit: contain;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
	}

	.stock-title h1 {
		margin: 0;
		font-size: 2.5rem;
	}

	.company-name {
		color: var(--color-text-muted);
		margin: 0.25rem 0;
	}

	/* Quote Section */
	.quote-main {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.price {
		font-size: 2.5rem;
		font-weight: 700;
	}

	.change {
		font-size: 1.25rem;
		font-weight: 500;
	}

	.change.positive {
		color: var(--color-chart-up);
	}

	.change.negative {
		color: var(--color-chart-down);
	}

	.quote-details {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.quote-item {
		display: flex;
		flex-direction: column;
	}

	.quote-item .label {
		font-size: 0.7rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.quote-item .value {
		font-size: 1rem;
		font-weight: 500;
	}

	/* Chart */
	.chart-area {
		min-height: 300px;
	}

	.chart-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 300px;
		color: var(--color-text-muted);
	}

	/* Ratings */
	.ratings-bar {
		display: flex;
		height: 32px;
		border-radius: 3px;
		overflow: hidden;
		border: 1px solid var(--color-border);
	}

	.rating-segment {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
	}

	.rating-count {
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
	}

	.rating-segment.strong-buy {
		background: #1b5e20;
	}
	.rating-segment.buy {
		background: #4caf50;
	}
	.rating-segment.hold {
		background: #ffc107;
	}
	.rating-segment.sell {
		background: #ff5722;
	}
	.rating-segment.strong-sell {
		background: #b71c1c;
	}

	.ratings-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 0.75rem;
		font-size: 0.75rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 2px;
	}

	.dot.strong-buy {
		background: #1b5e20;
	}
	.dot.buy {
		background: #4caf50;
	}
	.dot.hold {
		background: #ffc107;
	}
	.dot.sell {
		background: #ff5722;
	}
	.dot.strong-sell {
		background: #b71c1c;
	}

	/* Info Grid */
	.info-grid {
		display: grid;
		gap: 1rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
	}

	.info-item .label {
		font-size: 0.7rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	/* Table */
	td.positive {
		color: var(--color-chart-up);
	}

	td.negative {
		color: var(--color-chart-down);
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1rem;
	}

	.stats-box {
		padding: 1rem;
	}

	.stats-title {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text-muted);
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.stats-title i {
		margin-right: 0.35rem;
	}

	.stats-row {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.stats-row.mt-half {
		margin-top: 0.5rem;
	}

	.stats-item {
		display: flex;
		flex-direction: column;
		min-width: 80px;
	}

	.stats-item .label {
		font-size: 0.65rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.stats-item .value {
		font-size: 1rem;
		font-weight: 600;
	}

	.stats-item .value.positive {
		color: var(--color-chart-up);
	}

	.stats-item .value.negative {
		color: var(--color-chart-down);
	}

	.price-high {
		color: var(--color-chart-up);
	}

	.price-low {
		color: var(--color-chart-down);
	}

	.stats-note {
		font-size: 0.7rem;
		color: var(--color-text-muted);
		margin: 0.5rem 0 0 0;
	}

	/* 52-Week Range Bar */
	.range-bar {
		margin-top: 0.75rem;
	}

	.range-track {
		height: 6px;
		background: var(--color-border);
		border-radius: 3px;
		overflow: hidden;
	}

	.range-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-chart-down) 0%, var(--color-chart-up) 100%);
		border-radius: 3px;
	}

	.range-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.65rem;
		color: var(--color-text-muted);
		margin-top: 0.25rem;
	}

	@media (max-width: 640px) {
		.stock-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.stock-title h1 {
			font-size: 2rem;
		}

		.price {
			font-size: 2rem;
		}

		.quote-main {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
