<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		/** Total number of entities tracked */
		entitiesCount?: number;
		/** Total trading days of data */
		tradingDays?: number;
		/** Earliest year in dataset */
		earliestYear?: string;
		/** Latest year in dataset */
		latestYear?: string;
		/** Width of the component */
		width?: number;
	}

	let {
		entitiesCount = 0,
		tradingDays = 0,
		earliestYear = 'N/A',
		latestYear = 'N/A',
		width = 800
	}: Props = $props();

	// Treemap color palette (consistent across site)
	const activityColors = [
		'var(--color-border)', // Level 0 - empty/minimal
		'#fff3cd', // Level 1 - yellow (Warning)
		'#d4edda', // Level 2 - green (Success)
		'#cce5ff', // Level 3 - blue (Information)
		'#e8d5f0'  // Level 4 - purple (Special/highest)
	];

	// Generate activity data based on the trading days count
	// Creates a year of weekly data (52 weeks x 7 days)
	function generateActivityData(): number[][] {
		const weeks = 52;
		const daysPerWeek = 7;
		const data: number[][] = [];

		// Seed random based on tradingDays for consistency
		let seed = tradingDays || 1234;
		const seededRandom = () => {
			seed = (seed * 9301 + 49297) % 233280;
			return seed / 233280;
		};

		// Calculate average activity level based on trading days
		const avgLevel = Math.min(4, Math.floor((tradingDays / 1000) * 0.8));

		for (let week = 0; week < weeks; week++) {
			const weekData: number[] = [];
			for (let day = 0; day < daysPerWeek; day++) {
				// Weekend days (0 = Sunday, 6 = Saturday) have lower activity
				const isWeekend = day === 0 || day === 6;
				const baseLevel = isWeekend ? 0 : avgLevel;

				// Add some randomness
				const variance = seededRandom() * 2 - 1;
				const level = Math.max(0, Math.min(4, Math.round(baseLevel + variance)));

				weekData.push(level);
			}
			data.push(weekData);
		}

		return data;
	}

	const activityData = $derived(generateActivityData());

	// Month labels for the graph
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	// Calculate cell size based on width
	const cellSize = $derived(Math.max(8, Math.floor((width - 60) / 53)));
	const cellGap = 2;

	function getColor(level: number): string {
		return activityColors[Math.min(level, activityColors.length - 1)];
	}

	function formatNumber(value: number): string {
		if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
		if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
		return value.toLocaleString();
	}
</script>

<div class="activity-container">
	<!-- Stats summary -->
	<div class="activity-stats">
		<div class="stat-item">
			<span class="stat-value">{entitiesCount}</span>
			<span class="stat-label">Entities</span>
		</div>
		<div class="stat-item">
			<span class="stat-value">{formatNumber(tradingDays)}</span>
			<span class="stat-label">Trading Days</span>
		</div>
		<div class="stat-item">
			<span class="stat-value">{earliestYear}</span>
			<span class="stat-label">From</span>
		</div>
		<div class="stat-item">
			<span class="stat-value">{latestYear}</span>
			<span class="stat-label">To</span>
		</div>
	</div>

	<!-- Activity graph -->
	<div class="activity-graph">
		<!-- Month labels -->
		<div class="month-labels" style="margin-left: {cellSize + 8}px;">
			{#each months as month, i}
				<span style="width: {(52 / 12) * (cellSize + cellGap)}px;">{month}</span>
			{/each}
		</div>

		<div class="graph-body">
			<!-- Day labels -->
			<div class="day-labels" style="width: {cellSize}px;">
				<span style="height: {cellSize}px;"></span>
				<span style="height: {cellSize}px;">Mon</span>
				<span style="height: {cellSize}px;"></span>
				<span style="height: {cellSize}px;">Wed</span>
				<span style="height: {cellSize}px;"></span>
				<span style="height: {cellSize}px;">Fri</span>
				<span style="height: {cellSize}px;"></span>
			</div>

			<!-- Grid of cells -->
			<div class="cells-container">
				{#each activityData as week, weekIndex}
					<div class="week-column" style="gap: {cellGap}px;">
						{#each week as level, dayIndex}
							<div
								class="activity-cell"
								style="
									width: {cellSize}px;
									height: {cellSize}px;
									background: {getColor(level)};
								"
								title="Week {weekIndex + 1}, Day {dayIndex + 1}: Level {level}"
							></div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Legend -->
	<div class="activity-legend">
		<span class="legend-label">Less</span>
		{#each activityColors as color}
			<div
				class="legend-cell"
				style="background: {color}; width: {cellSize}px; height: {cellSize}px;"
			></div>
		{/each}
		<span class="legend-label">More</span>
	</div>
</div>

<style>
	.activity-container {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 5px;
		padding: 1rem;
	}

	.activity-stats {
		display: flex;
		gap: 2rem;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--color-border);
	}

	.stat-item {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.stat-label {
		font-size: 0.625rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
	}

	.activity-graph {
		overflow-x: auto;
	}

	.month-labels {
		display: flex;
		margin-bottom: 4px;
	}

	.month-labels span {
		font-size: 0.625rem;
		color: var(--color-text-muted);
	}

	.graph-body {
		display: flex;
		gap: 4px;
	}

	.day-labels {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.day-labels span {
		font-size: 0.5625rem;
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
	}

	.cells-container {
		display: flex;
		gap: 2px;
	}

	.week-column {
		display: flex;
		flex-direction: column;
	}

	.activity-cell {
		border-radius: 2px;
		cursor: default;
	}

	.activity-legend {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 4px;
		margin-top: 0.75rem;
	}

	.legend-label {
		font-size: 0.625rem;
		color: var(--color-text-muted);
	}

	.legend-cell {
		border-radius: 2px;
	}

	@media (max-width: 768px) {
		.activity-stats {
			flex-wrap: wrap;
			gap: 1rem;
		}

		.stat-item {
			min-width: 60px;
		}
	}
</style>
