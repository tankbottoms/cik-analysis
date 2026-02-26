# Historical Stock Data Analysis

**Live Site:** [historical-stock-data.vercel.app](https://historical-stock-data.vercel.app) (Beta)

Investment research platform combining SEC EDGAR forensics, portfolio management, and interactive D3 visualizations. Built with SvelteKit 2 and Svelte 5.

---

<p align="center">
<img width="600" height="880" src="./static/imgs/screenshot.png" alt="App Screenshot">
</p>

---

## Notable Features

### Portfolio Management

- Track holdings with shares, average cost, and real-time gain/loss calculations
- Watchlist management with localStorage persistence (no backend required)
- Sortable holdings table with export capabilities

### Interactive D3 Visualizations

- **Treemap** - Portfolio allocation sized by value, colored by gain/loss
- **Streamgraph** - Portfolio performance over 1 year with stats overlay and hover tooltips
- **Activity Graph** - GitHub-style 52-week activity grid showing entity trading day density
- **Price and Volume Charts** - Per-stock historical analysis with computed metrics

### SEC Forensic Analysis

- Entity browsing with trading data, volume metrics, and filing timelines
- CIK-level deep dives for individual SEC-registered entities
- Peak price tracking, 52-week high/low, all-time high/low, and volatility metrics
- Integration with [edgar-cik-cli](https://github.com/tankbottoms/edgar-cik-cli) for full CIK filing history

### Market Data

- S&P 500 autocomplete search with company profiles
- Top 25 stocks with 5-year historical OHLCV data
- BTC and ETH cryptocurrency historical data (5-year)
- Multi-provider data pipeline: Finnhub, Twelve Data, Alpha Vantage, Massive.com

### Scrolling Ticker Strip

- Draggable ticker with auto-scroll and 3-second resume delay after interaction
- Velocity tracking for smooth directional scrolling

### Education System

- 8 knowledge categories: Financial Analysis, Business Quality, Valuation, Portfolio, Income Investing, Capital Allocation, Derivatives, Wealth Building
- Expandable accordion sections with deep linking via hash navigation
- Contextual tooltips and badges throughout the app

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| SvelteKit | 2.x | Framework |
| Svelte | 5.x | UI ($props, $state, $derived, $effect) |
| D3.js | 7.x | Data visualization |
| Font Awesome | 6.x | Icons (thin style) |
| TypeScript | 5.x | Type safety |
| Bun | 1.x | Runtime and package manager |

## Getting Started

```bash
bun install
cp .env.example .env
bun run dev
```

API keys are optional (for live data fetching). The app ships with prefetched static JSON data.

## Data Pipeline

| Command | Description |
|---------|-------------|
| `bun run prefetch:sp500` | Fetch S&P 500 company profiles |
| `bun run prefetch:top25` | Fetch top 25 stocks detailed history |
| `bun run prefetch:crypto` | Fetch BTC/ETH cryptocurrency history |
| `bun run data:pipeline` | Run full SEC forensic data pipeline |

## Deployment

```bash
bun run build     # Static build to build/
vercel --prod     # Deploy to Vercel
```

## Documentation

- [API Providers](docs/API-PROVIDERS.md) - API documentation and rate limits
- [TODO](docs/TODO.md) - Task tracking and roadmap
- [CHANGELOG](docs/CHANGELOG.md) - Version history

## License

Private - All rights reserved.
