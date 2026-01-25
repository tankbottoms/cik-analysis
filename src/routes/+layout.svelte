<script lang="ts">
	import '../app.css';
	import TickerStrip from '$lib/components/TickerStrip.svelte';
	import { page } from '$app/stores';

	let { children } = $props();

	let theme = $state('light');
	let showTicker = $state(true);

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', theme);
		}
	}

	// Determine active nav item
	const currentPath = $derived($page.url.pathname);
</script>

<svelte:head>
	<title>Historical Stock Data Analysis</title>
	<meta name="description" content="Stock analysis platform with portfolio tracking, D3 visualizations, and SEC forensic analysis" />
</svelte:head>

{#if showTicker}
	<TickerStrip speed={40} maxItems={25} />
{/if}

<div class="container">
	<div class="page-wrapper">
		<header>
			<a href="/" class="site-title">Historical Stock Data</a>
			<nav class="nav">
				<a href="/" class:active={currentPath === '/'}>Home</a>
				<a href="/portfolio" class:active={currentPath.startsWith('/portfolio')}>Portfolio</a>
				<a href="/visualizations/stock-analysis" class:active={currentPath.startsWith('/visualizations')}>Analysis</a>
				<a href="/education" class:active={currentPath === '/education'}>Education</a>
				<button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
					<i class="fat {theme === 'light' ? 'fa-moon' : 'fa-sun'}"></i>
				</button>
			</nav>
		</header>

		<main>
			{@render children()}
		</main>

		<footer>
			<div class="footer-content">
				<span>Historical Stock Data Analysis</span>
				<span>|</span>
				<span>SEC Filing Research</span>
				<span>|</span>
				<span>Data: Finnhub, Twelve Data, Alpha Vantage, SEC EDGAR</span>
			</div>
		</footer>
	</div>
</div>
