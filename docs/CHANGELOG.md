# Changelog - Stock Analysis Platform

All notable changes to the Stock Analysis Platform project will be documented in this file.

---

## [Unreleased]

### Phase 2.5: UX Enhancements & Visualization Improvements

#### 2026-01-25

**Visual & Interaction Enhancements**

- Enhanced TickerStrip with improved drag behavior:
  - 3-second delay before auto-scroll resumes after user interaction
  - Auto-scroll continues in the direction of last mouse movement
  - Velocity tracking for smooth direction detection
- Created PortfolioStreamgraph component:
  - D3-based streamgraph showing portfolio performance over 1 year
  - Stats overlay displaying Total Value, Gain/Loss, and Return percentage
  - Hover tooltip with date and per-stock value breakdown
  - Uses consistent treemap color palette
- Created ActivityGraph component:
  - GitHub-style activity grid (52 weeks x 7 days)
  - Stats row showing Entities, Trading Days, and date range
  - Activity levels colored using treemap palette
  - Month and day labels with "Less/More" legend
- Updated portfolio page:
  - Replaced stats cards with streamgraph visualization
  - Added narrative sentence summarizing portfolio performance
- Updated homepage:
  - Replaced Data Overview stats cards with ActivityGraph
- Standardized color palette site-wide:
  - All graphs now use treemap colors: `#d4edda` (green), `#cce5ff` (blue), `#e8d5f0` (purple), `#fff3cd` (yellow)
- Fixed build warnings:
  - Resolved unused CSS selectors
  - Fixed a11y issues in portfolio modal
  - Converted container variables to proper `$state()` declarations

**Files Created:**
- `src/lib/components/PortfolioStreamgraph.svelte`
- `src/lib/components/ActivityGraph.svelte`

**Files Modified:**
- `src/lib/components/TickerStrip.svelte` - 3-second delay auto-scroll
- `src/lib/components/PortfolioTreemap.svelte` - $state() fix
- `src/routes/+page.svelte` - ActivityGraph, removed unused CSS
- `src/routes/portfolio/+page.svelte` - Streamgraph, narrative, a11y fixes

---

### Phase 2: Portfolio Management & Landing Page

#### 2026-01-13

**Phase 2 Completed - Portfolio System**

- Created portfolio store with localStorage persistence (`src/lib/stores/portfolio.svelte.ts`)
- Built reusable components:
  - `SearchInput.svelte` - Stock search with S&P 500 autocomplete
  - `TickerStrip.svelte` - Scrolling market ticker with price display
  - `HoldingsTable.svelte` - Sortable holdings table with gain/loss
  - `PortfolioTreemap.svelte` - D3 treemap visualization colored by gain/loss
- Created portfolio routes:
  - `/portfolio` - Main portfolio management page
  - `/portfolio/holdings` - Detailed holdings view with export/import
  - `/portfolio/watchlist` - Stock watchlist management
- Redesigned landing page with:
  - Stock search input
  - Quick navigation cards (Portfolio, Watchlist, SEC Analysis, Education)
  - Portfolio overview section (when user has holdings)
  - Ticker strip in layout header
- Updated navigation to include Portfolio link

**Files Created:**
- `src/lib/stores/portfolio.svelte.ts`
- `src/lib/components/SearchInput.svelte`
- `src/lib/components/TickerStrip.svelte`
- `src/lib/components/HoldingsTable.svelte`
- `src/lib/components/PortfolioTreemap.svelte`
- `src/lib/components/index.ts`
- `src/routes/portfolio/+page.svelte`
- `src/routes/portfolio/holdings/+page.svelte`
- `src/routes/portfolio/watchlist/+page.svelte`

**Files Modified:**
- `src/routes/+page.svelte` - Redesigned landing page
- `src/routes/+layout.svelte` - Added ticker strip and updated navigation
- `src/lib/types/portfolio.ts` - Updated WatchlistItem type

---

### Phase 1: Data Infrastructure

#### 2026-01-12

**Phase 1 Completed - API Clients & Prefetch Scripts**

