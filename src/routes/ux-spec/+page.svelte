<script lang="ts">
	// Track expanded state for each section - all expanded by default
	let expandedSections = $state({
		philosophy: true,
		colors: true,
		typography: true,
		badges: true,
		components: true,
		layout: true
	});

	function toggleSection(id: string) {
		expandedSections[id as keyof typeof expandedSections] = !expandedSections[id as keyof typeof expandedSections];
	}

	function expandAll() {
		Object.keys(expandedSections).forEach(key => {
			expandedSections[key as keyof typeof expandedSections] = true;
		});
	}

	function collapseAll() {
		Object.keys(expandedSections).forEach(key => {
			expandedSections[key as keyof typeof expandedSections] = false;
		});
	}

	// Primary category colors from UX spec
	const primaryColors = [
		{ id: 'green-1', name: 'Success', bg: '#d4edda', border: '#28a745', text: '#28a745' },
		{ id: 'blue-1', name: 'Information', bg: '#cce5ff', border: '#007bff', text: '#007bff' },
		{ id: 'yellow-1', name: 'Warning', bg: '#fff3cd', border: '#ffc107', text: '#856404' },
		{ id: 'cyan-1', name: 'Secondary Info', bg: '#cce5ff', border: '#17a2b8', text: '#17a2b8' },
		{ id: 'teal-1', name: 'Alternate Positive', bg: '#d4edda', border: '#20c997', text: '#20c997' },
		{ id: 'red-1', name: 'Error', bg: '#f8d7da', border: '#dc3545', text: '#dc3545' },
		{ id: 'gray-1', name: 'Neutral', bg: '#e2e3e5', border: '#6c757d', text: '#6c757d' },
		{ id: 'purple-1', name: 'Special', bg: '#e8d5f0', border: '#9c27b0', text: '#9c27b0' }
	];

	// CSS variable colors
	const cssVariables = [
		{ name: '--color-bg', light: '#fafafa', dark: '#0a0a0a', purpose: 'Main background' },
		{ name: '--color-bg-secondary', light: '#ffffff', dark: '#1a1a1a', purpose: 'Card backgrounds' },
		{ name: '--color-text', light: '#111111', dark: '#e5e5e5', purpose: 'Primary text' },
		{ name: '--color-text-muted', light: '#666666', dark: '#a0a0a0', purpose: 'Secondary text' },
		{ name: '--color-link', light: '#0066cc', dark: '#5c9fd8', purpose: 'Links' },
		{ name: '--color-border', light: '#e5e5e5', dark: '#2a2a2a', purpose: 'Standard borders' },
		{ name: '--color-border-dark', light: '#000000', dark: '#e5e5e5', purpose: 'Accent borders' }
	];
</script>

<svelte:head>
	<title>UX Specification | Historical Stock Data</title>
</svelte:head>

<a href="/" class="back-link">
	<i class="fat fa-arrow-left"></i> Back to Home
</a>

<h1><i class="fat fa-palette"></i> UX Specification</h1>

<div class="header-row">
	<div class="flex-row">
		<span class="badge badge-blue">v3.0</span>
		<span class="badge badge-green">Neo-Brutalist</span>
		<span class="badge badge-purple">Terminal Aesthetic</span>
	</div>
	<div class="toggle-all-buttons">
		<button class="toggle-all-btn" onclick={expandAll}>
			<i class="fat fa-angles-down"></i> Expand All
		</button>
		<button class="toggle-all-btn" onclick={collapseAll}>
			<i class="fat fa-angles-up"></i> Collapse All
		</button>
	</div>
</div>

<div class="description-box">
	<p>
		This specification provides precise, unambiguous styling rules for all UI components.
		Follow these patterns exactly to ensure visual consistency across all generated pages.
	</p>
</div>

