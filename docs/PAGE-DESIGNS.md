# Page Designs - Stock Analysis Platform

Detailed wireframes and component specifications for all pages in the Stock Analysis Platform.

---

## Design System Reference

All pages follow the UX specification at `~/Developer/ux-spec/`:

- **Style**: Neo-brutalist with terminal aesthetic
- **Typography**: Monospace-first (`--font-mono`)
- **Shadows**: Hard offset (`2px 2px 0px`)
- **Border-radius**: 0 for containers, 9999px for badges
- **Icons**: Font Awesome thin (`fat` class)

---

## Landing Page (`/`)

### Layout Structure

```
+------------------------------------------------------------------+
|  [Logo]    [==== Search: Enter ticker or company ====]  [Gear]   |
+------------------------------------------------------------------+
| AAPL +1.2% $182 | MSFT -0.3% $420 | GOOGL +0.5% $178 | ...       |
+------------------------------------------------------------------+
|  Portfolio Value                   | Daily Change                |
|  $125,432.18                       | +$2,341.56 (+1.90%)        |
+------------------------------------------------------------------+
|  [Holdings]  [Watchlist]  [Market]  [Research]  [Education]      |
+------------------------------------------------------------------+
|                                                                   |
|  +----------------------------------------------------------+    |
|  |                    TREEMAP VISUALIZATION                  |    |
|  |  +--------+  +------------+  +---------+  +------+       |    |
|  |  |  AAPL  |  |    MSFT    |  |  GOOGL  |  | NVDA |       |    |
|  |  | $45.2K |  |   $21.0K   |  | $18.5K  |  |$12.3K|       |    |
|  |  |  +2.1% |  |   -0.3%    |  |  +1.5%  |  |+3.2% |       |    |
|  |  +--------+  +------------+  +---------+  +------+       |    |
|  |  +--------------+  +--------+  +-------------------+     |    |
|  |  |    AMZN      |  |  META  |  |       TSLA        |     |    |
|  |  |    $8.9K     |  | $6.2K  |  |      $10.1K       |     |    |
|  |  +--------------+  +--------+  +-------------------+     |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
| Holdings                        | Portfolio Performance          |
| +---------------------------+   | +---------------------------+  |
| | AAPL   150 shares        |   | |     [Stacked Area Chart]  |  |
| | $182.52  +$2.34 (+1.3%)  |   | |     Portfolio value over  |  |
| | Value: $27,378           |   | |     time                   |  |
| +---------------------------+   | |                           |  |
| | MSFT    50 shares        |   | |                           |  |
| | $420.15  -$1.25 (-0.3%)  |   | |                           |  |
| | Value: $21,007           |   | +---------------------------+  |
| +---------------------------+   |                                |
+------------------------------------------------------------------+
```

### Components

#### Search Input
- Full-width search bar in header
- Autocomplete dropdown with stock matches
- Actions: Add to Portfolio, Add to Watchlist, View Details

#### Ticker Strip
- Horizontal scrolling strip
- S&P 500 top movers
- 15-second refresh via polling
- Click to navigate to stock detail

#### Portfolio Stats Box
- Total portfolio value
- Daily change (absolute and percentage)
- Uses `.section-box` styling

#### Treemap
- D3 treemap visualization
- Size = position value
- Color = daily change (green/red gradient)
- Click to navigate to stock detail
- Tooltip with full details

#### Holdings List
- Card-based layout
- Shows: Symbol, shares, price, change, value
- Dense information display

---

## Company Detail Page (`/stock/[symbol]`)

### Layout Structure

