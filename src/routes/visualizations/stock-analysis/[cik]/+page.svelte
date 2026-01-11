<script lang="ts">
	import { browser } from '$app/environment';
	import type { PageData } from './$types';

	let { data } = $props();

	// D3 module loaded dynamically
	let d3: typeof import('d3') | null = $state(null);
	let loading = $state(true);

	// Chart container refs using $state for proper reactivity
	let priceChartEl: HTMLDivElement | null = $state(null);
	let volumeChartEl: HTMLDivElement | null = $state(null);

	// Reactive tooltip state
	let tooltipVisible = $state(false);
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let tooltipData = $state<{
		date: string;
		close: number;
		high: number;
		low: number;
		volume: number;
		sources: string[];
	} | null>(null);

	interface DailyData {
		date: string;
		open: number;
		high: number;
		low: number;
		close: number;
		volume: number;
		dollarVolume: number;
		sources: string[];
	}

	// Load D3 dynamically on browser using $effect
	$effect(() => {
		if (browser && !d3) {
			console.log('[D3] Loading d3 module...');
			import('d3').then(module => {
				console.log('[D3] D3 loaded successfully');
				d3 = module;
				loading = false;
			}).catch(e => {
				console.error('[D3] Failed to load d3:', e);
				loading = false;
			});
		}
	});

	// Render price chart when dependencies are ready
	$effect(() => {
		console.log('[Chart] Price chart effect running:', {
			browser,
			d3: !!d3,
			priceChartEl: !!priceChartEl,
			hasData: !!(data.stockData?.dailyData?.length)
		});
		if (browser && d3 && priceChartEl && data.stockData?.dailyData && data.stockData.dailyData.length > 0) {
			console.log('[Chart] Rendering price chart with', data.stockData.dailyData.length, 'data points');
			renderPriceChart(data.stockData.dailyData);
		}
	});

	// Render volume chart when dependencies are ready
	$effect(() => {
		console.log('[Chart] Volume chart effect running:', {
			browser,
			d3: !!d3,
			volumeChartEl: !!volumeChartEl,
			hasData: !!(data.stockData?.dailyData?.length)
		});
		if (browser && d3 && volumeChartEl && data.stockData?.dailyData && data.stockData.dailyData.length > 0) {
			console.log('[Chart] Rendering volume chart with', data.stockData.dailyData.length, 'data points');
			renderVolumeChart(data.stockData.dailyData);
		}
	});

	// Parse dates that can be either YYYY-MM-DD or ISO datetime format
	function parseFlexibleDate(dateStr: string): Date {
		// Try ISO format first (e.g., 2026-01-09T14:30:00.000Z)
		if (dateStr.includes('T')) {
			return new Date(dateStr);
		}
		// Otherwise parse YYYY-MM-DD
		const parts = dateStr.split('-');
		return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
	}

	function renderPriceChart(dailyData: DailyData[]) {
		if (!d3 || !priceChartEl) return;

		const margin = { top: 20, right: 30, bottom: 50, left: 60 };
		const width = priceChartEl.clientWidth - margin.left - margin.right;
		const height = 300 - margin.top - margin.bottom;

		// Clear any existing chart
		d3.select(priceChartEl).selectAll('*').remove();

		const svg = d3
			.select(priceChartEl)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Parse dates - handle both YYYY-MM-DD and ISO datetime formats
		const chartData = dailyData.map((d) => ({
			...d,
			dateObj: parseFlexibleDate(d.date)
		}));

		// Scales
		const x = d3
			.scaleTime()
			.domain(d3.extent(chartData, (d) => d.dateObj) as [Date, Date])
			.range([0, width]);

		const y = d3
			.scaleLinear()
			.domain([0, d3.max(chartData, (d) => d.high) ?? 0])
			.nice()
			.range([height, 0]);

		// Grid lines
		svg
			.append('g')
			.attr('class', 'grid')
			.attr('transform', `translate(0,${height})`)
			.call(
				d3
					.axisBottom(x)
					.tickSize(-height)
					.tickFormat(() => '')
			)
			.selectAll('line')
			.style('stroke', 'var(--color-chart-grid)')
			.style('stroke-opacity', 0.5);

		svg
			.append('g')
			.attr('class', 'grid')
			.call(
				d3
					.axisLeft(y)
					.tickSize(-width)
					.tickFormat(() => '')
			)
			.selectAll('line')
			.style('stroke', 'var(--color-chart-grid)')
			.style('stroke-opacity', 0.5);

		// Line for closing prices
		const line = d3
			.line<(typeof chartData)[0]>()
			.x((d) => x(d.dateObj))
			.y((d) => y(d.close));

		svg
			.append('path')
			.datum(chartData)
			.attr('fill', 'none')
			.attr('stroke', 'var(--color-accent-blue)')
			.attr('stroke-width', 1.5)
			.attr('d', line);

		// Area under the line
		const area = d3
			.area<(typeof chartData)[0]>()
			.x((d) => x(d.dateObj))
			.y0(height)
			.y1((d) => y(d.close));

		svg
			.append('path')
			.datum(chartData)
			.attr('fill', 'var(--color-accent-blue)')
			.attr('fill-opacity', 0.1)
			.attr('d', area);

		// Axes
		svg
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x).ticks(6))
			.selectAll('text')
			.style('font-family', 'var(--font-mono)')
			.style('font-size', '10px');

		svg
			.append('g')
			.call(d3.axisLeft(y).ticks(5).tickFormat((d) => `$${d}`))
			.selectAll('text')
			.style('font-family', 'var(--font-mono)')
			.style('font-size', '10px');

		// Y-axis label
		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 0 - margin.left)
			.attr('x', 0 - height / 2)
			.attr('dy', '1em')
			.style('text-anchor', 'middle')
			.style('font-size', '11px')
			.style('fill', 'var(--color-text-muted)')
			.text('Price ($)');

		// Interactive overlay
		const bisect = d3.bisector<(typeof chartData)[0], Date>((d) => d.dateObj).left;

		const focus = svg.append('g').style('display', 'none');

		focus.append('circle').attr('r', 4).attr('fill', 'var(--color-accent-blue)');

		focus
			.append('line')
			.attr('class', 'x-line')
			.attr('stroke', 'var(--color-border-dark)')
			.attr('stroke-dasharray', '3,3')
			.attr('opacity', 0.5);

		svg
			.append('rect')
			.attr('width', width)
			.attr('height', height)
			.style('fill', 'none')
			.style('pointer-events', 'all')
			.on('mouseover', () => {
				focus.style('display', null);
				tooltipVisible = true;
			})
			.on('mouseout', () => {
				focus.style('display', 'none');
				tooltipVisible = false;
			})
			.on('mousemove', (event) => {
				if (!d3) return;
				const [mouseX] = d3.pointer(event);
				const x0 = x.invert(mouseX);
				const i = bisect(chartData, x0, 1);
				const d0 = chartData[i - 1];
				const d1 = chartData[i];
				if (!d0 || !d1) return;
				const d = x0.getTime() - d0.dateObj.getTime() > d1.dateObj.getTime() - x0.getTime() ? d1 : d0;

				focus.attr('transform', `translate(${x(d.dateObj)},${y(d.close)})`);
				focus.select('.x-line').attr('y2', height - y(d.close));

				// Update tooltip state (safe - no innerHTML)
				tooltipData = {
					date: d.date,
					close: d.close,
					high: d.high,
					low: d.low,
					volume: d.volume,
					sources: d.sources
				};
				tooltipX = event.pageX + 15;
				tooltipY = event.pageY - 10;
			});
	}

	function renderVolumeChart(dailyData: DailyData[]) {
		if (!d3 || !volumeChartEl) return;

		const margin = { top: 20, right: 30, bottom: 50, left: 60 };
		const width = volumeChartEl.clientWidth - margin.left - margin.right;
		const height = 200 - margin.top - margin.bottom;

		// Clear any existing chart
		d3.select(volumeChartEl).selectAll('*').remove();

		const svg = d3
			.select(volumeChartEl)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Parse dates - handle both YYYY-MM-DD and ISO datetime formats
		const chartData = dailyData.map((d) => ({
			...d,
			dateObj: parseFlexibleDate(d.date)
		}));

		// Scales
		const x = d3
			.scaleTime()
			.domain(d3.extent(chartData, (d) => d.dateObj) as [Date, Date])
			.range([0, width]);

		const y = d3
			.scaleLinear()
			.domain([0, d3.max(chartData, (d) => d.volume) ?? 0])
			.nice()
			.range([height, 0]);

		// Calculate bar width
		const barWidth = Math.max(1, width / chartData.length - 1);

		// Bars
		svg
			.selectAll('.bar')
			.data(chartData)
			.enter()
			.append('rect')
			.attr('class', 'bar')
			.attr('x', (d) => x(d.dateObj) - barWidth / 2)
			.attr('y', (d) => y(d.volume))
			.attr('width', barWidth)
			.attr('height', (d) => height - y(d.volume))
			.attr('fill', 'var(--color-chart-volume)')
			.attr('opacity', 0.7);

		// Axes
		svg
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x).ticks(6))
			.selectAll('text')
			.style('font-family', 'var(--font-mono)')
			.style('font-size', '10px');

		svg
			.append('g')
			.call(
				d3
					.axisLeft(y)
					.ticks(5)
					.tickFormat((d) => d3!.format('.2s')(d as number))
			)
			.selectAll('text')
			.style('font-family', 'var(--font-mono)')
			.style('font-size', '10px');

		// Y-axis label
		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 0 - margin.left)
			.attr('x', 0 - height / 2)
			.attr('dy', '1em')
			.style('text-anchor', 'middle')
			.style('font-size', '11px')
			.style('fill', 'var(--color-text-muted)')
			.text('Volume');
	}

	function formatNumber(n: number): string {
		if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
		if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
		return n.toLocaleString();
	}

	// Get SEC filing type badge class based on form type
	function getFilingBadgeClass(form: string): string {
		const formUpper = form.toUpperCase().replace(/\s+/g, '');

		// Annual reports (10-K, 10-KSB)
		if (formUpper.includes('10K') || formUpper.includes('10-K')) {
			return 'badge-sec-annual';
		}

		// Quarterly reports (10-Q, 10-QSB)
		if (formUpper.includes('10Q') || formUpper.includes('10-Q')) {
			return 'badge-sec-quarterly';
		}

		// Late filing notifications
		if (formUpper.startsWith('NT') || formUpper.includes('NTN')) {
			return 'badge-sec-late';
		}

		// Current reports (8-K)
		if (formUpper.includes('8-K') || formUpper.includes('8K')) {
			return 'badge-sec-current';
		}

		// Insider transactions (Form 3, 4, 5)
		if (formUpper === '3' || formUpper === '4' || formUpper === '5') {
			return 'badge-sec-insider';
		}

		// Proxy statements
		if (formUpper.includes('14A') || formUpper.includes('14C')) {
			return 'badge-sec-proxy';
		}

		// Registration statements (S-1, S-3, S-8, SB-2)
		if (formUpper.startsWith('S-') || formUpper.startsWith('S1') || formUpper.startsWith('SB')) {
			return 'badge-sec-registration';
		}

		// Beneficial ownership (SC 13D, SC 13G)
		if (formUpper.includes('13D') || formUpper.includes('13G')) {
			return 'badge-sec-13d';
		}

		// Deregistration (15-12G, 15)
		if (formUpper.startsWith('15')) {
			return 'badge-sec-late';
		}

		// Default for other types
		return 'badge-sec-other';
	}
