<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	interface HoldingData {
		symbol: string;
		shares: number;
		avgCost: number;
		currentPrice: number;
	}

	interface Props {
		holdings: HoldingData[];
		width?: number;
		height?: number;
		totalValue: number;
		totalCost: number;
		gainLoss: number;
		gainLossPercent: number;
	}

	let {
		holdings,
		width = 800,
		height = 140,
		totalValue,
		totalCost,
		gainLoss,
		gainLossPercent
	}: Props = $props();

	let container: HTMLDivElement | null = $state(null);
	let tooltipData = $state<{ date: Date; values: { symbol: string; value: number }[]; total: number } | null>(null);
	let tooltipPosition = $state({ x: 0, y: 0 });

	// Generate simulated historical data for the streamgraph
	function generateHistoricalData() {
		const days = 365; // 1 year of data
		const data: { date: Date; [key: string]: number | Date }[] = [];
		const today = new Date();

		// Get symbols from holdings
		const symbols = holdings.map((h) => h.symbol);
		if (symbols.length === 0) return [];

		// Generate base values for each holding (start from cost basis)
		const baseValues: Record<string, number> = {};
		holdings.forEach((h) => {
			baseValues[h.symbol] = h.shares * h.avgCost;
		});

		// Generate daily data with random walk
		for (let i = days; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);

			const dayData: { date: Date; [key: string]: number | Date } = { date };

			symbols.forEach((symbol) => {
				const holding = holdings.find((h) => h.symbol === symbol);
				if (!holding) return;

				// Calculate value at this point in time
				// Start from cost basis and move toward current value
				const progress = (days - i) / days;
				const startValue = holding.shares * holding.avgCost;
				const endValue = holding.shares * holding.currentPrice;

				// Add some volatility
				const volatility = startValue * 0.15 * Math.sin((i / 30) * Math.PI + symbol.charCodeAt(0));
				const trendValue = startValue + (endValue - startValue) * progress;
				const value = Math.max(trendValue + volatility * (1 - progress * 0.5), startValue * 0.5);

				dayData[symbol] = value;
			});

			data.push(dayData);
		}

		return data;
	}

	// Treemap color palette (consistent across site)
	const treemapColors = [
		'#d4edda', // green-1 (Success)
		'#cce5ff', // blue-1 (Information)
		'#e8d5f0', // purple-1 (Special)
		'#fff3cd'  // yellow-1 (Warning)
	];

	function getColor(symbol: string, index: number): string {
		return treemapColors[index % treemapColors.length];
	}

	function renderStreamgraph() {
		if (!container || holdings.length === 0) return;

		// Clear previous content
		d3.select(container).selectAll('*').remove();

		const data = generateHistoricalData();
		if (data.length === 0) return;

		const symbols = holdings.map((h) => h.symbol);
		const margin = { top: 10, right: 10, bottom: 25, left: 10 };
		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;

		// Create SVG
		const svg = d3
			.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', `0 0 ${width} ${height}`)
			.style('font-family', 'var(--font-mono)');

		const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

		// Stack the data
		const stack = d3
			.stack<{ date: Date; [key: string]: number | Date }>()
			.keys(symbols)
			.offset(d3.stackOffsetWiggle)
			.order(d3.stackOrderInsideOut);

		const stackedData = stack(data);

		// Scales
		const xScale = d3
			.scaleTime()
			.domain(d3.extent(data, (d) => d.date) as [Date, Date])
			.range([0, innerWidth]);

		const yMin = d3.min(stackedData, (layer) => d3.min(layer, (d) => d[0])) ?? 0;
		const yMax = d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])) ?? 0;

		const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerHeight, 0]);

		// Area generator
		const area = d3
			.area<d3.SeriesPoint<{ date: Date; [key: string]: number | Date }>>()
			.x((d) => xScale(d.data.date as Date))
			.y0((d) => yScale(d[0]))
			.y1((d) => yScale(d[1]))
			.curve(d3.curveBasis);

		// Draw streams
		g.selectAll('path')
			.data(stackedData)
			.join('path')
			.attr('d', area)
			.attr('fill', (d, i) => getColor(d.key, i))
			.attr('opacity', 0.85)
			.attr('stroke', 'var(--color-bg)')
			.attr('stroke-width', 0.5);

		// X-axis (minimal)
		const xAxis = d3
			.axisBottom(xScale)
			.ticks(6)
			.tickFormat((d) => d3.timeFormat('%b')(d as Date));

		g.append('g')
			.attr('transform', `translate(0,${innerHeight})`)
			.call(xAxis)
			.attr('color', 'var(--color-text-muted)')
			.attr('font-size', '9px')
			.selectAll('line, path')
			.attr('stroke', 'var(--color-border)');

		// Hover overlay
		const bisect = d3.bisector<{ date: Date; [key: string]: number | Date }, Date>((d) => d.date as Date).left;

		const hoverLine = g
			.append('line')
			.attr('stroke', 'var(--color-text-muted)')
			.attr('stroke-width', 1)
			.attr('stroke-dasharray', '3,3')
			.attr('y1', 0)
			.attr('y2', innerHeight)
			.style('opacity', 0);

		const overlay = g
			.append('rect')
			.attr('width', innerWidth)
			.attr('height', innerHeight)
			.attr('fill', 'transparent')
			.style('cursor', 'crosshair');

		overlay.on('mousemove', (event: MouseEvent) => {
			const [mx] = d3.pointer(event);
			const date = xScale.invert(mx);
			const index = bisect(data, date, 1);
			const d0 = data[index - 1];
			const d1 = data[index];

			if (!d0 || !d1) return;

			const d = date.getTime() - (d0.date as Date).getTime() > (d1.date as Date).getTime() - date.getTime() ? d1 : d0;

			// Update hover line
			hoverLine.attr('x1', xScale(d.date as Date)).attr('x2', xScale(d.date as Date)).style('opacity', 1);

			// Calculate values for tooltip
			const values = symbols.map((symbol) => ({
				symbol,
				value: d[symbol] as number
			}));
			const total = values.reduce((sum, v) => sum + v.value, 0);

			const rect = container.getBoundingClientRect();
			tooltipData = { date: d.date as Date, values, total };
			tooltipPosition = {
				x: event.clientX - rect.left + 15,
				y: event.clientY - rect.top - 10
			};
		});

		overlay.on('mouseleave', () => {
			hoverLine.style('opacity', 0);
			tooltipData = null;
		});
	}

	function formatCurrency(value: number): string {
		if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
		if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
		return `$${value.toFixed(0)}`;
	}

	function formatDate(date: Date): string {
		return d3.timeFormat('%b %d, %Y')(date);
	}

	onMount(() => {
		renderStreamgraph();
	});

	// Re-render when data changes
	$effect(() => {
		const _holdings = holdings;
		const _width = width;
		const _height = height;
		if (_holdings && container && _width > 0) {
			renderStreamgraph();
		}
	});
