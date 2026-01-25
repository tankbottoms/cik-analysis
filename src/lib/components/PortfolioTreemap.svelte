<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	interface TreemapItem {
		symbol: string;
		name?: string;
		value: number;
		gainLossPercent: number;
		sector?: string;
	}

	interface Props {
		items: TreemapItem[];
		width?: number;
		height?: number;
		onItemClick?: (item: TreemapItem) => void;
	}

	let { items, width = 600, height = 400, onItemClick }: Props = $props();

	let container: HTMLDivElement | null = $state(null);
	let tooltipData = $state<TreemapItem | null>(null);
	let tooltipPosition = $state({ x: 0, y: 0 });

	// UX spec treemap color palette (matches Sample Portfolio)
	const treemapColors = [
		'#d4edda', // green-1 (Success)
		'#cce5ff', // blue-1 (Information)
		'#e8d5f0', // purple-1 (Special)
		'#fff3cd' // yellow-1 (Warning)
	];

	// Get color by index (cycles through palette)
	function getColor(index: number): string {
		return treemapColors[index % treemapColors.length];
	}

	function renderTreemap() {
		if (!container || items.length === 0) return;

		// Clear previous content
		d3.select(container).selectAll('*').remove();

		// Prepare data for D3 hierarchy
		const hierarchyData = {
			name: 'Portfolio',
			children: items.map((item) => ({
				...item,
				value: Math.max(item.value, 1) // Ensure positive value
			}))
		};

		// Create hierarchy
		const root = d3
			.hierarchy(hierarchyData)
			.sum((d: any) => d.value)
			.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

		// Create treemap layout
		const treemap = d3
			.treemap<typeof hierarchyData>()
			.size([width, height])
			.paddingOuter(0)
			.paddingInner(4)
			.round(true);

		treemap(root);

		// Create SVG
		const svg = d3
			.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', `0 0 ${width} ${height}`)
			.style('font-family', 'var(--font-mono)');

		// Create cells
		const cells = svg
			.selectAll('g')
			.data(root.leaves())
			.join('g')
			.attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

		// Add rectangles
		cells
			.append('rect')
			.attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
			.attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
			.attr('fill', (_d: any, i: number) => getColor(i))
			.attr('stroke', 'var(--color-border)')
			.attr('stroke-width', 1)
			.attr('rx', 0)
			.style('cursor', 'pointer')
			.on('click', (_event: MouseEvent, d: any) => {
				onItemClick?.(d.data as TreemapItem);
			})
			.on('mouseenter', (event: MouseEvent, d: any) => {
				tooltipData = d.data as TreemapItem;
				const rect = container.getBoundingClientRect();
				tooltipPosition = {
					x: event.clientX - rect.left + 10,
					y: event.clientY - rect.top + 10
				};
			})
			.on('mousemove', (event: MouseEvent) => {
				const rect = container.getBoundingClientRect();
				tooltipPosition = {
					x: event.clientX - rect.left + 10,
					y: event.clientY - rect.top + 10
				};
			})
			.on('mouseleave', () => {
				tooltipData = null;
			});

		// Add labels (dark text on light backgrounds)
		cells
			.append('text')
			.attr('x', 8)
			.attr('y', 18)
			.attr('fill', '#000000')
			.attr('font-size', '13px')
			.attr('font-weight', '600')
			.style('pointer-events', 'none')
			.text((d: any) => {
				const cellWidth = d.x1 - d.x0;
				if (cellWidth < 40) return '';
				return d.data.symbol;
			});

		// Add value labels for larger cells
		cells
			.append('text')
			.attr('x', 8)
			.attr('y', 33)
			.attr('fill', '#000000')
			.attr('font-size', '11px')
			.style('pointer-events', 'none')
			.text((d: any) => {
				const cellWidth = d.x1 - d.x0;
				const cellHeight = d.y1 - d.y0;
				if (cellWidth < 60 || cellHeight < 45) return '';
				return formatCurrency(d.data.value);
			});

		// Add percentage labels for larger cells
		cells
			.append('text')
			.attr('x', 8)
			.attr('y', 48)
			.attr('font-size', '11px')
			.attr('font-weight', '600')
			.style('pointer-events', 'none')
			.attr('fill', (d: any) => d.data.gainLossPercent >= 0 ? '#2e7d32' : '#c62828')
			.text((d: any) => {
				const cellWidth = d.x1 - d.x0;
				const cellHeight = d.y1 - d.y0;
				if (cellWidth < 60 || cellHeight < 60) return '';
				const sign = d.data.gainLossPercent >= 0 ? '+' : '';
				return `${sign}${d.data.gainLossPercent.toFixed(1)}%`;
			});
	}

	function formatCurrency(value: number): string {
		if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
		if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
		return `$${value.toFixed(0)}`;
	}

	function formatPercent(value: number): string {
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(2)}%`;
	}

	onMount(() => {
		renderTreemap();
	});

	// Re-render when items, width, or height change
	$effect(() => {
		// Access all dependencies to trigger re-render
		const _items = items;
		const _width = width;
		const _height = height;
		if (_items && container && _width > 0) {
			renderTreemap();
		}
	});
</script>

<div class="treemap-container">
	{#if items.length === 0}
		<div class="empty-state">
			<i class="fat fa-chart-tree-map"></i>
			<p>No holdings to visualize</p>
			<p class="text-muted">Add stocks to your portfolio to see the treemap</p>
		</div>
	{:else}
		<div bind:this={container} class="treemap-svg" style="width: 100%; height: {height}px;">
			<!-- D3 will render here -->
		</div>

		{#if tooltipData}
			<div
				class="treemap-tooltip"
				style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;"
			>
				<div class="tooltip-header">
					<strong>{tooltipData.symbol}</strong>
					{#if tooltipData.name}
						<span class="tooltip-name">{tooltipData.name}</span>
					{/if}
				</div>
				<div class="tooltip-row">
					<span class="tooltip-label">Value:</span>
					<span class="tooltip-value">{formatCurrency(tooltipData.value)}</span>
				</div>
				<div class="tooltip-row">
					<span class="tooltip-label">Change:</span>
					<span
						class="tooltip-value"
						class:positive={tooltipData.gainLossPercent >= 0}
						class:negative={tooltipData.gainLossPercent < 0}
					>
						{formatPercent(tooltipData.gainLossPercent)}
					</span>
				</div>
				{#if tooltipData.sector}
					<div class="tooltip-row">
						<span class="tooltip-label">Sector:</span>
						<span class="tooltip-value">{tooltipData.sector}</span>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
	.treemap-container {
		position: relative;
	}

	.treemap-svg {
		background: var(--color-bg);
		overflow: hidden;
	}

	.treemap-tooltip {
		position: absolute;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-dark);
		border-radius: 3px;
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		pointer-events: none;
		z-index: 100;
		box-shadow: 2px 2px 0px var(--color-shadow);
		min-width: 120px;
	}

	.tooltip-header {
		margin-bottom: 0.5rem;
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.375rem;
	}

	.tooltip-header strong {
		font-size: 0.875rem;
	}

	.tooltip-name {
		display: block;
		font-size: 0.6875rem;
		color: var(--color-text-muted);
		margin-top: 0.125rem;
	}

	.tooltip-row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin: 0.25rem 0;
	}

	.tooltip-label {
		color: var(--color-text-muted);
	}

	.tooltip-value {
		font-weight: 500;
	}

	.tooltip-value.positive {
		color: var(--color-chart-up);
	}

	.tooltip-value.negative {
		color: var(--color-chart-down);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 300px;
		color: var(--color-text-muted);
		text-align: center;
		padding: 2rem;
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
