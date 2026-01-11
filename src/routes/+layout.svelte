<script lang="ts">
	import '../app.css';

	let { children } = $props();

	let theme = $state('light');

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', theme);
		}
	}
</script>

<svelte:head>
	<title>Historical Stock Data Analysis</title>
	<meta name="description" content="Forensic analysis of historical stock trading data for SEC-related entities" />
</svelte:head>

<div class="container">
	<div class="page-wrapper">
		<header>
			<a href="/" class="site-title">Historical Stock Data</a>
			<nav class="nav">
				<a href="/">Home</a>
				<a href="/visualizations/stock-analysis">Stock Analysis</a>
				<a href="/ux-spec">UX Spec</a>
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
				<span>Data sources: Local Cache, Alpha Vantage, SEC EDGAR</span>
			</div>
		</footer>
	</div>
</div>