- Created API client modules for all data providers:
  - `src/lib/api/finnhub.ts` - Company profiles, logos, news, SEC filings
  - `src/lib/api/twelvedata.ts` - Historical data, crypto
  - `src/lib/api/alphavantage.ts` - Bulk quotes
  - `src/lib/api/massive.ts` - Real-time snapshots
  - `src/lib/api/cache.ts` - Caching utilities with TTL
  - `src/lib/api/index.ts` - Unified exports
- Created type definitions:
  - `src/lib/types/market.ts` - Market data types
  - `src/lib/types/portfolio.ts` - Portfolio management types
- Created prefetch scripts:
  - `scripts/prefetch-sp500.ts` - Fetch S&P 500 profiles from Finnhub
  - `scripts/prefetch-top25.ts` - Fetch 5-year history for top 25 stocks
  - `scripts/prefetch-crypto.ts` - Fetch BTC/ETH history from Twelve Data
- Set up static JSON directory structure
- Successfully prefetched S&P 500 company profiles (100 stocks)

**Generated Data:**
- `static/json/market/sp500-list.json` - 100 S&P 500 stocks with sectors
- `static/json/market/sp500-profiles.json` - Combined company profiles
- `static/json/companies/AAPL-profile.json` (and others) - Individual profiles

---

### Planning Phase

#### 2026-01-12

**Project Planning Completed**

- Analyzed 1000xStocks.com features and data requirements from `docs/1000x_Analysis.md`
- Researched and documented all API providers:
  - Massive.com (formerly Polygon.io): Real-time quotes, snapshots, historical data
  - Finnhub: Company profiles, logos, news, SEC filings (30 req/sec free)
  - Twelve Data: Historical data back to 1980, crypto coverage (800/day free)
  - Alpha Vantage: Bulk quotes for 100 symbols (25/day free)
  - SEC EDGAR: Official filings (10 req/sec)
- Created comprehensive implementation plan with 7 phases
- Established design decisions:
  - Portfolio storage: localStorage only (no backend)
  - API tiers: Free tiers only with strategic caching
  - Platform: Desktop-first with responsive mobile
  - AI features: Deferred to later phases
- Created documentation structure:
  - `docs/README.md` - Project overview
  - `docs/API-PROVIDERS.md` - API documentation and rate limits
  - `docs/TODO.md` - Task tracking
  - `docs/CHANGELOG.md` - This file
- Mapped data providers to features with primary/fallback strategy
- Designed caching architecture (browser, static JSON, API routes)
- Defined top 25 stocks and crypto (BTC, ETH) for deep data collection

**Files Created:**
- `/docs/README.md`
- `/docs/API-PROVIDERS.md`
- `/docs/TODO.md`
- `/docs/CHANGELOG.md`

**Next Steps:**
- Begin Phase 1: Data Provider Integration
- Create API client modules
- Run prefetch scripts to populate static JSON

---

## Version History

### [0.1.0] - 2026-01-10

**Initial Commit**

- SvelteKit 2 project setup with Svelte 5
- D3.js visualization integration
- SEC forensic analysis pages for penny stocks
- Education page with investment term definitions
- UX specification page with design system
- Data pipeline for CSV to JSON conversion

**Features:**
- Stock analysis visualization for SEC entities
- Interactive D3 price and volume charts
- SEC filing timeline integration
- Education system with tooltips and deep linking
- Neo-brutalist design system

**Data Sources:**
- Local CSV files with historical trading data
- SEC EDGAR filing metadata
- Yahoo Finance (via yfinance library)

---

## Upcoming Releases

### [0.2.0] - Phase 1 & 2

- API client modules for all providers
- Data prefetch pipeline
- Portfolio management (localStorage)
- Landing page redesign with treemap
- Ticker strip component

### [0.3.0] - Phase 3

- Google Finance-style company detail page
- Interactive D3 price charts with time ranges
- Key statistics display
- Company news feed

### [0.4.0] - Phase 4 & 5

- Advanced chart features (candlestick, technical indicators)
- Stock comparison tool
- Financial statements display
- Earnings data integration

### [0.5.0] - Phase 6

- Real-time quote polling
- Visual price change animations
- Enhanced ticker strip

### [1.0.0] - Full Release

- All phases complete
- Production-ready deployment
- Comprehensive documentation
