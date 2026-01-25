<script lang="ts">
	import { browser } from '$app/environment';

	interface TickerItem {
		symbol: string;
		name: string;
		basePrice: number;
		price: number;
		change: number;
		changePercent: number;
	}

	interface Props {
		/** Speed of animation in seconds (lower = faster) */
		speed?: number;
		/** Delay before resuming auto-scroll after drag (ms) */
		resumeDelay?: number;
	}

	let { speed = 30, resumeDelay = 3000 }: Props = $props();

	let initialized = $state(false);

	// Drag state
	let isDragging = $state(false);
	let dragStartX = $state(0);
	let dragOffset = $state(0);
	let dragStartOffset = $state(0);
	let hasDragged = $state(false);
	let tickerTrack: HTMLDivElement | null = $state(null);

	// Velocity tracking for direction detection
	let lastMoveTime = $state(0);
	let lastMoveX = $state(0);
	let velocity = $state(0);

	// Auto-scroll state
	let isAutoScrolling = $state(false);
	let autoScrollAnimationId = $state<number | null>(null);
	let resumeTimeoutId = $state<ReturnType<typeof setTimeout> | null>(null);
	let scrollDirection = $state<'left' | 'right'>('left'); // Direction to scroll after drag

	// Hardcoded stock data with base prices (cached/static data)
	const STOCK_DATA = [
		{ symbol: 'AAPL', name: 'Apple Inc.', basePrice: 248.05 },
		{ symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 465.96 },
		{ symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 327.94 },
		{ symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 239.17 },
		{ symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 187.68 },
		{ symbol: 'META', name: 'Meta Platforms', basePrice: 658.77 },
		{ symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 449.07 },
		{ symbol: 'BRK.B', name: 'Berkshire Hathaway', basePrice: 478.98 },
		{ symbol: 'UNH', name: 'UnitedHealth', basePrice: 528.40 },
		{ symbol: 'JNJ', name: 'Johnson & Johnson', basePrice: 156.80 },
		{ symbol: 'V', name: 'Visa Inc.', basePrice: 326.19 },
		{ symbol: 'JPM', name: 'JPMorgan Chase', basePrice: 297.73 },
		{ symbol: 'AVGO', name: 'Broadcom Inc.', basePrice: 320.06 },
		{ symbol: 'CVX', name: 'Chevron Corp.', basePrice: 148.90 },
		{ symbol: 'MRK', name: 'Merck & Co.', basePrice: 108.50 },
		{ symbol: 'ABBV', name: 'AbbVie Inc.', basePrice: 154.20 },
		{ symbol: 'PEP', name: 'PepsiCo Inc.', basePrice: 172.80 },
		{ symbol: 'COST', name: 'Costco Wholesale', basePrice: 572.40 },
		{ symbol: 'KO', name: 'Coca-Cola Co.', basePrice: 59.80 },
		{ symbol: 'NFLX', name: 'Netflix Inc.', basePrice: 485.20 }
	];

	// Initialize tickers with simulated prices (computed once)
	let tickers = $state<TickerItem[]>(
		STOCK_DATA.map((stock) => {
			const change = simulateChange(stock.basePrice);
			const price = stock.basePrice + change;
			const changePercent = (change / stock.basePrice) * 100;
			return { ...stock, price, change, changePercent };
		})
	);

	// Set up price update interval on browser
	$effect(() => {
		if (browser && !initialized) {
			initialized = true;

			// Update prices every 8 seconds with smooth simulation
			const interval = setInterval(() => {
				tickers = tickers.map((ticker) => {
					const change = simulateChange(ticker.basePrice);
					const price = ticker.basePrice + change;
					const changePercent = (change / ticker.basePrice) * 100;
					return { ...ticker, price, change, changePercent };
				});
			}, 8000);

			return () => clearInterval(interval);
		}
	});

	// Wrap offset to stay in valid range
	function wrapOffset(offset: number): number {
		if (!tickerTrack) return offset;
		const halfWidth = tickerTrack.scrollWidth / 2;
		while (offset < -halfWidth) offset += halfWidth;
		while (offset > 0) offset -= halfWidth;
		return offset;
	}

	// Calculate scroll speed in pixels per frame (based on speed prop)
	function getScrollSpeed(): number {
		if (!tickerTrack) return 1;
		// speed is in seconds for full width, convert to pixels per frame (~60fps)
		const halfWidth = tickerTrack.scrollWidth / 2;
		return halfWidth / (speed * 60);
	}

	// Auto-scroll animation loop (runs after 3-second delay)
	function autoScroll() {
		if (!isAutoScrolling) return;

		const scrollSpeed = getScrollSpeed();
		// Scroll left = negative offset, scroll right = positive offset
		const direction = scrollDirection === 'left' ? -1 : 1;
		dragOffset = wrapOffset(dragOffset + direction * scrollSpeed);

		autoScrollAnimationId = requestAnimationFrame(autoScroll);
	}

	// Start auto-scrolling after delay
	function scheduleAutoScroll() {
		// Clear any existing timeout
		if (resumeTimeoutId !== null) {
			clearTimeout(resumeTimeoutId);
		}

		resumeTimeoutId = setTimeout(() => {
			isAutoScrolling = true;
			autoScrollAnimationId = requestAnimationFrame(autoScroll);
			resumeTimeoutId = null;
		}, resumeDelay);
	}

	// Stop auto-scrolling
	function stopAutoScroll() {
		if (autoScrollAnimationId !== null) {
			cancelAnimationFrame(autoScrollAnimationId);
			autoScrollAnimationId = null;
		}
		if (resumeTimeoutId !== null) {
			clearTimeout(resumeTimeoutId);
			resumeTimeoutId = null;
		}
		isAutoScrolling = false;
	}

	// Global mouse event listeners for drag
	$effect(() => {
		if (browser && isDragging) {
			const handleMouseMove = (e: MouseEvent) => {
				if (!isDragging) return;

				const now = performance.now();
				const delta = e.clientX - dragStartX;

				if (Math.abs(delta) > 5) {
					hasDragged = true;
				}

				// Track velocity to determine scroll direction
				if (lastMoveTime > 0) {
					const timeDelta = now - lastMoveTime;
					if (timeDelta > 0) {
						const moveDelta = e.clientX - lastMoveX;
						// Smooth velocity calculation
						velocity = velocity * 0.5 + (moveDelta / timeDelta) * 16 * 0.5;
					}
				}
				lastMoveTime = now;
				lastMoveX = e.clientX;

				// Drag moves content with the mouse (drag left = content moves left)
				dragOffset = wrapOffset(dragStartOffset + delta);
			};

			const handleMouseUp = () => {
				isDragging = false;

				// Determine scroll direction based on last drag velocity
				// Positive velocity = dragging right = scroll right
				// Negative velocity = dragging left = scroll left
				if (Math.abs(velocity) > 0.5) {
					scrollDirection = velocity > 0 ? 'right' : 'left';
				}
				// If velocity is very low, keep the current direction

				// Schedule auto-scroll to resume after delay
				scheduleAutoScroll();

				// Reset hasDragged after a short delay to allow click prevention
				setTimeout(() => {
					hasDragged = false;
				}, 50);
			};

			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseup', handleMouseUp);

			return () => {
				window.removeEventListener('mousemove', handleMouseMove);
				window.removeEventListener('mouseup', handleMouseUp);
			};
		}
	});

	function handleMouseDown(e: MouseEvent) {
		// Stop any ongoing auto-scroll animation and pending resume
		stopAutoScroll();
		velocity = 0;

		isDragging = true;
		dragStartX = e.clientX;
		dragStartOffset = dragOffset;
		lastMoveTime = 0;
		lastMoveX = e.clientX;
		hasDragged = false;
		e.preventDefault();
	}

	function handleClick(e: MouseEvent) {
		// Prevent navigation if we dragged
		if (hasDragged) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	// Simulate a random price change (between -2% and +2% of base price)
	function simulateChange(basePrice: number): number {
		const maxChange = basePrice * 0.02;
		const change = (Math.random() * 2 - 1) * maxChange;
		return Math.round(change * 100) / 100;
	}

	function formatPrice(price: number): string {
		return price.toFixed(2);
	}

	function formatChange(change: number): string {
		const sign = change >= 0 ? '+' : '';
		return `${sign}${change.toFixed(2)}`;
	}

	function formatPercent(percent: number): string {
		const sign = percent >= 0 ? '+' : '';
		return `${sign}${percent.toFixed(2)}%`;
	}
</script>

<div
	class="ticker-strip"
	class:dragging={isDragging}
	class:auto-scrolling={isAutoScrolling}
	role="marquee"
	aria-label="Stock price ticker"
	onmousedown={handleMouseDown}
>
	{#if tickers.length > 0}
		<div
			bind:this={tickerTrack}
			class="ticker-track"
			class:manual-scroll={isDragging || isAutoScrolling || dragOffset !== 0}
			style="--speed: {speed}s; --drag-offset: {dragOffset}px;"
		>
			<!-- First set of items -->
			{#each tickers as ticker (ticker.symbol + '-1')}
				<a href="/stock/{ticker.symbol}" class="ticker-item" onclick={handleClick}>
					<span class="ticker-symbol">{ticker.symbol}</span>
					<span class="ticker-price">${formatPrice(ticker.price)}</span>
					<span class="ticker-change" class:positive={ticker.change >= 0} class:negative={ticker.change < 0}>
						{formatChange(ticker.change)} ({formatPercent(ticker.changePercent)})
					</span>
				</a>
			{/each}
			<!-- Duplicate for seamless loop -->
			{#each tickers as ticker (ticker.symbol + '-2')}
				<a href="/stock/{ticker.symbol}" class="ticker-item" onclick={handleClick}>
					<span class="ticker-symbol">{ticker.symbol}</span>
					<span class="ticker-price">${formatPrice(ticker.price)}</span>
					<span class="ticker-change" class:positive={ticker.change >= 0} class:negative={ticker.change < 0}>
						{formatChange(ticker.change)} ({formatPercent(ticker.changePercent)})
					</span>
				</a>
			{/each}
		</div>
	{:else}
		<div class="ticker-loading">
			<i class="fat fa-spinner-third fa-spin"></i>
			<span>Loading market data...</span>
		</div>
	{/if}
</div>

<style>
	.ticker-strip {
		background: var(--color-bg-secondary);
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
		overflow: hidden;
		white-space: nowrap;
		padding: 0.5rem 0;
		cursor: grab;
		user-select: none;
	}

	.ticker-strip.dragging {
		cursor: grabbing;
	}

	.ticker-track {
		display: inline-flex;
		animation: scroll var(--speed) linear infinite;
	}

	.ticker-track.manual-scroll {
		animation: none;
		transform: translateX(var(--drag-offset, 0));
	}

	.ticker-strip.auto-scrolling .ticker-track {
		/* Smooth auto-scrolling */
		will-change: transform;
	}

	@keyframes scroll {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}

	.ticker-item {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0 1.5rem;
		text-decoration: none;
		color: var(--color-text);
		border-right: 1px solid var(--color-border);
		transition: background 0.1s ease;
	}

	.ticker-item:hover {
		background: var(--color-hover-bg);
	}

	.dragging .ticker-item {
		pointer-events: none;
	}

	.ticker-symbol {
		font-weight: 600;
		font-size: 0.8125rem;
	}

	.ticker-price {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}

	.ticker-change {
		font-size: 0.75rem;
		font-weight: 500;
	}

	.ticker-change.positive {
		color: var(--color-chart-up);
	}

	.ticker-change.negative {
		color: var(--color-chart-down);
	}

	.ticker-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.25rem;
		color: var(--color-text-muted);
		font-size: 0.8125rem;
	}

	@media (max-width: 768px) {
		.ticker-item {
			padding: 0 1rem;
		}

		.ticker-price {
			display: none;
		}
	}
</style>
