<script lang="ts">
	import { portfolioStore } from '$lib/stores/portfolio.svelte';
	import HoldingsTable from '$lib/components/HoldingsTable.svelte';

	// Compute holdings with mock prices
	const holdingsWithPrices = $derived(() => {
		return portfolioStore.holdings.map((h) => ({
			...h,
			currentPrice: generateMockPrice(h.symbol),
			companyName: h.notes || undefined
		}));
	});

	// Sort options
	type SortBy = 'symbol' | 'value' | 'gainLoss' | 'date';
	let sortBy = $state<SortBy>('symbol');

	// Filter state
	let filterText = $state('');

	const filteredHoldings = $derived(() => {
		let result = holdingsWithPrices();

		// Apply text filter
		if (filterText.trim()) {
			const search = filterText.toUpperCase();
			result = result.filter(
				(h) =>
					h.symbol.toUpperCase().includes(search) ||
					(h.companyName && h.companyName.toUpperCase().includes(search))
			);
		}

		return result;
	});

	function generateMockPrice(symbol: string): number {
		const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
		return 50 + (hash % 200) + Math.random() * 10;
	}

	function handleRemove(id: string) {
		if (confirm('Remove this holding?')) {
			portfolioStore.removeHolding(id);
		}
	}

	function handleClearAll() {
		if (confirm('Remove ALL holdings? This cannot be undone.')) {
			portfolioStore.clearAllHoldings();
		}
	}

	function handleExport() {
		const data = portfolioStore.exportData();
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `portfolio-${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleImport() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				const text = await file.text();
				const success = portfolioStore.importData(text);
				if (success) {
					alert('Portfolio imported successfully!');
				} else {
					alert('Failed to import portfolio. Invalid format.');
				}
			}
		};
		input.click();
	}
</script>

<svelte:head>
	<title>Holdings | Portfolio</title>
</svelte:head>

<a href="/portfolio" class="back-link">
	<i class="fat fa-arrow-left"></i> Back to Portfolio
</a>

<h1><i class="fat fa-list"></i> Holdings</h1>

<p class="text-muted">
	Detailed view of all your portfolio holdings.
</p>

<!-- Filters and Actions -->
<section class="mt-2">
	<div class="toolbar">
		<div class="filter-group">
			<input
				type="text"
				bind:value={filterText}
				placeholder="Filter by symbol or name..."
				class="filter-input"
			/>
		</div>

		<div class="action-group">
			<button type="button" class="button" onclick={handleExport}>
				<i class="fat fa-download"></i> Export
			</button>
			<button type="button" class="button" onclick={handleImport}>
				<i class="fat fa-upload"></i> Import
			</button>
			{#if portfolioStore.totalHoldings > 0}
				<button type="button" class="button button-danger" onclick={handleClearAll}>
					<i class="fat fa-trash"></i> Clear All
				</button>
			{/if}
		</div>
	</div>
</section>

<!-- Holdings Table -->
<section class="mt-2">
	<div class="section-box">
		<HoldingsTable
			holdings={filteredHoldings()}
			onRemove={handleRemove}
			showActions={true}
		/>
	</div>

	{#if filterText && filteredHoldings().length === 0}
		<div class="callout mt-2">
			<i class="fat fa-circle-info"></i>
			No holdings match "{filterText}"
		</div>
	{/if}
</section>

<!-- Summary -->
{#if portfolioStore.totalHoldings > 0}
	<section class="mt-3">
		<h2><i class="fat fa-chart-pie"></i> Summary</h2>

		<div class="section-box">
			<table>
				<tbody>
					<tr>
						<td>Total Holdings</td>
						<td class="text-right"><strong>{portfolioStore.totalHoldings}</strong></td>
					</tr>
					<tr>
						<td>Unique Symbols</td>
						<td class="text-right"><strong>{new Set(portfolioStore.symbols).size}</strong></td>
					</tr>
					<tr>
						<td>Last Updated</td>
						<td class="text-right">
							<strong>{new Date(portfolioStore.lastUpdated).toLocaleDateString()}</strong>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>
{/if}

<style>
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.filter-group {
		flex: 1;
		min-width: 200px;
		max-width: 300px;
	}

	.filter-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 3px;
		color: var(--color-text);
	}

	.filter-input:focus {
		outline: none;
		border-color: var(--color-border-dark);
	}

	.action-group {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.button-danger {
		border-color: var(--color-accent-red);
		color: var(--color-accent-red);
	}

	.button-danger:hover {
		background: rgba(198, 40, 40, 0.1);
	}

	@media (max-width: 640px) {
		.toolbar {
			flex-direction: column;
			align-items: stretch;
		}

		.filter-group {
			max-width: none;
		}

		.action-group {
			justify-content: flex-start;
		}
	}
</style>
