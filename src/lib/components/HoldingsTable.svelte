<script lang="ts">
	import type { Holding } from '$lib/types/portfolio';

	interface HoldingWithPrice extends Holding {
		currentPrice?: number;
		companyName?: string;
	}

	interface Props {
		holdings: HoldingWithPrice[];
		onRemove?: (id: string) => void;
		onEdit?: (holding: HoldingWithPrice) => void;
		showActions?: boolean;
		compact?: boolean;
	}

	let { holdings, onRemove, onEdit, showActions = true, compact = false }: Props = $props();

	type SortField = 'symbol' | 'shares' | 'avgCost' | 'value' | 'gainLoss' | 'gainLossPercent';
	type SortDirection = 'asc' | 'desc';

	let sortField = $state<SortField>('symbol');
	let sortDirection = $state<SortDirection>('asc');

	const sortedHoldings = $derived(() => {
		return [...holdings].sort((a, b) => {
			let aVal: number | string;
			let bVal: number | string;

			switch (sortField) {
				case 'symbol':
					aVal = a.symbol;
					bVal = b.symbol;
					break;
				case 'shares':
					aVal = a.shares;
					bVal = b.shares;
					break;
				case 'avgCost':
					aVal = a.avgCost;
					bVal = b.avgCost;
					break;
				case 'value':
					aVal = a.shares * (a.currentPrice ?? a.avgCost);
					bVal = b.shares * (b.currentPrice ?? b.avgCost);
					break;
				case 'gainLoss':
					aVal = a.currentPrice ? (a.currentPrice - a.avgCost) * a.shares : 0;
					bVal = b.currentPrice ? (b.currentPrice - b.avgCost) * b.shares : 0;
					break;
				case 'gainLossPercent':
					aVal = a.currentPrice ? ((a.currentPrice - a.avgCost) / a.avgCost) * 100 : 0;
					bVal = b.currentPrice ? ((b.currentPrice - b.avgCost) / b.avgCost) * 100 : 0;
					break;
				default:
					return 0;
			}

			if (typeof aVal === 'string' && typeof bVal === 'string') {
				return sortDirection === 'asc'
					? aVal.localeCompare(bVal)
					: bVal.localeCompare(aVal);
			}

			return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
		});
	});

	const totals = $derived(() => {
		let totalCost = 0;
		let totalValue = 0;

		for (const h of holdings) {
			totalCost += h.shares * h.avgCost;
			totalValue += h.shares * (h.currentPrice ?? h.avgCost);
		}

		const totalGainLoss = totalValue - totalCost;
		const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

		return { totalCost, totalValue, totalGainLoss, totalGainLossPercent };
	});

	function handleSort(field: SortField) {
		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'asc';
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

	function formatShares(value: number): string {
		return value.toLocaleString('en-US', { maximumFractionDigits: 4 });
	}

	function getSortIcon(field: SortField): string {
		if (sortField !== field) return 'fa-sort';
		return sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
	}
</script>

{#if holdings.length === 0}
	<div class="empty-state">
		<i class="fat fa-folder-open"></i>
		<p>No holdings yet</p>
		<p class="text-muted">Search for stocks to add to your portfolio</p>
	</div>
{:else}
	<div class="holdings-table-wrapper" class:compact>
		<table class="holdings-table">
			<thead>
				<tr>
					<th class="sortable" onclick={() => handleSort('symbol')}>
						Symbol <i class="fat {getSortIcon('symbol')}"></i>
					</th>
					{#if !compact}
						<th>Company</th>
					{/if}
					<th class="sortable text-right" onclick={() => handleSort('shares')}>
						Shares <i class="fat {getSortIcon('shares')}"></i>
					</th>
					<th class="sortable text-right" onclick={() => handleSort('avgCost')}>
						Avg Cost <i class="fat {getSortIcon('avgCost')}"></i>
					</th>
					<th class="text-right">Current</th>
					<th class="sortable text-right" onclick={() => handleSort('value')}>
						Value <i class="fat {getSortIcon('value')}"></i>
					</th>
					<th class="sortable text-right" onclick={() => handleSort('gainLossPercent')}>
						Gain/Loss <i class="fat {getSortIcon('gainLossPercent')}"></i>
					</th>
					{#if showActions}
						<th class="actions-col"></th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each sortedHoldings() as holding}
					{@const currentPrice = holding.currentPrice ?? holding.avgCost}
					{@const value = holding.shares * currentPrice}
					{@const gainLoss = (currentPrice - holding.avgCost) * holding.shares}
					{@const gainLossPercent = ((currentPrice - holding.avgCost) / holding.avgCost) * 100}
					<tr>
						<td>
							<a href="/stock/{holding.symbol}" class="symbol-link">{holding.symbol}</a>
						</td>
						{#if !compact}
							<td class="company-name">{holding.companyName || '-'}</td>
						{/if}
						<td class="text-right">{formatShares(holding.shares)}</td>
						<td class="text-right">{formatCurrency(holding.avgCost)}</td>
						<td class="text-right">
							{#if holding.currentPrice}
								{formatCurrency(holding.currentPrice)}
							{:else}
								<span class="text-muted">-</span>
							{/if}
						</td>
						<td class="text-right">{formatCurrency(value)}</td>
						<td class="text-right">
							<span class="gain-loss" class:positive={gainLoss >= 0} class:negative={gainLoss < 0}>
								{formatCurrency(gainLoss)}
								<span class="gain-loss-percent">({formatPercent(gainLossPercent)})</span>
							</span>
						</td>
						{#if showActions}
							<td class="actions-col">
								<div class="actions">
									{#if onEdit}
										<button
											type="button"
											class="action-btn"
											onclick={() => onEdit?.(holding)}
											title="Edit holding"
										>
											<i class="fat fa-pencil"></i>
										</button>
									{/if}
									{#if onRemove}
										<button
											type="button"
											class="action-btn action-btn-danger"
											onclick={() => onRemove?.(holding.id)}
											title="Remove holding"
										>
											<i class="fat fa-trash"></i>
										</button>
									{/if}
								</div>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr class="totals-row">
					<td colspan={compact ? 4 : 5}>Total</td>
					<td class="text-right">{formatCurrency(totals().totalValue)}</td>
					<td class="text-right">
						<span
							class="gain-loss"
							class:positive={totals().totalGainLoss >= 0}
							class:negative={totals().totalGainLoss < 0}
						>
							{formatCurrency(totals().totalGainLoss)}
							<span class="gain-loss-percent">({formatPercent(totals().totalGainLossPercent)})</span>
						</span>
					</td>
					{#if showActions}
						<td></td>
					{/if}
				</tr>
			</tfoot>
		</table>
	</div>
{/if}

<style>
	.holdings-table-wrapper {
		overflow-x: auto;
	}

	.holdings-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.holdings-table th,
	.holdings-table td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid var(--color-border);
	}

	.holdings-table th {
		font-weight: 600;
		background: var(--color-bg-secondary);
		white-space: nowrap;
	}

	.holdings-table th.sortable {
		cursor: pointer;
		user-select: none;
	}

	.holdings-table th.sortable:hover {
		background: var(--color-hover-bg);
	}

	.holdings-table th i {
		margin-left: 0.25rem;
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.holdings-table tbody tr:hover {
		background: var(--color-hover-bg);
	}

	.holdings-table .text-right {
		text-align: right;
	}

	.symbol-link {
		font-weight: 600;
		color: var(--color-link);
		text-decoration: none;
	}

	.symbol-link:hover {
		text-decoration: underline;
	}

	.company-name {
		color: var(--color-text-muted);
		font-size: 0.8125rem;
		max-width: 200px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.gain-loss {
		font-weight: 500;
	}

	.gain-loss.positive {
		color: var(--color-chart-up);
	}

	.gain-loss.negative {
		color: var(--color-chart-down);
	}

	.gain-loss-percent {
		font-size: 0.75rem;
		opacity: 0.8;
	}

	.totals-row {
		font-weight: 600;
		background: var(--color-bg-secondary);
	}

	.totals-row td {
		border-top: 2px solid var(--color-border-dark);
		border-bottom: none;
	}

	.actions-col {
		width: 80px;
	}

	.actions {
		display: flex;
		gap: 0.25rem;
		justify-content: flex-end;
	}

	.action-btn {
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 3px;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		color: var(--color-text-muted);
		font-size: 0.75rem;
		transition: all 0.1s ease;
	}

	.action-btn:hover {
		border-color: var(--color-border-dark);
		color: var(--color-text);
	}

	.action-btn-danger:hover {
		border-color: var(--color-accent-red);
		color: var(--color-accent-red);
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--color-text-muted);
	}

	.empty-state i {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.empty-state p {
		margin: 0.25rem 0;
	}

	/* Compact mode */
	.compact .holdings-table th,
	.compact .holdings-table td {
		padding: 0.5rem;
		font-size: 0.8125rem;
	}

	@media (max-width: 768px) {
		.company-name {
			display: none;
		}

		.gain-loss-percent {
			display: none;
		}
	}
</style>