</script>

<svelte:head>
	<title>{data.stockData?.ticker ?? data.cik} | Stock Analysis</title>
</svelte:head>

<!-- Safe tooltip using Svelte template -->
{#if tooltipVisible && tooltipData}
	<div class="tooltip" style="left: {tooltipX}px; top: {tooltipY}px;">
		<div><span class="tooltip-label">Date:</span><span class="tooltip-value">{tooltipData.date}</span></div>
		<div><span class="tooltip-label">Close:</span><span class="tooltip-value">${tooltipData.close.toFixed(4)}</span></div>
		<div><span class="tooltip-label">High:</span><span class="tooltip-value">${tooltipData.high.toFixed(4)}</span></div>
		<div><span class="tooltip-label">Low:</span><span class="tooltip-value">${tooltipData.low.toFixed(4)}</span></div>
		<div><span class="tooltip-label">Volume:</span><span class="tooltip-value">{tooltipData.volume.toLocaleString()}</span></div>
		<div><span class="tooltip-label">Source:</span><span class="tooltip-value">{tooltipData.sources.join(', ')}</span></div>
	</div>
{/if}

<a href="/visualizations/stock-analysis" class="back-link">
	<i class="fat fa-arrow-left"></i> Back to Stock Analysis
</a>

{#if data.stockData}
	<h1>{data.stockData.ticker} - {data.stockData.company}</h1>

	<div class="flex-row" style="margin-bottom: 1rem;">
		<span class="badge badge-blue">{data.stockData.cik}</span>
		<span class="badge badge-green">{data.stockData.exchange}</span>
		<span class="text-muted" style="font-size: 0.75rem;">
			{data.stockData.period.start} to {data.stockData.period.end}
		</span>
	</div>

	<section>
		<h2><i class="fat fa-chart-pie"></i> Key Metrics</h2>

		<div class="stats-grid">
			<div class="section-box stats-card">
				<div class="stat-number" style="color: var(--color-accent-green);">
					${data.stockData.metrics.peakPrice.toFixed(4)}
				</div>
				<div class="stat-label">Peak Price</div>
				<div class="text-muted" style="font-size: 0.65rem; margin-top: 0.25rem;">
					{data.stockData.metrics.peakDate}
				</div>
			</div>

			<div class="section-box stats-card">
				<div class="stat-number" style="color: var(--color-accent-red);">
					${data.stockData.metrics.lowPrice.toFixed(4)}
				</div>
				<div class="stat-label">Low Price</div>
				<div class="text-muted" style="font-size: 0.65rem; margin-top: 0.25rem;">
					{data.stockData.metrics.lowDate}
				</div>
			</div>

			<div class="section-box stats-card">
				<div class="stat-number">{data.stockData.metrics.tradingDays}</div>
				<div class="stat-label">Trading Days</div>
			</div>

			<div class="section-box stats-card">
				<div class="stat-number">{formatNumber(data.stockData.metrics.totalVolume)}</div>
				<div class="stat-label">Total Volume</div>
			</div>

			<div class="section-box stats-card">
				<div class="stat-number">${formatNumber(data.stockData.metrics.totalDollarVolume)}</div>
				<div class="stat-label">Dollar Volume</div>
			</div>

			<div class="section-box stats-card">
				<div
					class="stat-number"
					style="color: {data.stockData.metrics.priceChangePercent >= 0
						? 'var(--color-accent-green)'
						: 'var(--color-accent-red)'};"
				>
					{data.stockData.metrics.priceChangePercent >= 0 ? '+' : ''}{data.stockData.metrics.priceChangePercent.toFixed(
						1
					)}%
				</div>
				<div class="stat-label">Price Change</div>
			</div>
		</div>
	</section>

	<section class="mt-3">
		<h2><i class="fat fa-chart-line"></i> Price Chart</h2>
		{#if loading}
			<div class="chart-container">
				<div class="chart-loading">Loading chart...</div>
			</div>
		{:else}
			<div class="chart-container">
				<div class="chart-title">
					<i class="fat fa-chart-line"></i> Daily Closing Prices
				</div>
				<div class="chart-subtitle">
					Hover over the chart to see detailed data. Data sources: {data.stockData.sources.join(', ')}
				</div>
				<div bind:this={priceChartEl} class="chart-area"></div>
			</div>
		{/if}
	</section>

	<section class="mt-3">
		<h2><i class="fat fa-chart-bar"></i> Volume Chart</h2>
		{#if loading}
			<div class="chart-container">
				<div class="chart-loading">Loading chart...</div>
			</div>
		{:else}
			<div class="chart-container">
				<div class="chart-title">
					<i class="fat fa-chart-bar"></i> Daily Trading Volume
				</div>
				<div class="chart-subtitle">
					Highest volume: {formatNumber(data.stockData.metrics.highestVolumeAmount)} shares on {data
						.stockData.metrics.highestVolumeDay}
				</div>
				<div bind:this={volumeChartEl} class="chart-area chart-area-volume"></div>
			</div>
		{/if}
	</section>

	<section class="mt-3">
		<h2><i class="fat fa-table"></i> Trading Statistics</h2>
		<div class="section-box">
			<table>
				<tbody>
					<tr>
						<td class="text-muted">Average Price</td>
						<td class="text-right"><strong>${data.stockData.metrics.avgPrice.toFixed(4)}</strong></td>
					</tr>
					<tr>
						<td class="text-muted">Highest Volume Day</td>
						<td class="text-right">
							<strong>{data.stockData.metrics.highestVolumeDay}</strong>
							({formatNumber(data.stockData.metrics.highestVolumeAmount)} shares)
						</td>
					</tr>
					<tr>
						<td class="text-muted">Highest Dollar Volume Day</td>
						<td class="text-right">
							<strong>{data.stockData.metrics.highestDollarVolumeDay}</strong>
							(${formatNumber(data.stockData.metrics.highestDollarVolumeAmount)})
						</td>
					</tr>
					<tr>
						<td class="text-muted">First Trade Date</td>
						<td class="text-right"><strong>{data.stockData.metrics.firstTradeDate}</strong></td>
					</tr>
					<tr>
						<td class="text-muted">Last Trade Date</td>
						<td class="text-right"><strong>{data.stockData.metrics.lastTradeDate}</strong></td>
					</tr>
					<tr>
						<td class="text-muted">Data Sources</td>
						<td class="text-right">
							{#each data.stockData.sources as source}
								<span class="badge badge-blue" style="margin-left: 0.25rem;">{source}</span>
							{/each}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	{#if data.filings && data.filings.length > 0}
		<section class="mt-3">
			<h2><i class="fat fa-file-lines"></i> SEC Filings ({data.filings.length})</h2>
			<div class="section-box" style="max-height: 400px; overflow-y: auto;">
				<table>
					<thead>
						<tr>
							<th>Date</th>
							<th>Form</th>
							<th>Accession Number</th>
						</tr>
					</thead>
					<tbody>
						{#each data.filings.slice(0, 50) as filing}
							<tr>
								<td>{filing.filingDate}</td>
								<td><span class="badge {getFilingBadgeClass(filing.form)}">{filing.form}</span></td>
								<td>
									<a href={filing.documentUrl} target="_blank" rel="noopener noreferrer">
										{filing.accessionNumber}
										<i class="fat fa-external-link" style="font-size: 0.7em; margin-left: 0.25rem;"
										></i>
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				{#if data.filings.length > 50}
					<div class="text-muted text-center" style="padding: 1rem;">
						Showing 50 of {data.filings.length} filings
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<section class="mt-3">
		<h2><i class="fat fa-download"></i> Download Data</h2>
		<div class="flex-row">
			<a
				href="/csv/{data.stockData.cik}-{data.stockData.ticker}-{data.stockData.period.start.split(
					'-'
				)[0]}-{data.stockData.period.end.split('-')[0]}.csv"
				class="button"
				download
			>
				<i class="fat fa-file-csv"></i> Download CSV
			</a>
			<a
				href="/json/entities/{data.stockData.cik}-{data.stockData.ticker}-{data.stockData.period.start.split(
					'-'
				)[0]}-{data.stockData.period.end.split('-')[0]}.json"
				class="button"
				download
			>
				<i class="fat fa-file-code"></i> Download JSON
			</a>
		</div>
	</section>
{:else}
	<h1>{data.cik}</h1>

	<div class="callout mt-3">
		<p>
			<i class="fat fa-triangle-exclamation"></i>
			No stock data available for this entity. This could mean:
		</p>
		<ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
			<li>The entity has no public trading history</li>
			<li>The data pipeline hasn't been run yet</li>
			<li>The CIK is for an individual filer, not a company</li>
		</ul>
	</div>

	{#if data.filings && data.filings.length > 0}
		<section class="mt-3">
			<h2><i class="fat fa-file-lines"></i> SEC Filings ({data.filings.length})</h2>
			<div class="section-box" style="max-height: 400px; overflow-y: auto;">
				<table>
					<thead>
						<tr>
							<th>Date</th>
							<th>Form</th>
							<th>Accession Number</th>
						</tr>
					</thead>
					<tbody>
						{#each data.filings.slice(0, 50) as filing}
							<tr>
								<td>{filing.filingDate}</td>
								<td><span class="badge {getFilingBadgeClass(filing.form)}">{filing.form}</span></td>
								<td>
									<a href={filing.documentUrl} target="_blank" rel="noopener noreferrer">
										{filing.accessionNumber}
										<i class="fat fa-external-link" style="font-size: 0.7em; margin-left: 0.25rem;"
										></i>
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}
{/if}

<style>
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 0.75rem;
	}

	@media (max-width: 1024px) {
		.stats-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (max-width: 640px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.chart-area {
		width: 100%;
		min-height: 340px;
	}

	.chart-area-volume {
		min-height: 240px;
	}

	.chart-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 300px;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
	}
</style>
