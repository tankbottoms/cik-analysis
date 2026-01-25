<script lang="ts">
	interface Props {
		symbol: string;
		name: string;
		price?: number;
		change?: number;
		changePercent?: number;
		sector?: string;
		marketCap?: number;
		logo?: string;
		recommendation?: {
			buy: number;
			hold: number;
			sell: number;
		};
		href?: string;
	}

	let {
		symbol,
		name,
		price,
		change,
		changePercent,
		sector,
		marketCap,
		logo,
		recommendation,
		href = `/stock/${symbol}`
	}: Props = $props();

	function formatPrice(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(value);
	}

	function formatChange(value: number): string {
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(2)}`;
	}

	function formatPercent(value: number): string {
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(2)}%`;
	}

	function formatMarketCap(value: number): string {
		// API returns market cap in millions
		const inBillions = value / 1000;
		if (inBillions >= 1000) {
			return `$${(inBillions / 1000).toFixed(1)}T`;
		}
		if (inBillions >= 1) {
			return `$${inBillions.toFixed(0)}B`;
		}
		return `$${value.toFixed(0)}M`;
	}

	function getRecommendationClass(rec: Props['recommendation']): string {
		if (!rec) return 'badge-muted';
		const total = rec.buy + rec.hold + rec.sell;
		if (total === 0) return 'badge-muted';
		const buyRatio = rec.buy / total;
		if (buyRatio >= 0.6) return 'badge-green';
		if (buyRatio >= 0.4) return 'badge-amber';
		return 'badge-red';
	}

	function getRecommendationLabel(rec: Props['recommendation']): string {
		if (!rec) return '';
		const total = rec.buy + rec.hold + rec.sell;
		if (total === 0) return '';
		const buyRatio = rec.buy / total;
		if (buyRatio >= 0.6) return 'Buy';
		if (buyRatio >= 0.4) return 'Hold';
		return 'Sell';
	}

	const isPositive = $derived((change ?? 0) >= 0);
</script>

<a {href} class="stock-card section-box">
	<div class="card-header">
		<div class="symbol-info">
			{#if logo}
				<img src={logo} alt={symbol} class="stock-logo" />
			{/if}
			<div>
				<span class="symbol">{symbol}</span>
				{#if sector}
					<span class="sector">{sector}</span>
				{/if}
			</div>
		</div>
		{#if recommendation}
			<span class="badge {getRecommendationClass(recommendation)}">{getRecommendationLabel(recommendation)}</span>
		{/if}
	</div>

	<div class="company-name">{name}</div>

	{#if price !== undefined}
		<div class="price-row">
			<span class="price">{formatPrice(price)}</span>
			{#if change !== undefined && changePercent !== undefined}
				<span class="change" class:positive={isPositive} class:negative={!isPositive}>
					{formatChange(change)} ({formatPercent(changePercent)})
				</span>
			{/if}
		</div>
	{/if}

	{#if marketCap}
		<div class="market-cap">
			<span class="label">Market Cap:</span>
			<span class="value">{formatMarketCap(marketCap)}</span>
		</div>
	{/if}
</a>

<style>
	.stock-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		text-decoration: none;
		color: inherit;
		cursor: pointer;
	}

	.stock-card:hover {
		border-color: var(--color-border-dark);
		box-shadow: 3px 3px 0px var(--color-shadow);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.symbol-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stock-logo {
		width: 28px;
		height: 28px;
		border-radius: 3px;
		object-fit: contain;
		background: var(--color-bg);
	}

	.symbol {
		font-weight: 700;
		font-size: 1.125rem;
	}

	.sector {
		display: block;
		font-size: 0.65rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.company-name {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.price-row {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin-top: 0.25rem;
	}

	.price {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.change {
		font-size: 0.8125rem;
		font-weight: 500;
	}

	.change.positive {
		color: var(--color-chart-up);
	}

	.change.negative {
		color: var(--color-chart-down);
	}

	.market-cap {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-top: auto;
		padding-top: 0.25rem;
	}

	.market-cap .label {
		opacity: 0.7;
	}

	.market-cap .value {
		font-weight: 500;
	}
</style>
