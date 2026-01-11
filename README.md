# Historical Stock Data Analysis

A SvelteKit 2 application for forensic analysis of historical stock trading data for SEC-related entities. This tool provides comprehensive stock price analysis, volume metrics, and SEC filing integration for penny stock investigations.

## Features

- Interactive D3.js visualizations of trading data
- Data pipeline for fetching and processing historical stock data
- CIK (Central Index Key) entity mapping and tracking
- SEC EDGAR filing integration
- Static site generation for easy deployment
- Responsive design following UX specification guidelines

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5
- **Runtime**: Bun (TypeScript)
- **Visualization**: D3.js v7
- **Styling**: CSS with Font Awesome icons
- **Testing**: Playwright
- **Deployment**: Vercel / Static adapter

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- API keys (optional, for data fetching):
  - Alpha Vantage API key
  - Massive.com S3 credentials (for remote data storage)

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

The project includes a four-stage data pipeline for processing historical stock data:

| Command | Description |
|---------|-------------|
| `bun run data:fetch` | Fetch data from Alpha Vantage and SEC EDGAR APIs |
| `bun run data:consolidate` | Merge local cache with remote API data |
| `bun run data:normalize` | Convert to daily OHLCV and calculate metrics |
| `bun run data:generate` | Generate final JSON/CSV for the website |
| `bun run data:pipeline` | Run all steps in sequence |

## Project Structure

```
Historical-Stock-Data/
├── src/
│   ├── lib/                 # Shared utilities
│   └── routes/              # SvelteKit routes
│       ├── ux-spec/         # UX specification pages
│       └── visualizations/  # D3 visualization pages
├── scripts/                 # Data pipeline scripts
│   ├── 01-fetch-remote.ts
│   ├── 02-consolidate-local.ts
│   ├── 03-normalize-data.ts
│   └── 04-generate-json.ts
├── static/
│   ├── csv/                 # Historical trading data (CSV)
│   ├── json/                # Processed entity data (JSON)
│   └── fontawesome/         # Icon library
└── tests/                   # Playwright tests
```

## Entity Tracking

Entities are tracked via CIK (Central Index Key) numbers:

| CIK | Entity |
|-----|--------|
| 0000878146 | Dynamic Associates Inc. / Legal Access Technologies Inc. |
| 0001059577 | MW Medical Inc. / Davi Skin Inc. |
| 0001103993 | Las Vegas Gaming Inc. |
| 0000013156 | Galaxy Gaming Inc. (GLXZ) |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Alpha Vantage API (for stock data)
ALPHA_VANTAGE_API_KEY=your_key_here

# SEC EDGAR (rate limiting)
SEC_EDGAR_USER_AGENT=YourApp/1.0 (your@email.com)

# Optional: Remote storage
MASSIVE_API_KEY=your_key_here
MASSIVE_S3_ACCESS_KEY=your_key_here
MASSIVE_S3_SECRET_KEY=your_key_here
```

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server |
| `build` | Build for production |
| `preview` | Preview production build |
| `check` | Run Svelte type checking |
| `test` | Run Playwright tests |
| `format` | Format code with Prettier |
| `lint` | Lint code |

## Deployment

### Vercel

The project includes Vercel configuration (`vercel.json`). Deploy with:

```bash
vercel --prod
```

### Static Hosting

Build generates static files in `build/` directory suitable for any static host (GitHub Pages, Netlify, etc.):

```bash
bun run build
# Deploy contents of build/ directory
```

## License

Private - All rights reserved.