```
+------------------------------------------------------------------+
| <- Back to Portfolio                                              |
+------------------------------------------------------------------+
|  [Logo]  AAPL  Apple Inc.                    [+ Add to Watchlist] |
|          NASDAQ: AAPL                                             |
+------------------------------------------------------------------+
|  $182.52      +$2.34 (+1.30%)       After hours: $182.80 (+0.15%) |
|  [large]      [green badge]          [muted text]                 |
+------------------------------------------------------------------+
|  [1D] [5D] [1M] [6M] [YTD] [1Y] [5Y] [Max]    [Line] [Candle]    |
+------------------------------------------------------------------+
|                                                                   |
|  +----------------------------------------------------------+    |
|  |                                                           |    |
|  |                   INTERACTIVE PRICE CHART                 |    |
|  |                                                           |    |
|  |     $185 ─────────────────────────────────────            |    |
|  |                          /\                               |    |
|  |     $180 ───────────────/  \──────────────────            |    |
|  |                        /    \    /\                       |    |
|  |     $175 ─────────────/      \──/  \──────────            |    |
|  |                      /              \                     |    |
|  |     $170 ───────────/                \────────            |    |
|  |                                                           |    |
|  |     [Volume bars at bottom]                               |    |
|  |     ████ ██ ████ ███ ██ ████ ███ ████ ██                  |    |
|  |                                                           |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
| Key Statistics                                                    |
| +------------+  +------------+  +------------+                    |
| | Market Cap |  | P/E Ratio  |  | 52-Wk High |                    |
| | $2.87T     |  | 29.4       |  | $198.23    |                    |
| +------------+  +------------+  +------------+                    |
| +------------+  +------------+  +------------+                    |
| | Volume     |  | Div Yield  |  | 52-Wk Low  |                    |
| | 45.2M      |  | 0.51%      |  | $164.08    |                    |
| +------------+  +------------+  +------------+                    |
+------------------------------------------------------------------+
| [Overview]  [Financials]  [Earnings]  [News]  [Filings]          |
+------------------------------------------------------------------+
| About Apple Inc.                                                  |
| +---------------------------------------------------------------+|
| | Apple Inc. designs, manufactures, and markets smartphones,    ||
| | personal computers, tablets, wearables, and accessories       ||
| | worldwide. The company offers iPhone, iPad, Mac, Apple Watch, ||
| | and Apple TV...                                               ||
| +---------------------------------------------------------------+|
|                                                                   |
| Company Information                                               |
| +-------------------+  +-------------------+  +------------------+|
| | CEO              |  | Employees         |  | Founded          ||
| | Tim Cook         |  | 164,000           |  | 1976             ||
| +-------------------+  +-------------------+  +------------------+|
| | Sector           |  | Industry          |  | Website          ||
| | Technology       |  | Consumer Elec.    |  | apple.com        ||
| +-------------------+  +-------------------+  +------------------+|
+------------------------------------------------------------------+
| Recent News                                                       |
| +---------------------------------------------------------------+|
| | [badge: News] Apple Q4 earnings beat expectations              ||
| | 2 hours ago - Reuters                                          ||
| +---------------------------------------------------------------+|
| | [badge: News] New iPhone sales exceed analyst forecasts        ||
| | 5 hours ago - Bloomberg                                        ||
| +---------------------------------------------------------------+|
+------------------------------------------------------------------+
```

### Components

#### Header Section
- Company logo (from Finnhub CDN)
- Symbol and company name
- Exchange information
- Add to watchlist button

#### Price Display
- Large current price
- Change badge (green/red)
- After-hours price (if available)

#### Time Range Selector
- Buttons: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, Max
- Chart type toggle: Line / Candlestick
- Active button highlighted

#### Price Chart
- D3.js line or candlestick chart
- X-axis: Time scale based on range
- Y-axis: Price scale with grid lines
- Tooltip on hover showing OHLCV
- Volume bars at bottom

#### Key Statistics Grid
- 6 stats minimum (2x3 grid)
- Stats: Market Cap, P/E, 52-Week High, Volume, Div Yield, 52-Week Low
- Each in a `.section-box` with `.stats-card` styling

#### Tabbed Content
- Overview: Company description, info grid
- Financials: Income statement, balance sheet, cash flow
- Earnings: Earnings chart, calendar
- News: Recent news feed
- Filings: SEC filing list

---

## Portfolio Page (`/portfolio`)

### Layout Structure

```
+------------------------------------------------------------------+
| <- Back to Dashboard                                              |
+------------------------------------------------------------------+
| Portfolio Management                          [+ Add Holding]     |
+------------------------------------------------------------------+
| Summary Stats                                                     |
| +----------+ +----------+ +----------+ +----------+ +----------+  |
| | Total    | | Today's  | | Total    | | Stocks   | | Watchlist|  |
| | Value    | | Change   | | Gain     | | Held     | | Count    |  |
| | $125.4K  | | +$2.3K   | | +$18.2K  | | 12       | | 8        |  |
| +----------+ +----------+ +----------+ +----------+ +----------+  |
+------------------------------------------------------------------+
| Holdings                                                          |
| +---------------------------------------------------------------+|
| | Symbol | Shares | Avg Cost | Current | Change | Value  | Act. ||
| |--------|--------|----------|---------|--------|--------|------||
| | AAPL   | 150    | $165.00  | $182.52 | +10.6% | $27.4K | [x]  ||
| | MSFT   | 50     | $380.00  | $420.15 | +10.6% | $21.0K | [x]  ||
| | GOOGL  | 100    | $155.00  | $178.30 | +15.0% | $17.8K | [x]  ||
| | NVDA   | 25     | $450.00  | $492.00 | +9.3%  | $12.3K | [x]  ||
| +---------------------------------------------------------------+|
+------------------------------------------------------------------+
| Watchlist                                                         |
| +--------+ +--------+ +--------+ +--------+                       |
| | TSLA   | | META   | | AMZN   | | AMD    |                       |
| | $248.50| | $582.30| | $186.40| | $156.20|                       |
| | +2.3%  | | -1.1%  | | +0.8%  | | +4.5%  |                       |
| +--------+ +--------+ +--------+ +--------+                       |
+------------------------------------------------------------------+
```

