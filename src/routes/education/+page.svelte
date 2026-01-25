<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// Education categories with icons
	const categories = [
		{ id: 'financial-analysis', label: 'Financial Analysis', icon: 'fa-file-invoice-dollar', color: 'badge-blue' },
		{ id: 'business-quality', label: 'Business Quality', icon: 'fa-building', color: 'badge-purple' },
		{ id: 'valuation', label: 'Valuation', icon: 'fa-calculator', color: 'badge-green' },
		{ id: 'portfolio', label: 'Portfolio', icon: 'fa-chart-pie', color: 'badge-cyan' },
		{ id: 'income', label: 'Income Investing', icon: 'fa-coins', color: 'badge-amber' },
		{ id: 'capital', label: 'Capital Allocation', icon: 'fa-sitemap', color: 'badge-teal' },
		{ id: 'derivatives', label: 'Derivatives', icon: 'fa-exchange', color: 'badge-red' },
		{ id: 'wealth', label: 'Wealth Building', icon: 'fa-piggy-bank', color: 'badge-gray' }
	];

	// Active filters
	let activeFilters = $state<Set<string>>(new Set());

	function toggleFilter(id: string) {
		if (activeFilters.has(id)) {
			activeFilters.delete(id);
		} else {
			activeFilters.add(id);
		}
		activeFilters = new Set(activeFilters);
	}

	function clearFilters() {
		activeFilters = new Set();
	}

	function isVisible(categoryId: string): boolean {
		return activeFilters.size === 0 || activeFilters.has(categoryId);
	}

	// Handle hash navigation on mount
	$effect(() => {
		if (browser) {
			const hash = window.location.hash.slice(1);
			if (hash) {
				setTimeout(() => {
					const element = document.getElementById(hash);
					if (element) {
						element.scrollIntoView({ behavior: 'smooth', block: 'start' });
					}
				}, 100);
			}
		}
	});

	// Expanded state for accordion sections
	let expandedSections = $state<Record<string, boolean>>({
		'balance-sheets': true,
		'income-statements': true,
		'cash-flow': true,
		'strategic-position': true,
		'competitive-advantages': true,
		'margin-economics': true,
		'income-securities': true,
		'growth-companies': true,
		'revenue-metrics': true,
		'asset-allocation': true,
		'position-sizing': true,
		'risk-management': true,
		'dividend-fundamentals': true,
		'yield-analysis': true,
		'management-decisions': true,
		'shareholder-returns': true,
		'derivatives-basics': true,
		'derivatives-strategies': true,
		'compounding': true,
		'long-term': true
	});

	function toggleSection(id: string) {
		expandedSections[id] = !expandedSections[id];
	}
</script>

<svelte:head>
	<title>Investment Education | Historical Stock Data</title>
	<meta name="description" content="Comprehensive guide to fundamental analysis, valuation methods, and portfolio construction for long-term investors." />
</svelte:head>

<a href="/" class="back-link">
	<i class="fat fa-arrow-left"></i> Back to Home
</a>

<h1><i class="fat fa-graduation-cap"></i> Investment Education</h1>

<div class="flex-row" style="margin-bottom: 1rem;">
	<span class="badge badge-blue">v1.0</span>
	<span class="badge badge-green">Fundamental Analysis</span>
	<span class="badge badge-purple">Comprehensive Guide</span>
</div>

<div class="description-box">
	<p>
		A comprehensive guide to fundamental analysis, valuation methods, and portfolio construction for long-term investors.
		Use the category filters below to focus on specific topics, or scroll through all concepts.
		Each section can be linked directly - share links to specific topics with others.
	</p>
</div>

