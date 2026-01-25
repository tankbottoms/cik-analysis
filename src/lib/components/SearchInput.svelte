<script lang="ts">
	import { onMount } from 'svelte';

	interface Stock {
		symbol: string;
		name: string;
		sector?: string;
	}

	interface Props {
		placeholder?: string;
		onSelect?: (stock: Stock) => void;
		onAddToPortfolio?: (stock: Stock) => void;
		onAddToWatchlist?: (stock: Stock) => void;
	}

	let { placeholder = 'Search stocks...', onSelect, onAddToPortfolio, onAddToWatchlist }: Props =
		$props();

	let query = $state('');
	let stocks = $state<Stock[]>([]);
	let isFocused = $state(false);
	let selectedIndex = $state(-1);
	let inputElement: HTMLInputElement;

	// Filter stocks based on query
	const suggestions = $derived(() => {
		if (!query.trim() || query.length < 1) return [];

		const searchTerm = query.toUpperCase().trim();
		return stocks
			.filter(
				(stock) =>
					stock.symbol.toUpperCase().includes(searchTerm) ||
					stock.name.toUpperCase().includes(searchTerm)
			)
			.slice(0, 8); // Limit to 8 suggestions
	});

	const showDropdown = $derived(isFocused && suggestions().length > 0);

	onMount(async () => {
		try {
			const response = await fetch('/json/market/sp500-list.json');
			if (response.ok) {
				const data = await response.json();
				stocks = data.stocks || [];
			}
		} catch (error) {
			console.error('Failed to load stock list:', error);
		}
	});

	function handleSelect(stock: Stock) {
		query = '';
		selectedIndex = -1;
		isFocused = false;
		onSelect?.(stock);
	}

	function handleKeydown(event: KeyboardEvent) {
		const items = suggestions();

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, -1);
				break;
			case 'Enter':
				event.preventDefault();
				if (selectedIndex >= 0 && items[selectedIndex]) {
					handleSelect(items[selectedIndex]);
				}
				break;
			case 'Escape':
				isFocused = false;
				selectedIndex = -1;
				inputElement?.blur();
				break;
		}
	}

	function handleAddToPortfolio(event: MouseEvent, stock: Stock) {
		event.stopPropagation();
		onAddToPortfolio?.(stock);
		query = '';
		isFocused = false;
	}

	function handleAddToWatchlist(event: MouseEvent, stock: Stock) {
		event.stopPropagation();
		onAddToWatchlist?.(stock);
		query = '';
		isFocused = false;
	}
</script>

<div class="search-container">
	<div class="search-input-wrapper">
		<i class="fat fa-magnifying-glass search-icon"></i>
		<input
			bind:this={inputElement}
			type="text"
			bind:value={query}
			{placeholder}
			class="search-input"
			onfocus={() => (isFocused = true)}
			onblur={() => setTimeout(() => (isFocused = false), 200)}
			onkeydown={handleKeydown}
			autocomplete="off"
			spellcheck="false"
		/>
		{#if query}
			<button
				type="button"
				class="clear-button"
				onclick={() => {
					query = '';
					inputElement?.focus();
				}}
				aria-label="Clear search"
			>
				<i class="fat fa-xmark"></i>
			</button>
		{/if}
	</div>

	{#if showDropdown}
		<div class="search-dropdown">
			{#each suggestions() as stock, index}
				<div
					class="search-result"
					class:selected={index === selectedIndex}
					onclick={() => handleSelect(stock)}
					onmouseenter={() => (selectedIndex = index)}
					onkeydown={(e) => e.key === 'Enter' && handleSelect(stock)}
					role="option"
					tabindex="0"
					aria-selected={index === selectedIndex}
				>
					<div class="result-main">
						<span class="result-symbol">{stock.symbol}</span>
						<span class="result-name">{stock.name}</span>
					</div>
					<div class="result-actions">
						{#if onAddToPortfolio}
							<button
								type="button"
								class="action-button"
								onclick={(e) => handleAddToPortfolio(e, stock)}
								title="Add to portfolio"
							>
								<i class="fat fa-plus"></i>
							</button>
						{/if}
						{#if onAddToWatchlist}
							<button
								type="button"
								class="action-button"
								onclick={(e) => handleAddToWatchlist(e, stock)}
								title="Add to watchlist"
							>
								<i class="fat fa-eye"></i>
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.search-container {
		position: relative;
		width: 100%;
		max-width: 400px;
	}

	.search-input-wrapper {
		display: flex;
		align-items: center;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 3px;
		padding: 0 0.75rem;
		transition: all 0.15s ease;
	}

	.search-input-wrapper:focus-within {
		border-color: var(--color-border-dark);
		box-shadow: 2px 2px 0px var(--color-shadow);
	}

	.search-icon {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		margin-right: 0.5rem;
	}

	.search-input {
		flex: 1;
		padding: 0.625rem 0;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		background: transparent;
		border: none;
		outline: none;
		color: var(--color-text);
	}

	.search-input::placeholder {
		color: var(--color-text-muted);
	}

	.clear-button {
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.clear-button:hover {
		color: var(--color-text);
	}

	.search-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin-top: 4px;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-dark);
		border-radius: 3px;
		box-shadow: 3px 3px 0px var(--color-shadow);
		z-index: 100;
		max-height: 320px;
		overflow-y: auto;
	}

	.search-result {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 0.625rem 0.75rem;
		background: none;
		border: none;
		border-bottom: 1px solid var(--color-border);
		cursor: pointer;
		text-align: left;
		font-family: var(--font-mono);
		color: var(--color-text);
		transition: background 0.1s ease;
	}

	.search-result:last-child {
		border-bottom: none;
	}

	.search-result:hover,
	.search-result.selected {
		background: var(--color-hover-bg);
	}

	.result-main {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		flex: 1;
		min-width: 0;
	}

	.result-symbol {
		font-weight: 600;
		font-size: 0.875rem;
	}

	.result-name {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.result-actions {
		display: flex;
		gap: 0.25rem;
		margin-left: 0.5rem;
	}

	.action-button {
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 3px;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		color: var(--color-text-muted);
		font-size: 0.75rem;
		transition: all 0.1s ease;
	}

	.action-button:hover {
		border-color: var(--color-border-dark);
		color: var(--color-text);
		background: var(--color-bg-secondary);
	}
</style>
