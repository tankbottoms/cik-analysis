# Historical Stock Data Analysis

A SvelteKit 2 application for stock analysis with portfolio tracking, interactive D3 visualizations, and SEC forensic analysis tools.

## Features

- **Portfolio Management**: Track holdings and watchlist with localStorage persistence
- **Interactive Visualizations**: D3.js treemaps, streamgraphs, and activity graphs
- **Real-time Ticker**: Draggable stock ticker with simulated price updates
- **SEC Analysis**: Forensic analysis of historical trading data for SEC entities
- **Education System**: Investment term definitions with tooltips and deep linking
- **S&P 500 Search**: Autocomplete search across S&P 500 stocks

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| SvelteKit | 2.x | Framework |
| Svelte | 5.x | UI library ($props, $state, $derived, $effect) |
| D3.js | 7.x | Data visualization |
| Font Awesome | 6.x | Icons (thin style: `fat` class) |
| TypeScript | 5.x | Type safety |
| Bun | 1.x | Runtime and package manager |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- API keys (optional, for data fetching):
  - Finnhub API key
  - Twelve Data API key
  - Alpha Vantage API key

### Installation

```bash
# Install dependencies
bun install

# Copy environment template
cp .env.example .env

# Edit .env with your API keys (optional)
```

### Development

```bash
# Start development server
bun run dev

# Run type checking
bun run check

# Run tests
bun run test
```

### Building

```bash
# Build for production (static)
bun run build

# Preview production build
bun run preview
```

## Data Pipeline

| Command | Description |
|---------|-------------|
| `bun run prefetch:sp500` | Fetch S&P 500 company profiles from Finnhub |
| `bun run prefetch:top25` | Fetch detailed history for top 25 stocks |
| `bun run prefetch:crypto` | Fetch BTC and ETH cryptocurrency history |
| `bun run data:pipeline` | Run full SEC forensic data pipeline |

## Project Structure

```
src/
├── lib/
│   ├── api/                 # API client modules
│   ├── components/          # Reusable Svelte components
│   │   ├── ActivityGraph.svelte
│   │   ├── HoldingsTable.svelte
│   │   ├── PortfolioStreamgraph.svelte
│   │   ├── PortfolioTreemap.svelte
│   │   ├── SearchInput.svelte
│   │   ├── StockCard.svelte
│   │   └── TickerStrip.svelte
│   ├── stores/              # Svelte stores
│   │   └── portfolio.svelte.ts
│   ├── types/               # TypeScript definitions
│   └── education.ts         # Education term definitions
├── routes/
│   ├── +page.svelte         # Homepage
│   ├── education/           # Education page
│   ├── portfolio/           # Portfolio management
│   │   ├── holdings/        # Holdings detail
│   │   └── watchlist/       # Watchlist management
│   ├── stock/[symbol]/      # Stock detail pages
│   ├── ux-spec/             # UX specification
│   └── visualizations/      # SEC analysis pages
├── static/
│   ├── csv/                 # Historical trading data
│   ├── json/                # Processed data (companies, market, crypto)
│   └── fontawesome/         # Icon library
└── scripts/                 # Data pipeline scripts
```

## Key Components

| Component | Description |
|-----------|-------------|
| `TickerStrip` | Draggable stock ticker with 3-second auto-resume |
| `PortfolioStreamgraph` | D3 streamgraph showing portfolio performance over time |
| `PortfolioTreemap` | D3 treemap sized by value with gain/loss coloring |
| `ActivityGraph` | GitHub-style activity grid for data overview |
| `SearchInput` | S&P 500 autocomplete search |
| `HoldingsTable` | Sortable table with gain/loss calculations |

## Color Palette

Site-wide treemap color palette used across all visualizations:

| Color | Hex | Usage |
|-------|-----|-------|
| Green | `#d4edda` | Success/Level 2 |
| Blue | `#cce5ff` | Information/Level 3 |
| Purple | `#e8d5f0` | Special/Level 4 |
| Yellow | `#fff3cd` | Warning/Level 1 |

## Deployment

### Vercel

```bash
vercel --prod
```

### Static Hosting

Build generates static files in `build/` directory:

```bash
bun run build
# Deploy contents of build/ directory
```

## Documentation

- [API Providers](docs/API-PROVIDERS.md) - API documentation and rate limits
- [TODO](docs/TODO.md) - Task tracking
- [CHANGELOG](docs/CHANGELOG.md) - Version history

## License

Private - All rights reserved.