</script>

<div class="streamgraph-container">
	{#if holdings.length === 0}
		<div class="empty-state">
			<p>Add holdings to see portfolio performance</p>
		</div>
	{:else}
		<!-- Stats overlay -->
		<div class="stats-overlay">
			<div class="stat-primary">
				<span class="stat-value">{formatCurrency(totalValue)}</span>
				<span class="stat-label">Total Value</span>
			</div>
			<div class="stat-secondary">
				<span class="stat-value" class:positive={gainLoss >= 0} class:negative={gainLoss < 0}>
					{gainLoss >= 0 ? '+' : ''}{formatCurrency(Math.abs(gainLoss))}
				</span>
				<span class="stat-label">Gain/Loss</span>
			</div>
			<div class="stat-secondary">
				<span class="stat-value" class:positive={gainLossPercent >= 0} class:negative={gainLossPercent < 0}>
					{gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
				</span>
				<span class="stat-label">Return</span>
			</div>
		</div>

		<div bind:this={container} class="streamgraph-svg"></div>

		{#if tooltipData}
			<div
				class="streamgraph-tooltip"
				style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;"
			>
				<div class="tooltip-date">{formatDate(tooltipData.date)}</div>
				<div class="tooltip-total">
					<strong>Total:</strong> {formatCurrency(tooltipData.total)}
				</div>
				<div class="tooltip-breakdown">
					{#each tooltipData.values.sort((a, b) => b.value - a.value).slice(0, 5) as item}
						<div class="tooltip-item">
							<span class="tooltip-symbol">{item.symbol}</span>
							<span class="tooltip-value">{formatCurrency(item.value)}</span>
						</div>
					{/each}
					{#if tooltipData.values.length > 5}
						<div class="tooltip-more">+{tooltipData.values.length - 5} more</div>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.streamgraph-container {
		position: relative;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 5px;
		overflow: hidden;
	}

	.streamgraph-svg {
		display: block;
	}

	.stats-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: flex-start;
		gap: 2rem;
		padding: 0.75rem 1rem;
		pointer-events: none;
		z-index: 10;
	}

	.stat-primary {
		display: flex;
		flex-direction: column;
	}

	.stat-primary .stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.stat-primary .stat-label {
		font-size: 0.6875rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
	}

	.stat-secondary {
		display: flex;
		flex-direction: column;
	}

	.stat-secondary .stat-value {
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.2;
	}

	.stat-secondary .stat-label {
		font-size: 0.625rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
	}

	.positive {
		color: var(--color-chart-up);
	}

	.negative {
		color: var(--color-chart-down);
	}

	.streamgraph-tooltip {
		position: absolute;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-dark);
		border-radius: 3px;
		padding: 0.5rem 0.75rem;
		font-size: 0.6875rem;
		pointer-events: none;
		z-index: 100;
		box-shadow: 2px 2px 0px var(--color-shadow);
		min-width: 140px;
	}

	.tooltip-date {
		font-weight: 600;
		margin-bottom: 0.375rem;
		padding-bottom: 0.25rem;
		border-bottom: 1px solid var(--color-border);
	}

	.tooltip-total {
		margin-bottom: 0.375rem;
	}

	.tooltip-breakdown {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.tooltip-item {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.tooltip-symbol {
		color: var(--color-text-muted);
	}

	.tooltip-value {
		font-weight: 500;
	}

	.tooltip-more {
		color: var(--color-text-muted);
		font-style: italic;
		margin-top: 0.25rem;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 140px;
		color: var(--color-text-muted);
	}

	@media (max-width: 640px) {
		.stats-overlay {
			gap: 1rem;
			padding: 0.5rem 0.75rem;
		}

		.stat-primary .stat-value {
			font-size: 1.25rem;
		}

		.stat-secondary .stat-value {
			font-size: 0.875rem;
		}
	}
</style>