### Components

#### Add Holding Modal
- Symbol input with autocomplete
- Purchase date picker
- Number of shares
- Purchase price per share
- Optional: Import from CSV

#### Holdings Table
- Sortable columns
- Inline delete button
- Click row to view stock detail
- Gain/loss color coding

#### Watchlist Grid
- Card-based layout
- Quick price and change display
- Click to view detail

---

## Stock Comparison (`/research/compare`)

### Layout Structure

```
+------------------------------------------------------------------+
| Stock Comparison                                                  |
+------------------------------------------------------------------+
| Compare up to 3 stocks:                                           |
| [AAPL    x] [MSFT    x] [+ Add Stock]                            |
+------------------------------------------------------------------+
| Normalized Price Chart (Base = 100)                               |
| +---------------------------------------------------------------+|
| |   140 ─────────────────────────── AAPL                        ||
| |                                                                ||
| |   120 ─────────────────────────── MSFT                        ||
| |                                                                ||
| |   100 ═══════════════════════════════════════                 ||
| |                                                                ||
| |   80  ─────────────────────────────────────                   ||
| +---------------------------------------------------------------+|
+------------------------------------------------------------------+
| Metrics Comparison                                                |
| +------------------+----------+----------+                        |
| | Metric           | AAPL     | MSFT     |                        |
| |------------------|----------|----------|                        |
| | Market Cap       | $2.87T   | $3.12T   |                        |
| | P/E Ratio        | 29.4     | 35.2     |                        |
| | Revenue Growth   | 8.2%     | 12.4%    |                        |
| | Net Margin       | 25.3%    | 34.1%    |                        |
| | Dividend Yield   | 0.51%    | 0.72%    |                        |
| | 52-Week Change   | +28.4%   | +18.2%   |                        |
| +------------------+----------+----------+                        |
+------------------------------------------------------------------+
```

---

## Market Overview (`/market`)

### Layout Structure

```
+------------------------------------------------------------------+
| Market Overview                                                   |
+------------------------------------------------------------------+
| Major Indices                                                     |
| +------------------+ +------------------+ +------------------+     |
| | S&P 500          | | Dow Jones        | | NASDAQ           |     |
| | 5,234.56         | | 38,456.12        | | 16,789.45        |     |
| | +1.2% (+62.34)   | | +0.8% (+305.23)  | | +1.5% (+248.90)  |     |
| +------------------+ +------------------+ +------------------+     |
+------------------------------------------------------------------+
| Top Gainers                    | Top Losers                       |
| +----------------------------+ | +----------------------------+   |
| | NVDA   +8.2%   $492.00    | | | INTC   -4.5%   $42.30      |   |
| | AMD    +5.1%   $156.20    | | | BA     -3.2%   $178.50     |   |
| | TSLA   +4.8%   $248.50    | | | DIS    -2.8%   $95.40      |   |
| +----------------------------+ | +----------------------------+   |
+------------------------------------------------------------------+
| Sector Performance                                                |
| +---------------------------------------------------------------+|
| | Technology     +2.1%  ████████████████████████                ||
| | Healthcare     +1.5%  ██████████████████                      ||
| | Financials     +0.8%  ████████████                            ||
| | Energy         -0.3%  ████████████  (red)                     ||
| | Utilities      -0.5%  ████████████████  (red)                 ||
| +---------------------------------------------------------------+|
+------------------------------------------------------------------+
```

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Adjustments |
|------------|-------|-------------------|
| Mobile | < 640px | Single column, collapsed stats |
| Tablet | 640-1024px | 2-column grids |
| Desktop | > 1024px | Full layout with sidebars |

### Mobile Adaptations

- Treemap: Simplified with fewer visible details
- Holdings table: Card view instead of table
- Charts: Touch-friendly with swipe gestures
- Navigation: Hamburger menu

---

## Color Usage

### Status Colors

| Color | Variable | Usage |
|-------|----------|-------|
| Green | `--color-accent-green` | Positive change, gains |
| Red | `--color-accent-red` | Negative change, losses |
| Blue | `--color-link` | Information, links |
| Muted | `--color-text-muted` | Secondary text |

### Chart Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Price Up | #28a745 | Green candles, up days |
| Price Down | #dc3545 | Red candles, down days |
| Volume | #6c757d | Volume bars |
| Grid | #e5e5e5 | Chart grid lines |

---

## Component Reference

All components use classes from `src/app.css`:

| Component | Class | Description |
|-----------|-------|-------------|
| Container | `.section-box` | Standard bordered container |
| Stats | `.stats-card` | Centered number + label |
| Badge | `.badge-green`, etc. | Pill-shaped status badges |
| Button | `.button`, `.button-primary` | Action buttons |
| Table | `table` | Data tables with hover |
| Callout | `.callout-info`, `.callout-warning` | Alert boxes |
| Back Link | `.back-link` | Navigation back link |