<!-- Design Philosophy -->
<section class="accordion-section">
	<button class="accordion-header" onclick={() => toggleSection('philosophy')}>
		<h2><i class="fat fa-lightbulb"></i> Design Philosophy</h2>
		<i class="fat {expandedSections.philosophy ? 'fa-chevron-up' : 'fa-chevron-down'} accordion-toggle"></i>
	</button>
	{#if expandedSections.philosophy}
	<div class="accordion-content">
	<div class="section-box">
		<h3>Core Principles</h3>
		<table>
			<tbody>
				<tr>
					<td><strong>Terminal Aesthetic</strong></td>
					<td>Monospace-first typography, minimal border-radius on containers</td>
				</tr>
				<tr>
					<td><strong>Information Density</strong></td>
					<td>Compact layouts, timeline-based navigation with sticky markers</td>
				</tr>
				<tr>
					<td><strong>Neo-Brutalist</strong></td>
					<td>Hard offset shadows (2-3px), 1px borders, 4px accent borders</td>
				</tr>
				<tr>
					<td><strong>Categorical Color</strong></td>
					<td>Same color = same category everywhere, never mix meanings</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="callout callout-warning">
		<h4><i class="fat fa-triangle-exclamation"></i> Critical Rules</h4>
		<ul>
			<li><strong>NO border-radius on containers</strong> - Cards, boxes, sections use <code>border-radius: 0</code> or max <code>5px</code></li>
			<li><strong>Hard shadows only</strong> - <code>box-shadow: 2px 2px 0px</code>, never blurred</li>
			<li><strong>Color in content only</strong> - Badges and values get color; containers stay neutral</li>
		</ul>
	</div>
	</div>
	{/if}
</section>

<!-- Color System -->
<section class="accordion-section">
	<button class="accordion-header" onclick={() => toggleSection('colors')}>
		<h2><i class="fat fa-palette"></i> Color System</h2>
		<i class="fat {expandedSections.colors ? 'fa-chevron-up' : 'fa-chevron-down'} accordion-toggle"></i>
	</button>
	{#if expandedSections.colors}
	<div class="accordion-content">

	<div class="section-box">
		<h3>CSS Variables</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">Theme-aware colors that automatically switch between light and dark modes.</p>

		<table>
			<thead>
				<tr>
					<th>Variable</th>
					<th>Light</th>
					<th>Dark</th>
					<th>Purpose</th>
				</tr>
			</thead>
			<tbody>
				{#each cssVariables as variable}
					<tr>
						<td><code>{variable.name}</code></td>
						<td>
							<div class="color-swatch-inline">
								<span class="swatch" style="background: {variable.light};"></span>
								<code>{variable.light}</code>
							</div>
						</td>
						<td>
							<div class="color-swatch-inline">
								<span class="swatch" style="background: {variable.dark};"></span>
								<code>{variable.dark}</code>
							</div>
						</td>
						<td class="text-muted">{variable.purpose}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="section-box mt-2">
		<h3>Primary Category Colors</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">Used for badges, status indicators, and categorical labeling.</p>

		<div class="color-grid">
			{#each primaryColors as color}
				<div class="color-card">
					<div class="color-preview" style="background: {color.bg}; border-color: {color.border};">
						<span style="color: {color.text};">{color.name}</span>
					</div>
					<div class="color-details">
						<div><span class="text-muted">ID:</span> {color.id}</div>
						<div><span class="text-muted">BG:</span> <code>{color.bg}</code></div>
						<div><span class="text-muted">Border:</span> <code>{color.border}</code></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
	</div>
	{/if}
</section>

<!-- Typography -->
<section class="accordion-section">
	<button class="accordion-header" onclick={() => toggleSection('typography')}>
		<h2><i class="fat fa-font"></i> Typography</h2>
		<i class="fat {expandedSections.typography ? 'fa-chevron-up' : 'fa-chevron-down'} accordion-toggle"></i>
	</button>
	{#if expandedSections.typography}
	<div class="accordion-content">

	<div class="section-box">
		<h3>Font Families</h3>
		<table>
			<thead>
				<tr>
					<th>Variable</th>
					<th>Stack</th>
					<th>Usage</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>--font-mono</code></td>
					<td style="font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;">ui-monospace, Cascadia Code, Menlo</td>
					<td>All text including headings, body, badges, tables</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="section-box mt-2">
		<h3>Type Scale</h3>
		<div class="type-samples">
			<div class="type-sample">
				<h1 style="margin: 0; font-family: var(--font-mono);">Page Title (h1)</h1>
				<span class="text-muted">font-size: 2rem | font-weight: 600 | font-family: mono</span>
			</div>
			<div class="type-sample">
				<h2 style="margin: 0;"><i class="fat fa-cube"></i> Section Heading (h2)</h2>
				<span class="text-muted">font-size: 1.5rem | font-weight: 600 | font-family: mono</span>
			</div>
			<div class="type-sample">
				<h3 style="margin: 0;">Subsection (h3)</h3>
				<span class="text-muted">font-size: 1rem | font-weight: 600 | font-family: mono</span>
			</div>
			<div class="type-sample">
				<p style="margin: 0;">Body text uses monospace for a terminal aesthetic with 14px base size.</p>
				<span class="text-muted">font-size: 14px | font-weight: 400 | font-family: mono</span>
			</div>
			<div class="type-sample">
				<span class="badge badge-blue">Badge Text</span>
				<span class="text-muted" style="margin-left: 1rem;">font-size: 0.65-0.7rem | font-weight: 500</span>
			</div>
		</div>
	</div>
	</div>
	{/if}
</section>

<!-- Badge System -->
<section class="accordion-section">
	<button class="accordion-header" onclick={() => toggleSection('badges')}>
		<h2><i class="fat fa-tag"></i> Badge System</h2>
		<i class="fat {expandedSections.badges ? 'fa-chevron-up' : 'fa-chevron-down'} accordion-toggle"></i>
	</button>
	{#if expandedSections.badges}
	<div class="accordion-content">

	<div class="callout callout-info">
		<p><strong>Shape Rules:</strong> Category badges use <code>border-radius: 9999px</code>. Document type badges use <code>border-radius: 3px</code>.</p>
	</div>

	<div class="section-box">
		<h3>Primary Badges</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">Used for main groupings and primary classifications. Prefer colored badges for categorical distinction; reserve black/white only for binary states (yes/no, on/off).</p>

		<div class="badge-showcase">
			<span class="badge badge-green">Success</span>
			<span class="badge badge-blue">Information</span>
			<span class="badge badge-amber">Warning</span>
			<span class="badge badge-cyan">Secondary</span>
			<span class="badge badge-teal">Positive</span>
			<span class="badge badge-red">Error</span>
			<span class="badge badge-gray">Neutral</span>
			<span class="badge badge-purple">Special</span>
		</div>

		<div class="code-block">
			<code>&lt;span class="badge badge-green"&gt;Success&lt;/span&gt;</code>
		</div>
	</div>

	<div class="section-box mt-2">
		<h3>Document Type Badges (Rectangular)</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">Used for file types, format indicators, type codes. Border-radius: 3px.</p>

		<div class="badge-showcase">
			<span class="doc-badge">PDF</span>
			<span class="doc-badge">JSON</span>
			<span class="doc-badge">CSV</span>
			<span class="doc-badge important">10-K</span>
		</div>
	</div>

	<div class="section-box mt-2">
		<h3>Tag Chips (Outline Style)</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">Used for keywords, hashtags, search terms. Border-radius: 3px.</p>

		<div class="badge-showcase">
			<span class="tag-chip">keyword</span>
			<span class="tag-chip">search-term</span>
			<span class="tag-chip">hashtag</span>
		</div>
	</div>
	</div>
	{/if}
</section>

<!-- Components -->
<section class="accordion-section">
	<button class="accordion-header" onclick={() => toggleSection('components')}>
		<h2><i class="fat fa-cube"></i> Components</h2>
		<i class="fat {expandedSections.components ? 'fa-chevron-up' : 'fa-chevron-down'} accordion-toggle"></i>
	</button>
	{#if expandedSections.components}
	<div class="accordion-content">

	<div class="section-box">
		<h3>Section Box</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">Standard container with 1px border and hover shadow effect.</p>

		<div class="section-box" style="margin: 1rem 0;">
			<p>This is a section box. Hover to see the shadow effect.</p>
		</div>

		<div class="code-block">
			<code>.section-box {'{'} border: 1px solid var(--color-border); box-shadow: 2px 2px 0px on hover {'}'}</code>
		</div>
	</div>

	<div class="section-box mt-2">
		<h3>Callout Boxes</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">Used for important information, warnings, and tips.</p>

		<div class="callout callout-info" style="margin: 1rem 0;">
			<p><i class="fat fa-circle-info"></i> <strong>Info:</strong> This is an informational callout.</p>
		</div>

		<div class="callout callout-warning" style="margin: 1rem 0;">
			<p><i class="fat fa-triangle-exclamation"></i> <strong>Warning:</strong> This is a warning callout.</p>
		</div>

		<div class="callout callout-danger" style="margin: 1rem 0;">
			<p><i class="fat fa-circle-xmark"></i> <strong>Danger:</strong> This is a danger callout.</p>
		</div>
	</div>

	<div class="section-box mt-2">
		<h3>Stats Cards</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">Used for displaying key metrics and statistics. Always display a minimum of 6 data points for visual balance and information density.</p>

		<div class="stats-grid" style="margin: 1rem 0;">
			<div class="section-box stats-card">
				<div class="stat-number" style="color: var(--color-accent-green);">$1.234</div>
				<div class="stat-label">Peak Price</div>
			</div>
			<div class="section-box stats-card">
				<div class="stat-number">$0.012</div>
				<div class="stat-label">Low Price</div>
			</div>
			<div class="section-box stats-card">
				<div class="stat-number">1,234</div>
				<div class="stat-label">Trading Days</div>
			</div>
			<div class="section-box stats-card">
				<div class="stat-number">45.2M</div>
				<div class="stat-label">Total Volume</div>
			</div>
			<div class="section-box stats-card">
				<div class="stat-number">$2.4M</div>
				<div class="stat-label">Dollar Volume</div>
			</div>
			<div class="section-box stats-card">
				<div class="stat-number" style="color: var(--color-accent-red);">-15.2%</div>
				<div class="stat-label">Change</div>
			</div>
		</div>
	</div>

	<div class="section-box mt-2">
		<h3>Tooltips / Help Icons</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">Use the info circle icon <i class="fat fa-circle-info" style="color: var(--color-text-muted);"></i> to provide contextual help, definitions, or additional guidance. Tooltips should appear on hover.</p>

		<div style="margin: 1rem 0;">
			<p>
				<strong>Section Label</strong>
				<span class="tooltip-trigger" title="This tooltip explains what the section contains or how to use it.">
					<i class="fat fa-circle-info"></i>
				</span>
			</p>
			<p class="text-muted" style="font-size: 0.8rem;">Hover over the info icon to see the tooltip.</p>
		</div>

		<div class="code-block">
			<code>&lt;span class="tooltip-trigger" title="Help text here"&gt;&lt;i class="fat fa-circle-info"&gt;&lt;/i&gt;&lt;/span&gt;</code>
		</div>
	</div>

	<div class="section-box mt-2">
		<h3>Buttons</h3>
		<div class="flex-row" style="margin: 1rem 0;">
			<button class="button">Default Button</button>
			<button class="button button-primary">Primary Button</button>
			<button class="button"><i class="fat fa-download"></i> With Icon</button>
		</div>
	</div>

	<div class="section-box mt-2">
		<h3>Card Link Indicators</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">For clickable cards, use a subtle link icon positioned at bottom-right. The icon highlights blue on hover. Do not use text like "Click to view..." - the icon alone is sufficient.</p>

		<div class="section-box featured-demo" style="position: relative; padding-bottom: 2.5rem;">
			<div class="header-row">
				<h4 style="margin: 0;">Example Card</h4>
				<span class="badge badge-blue">Sample</span>
			</div>
			<p class="text-muted" style="font-size: 0.875rem; margin-top: 0.5rem;">Card content goes here with relevant data.</p>
			<div class="card-link-indicator">
				<i class="fat fa-arrow-up-right-from-square"></i>
			</div>
		</div>

		<div class="code-block" style="margin-top: 1rem;">
			<code>.card-link-indicator {'{'} position: absolute; bottom: 0.75rem; right: 0.75rem; {'}'}</code>
		</div>
	</div>

	<div class="section-box mt-2" id="back-link-demo">
		<h3>Back Links</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">Consistent navigation pattern at the top of detail pages.</p>

		<a href="#back-link-demo" class="back-link">
			<i class="fat fa-arrow-left"></i> Back to Previous
		</a>

		<div class="code-block" style="margin-top: 1rem;">
			<code>&lt;a href="/" class="back-link"&gt;&lt;i class="fat fa-arrow-left"&gt;&lt;/i&gt; Back to Home&lt;/a&gt;</code>
		</div>
	</div>

	<div class="section-box mt-2">
		<h3>Dense Information Cards</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">Entity cards with header row, description, and embedded 2x2 metric grid for compact data display.</p>

		<div class="section-box featured-demo" style="position: relative; padding-bottom: 2.5rem;">
			<div class="header-row">
				<h4 style="margin: 0;">TICKER</h4>
				<span class="badge badge-blue">0001234567</span>
			</div>
			<div class="text-muted" style="font-size: 0.875rem; margin-top: 0.5rem;">
				Company Name Here
			</div>
			<div class="dense-grid" style="margin-top: 1rem;">
				<div>
					<div class="text-muted" style="font-size: 0.65rem; text-transform: uppercase;">Trading Days</div>
					<div style="font-weight: 600;">1,234</div>
				</div>
				<div>
					<div class="text-muted" style="font-size: 0.65rem; text-transform: uppercase;">Peak Price</div>
					<div style="font-weight: 600; color: var(--color-accent-green);">$1.2345</div>
				</div>
				<div>
					<div class="text-muted" style="font-size: 0.65rem; text-transform: uppercase;">Total Volume</div>
					<div style="font-weight: 600;">45,000,000</div>
				</div>
				<div>
					<div class="text-muted" style="font-size: 0.65rem; text-transform: uppercase;">Date Range</div>
					<div style="font-weight: 600; font-size: 0.75rem;">2001-01-01</div>
				</div>
			</div>
			<div class="card-link-indicator">
				<i class="fat fa-arrow-up-right-from-square"></i>
			</div>
		</div>

		<div class="code-block" style="margin-top: 1rem;">
			<code>.dense-grid {'{'} display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; {'}'}</code>
		</div>
	</div>

	<div class="section-box mt-2">
		<h3>Command/Reference Tables</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">Tables displaying code commands with descriptions. Use <code>&lt;code&gt;</code> for commands and plain text for descriptions.</p>

		<table style="margin: 1rem 0;">
			<thead>
				<tr>
					<th>Command</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>bun run dev</code></td>
					<td>Start development server</td>
				</tr>
				<tr>
					<td><code>bun run build</code></td>
					<td>Build for production</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="section-box mt-2">
		<h3>Treemap Visualizations</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">Used for showing hierarchical data with proportional sizing. Cell size represents relative value (volume, count, etc.). Uses primary category colors.</p>

		<div class="treemap-demo">
			<div class="treemap-cell treemap-cell-large" style="flex: 3; background: #d4edda;">
				<span class="treemap-label">LATI</span>
				<span class="treemap-value">Vol: 45.2M</span>
				<span class="treemap-value">Days: 1,234</span>
				<span class="treemap-value">Peak: $0.0850</span>
				<span class="treemap-value treemap-company">Legal Access Technologies Inc</span>
			</div>
			<div style="flex: 2; display: flex; flex-direction: column; gap: 4px;">
				<div class="treemap-cell" style="flex: 1; background: #cce5ff;">
					<span class="treemap-label">DAVI</span>
					<span class="treemap-value">Vol: 12.1M</span>
				</div>
				<div style="flex: 1; display: flex; gap: 4px;">
					<div class="treemap-cell treemap-cell-small" style="flex: 1; background: #e8d5f0;">
						<span class="treemap-label">LVGI</span>
					</div>
					<div class="treemap-cell treemap-cell-small" style="flex: 0.8; background: #fff3cd;">
						<span class="treemap-label">DAVN</span>
					</div>
				</div>
			</div>
		</div>

		<h4 style="margin-top: 1.5rem;">Cell Size Categories</h4>

		<div class="treemap-examples">
			<div class="treemap-example">
				<span class="badge badge-green">Large Cell</span>
				<div class="treemap-cell-example" style="background: #d4edda; height: 110px; width: 140px;">
					<span class="treemap-label">TICKER</span>
					<span class="treemap-value">Vol: 45.2M</span>
					<span class="treemap-value">Days: 1,234</span>
					<span class="treemap-value">Peak: $0.0850</span>
					<span class="treemap-value treemap-company">Company Name</span>
				</div>
				<p class="text-muted" style="font-size: 0.7rem; margin-top: 0.5rem;">w &gt; 140px, h &gt; 110px</p>
			</div>

			<div class="treemap-example">
				<span class="badge badge-blue">Medium Cell</span>
				<div class="treemap-cell-example" style="background: #cce5ff; height: 70px; width: 90px;">
					<span class="treemap-label">TICKER</span>
					<span class="treemap-value">Vol: 12.1M</span>
					<span class="treemap-value">Days: 567</span>
				</div>
				<p class="text-muted" style="font-size: 0.7rem; margin-top: 0.5rem;">w &gt; 90px, h &gt; 70px</p>
			</div>

			<div class="treemap-example">
				<span class="badge badge-purple">Small Cell</span>
				<div class="treemap-cell-example" style="background: #e8d5f0; height: 50px; width: 70px;">
					<span class="treemap-label">TICKER</span>
					<span class="treemap-value">Vol: 8.4M</span>
				</div>
				<p class="text-muted" style="font-size: 0.7rem; margin-top: 0.5rem;">w &gt; 70px, h &gt; 50px</p>
			</div>

			<div class="treemap-example">
				<span class="badge badge-amber">Minimal Cell</span>
				<div class="treemap-cell-example" style="background: #fff3cd; height: 28px; width: 55px;">
					<span class="treemap-label">DAVN</span>
				</div>
				<p class="text-muted" style="font-size: 0.7rem; margin-top: 0.5rem;">Ticker only + tooltip</p>
			</div>
		</div>

		<table style="margin-top: 1.5rem;">
			<thead>
				<tr>
					<th>Property</th>
					<th>Value</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><strong>Inner padding</strong></td>
					<td><code>paddingInner: 4</code> between cells</td>
				</tr>
				<tr>
					<td><strong>Outer padding</strong></td>
					<td><code>paddingOuter: 2</code> around edges</td>
				</tr>
				<tr>
					<td><strong>Hover effect</strong></td>
					<td><code>opacity: 0.8</code> on hover</td>
				</tr>
				<tr>
					<td><strong>Text color</strong></td>
					<td>Black (<code>#000000</code>) on primary category backgrounds</td>
				</tr>
				<tr>
					<td><strong>Company name</strong></td>
					<td>Full name, no truncation</td>
				</tr>
				<tr>
					<td><strong>Click action</strong></td>
					<td>Navigate to entity detail page</td>
				</tr>
				<tr>
					<td><strong>Tooltips</strong></td>
					<td>Full details: name, CIK, volume, days, peak price</td>
				</tr>
			</tbody>
		</table>

		<div class="code-block" style="margin-top: 1rem;">
			<code>d3.treemap().size([width, height]).paddingInner(4).paddingOuter(2).round(true)</code>
		</div>
	</div>
	</div>
	{/if}
</section>

<!-- Layout -->
<section class="accordion-section">
	<button class="accordion-header" onclick={() => toggleSection('layout')}>
		<h2><i class="fat fa-table-columns"></i> Layout Patterns</h2>
		<i class="fat {expandedSections.layout ? 'fa-chevron-up' : 'fa-chevron-down'} accordion-toggle"></i>
	</button>
	{#if expandedSections.layout}
	<div class="accordion-content">

	<div class="section-box">
		<h3>Page Container</h3>
		<table>
			<tbody>
				<tr>
					<td><code>.container</code></td>
					<td>max-width: 900px</td>
					<td>Standard content width</td>
				</tr>
				<tr>
					<td><code>.container.wide</code></td>
					<td>max-width: 1200px</td>
					<td>Wide layouts, visualizations</td>
				</tr>
				<tr>
					<td><code>.container.narrow</code></td>
					<td>max-width: 750px</td>
					<td>Reading-focused content</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="section-box mt-2">
		<h3>Card Grid</h3>
		<p class="text-muted" style="margin-bottom: 1rem;">Auto-fit responsive grid for cards.</p>

		<div class="code-block">
			<code>grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))</code>
		</div>
	</div>

	<div class="section-box mt-2">
		<h3>Spacing</h3>
		<table>
			<tbody>
				<tr>
					<td><code>gap: 1rem</code></td>
					<td>Standard spacing between elements</td>
				</tr>
				<tr>
					<td><code>padding: 1rem 1.25rem</code></td>
					<td>Card internal padding</td>
				</tr>
				<tr>
					<td><code>margin-bottom: 1.5rem</code></td>
					<td>Section spacing</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="section-box mt-2">
		<h3>Responsive Breakpoints</h3>
		<table>
			<thead>
				<tr>
					<th>Breakpoint</th>
					<th>Width</th>
					<th>Target</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Mobile</td>
					<td>&lt; 640px</td>
					<td>Phones</td>
				</tr>
				<tr>
					<td>Tablet</td>
					<td>640-1024px</td>
					<td>Tablets</td>
				</tr>
				<tr>
					<td>Desktop</td>
					<td>&gt; 1024px</td>
					<td>Desktop</td>
				</tr>
			</tbody>
		</table>
	</div>
	</div>
	{/if}
</section>

<style>
	/* Accordion Styles */
	.accordion-section {
		margin-bottom: 0.5rem;
		border: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
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
		transition: background 0.15s ease;
	}

	.accordion-header:hover {
		background: var(--color-hover-bg);
	}

	.accordion-header h2 {
		margin: 0;
		font-size: 1.25rem;
	}

	.accordion-toggle {
		font-size: 1rem;
		color: var(--color-text-muted);
		transition: transform 0.2s ease;
	}

	.accordion-content {
		padding: 0 1rem 1rem 1rem;
	}

	/* Header Row with badges and toggle buttons */
	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.toggle-all-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.toggle-all-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		padding: 0.35rem 0.75rem;
		border: 1px solid var(--color-border);
		background: var(--color-bg);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.toggle-all-btn:hover {
		border-color: var(--color-border-dark);
		color: var(--color-text);
		box-shadow: 1px 1px 0px var(--color-shadow);
	}

	.description-box {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		padding: 1rem 1.25rem;
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.color-card {
		border: 1px solid var(--color-border);
	}

	.color-preview {
		padding: 1rem;
		text-align: center;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		font-weight: 600;
		border: 2px solid;
	}

	.color-details {
		padding: 0.5rem;
		font-size: 0.7rem;
		background: var(--color-bg-secondary);
	}

	.color-details div {
		margin-bottom: 0.25rem;
	}

	.color-swatch-inline {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.swatch {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 1px solid var(--color-border);
	}

	.type-samples {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.type-sample {
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.type-sample:last-child {
		border-bottom: none;
	}

	.badge-showcase {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.doc-badge {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 500;
		padding: 0.15rem 0.4rem;
		border-radius: 3px;
		border: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
		color: var(--color-text);
	}

	.doc-badge.important::after {
		content: '';
		display: inline-block;
		width: 8px;
		height: 8px;
		margin-left: 0.25rem;
		background: #ffc107;
		border-radius: 50%;
	}

	.tag-chip {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 400;
		padding: 0.2rem 0.5rem;
		border-radius: 3px;
		border: 1px solid var(--color-border-dark);
		background: transparent;
		color: var(--color-text);
		cursor: pointer;
	}

	.tag-chip:hover {
		background: var(--color-hover-bg);
	}

	.code-block {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		padding: 0.75rem 1rem;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		overflow-x: auto;
	}

	.button-primary {
		background: var(--color-border-dark);
		color: var(--color-bg);
	}

	.callout-danger {
		border-left-color: #dc3545;
		background: rgba(220, 53, 69, 0.1);
	}

	.mt-1 {
		margin-top: 0.5rem;
	}

	.mt-2 {
		margin-top: 1rem;
	}

	h3 {
		font-family: var(--font-mono);
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	h4 {
		font-family: var(--font-mono);
		font-size: 0.9rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	ul {
		margin: 0;
		padding-left: 1.5rem;
	}

	li {
		margin-bottom: 0.5rem;
	}

	/* Stats Grid - 6 columns minimum */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 0.75rem;
	}

	@media (max-width: 900px) {
		.stats-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (max-width: 500px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Tooltip trigger */
	.tooltip-trigger {
		color: var(--color-text-muted);
		cursor: help;
		margin-left: 0.35rem;
	}

	.tooltip-trigger:hover {
		color: var(--color-link);
	}

	/* Card Link Indicator */
	.card-link-indicator {
		position: absolute;
		bottom: 0.75rem;
		right: 0.75rem;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		transition: color 0.15s ease;
	}

	.card-link-indicator:hover,
	.featured-demo:hover .card-link-indicator {
		color: var(--color-link);
	}

	.featured-demo {
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.featured-demo:hover {
		border-color: var(--color-border-dark);
		box-shadow: 2px 2px 0px var(--color-shadow);
	}

	/* Dense Grid for card metrics */
	.dense-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	/* Treemap Demo */
	.treemap-demo {
		display: flex;
		gap: 4px;
		height: 180px;
		margin-bottom: 1rem;
	}

	.treemap-cell {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		padding: 8px 10px;
		color: #000000;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.treemap-cell:hover {
		opacity: 0.8;
	}

	.treemap-label {
		font-size: 13px;
	}

	.treemap-value {
		font-size: 11px;
	}

	.treemap-cell-small .treemap-label {
		font-size: 12px;
	}

	.treemap-company {
		font-size: 10px;
		margin-top: 2px;
	}

	.treemap-examples {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.treemap-example {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.treemap-cell-example {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		padding: 8px 10px;
		color: #000000;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.treemap-cell-example:hover {
		opacity: 0.8;
	}

	.treemap-cell-example .treemap-label {
		font-size: 13px;
	}

	.treemap-cell-example .treemap-value {
		font-size: 11px;
	}

	.treemap-cell-example .treemap-company {
		font-size: 10px;
	}
</style>