<!-- Category Filter Box -->
<div class="filter-box">
	<h3><i class="fat fa-filter"></i> Filter by Category</h3>
	<div class="filter-badges">
		{#each categories as cat}
			<button
				class="category-filter-btn {cat.color}"
				class:active={activeFilters.has(cat.id)}
				onclick={() => toggleFilter(cat.id)}
			>
				<i class="fat {cat.icon}"></i>
				{cat.label}
			</button>
		{/each}
	</div>
	{#if activeFilters.size > 0}
		<button class="clear-filters-btn" onclick={clearFilters}>
			<i class="fat fa-times"></i> Clear Filters
		</button>
	{/if}
</div>

<!-- Financial Statement Analysis -->
{#if isVisible('financial-analysis')}
<section class="education-category" id="financial-analysis">
	<div class="category-header">
		<h2><i class="fat fa-file-invoice-dollar"></i> Financial Statement Analysis</h2>
		<span class="badge badge-blue">Financial Analysis</span>
	</div>

	<!-- Balance Sheets -->
	<article class="concept-section" id="balance-sheets">
		<button class="accordion-header" onclick={() => toggleSection('balance-sheets')}>
			<h3><i class="fat fa-balance-scale"></i> Understanding Balance Sheets</h3>
			<i class="fat {expandedSections['balance-sheets'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['balance-sheets']}
		<div class="accordion-content">
			<p class="concept-intro">
				The balance sheet provides a snapshot of what a company owns, owes, and the residual claim of shareholders at a specific point in time.
			</p>

			<div class="formula-box">
				<strong>The Fundamental Equation:</strong>
				<code>Assets = Liabilities + Shareholders' Equity</code>
			</div>

			<h4>Asset Classification</h4>
			<div class="two-column-grid">
				<div class="info-card">
					<h5>Current Assets</h5>
					<p class="text-muted">Resources expected to convert to cash within one year:</p>
					<ul>
						<li><strong>Cash & Equivalents</strong> - Bank balances, money market funds</li>
						<li><strong>Receivables</strong> - Customer payments pending (30-90 days)</li>
						<li><strong>Inventory</strong> - Goods held for sale</li>
						<li><strong>Marketable Securities</strong> - Short-term investments</li>
					</ul>
				</div>
				<div class="info-card">
					<h5>Non-Current Assets</h5>
					<p class="text-muted">Provide benefit beyond one year:</p>
					<ul>
						<li><strong>Property & Equipment</strong> - Buildings, machinery</li>
						<li><strong>Intangible Assets</strong> - Patents, trademarks, goodwill</li>
						<li><strong>Long-term Investments</strong> - Equity stakes, bonds</li>
					</ul>
				</div>
			</div>

			<h4>Key Analytical Ratios</h4>
			<table>
				<thead>
					<tr>
						<th>Ratio</th>
						<th>Formula</th>
						<th>Interpretation</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><span class="badge badge-edu-ratio">Current Ratio</span></td>
						<td><code>Current Assets / Current Liabilities</code></td>
						<td>Values above 1.0 indicate ability to meet short-term obligations</td>
					</tr>
					<tr>
						<td><span class="badge badge-edu-ratio">Quick Ratio</span></td>
						<td><code>(Current Assets - Inventory) / Current Liabilities</code></td>
						<td>More conservative liquidity assessment</td>
					</tr>
					<tr>
						<td><span class="badge badge-edu-ratio">Debt-to-Equity</span></td>
						<td><code>Total Liabilities / Shareholders' Equity</code></td>
						<td>Lower ratios indicate less reliance on debt</td>
					</tr>
					<tr>
						<td><span class="badge badge-edu-ratio">ROE</span></td>
						<td><code>Net Income / Shareholders' Equity</code></td>
						<td>Profit generation efficiency relative to shareholder investment</td>
					</tr>
				</tbody>
			</table>

			<div class="callout callout-warning">
				<h5><i class="fat fa-triangle-exclamation"></i> Warning Indicators</h5>
				<ul>
					<li>Declining current ratios over consecutive periods</li>
					<li>Debt-to-equity significantly above industry peers</li>
					<li>Large intangible asset balances requiring scrutiny</li>
					<li>Off-balance sheet arrangements disclosed in footnotes</li>
				</ul>
			</div>
		</div>
		{/if}
	</article>

	<!-- Income Statements -->
	<article class="concept-section" id="income-statements">
		<button class="accordion-header" onclick={() => toggleSection('income-statements')}>
			<h3><i class="fat fa-chart-line"></i> Decoding Income Statements</h3>
			<i class="fat {expandedSections['income-statements'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['income-statements']}
		<div class="accordion-content">
			<p class="concept-intro">
				The income statement reveals profitability over a period, showing how revenue transforms into net income through successive expense deductions.
			</p>

			<div class="code-block" style="font-size: 0.8rem;">
				<pre>Revenue (Top Line)
  - Cost of Goods Sold
  ─────────────────────
= Gross Profit
  - Operating Expenses (SG&A, R&D)
  ─────────────────────
= Operating Income
  +/- Other Income/Expense
  - Interest Expense
  ─────────────────────
= Pre-Tax Income
  - Income Tax Expense
  ─────────────────────
= Net Income (Bottom Line)</pre>
			</div>

			<h4>Profitability Metrics</h4>
			<table>
				<thead>
					<tr>
						<th>Margin</th>
						<th>Formula</th>
						<th>Typical Ranges</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><span class="badge badge-edu-metric">Gross Margin</span></td>
						<td><code>(Revenue - COGS) / Revenue</code></td>
						<td>Software: 70-80%+ | Retail: 25-40%</td>
					</tr>
					<tr>
						<td><span class="badge badge-edu-metric">Operating Margin</span></td>
						<td><code>Operating Income / Revenue</code></td>
						<td>Reflects operational efficiency</td>
					</tr>
					<tr>
						<td><span class="badge badge-edu-metric">Net Margin</span></td>
						<td><code>Net Income / Revenue</code></td>
						<td>Ultimate profitability after all costs</td>
					</tr>
				</tbody>
			</table>

			<h4>Analytical Focus Areas</h4>
			<div class="focus-list">
				<div class="focus-item"><span class="badge badge-gray">1</span> <strong>Revenue Trends</strong> - Year-over-year growth, quarterly seasonality</div>
				<div class="focus-item"><span class="badge badge-gray">2</span> <strong>Margin Trajectories</strong> - Expanding or contracting margins</div>
				<div class="focus-item"><span class="badge badge-gray">3</span> <strong>Earnings Quality</strong> - Operating income vs. one-time gains</div>
				<div class="focus-item"><span class="badge badge-gray">4</span> <strong>Expense Management</strong> - Operating leverage efficiency</div>
				<div class="focus-item"><span class="badge badge-gray">5</span> <strong>Industry Benchmarking</strong> - Peer comparison for context</div>
			</div>
		</div>
		{/if}
	</article>

	<!-- Cash Flow Statements -->
	<article class="concept-section" id="cash-flow">
		<button class="accordion-header" onclick={() => toggleSection('cash-flow')}>
			<h3><i class="fat fa-money-bill-wave"></i> Cash Flow Statement Fundamentals</h3>
			<i class="fat {expandedSections['cash-flow'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['cash-flow']}
		<div class="accordion-content">
			<p class="concept-intro">
				The cash flow statement tracks actual cash movements, revealing the quality of reported earnings and financial flexibility.
			</p>

			<h4>Three Activity Categories</h4>
			<div class="three-column-grid">
				<div class="info-card">
					<h5><i class="fat fa-cogs"></i> Operating Activities</h5>
					<p class="text-muted">Core business cash generation</p>
					<ul>
						<li>Customer receipts</li>
						<li>Supplier payments</li>
						<li>Tax payments</li>
					</ul>
				</div>
				<div class="info-card">
					<h5><i class="fat fa-building"></i> Investing Activities</h5>
					<p class="text-muted">Capital deployment</p>
					<ul>
						<li>Capital expenditures</li>
						<li>Acquisitions</li>
						<li>Asset sales</li>
					</ul>
				</div>
				<div class="info-card">
					<h5><i class="fat fa-handshake"></i> Financing Activities</h5>
					<p class="text-muted">Capital structure changes</p>
					<ul>
						<li>Debt issuance/repayment</li>
						<li>Dividend payments</li>
						<li>Share repurchases</li>
					</ul>
				</div>
			</div>

			<h4>Critical Metrics</h4>
			<table>
				<thead>
					<tr>
						<th>Metric</th>
						<th>Formula</th>
						<th>Purpose</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><span class="badge badge-edu-metric">Free Cash Flow</span></td>
						<td><code>Operating Cash Flow - CapEx</code></td>
						<td>Discretionary cash for dividends, buybacks, acquisitions</td>
					</tr>
					<tr>
						<td><span class="badge badge-edu-metric">OCF Ratio</span></td>
						<td><code>Operating CF / Current Liabilities</code></td>
						<td>Ability to cover short-term obligations from operations</td>
					</tr>
					<tr>
						<td><span class="badge badge-edu-metric">CF-to-Debt</span></td>
						<td><code>Operating CF / Total Debt</code></td>
						<td>Capacity to service debt obligations</td>
					</tr>
				</tbody>
			</table>

			<div class="two-column-grid">
				<div class="callout callout-info">
					<h5><i class="fat fa-check"></i> Positive Signals</h5>
					<ul>
						<li>Operating CF exceeds net income</li>
						<li>Consistent positive operating CF</li>
						<li>Strategic investing for growth</li>
					</ul>
				</div>
				<div class="callout callout-warning">
					<h5><i class="fat fa-triangle-exclamation"></i> Warning Signs</h5>
					<ul>
						<li>Net income positive but operating CF negative</li>
						<li>Heavy reliance on financing</li>
						<li>Erratic cash flow patterns</li>
					</ul>
				</div>
			</div>
		</div>
		{/if}
	</article>
</section>
{/if}

<!-- Business Quality Assessment -->
{#if isVisible('business-quality')}
<section class="education-category" id="business-quality">
	<div class="category-header">
		<h2><i class="fat fa-building"></i> Business Quality Assessment</h2>
		<span class="badge badge-purple">Business Quality</span>
	</div>

	<!-- Strategic Position -->
	<article class="concept-section" id="strategic-position">
		<button class="accordion-header" onclick={() => toggleSection('strategic-position')}>
			<h3><i class="fat fa-chess"></i> Strategic Position Analysis</h3>
			<i class="fat {expandedSections['strategic-position'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['strategic-position']}
		<div class="accordion-content">
			<p class="concept-intro">
				Systematic evaluation of a company's strategic position through internal strengths/weaknesses and external opportunities/threats (SWOT analysis).
			</p>

			<div class="two-column-grid">
				<div class="info-card">
					<h5><i class="fat fa-plus-circle"></i> Strengths</h5>
					<ul>
						<li>Core competencies - What does the company do better?</li>
						<li>Unique resources and capabilities</li>
						<li>Brand recognition and customer loyalty</li>
						<li>Balance sheet strength</li>
					</ul>
				</div>
				<div class="info-card">
					<h5><i class="fat fa-minus-circle"></i> Weaknesses</h5>
					<ul>
						<li>Operational inefficiencies</li>
						<li>Resource constraints</li>
						<li>Market vulnerabilities</li>
						<li>Financial limitations</li>
					</ul>
				</div>
				<div class="info-card">
					<h5><i class="fat fa-arrow-up-right"></i> Opportunities</h5>
					<ul>
						<li>Market expansion potential</li>
						<li>Favorable demographic/tech trends</li>
						<li>Acquisition targets</li>
						<li>Regulatory tailwinds</li>
					</ul>
				</div>
				<div class="info-card">
					<h5><i class="fat fa-shield-xmark"></i> Threats</h5>
					<ul>
						<li>Competitive intensity</li>
						<li>Technological disruption</li>
						<li>Regulatory headwinds</li>
						<li>Supply chain vulnerabilities</li>
					</ul>
				</div>
			</div>
		</div>
		{/if}
	</article>

	<!-- Competitive Advantages -->
	<article class="concept-section" id="competitive-advantages">
		<button class="accordion-header" onclick={() => toggleSection('competitive-advantages')}>
			<h3><i class="fat fa-shield-halved"></i> Competitive Advantages (Economic Moats)</h3>
			<i class="fat {expandedSections['competitive-advantages'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['competitive-advantages']}
		<div class="accordion-content">
			<p class="concept-intro">
				Durable competitive advantages - economic moats - protect profitability from competitive erosion.
			</p>

			<h4>Sources of Competitive Advantage</h4>
			<div class="moat-grid">
				<div class="moat-card">
					<span class="badge badge-purple">Brand Power</span>
					<p>Strong brands command price premiums, customer loyalty, and distribution priority.</p>
				</div>
				<div class="moat-card">
					<span class="badge badge-blue">Cost Leadership</span>
					<p>Structural cost advantages through scale, proprietary processes, or favorable positioning.</p>
				</div>
				<div class="moat-card">
					<span class="badge badge-green">Network Effects</span>
					<p>Platform value increases with each additional user, creating winner-take-most dynamics.</p>
				</div>
				<div class="moat-card">
					<span class="badge badge-amber">Intellectual Property</span>
					<p>Protected innovation through patents, trade secrets, or regulatory exclusivity.</p>
				</div>
				<div class="moat-card">
					<span class="badge badge-cyan">Switching Costs</span>
					<p>Barriers to customer departure through integration depth, data lock-in, or retraining costs.</p>
				</div>
				<div class="moat-card">
					<span class="badge badge-red">Regulatory Protection</span>
					<p>Government-created barriers through licensing, zoning, or certifications.</p>
				</div>
			</div>

			<h4>Moat Assessment Framework</h4>
			<table>
				<thead>
					<tr>
						<th>Characteristic</th>
						<th>Weak</th>
						<th>Moderate</th>
						<th>Strong</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Duration</td>
						<td>&lt; 5 years</td>
						<td>5-10 years</td>
						<td>10+ years</td>
					</tr>
					<tr>
						<td>Defensibility</td>
						<td>Easily replicated</td>
						<td>Some barriers</td>
						<td>High barriers</td>
					</tr>
					<tr>
						<td>Profitability</td>
						<td>Industry average</td>
						<td>Above average</td>
						<td>Superior margins</td>
					</tr>
					<tr>
						<td>Market Position</td>
						<td>Fragmented</td>
						<td>Top 5</td>
						<td>Dominant</td>
					</tr>
				</tbody>
			</table>
		</div>
		{/if}
	</article>

	<!-- Margin Economics -->
	<article class="concept-section" id="margin-economics">
		<button class="accordion-header" onclick={() => toggleSection('margin-economics')}>
			<h3><i class="fat fa-percent"></i> Margin Economics</h3>
			<i class="fat {expandedSections['margin-economics'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['margin-economics']}
		<div class="accordion-content">
			<p class="concept-intro">
				Margins reveal the economic quality of a business model - how efficiently revenue converts to profit.
			</p>

			<div class="callout callout-info">
				<h5><i class="fat fa-lightbulb"></i> Why Margins Matter More Than Revenue</h5>
				<p>Two companies with $10B revenue: Company A at 5% margin = $500M profit. Company B at 25% margin = $2.5B profit. Company B generates 5x the profit from identical revenue.</p>
			</div>

			<h4>Margin Quality Indicators</h4>
			<div class="two-column-grid">
				<div class="info-card">
					<h5>High-Quality Margins From:</h5>
					<ul>
						<li>Strong competitive advantages</li>
						<li>Pricing power</li>
						<li>Operational excellence</li>
						<li>Asset-light business models</li>
					</ul>
				</div>
				<div class="info-card">
					<h5>Low-Quality Margins From:</h5>
					<ul>
						<li>Intense competition</li>
						<li>Commodity products</li>
						<li>Heavy capital requirements</li>
						<li>Weak differentiation</li>
					</ul>
				</div>
			</div>

			<h4>Margin Trend Analysis</h4>
			<table>
				<thead>
					<tr>
						<th>Pattern</th>
						<th>Interpretation</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><span class="badge badge-green">Stable high margins</span></td>
						<td>Durable moat, pricing power</td>
					</tr>
					<tr>
						<td><span class="badge badge-blue">Expanding margins</span></td>
						<td>Improving competitive position, scale benefits</td>
					</tr>
					<tr>
						<td><span class="badge badge-amber">Contracting margins</span></td>
						<td>Competitive pressure, cost inflation</td>
					</tr>
					<tr>
						<td><span class="badge badge-red">Volatile margins</span></td>
						<td>Cyclical business, weak positioning</td>
					</tr>
				</tbody>
			</table>
		</div>
		{/if}
	</article>
</section>
{/if}

<!-- Valuation Frameworks -->
{#if isVisible('valuation')}
<section class="education-category" id="valuation">
	<div class="category-header">
		<h2><i class="fat fa-calculator"></i> Valuation Frameworks</h2>
		<span class="badge badge-green">Valuation</span>
	</div>

	<!-- Income Securities -->
	<article class="concept-section" id="income-securities">
		<button class="accordion-header" onclick={() => toggleSection('income-securities')}>
			<h3><i class="fat fa-coins"></i> Income-Producing Securities</h3>
			<i class="fat {expandedSections['income-securities'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['income-securities']}
		<div class="accordion-content">
			<p class="concept-intro">
				Valuing dividend-paying stocks requires balancing current income with total return potential.
			</p>

			<div class="callout callout-warning">
				<h5><i class="fat fa-triangle-exclamation"></i> High Yield Warning</h5>
				<p>A high yield may indicate: declining stock price (distress), unsustainable payout, or limited growth prospects.</p>
			</div>

			<h4>Payout Ratio Analysis</h4>
			<div class="formula-box">
				<code>Payout Ratio = Dividends per Share / Earnings per Share</code>
			</div>
			<table>
				<thead>
					<tr>
						<th>Payout Level</th>
						<th>Interpretation</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>&lt; 30%</td><td>Conservative, high reinvestment</td></tr>
					<tr><td>30-50%</td><td>Balanced approach</td></tr>
					<tr><td>50-75%</td><td>Income-oriented</td></tr>
					<tr><td>&gt; 75%</td><td>High payout, sustainability risk</td></tr>
				</tbody>
			</table>
		</div>
		{/if}
	</article>

	<!-- Growth Companies -->
	<article class="concept-section" id="growth-companies">
		<button class="accordion-header" onclick={() => toggleSection('growth-companies')}>
			<h3><i class="fat fa-rocket"></i> High-Growth Companies</h3>
			<i class="fat {expandedSections['growth-companies'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['growth-companies']}
		<div class="accordion-content">
			<p class="concept-intro">
				Growth stock valuation requires projecting future earnings power and appropriate premium multiples.
			</p>

			<h4>Valuation Metrics</h4>
			<div class="formula-box">
				<code>P/E = Stock Price / Earnings per Share</code>
			</div>
			<table>
				<thead>
					<tr>
						<th>Growth Rate</th>
						<th>Reasonable P/E Range</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>10-15%</td><td>15-25x</td></tr>
					<tr><td>15-25%</td><td>25-40x</td></tr>
					<tr><td>25-40%</td><td>40-60x</td></tr>
					<tr><td>40%+</td><td>60x+ (with caution)</td></tr>
				</tbody>
			</table>

			<h4>The PEG Ratio</h4>
			<div class="formula-box">
				<code>PEG = P/E Ratio / Earnings Growth Rate</code>
			</div>
			<table>
				<thead>
					<tr>
						<th>PEG Value</th>
						<th>Interpretation</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>&lt; 1.0</td><td>Potentially undervalued</td></tr>
					<tr><td>1.0</td><td>Fair value</td></tr>
					<tr><td>&gt; 1.0</td><td>Premium valuation</td></tr>
				</tbody>
			</table>
		</div>
		{/if}
	</article>

	<!-- Revenue Metrics -->
	<article class="concept-section" id="revenue-metrics">
		<button class="accordion-header" onclick={() => toggleSection('revenue-metrics')}>
			<h3><i class="fat fa-chart-simple"></i> Revenue-Based Metrics (P/S)</h3>
			<i class="fat {expandedSections['revenue-metrics'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['revenue-metrics']}
		<div class="accordion-content">
			<p class="concept-intro">
				Price-to-sales provides valuation context when earnings are negative or volatile.
			</p>

			<h4>When to Use P/S</h4>
			<ul>
				<li>Early-stage companies investing for growth</li>
				<li>Cyclical businesses with volatile earnings</li>
				<li>Turnaround situations</li>
				<li>Cross-company comparisons within industries</li>
			</ul>

			<h4>Margin-Adjusted Analysis</h4>
			<table>
				<thead>
					<tr>
						<th>Business Type</th>
						<th>Typical Gross Margin</th>
						<th>P/S Implication</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>Software/SaaS</td><td>70-85%</td><td>Higher P/S justified</td></tr>
					<tr><td>Services</td><td>40-60%</td><td>Moderate P/S</td></tr>
					<tr><td>Hardware</td><td>30-45%</td><td>Lower P/S</td></tr>
					<tr><td>Retail</td><td>20-35%</td><td>Lowest P/S</td></tr>
				</tbody>
			</table>
		</div>
		{/if}
	</article>
</section>
{/if}

<!-- Portfolio Construction -->
{#if isVisible('portfolio')}
<section class="education-category" id="portfolio">
	<div class="category-header">
		<h2><i class="fat fa-chart-pie"></i> Portfolio Construction</h2>
		<span class="badge badge-cyan">Portfolio</span>
	</div>

	<!-- Asset Allocation -->
	<article class="concept-section" id="asset-allocation">
		<button class="accordion-header" onclick={() => toggleSection('asset-allocation')}>
			<h3><i class="fat fa-puzzle-piece"></i> Asset Allocation Principles</h3>
			<i class="fat {expandedSections['asset-allocation'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['asset-allocation']}
		<div class="accordion-content">
			<p class="concept-intro">
				Thoughtful portfolio construction balances growth potential with risk management.
			</p>

			<h4>Portfolio Composition Framework</h4>
			<table>
				<thead>
					<tr>
						<th>Category</th>
						<th>Allocation</th>
						<th>Characteristics</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><span class="badge badge-blue">Core Holdings</span></td>
						<td>40-60%</td>
						<td>Highest conviction, strong moats, proven models</td>
					</tr>
					<tr>
						<td><span class="badge badge-green">Growth Positions</span></td>
						<td>20-30%</td>
						<td>Above-average growth, acceptable risk/reward</td>
					</tr>
					<tr>
						<td><span class="badge badge-amber">Income Positions</span></td>
						<td>15-25%</td>
						<td>Sustainable dividends, lower volatility</td>
					</tr>
					<tr>
						<td><span class="badge badge-purple">Opportunistic</span></td>
						<td>0-10%</td>
						<td>Higher risk/reward, asymmetric upside</td>
					</tr>
				</tbody>
			</table>
		</div>
		{/if}
	</article>

	<!-- Position Sizing -->
	<article class="concept-section" id="position-sizing">
		<button class="accordion-header" onclick={() => toggleSection('position-sizing')}>
			<h3><i class="fat fa-sliders"></i> Position Sizing</h3>
			<i class="fat {expandedSections['position-sizing'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['position-sizing']}
		<div class="accordion-content">
			<p class="concept-intro">
				Position sizing determines portfolio risk more than security selection.
			</p>

			<h4>Concentration Guidelines</h4>
			<table>
				<thead>
					<tr>
						<th>Portfolio Size</th>
						<th>Suggested Positions</th>
						<th>Max Single Position</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>Under $50K</td><td>5-8</td><td>20%</td></tr>
					<tr><td>$50K-250K</td><td>8-12</td><td>15%</td></tr>
					<tr><td>$250K-1M</td><td>12-18</td><td>10%</td></tr>
					<tr><td>Over $1M</td><td>15-25</td><td>8%</td></tr>
				</tbody>
			</table>

			<h4>Sizing Factors</h4>
			<div class="focus-list">
				<div class="focus-item"><span class="badge badge-gray">1</span> <strong>Conviction level</strong> - Higher confidence, larger position</div>
				<div class="focus-item"><span class="badge badge-gray">2</span> <strong>Valuation</strong> - Better value, larger position</div>
				<div class="focus-item"><span class="badge badge-gray">3</span> <strong>Volatility</strong> - Higher volatility, smaller position</div>
				<div class="focus-item"><span class="badge badge-gray">4</span> <strong>Correlation</strong> - Similar holdings, smaller combined weight</div>
				<div class="focus-item"><span class="badge badge-gray">5</span> <strong>Liquidity</strong> - Less liquid, smaller position</div>
			</div>
		</div>
		{/if}
	</article>

	<!-- Risk Management -->
	<article class="concept-section" id="risk-management">
		<button class="accordion-header" onclick={() => toggleSection('risk-management')}>
			<h3><i class="fat fa-shield-halved"></i> Risk Management</h3>
			<i class="fat {expandedSections['risk-management'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['risk-management']}
		<div class="accordion-content">
			<p class="concept-intro">
				Managing downside risk preserves capital for future opportunities.
			</p>

			<h4>Diversification Benefits</h4>
			<table>
				<thead>
					<tr>
						<th>Positions</th>
						<th>Diversification Benefit</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>1</td><td>0%</td></tr>
					<tr><td>5</td><td>70%</td></tr>
					<tr><td>10</td><td>85%</td></tr>
					<tr><td>20</td><td>93%</td></tr>
					<tr><td>30+</td><td>95%+</td></tr>
				</tbody>
			</table>
			<p class="text-muted">Beyond 15-20 quality positions, additional diversification provides minimal benefit while increasing complexity.</p>
		</div>
		{/if}
	</article>
</section>
{/if}

<!-- Income Investing -->
{#if isVisible('income')}
<section class="education-category" id="income">
	<div class="category-header">
		<h2><i class="fat fa-coins"></i> Income Investing</h2>
		<span class="badge badge-amber">Income Investing</span>
	</div>

	<!-- Dividend Fundamentals -->
	<article class="concept-section" id="dividend-fundamentals">
		<button class="accordion-header" onclick={() => toggleSection('dividend-fundamentals')}>
			<h3><i class="fat fa-money-check-dollar"></i> Dividend Fundamentals</h3>
			<i class="fat {expandedSections['dividend-fundamentals'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['dividend-fundamentals']}
		<div class="accordion-content">
			<p class="concept-intro">
				Understanding dividend mechanics enables better income-focused investment decisions.
			</p>

			<h4>Dividend Timeline</h4>
			<div class="timeline-simple">
				<div class="timeline-step"><span class="badge badge-gray">1</span> <strong>Declaration Date</strong> - Board announces dividend</div>
				<div class="timeline-step"><span class="badge badge-gray">2</span> <strong>Ex-Dividend Date</strong> - First trading day without dividend right</div>
				<div class="timeline-step"><span class="badge badge-gray">3</span> <strong>Record Date</strong> - Ownership verification date</div>
				<div class="timeline-step"><span class="badge badge-gray">4</span> <strong>Payment Date</strong> - Cash distribution</div>
			</div>

			<h4>Yield Calculation</h4>
			<div class="formula-box">
				<code>Dividend Yield = (Annual Dividend per Share / Stock Price) x 100%</code>
			</div>
			<p class="text-muted">Yield moves inversely with stock price - high yields may signal distress rather than opportunity.</p>
		</div>
		{/if}
	</article>

	<!-- Yield Analysis -->
	<article class="concept-section" id="yield-analysis">
		<button class="accordion-header" onclick={() => toggleSection('yield-analysis')}>
			<h3><i class="fat fa-percent"></i> Yield Analysis</h3>
			<i class="fat {expandedSections['yield-analysis'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['yield-analysis']}
		<div class="accordion-content">
			<p class="concept-intro">
				Sustainable yields require underlying business quality.
			</p>

			<h4>Yield Sustainability Indicators</h4>
			<table>
				<thead>
					<tr>
						<th>Factor</th>
						<th>Sustainable</th>
						<th>Unsustainable</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>Payout Ratio</td><td>&lt; 60%</td><td>&gt; 80%</td></tr>
					<tr><td>FCF Coverage</td><td>&gt; 1.2x</td><td>&lt; 1.0x</td></tr>
					<tr><td>Debt Level</td><td>Moderate</td><td>Excessive</td></tr>
					<tr><td>Earnings Trend</td><td>Stable/Growing</td><td>Declining</td></tr>
				</tbody>
			</table>

			<div class="callout callout-info">
				<h5><i class="fat fa-chart-pie"></i> Historical Return Contribution</h5>
				<p>Long-term equity returns comprise approximately <strong>68% capital appreciation</strong> and <strong>32% dividend income</strong>. Both components matter.</p>
			</div>
		</div>
		{/if}
	</article>
</section>
{/if}

<!-- Capital Allocation -->
{#if isVisible('capital')}
<section class="education-category" id="capital">
	<div class="category-header">
		<h2><i class="fat fa-sitemap"></i> Capital Allocation</h2>
		<span class="badge badge-teal">Capital Allocation</span>
	</div>

	<!-- Management Decisions -->
	<article class="concept-section" id="management-decisions">
		<button class="accordion-header" onclick={() => toggleSection('management-decisions')}>
			<h3><i class="fat fa-briefcase"></i> Management Decisions</h3>
			<i class="fat {expandedSections['management-decisions'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['management-decisions']}
		<div class="accordion-content">
			<p class="concept-intro">
				How management deploys capital determines long-term shareholder value creation.
			</p>

			<h4>Capital Deployment Options</h4>
			<table>
				<thead>
					<tr>
						<th>Option</th>
						<th>Purpose</th>
						<th>Value Creation</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>Reinvestment</td><td>Organic growth</td><td>High ROIC projects</td></tr>
					<tr><td>Acquisitions</td><td>Inorganic growth</td><td>Strategic fit, fair price</td></tr>
					<tr><td>Dividends</td><td>Return cash</td><td>When reinvestment limited</td></tr>
					<tr><td>Buybacks</td><td>Return cash</td><td>When shares undervalued</td></tr>
					<tr><td>Debt Reduction</td><td>Strengthen balance sheet</td><td>Lower risk</td></tr>
				</tbody>
			</table>

			<div class="formula-box">
				<strong>Value Creation Rule:</strong>
				<code>ROIC &gt; Cost of Capital = Value Created</code>
			</div>
		</div>
		{/if}
	</article>

	<!-- Shareholder Returns -->
	<article class="concept-section" id="shareholder-returns">
		<button class="accordion-header" onclick={() => toggleSection('shareholder-returns')}>
			<h3><i class="fat fa-hand-holding-dollar"></i> Shareholder Returns (ROIC)</h3>
			<i class="fat {expandedSections['shareholder-returns'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['shareholder-returns']}
		<div class="accordion-content">
			<p class="concept-intro">
				Buybacks and dividends return capital when internal opportunities are limited.
			</p>

			<h4>Return on Invested Capital</h4>
			<div class="formula-box">
				<code>ROIC = Net Operating Profit After Tax / Invested Capital</code>
			</div>
			<table>
				<thead>
					<tr>
						<th>ROIC Level</th>
						<th>Quality Assessment</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>&gt; 20%</td><td><span class="badge badge-green">Exceptional</span></td></tr>
					<tr><td>15-20%</td><td><span class="badge badge-blue">Strong</span></td></tr>
					<tr><td>10-15%</td><td><span class="badge badge-amber">Adequate</span></td></tr>
					<tr><td>&lt; 10%</td><td><span class="badge badge-red">Below average</span></td></tr>
				</tbody>
			</table>
		</div>
		{/if}
	</article>
</section>
{/if}

<!-- Derivatives Overview -->
{#if isVisible('derivatives')}
<section class="education-category" id="derivatives">
	<div class="category-header">
		<h2><i class="fat fa-exchange"></i> Derivatives Overview</h2>
		<span class="badge badge-red">Derivatives</span>
	</div>

	<!-- Basics -->
	<article class="concept-section" id="derivatives-basics">
		<button class="accordion-header" onclick={() => toggleSection('derivatives-basics')}>
			<h3><i class="fat fa-file-contract"></i> Foundational Concepts</h3>
			<i class="fat {expandedSections['derivatives-basics'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['derivatives-basics']}
		<div class="accordion-content">
			<p class="concept-intro">
				Options provide tools for income generation, hedging, and strategic positioning.
			</p>

			<h4>Basic Definitions</h4>
			<div class="definition-grid">
				<div class="definition-item">
					<strong>Call Option</strong>
					<p>Right to purchase shares at specified price by expiration date.</p>
				</div>
				<div class="definition-item">
					<strong>Put Option</strong>
					<p>Right to sell shares at specified price by expiration date.</p>
				</div>
				<div class="definition-item">
					<strong>Premium</strong>
					<p>Price paid for the option contract.</p>
				</div>
				<div class="definition-item">
					<strong>Strike Price</strong>
					<p>Exercise price of the option.</p>
				</div>
			</div>

			<h4>Risk Profiles</h4>
			<table>
				<thead>
					<tr>
						<th>Strategy</th>
						<th>Max Loss</th>
						<th>Max Gain</th>
						<th>Outlook</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>Buy Call</td><td>Premium</td><td>Unlimited</td><td>Bullish</td></tr>
					<tr><td>Buy Put</td><td>Premium</td><td>Substantial</td><td>Bearish</td></tr>
					<tr><td>Sell Covered Call</td><td>Stock decline - premium</td><td>Premium + limited upside</td><td>Neutral/Mild Bull</td></tr>
					<tr><td>Sell Cash-Secured Put</td><td>Strike - premium</td><td>Premium</td><td>Bullish</td></tr>
				</tbody>
			</table>
		</div>
		{/if}
	</article>

	<!-- Strategies -->
	<article class="concept-section" id="derivatives-strategies">
		<button class="accordion-header" onclick={() => toggleSection('derivatives-strategies')}>
			<h3><i class="fat fa-cogs"></i> Strategy Applications</h3>
			<i class="fat {expandedSections['derivatives-strategies'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['derivatives-strategies']}
		<div class="accordion-content">
			<h4>Income Generation</h4>
			<div class="two-column-grid">
				<div class="info-card">
					<h5>Covered Call Writing</h5>
					<ul>
						<li>Own underlying shares</li>
						<li>Sell call options against position</li>
						<li>Collect premium income</li>
						<li>Cap upside at strike price</li>
					</ul>
					<p class="text-muted">Appropriate when: Neutral to mildly bullish.</p>
				</div>
				<div class="info-card">
					<h5>Cash-Secured Puts</h5>
					<ul>
						<li>Hold cash equal to potential purchase</li>
						<li>Sell put options</li>
						<li>Collect premium income</li>
						<li>Obligated to buy if assigned</li>
					</ul>
					<p class="text-muted">Appropriate when: Willing to buy at strike price.</p>
				</div>
			</div>

			<div class="callout callout-warning">
				<h5><i class="fat fa-graduation-cap"></i> Experience Requirement</h5>
				<p>Options strategies require solid understanding of underlying securities, risk tolerance assessment, position sizing discipline, and active monitoring capability. Consider substantial market experience before implementing.</p>
			</div>
		</div>
		{/if}
	</article>
</section>
{/if}

<!-- Wealth Building -->
{#if isVisible('wealth')}
<section class="education-category" id="wealth">
	<div class="category-header">
		<h2><i class="fat fa-piggy-bank"></i> Wealth Building</h2>
		<span class="badge badge-gray">Wealth Building</span>
	</div>

	<!-- Compounding -->
	<article class="concept-section" id="compounding">
		<button class="accordion-header" onclick={() => toggleSection('compounding')}>
			<h3><i class="fat fa-chart-area"></i> Compounding Principles</h3>
			<i class="fat {expandedSections['compounding'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['compounding']}
		<div class="accordion-content">
			<p class="concept-intro">
				Compound returns create exponential wealth growth over extended time horizons.
			</p>

			<h4>The Mathematics of Compounding</h4>
			<div class="formula-box">
				<code>Future Value = Present Value x (1 + r)^n</code>
				<p class="text-muted">Where r = annual return rate, n = number of years</p>
			</div>

			<table>
				<thead>
					<tr>
						<th>Years</th>
						<th>7% Annual</th>
						<th>10% Annual</th>
						<th>15% Annual</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>10</td><td>1.97x</td><td>2.59x</td><td>4.05x</td></tr>
					<tr><td>20</td><td>3.87x</td><td>6.73x</td><td>16.37x</td></tr>
					<tr><td>30</td><td>7.61x</td><td>17.45x</td><td>66.21x</td></tr>
				</tbody>
			</table>

			<div class="callout callout-info">
				<h5><i class="fat fa-hourglass-half"></i> The Patience Factor</h5>
				<ul>
					<li><strong>Short-term:</strong> Volatility dominates returns</li>
					<li><strong>Medium-term:</strong> Fundamentals begin driving outcomes</li>
					<li><strong>Long-term:</strong> Compounding creates substantial wealth</li>
				</ul>
			</div>
		</div>
		{/if}
	</article>

	<!-- Long-term Approach -->
	<article class="concept-section" id="long-term">
		<button class="accordion-header" onclick={() => toggleSection('long-term')}>
			<h3><i class="fat fa-hourglass-half"></i> Long-Term Approach</h3>
			<i class="fat {expandedSections['long-term'] ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
		</button>
		{#if expandedSections['long-term']}
		<div class="accordion-content">
			<p class="concept-intro">
				Successful long-term investing requires discipline across market cycles.
			</p>

			<h4>Investment Process Framework</h4>
			<div class="focus-list">
				<div class="focus-item"><span class="badge badge-gray">1</span> <strong>Identify Quality</strong> - Strong businesses with competitive advantages</div>
				<div class="focus-item"><span class="badge badge-gray">2</span> <strong>Assess Valuation</strong> - Reasonable price relative to value</div>
				<div class="focus-item"><span class="badge badge-gray">3</span> <strong>Size Appropriately</strong> - Position size reflecting conviction and risk</div>
				<div class="focus-item"><span class="badge badge-gray">4</span> <strong>Monitor Fundamentals</strong> - Ongoing business quality assessment</div>
				<div class="focus-item"><span class="badge badge-gray">5</span> <strong>Maintain Discipline</strong> - Avoid emotional decision-making</div>
			</div>

			<h4>Common Behavioral Pitfalls</h4>
			<table>
				<thead>
					<tr>
						<th>Bias</th>
						<th>Description</th>
						<th>Countermeasure</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>Recency</td><td>Overweighting recent events</td><td>Long-term data analysis</td></tr>
					<tr><td>Anchoring</td><td>Fixating on purchase price</td><td>Focus on current value</td></tr>
					<tr><td>Herding</td><td>Following crowd behavior</td><td>Independent analysis</td></tr>
					<tr><td>Overconfidence</td><td>Excessive conviction</td><td>Position size limits</td></tr>
					<tr><td>Loss Aversion</td><td>Reluctance to realize losses</td><td>Pre-defined exit criteria</td></tr>
				</tbody>
			</table>
		</div>
		{/if}
	</article>
</section>
{/if}

<!-- Summary Section -->
<section class="education-category" id="summary">
	<div class="section-box mt-3">
		<h3><i class="fat fa-bookmark"></i> Summary</h3>
		<table>
			<thead>
				<tr>
					<th>Domain</th>
					<th>Key Principles</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><a href="#financial-analysis" class="badge badge-blue">Financial Analysis</a></td>
					<td>Balance sheet reveals position; Income statement shows profitability; Cash flow confirms earnings quality</td>
				</tr>
				<tr>
					<td><a href="#business-quality" class="badge badge-purple">Business Quality</a></td>
					<td>Competitive advantages create durability; Margins reflect economics; Strategic position drives opportunity</td>
				</tr>
				<tr>
					<td><a href="#valuation" class="badge badge-green">Valuation</a></td>
					<td>Context matters more than absolute numbers; Growth deserves premium with limits</td>
				</tr>
				<tr>
					<td><a href="#portfolio" class="badge badge-cyan">Portfolio</a></td>
					<td>Diversification reduces risk; Concentration enables outperformance; Balance depends on objectives</td>
				</tr>
				<tr>
					<td><a href="#capital" class="badge badge-teal">Capital Allocation</a></td>
					<td>ROIC determines reinvestment value; Management quality matters</td>
				</tr>
				<tr>
					<td><a href="#wealth" class="badge badge-gray">Wealth Building</a></td>
					<td>Compounding requires time; Discipline enables consistency; Continuous learning improves outcomes</td>
				</tr>
			</tbody>
		</table>
	</div>

	<p class="disclaimer">
		<i class="fat fa-circle-info"></i>
		This educational content synthesizes fundamental investment principles for informational purposes. Investment decisions should consider individual circumstances, risk tolerance, and professional advice where appropriate.
	</p>
</section>

<style>
	.filter-box {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.filter-box h3 {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.filter-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.category-filter-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 500;
		padding: 0.35rem 0.75rem;
		border-radius: 3px;
		border: 1px solid;
		cursor: pointer;
		transition: all 0.15s ease;
		background: transparent;
	}

	.category-filter-btn:hover {
		transform: translateY(-1px);
	}

	.category-filter-btn.active {
		box-shadow: inset 0 0 0 2px var(--color-border-dark);
	}

	.clear-filters-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		padding: 0.35rem 0.75rem;
		margin-top: 0.75rem;
		border: 1px solid var(--color-border);
		background: var(--color-bg);
		cursor: pointer;
	}

	.education-category {
		margin-bottom: 2rem;
	}

	.category-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid var(--color-border-dark);
	}

	.category-header h2 {
		margin: 0;
	}

	.concept-section {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		margin-bottom: 0.75rem;
	}

	.accordion-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		background: transparent;
		cursor: pointer;
		text-align: left;
	}

	.accordion-header:hover {
		background: var(--color-hover-bg);
	}

	.accordion-header h3 {
		margin: 0;
		font-size: 1rem;
	}

	.accordion-content {
		padding: 0 1rem 1rem 1rem;
	}

	.concept-intro {
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--color-text);
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: var(--color-bg);
		border-left: 3px solid var(--color-border-dark);
	}

	.formula-box {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		padding: 1rem;
		margin: 1rem 0;
		font-family: var(--font-mono);
	}

	.formula-box code {
		font-size: 0.9rem;
	}

	.two-column-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin: 1rem 0;
	}

	.three-column-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin: 1rem 0;
	}

	@media (max-width: 768px) {
		.two-column-grid,
		.three-column-grid {
			grid-template-columns: 1fr;
		}
	}

	.info-card {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		padding: 1rem;
	}

	.info-card h5 {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
	}

	.info-card ul {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.8rem;
	}

	.info-card li {
		margin-bottom: 0.35rem;
	}

	.moat-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		margin: 1rem 0;
	}

	@media (max-width: 900px) {
		.moat-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 600px) {
		.moat-grid {
			grid-template-columns: 1fr;
		}
	}

	.moat-card {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		padding: 0.75rem;
	}

	.moat-card p {
		font-size: 0.8rem;
		margin: 0.5rem 0 0 0;
		color: var(--color-text-muted);
	}

	.focus-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 1rem 0;
	}

	.focus-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.875rem;
	}

	.timeline-simple {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 1rem 0;
	}

	.timeline-step {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.875rem;
	}

	.definition-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin: 1rem 0;
	}

	@media (max-width: 600px) {
		.definition-grid {
			grid-template-columns: 1fr;
		}
	}

	.definition-item {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		padding: 0.75rem;
	}

	.definition-item strong {
		display: block;
		margin-bottom: 0.25rem;
	}

	.definition-item p {
		font-size: 0.8rem;
		margin: 0;
		color: var(--color-text-muted);
	}

	.badge-edu-ratio {
		background: #e8f4fd;
		color: #1565c0;
		border: 1px solid #1565c0;
	}

	.badge-edu-metric {
		background: #e8f5e9;
		color: #2e7d32;
		border: 1px solid #2e7d32;
	}

	.code-block {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		padding: 0.75rem 1rem;
		font-family: var(--font-mono);
		overflow-x: auto;
	}

	.code-block pre {
		margin: 0;
		white-space: pre;
	}

	h4 {
		font-family: var(--font-mono);
		font-size: 0.9rem;
		font-weight: 600;
		margin: 1.25rem 0 0.75rem 0;
		color: var(--color-text);
	}

	.disclaimer {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		font-style: italic;
		margin-top: 1.5rem;
		padding: 1rem;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
	}
</style>
