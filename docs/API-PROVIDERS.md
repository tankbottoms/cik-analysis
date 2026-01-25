# API Providers Documentation

Comprehensive documentation for all financial data APIs used in the Stock Analysis Platform.

---

## Provider Summary

| Provider | API Key Env Variable | Documentation URL |
|----------|---------------------|-------------------|
| Massive.com | `MASSIVE_API_KEY` | https://massive.com/docs |
| Finnhub | `FINNHUB_API_KEY` | https://finnhub.io/docs/api |
| Twelve Data | `TWELVE_DATA_API_KEY` | https://twelvedata.com/docs |
| Alpha Vantage | `ALPHA_VANTAGE_API_KEY` | https://www.alphavantage.co/documentation/ |
| SEC EDGAR | `SEC_EDGAR_USER_AGENT` | https://www.sec.gov/search-filings/edgar-application-programming-interfaces |
| Yahoo Finance | `YAHOO_FINANCE_URL` | N/A (web scraping fallback) |

---

## Massive.com (formerly Polygon.io)

### Overview

Real-time and historical market data for stocks, options, forex, and crypto. Covers all 19 major US exchanges plus dark pools and OTC markets.

### Free Tier Limits

- Rate limits vary by endpoint and plan
- Some endpoints may require paid subscription
- Check https://massive.com/pricing for current limits

### Key Endpoints

| Endpoint | Purpose | Rate Limit |
|----------|---------|------------|
| `/v2/snapshot/ticker/{symbol}` | Current quote snapshot | Per plan |
| `/v2/aggs/ticker/{symbol}/range/{mult}/{span}/{from}/{to}` | Historical OHLCV | Per plan |
| `/v3/reference/tickers` | Ticker list and metadata | Per plan |
| `/v2/snapshot/locale/us/markets/stocks/gainers` | Top gainers | Per plan |
| `/v2/snapshot/locale/us/markets/stocks/losers` | Top losers | Per plan |

### WebSocket Streaming

- URL: `wss://socket.polygon.io/stocks`
- Requires premium subscription
- **Not available on free tier** - Use polling instead

### Example Request

```bash
curl "https://api.polygon.io/v2/snapshot/ticker/AAPL?apiKey=$MASSIVE_API_KEY"
```

### Response Format

```json
{
  "ticker": {
    "ticker": "AAPL",
    "todaysChange": 2.34,
    "todaysChangePerc": 1.30,
    "day": {
      "o": 180.18,
      "h": 183.50,
      "l": 179.90,
      "c": 182.52,
      "v": 45200000
    }
  }
}
```

---

## Finnhub

### Overview

Stock market data API with company profiles, logos, news, SEC filings, insider transactions, and analyst recommendations.

### Free Tier Limits

- **30 API calls per second** (universal)
- Some endpoints require premium (financials, estimates)

### Key Endpoints (Free Tier)

| Endpoint | Purpose | Premium Required |
|----------|---------|------------------|
| `/quote` | Real-time quote | No |
| `/stock/profile2` | Company profile + logo | No |
| `/stock/peers` | Competitor stocks | No |
| `/company-news` | 1 year news history | No |
| `/stock/recommendation` | Analyst ratings | No |
| `/stock/insider-transactions` | Insider trades | No |
| `/stock/filings` | SEC filing list | No |
| `/stock/financials-reported` | As-reported financials | No |
| `/calendar/earnings` | Earnings calendar | No |

### Premium-Only Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/stock/metric` | Detailed financial metrics |
| `/stock/earnings-estimate` | Analyst estimates |
| `/stock/price-target` | Price targets |
| `/stock/candle` | Full historical data |

### Example Request

```bash
curl "https://finnhub.io/api/v1/quote?symbol=AAPL&token=$FINNHUB_API_KEY"
```

### Response Format

```json
{
  "c": 182.52,      // Current price
  "d": 2.34,        // Change
  "dp": 1.30,       // Percent change
  "h": 183.50,      // High
  "l": 179.90,      // Low
  "o": 180.18,      // Open
  "pc": 180.18,     // Previous close
  "t": 1704931200   // Timestamp
}
```

### Logo URL Pattern

```
https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/{symbol}.png
```

---

## Twelve Data

### Overview

Historical and real-time market data with excellent crypto coverage. Data available back to 1980 for daily intervals.

### Free Tier Limits

- **8 API credits per minute**
- **800 credits per day**
- Credit costs vary by endpoint (time_series = 1 credit)

### Key Endpoints

| Endpoint | Credits | Purpose |
|----------|---------|---------|
| `/time_series` | 1 | Historical OHLCV |
| `/quote` | 1 | Real-time quote |
| `/eod` | 1 | End-of-day price |
| `/earliest_timestamp` | 1 | Data availability check |
| `/symbol_search` | 1 | Symbol lookup |
| `/stocks` | 1 | Stock list |
| `/cryptocurrencies` | 1 | Crypto list |
| `/technical_indicators/*` | 1-5 | Technical analysis |

### Historical Data Coverage

| Interval | Available From |
|----------|----------------|
| 1day, 1week, 1month | January 1, 1980 |
| 1min to 8h | December 15, 2022 |

### Crypto Coverage

Full support for BTC, ETH, and other major cryptocurrencies with same endpoints as stocks.

### Example Request

```bash
curl "https://api.twelvedata.com/time_series?symbol=AAPL&interval=1day&start_date=2024-01-01&end_date=2024-12-31&apikey=$TWELVE_DATA_API_KEY"
```

### Response Format

```json
{
  "meta": {
    "symbol": "AAPL",
    "interval": "1day",
    "currency": "USD"
  },
  "values": [
    {
      "datetime": "2024-12-31",
      "open": "180.18",
      "high": "183.50",
      "low": "179.90",
      "close": "182.52",
      "volume": "45200000"
    }
  ]
}
```

### WebSocket

- **Requires Pro plan** - Not available on free tier
- Use API polling as alternative

---

## Alpha Vantage

### Overview

Stock data API with bulk quote endpoint supporting 100 symbols per request.

### Free Tier Limits

- **25 API requests per day**
- **5 API requests per minute**
- Bulk endpoint: 100 symbols per request

### Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `TIME_SERIES_DAILY` | Daily OHLCV (20+ years) |
| `TIME_SERIES_DAILY_ADJUSTED` | Adjusted for splits/dividends |
| `GLOBAL_QUOTE` | Single stock quote |
| `BATCH_STOCK_QUOTES` | Up to 100 symbols at once |
| `SYMBOL_SEARCH` | Symbol lookup |
| `OVERVIEW` | Company fundamentals |
| `INCOME_STATEMENT` | Income statement |
| `BALANCE_SHEET` | Balance sheet |
| `CASH_FLOW` | Cash flow statement |
| `EARNINGS` | Quarterly earnings |

### Bulk Quote Strategy

The `BATCH_STOCK_QUOTES` endpoint is ideal for updating the S&P 500:
- 500 stocks / 100 per request = 5 API calls
- Fits within daily limit if called once per day

### Example Request (Bulk)

```bash
curl "https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=AAPL,MSFT,GOOGL&apikey=$ALPHA_VANTAGE_API_KEY"
```

### Example Request (Time Series)

```bash
curl "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AAPL&outputsize=full&apikey=$ALPHA_VANTAGE_API_KEY"
```

---

## SEC EDGAR

### Overview

Official SEC filing data. Free to use with rate limiting.

### Rate Limits

- **10 requests per second**
- Requires User-Agent header with contact email
- Use `SEC_EDGAR_USER_AGENT` environment variable

### Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/cgi-bin/browse-edgar` | Company filing search |
| `/submissions/CIK{cik}.json` | Company submissions |
| `/cgi-bin/viewer` | Filing viewer |

### Example Request

```bash
curl -H "User-Agent: $SEC_EDGAR_USER_AGENT" \
  "https://data.sec.gov/submissions/CIK0000320193.json"
```

---

## Data Provider Selection Matrix

### By Feature

| Feature | Primary | Fallback |
|---------|---------|----------|
| Real-time quote | Finnhub | Massive.com |
| Historical OHLCV | Twelve Data | Alpha Vantage |
| Company profile | Finnhub | Massive.com |
| Company logo | Finnhub CDN | - |
| News | Finnhub | Yahoo Finance |
| SEC filings | SEC EDGAR | Finnhub |
| Earnings | Finnhub | Alpha Vantage |
| Crypto | Twelve Data | Massive.com |
| Bulk quotes | Alpha Vantage | - |
| Ticker search | Finnhub | Twelve Data |

### By Update Frequency

| Data Type | Update Frequency | Provider |
|-----------|------------------|----------|
| Real-time quotes | 15-second polling | Finnhub |
| Ticker strip | 15-second polling | Alpha Vantage bulk |
| Historical data | Daily build script | Twelve Data |
| Company profiles | Weekly build script | Finnhub |
| News | Hourly fetch | Finnhub |
| SEC filings | Daily check | SEC EDGAR |

---

## Caching Strategy

### Static JSON Files (Build Time)

Generated by scripts and served as static assets:

```
/static/json/
├── market/
│   ├── sp500-list.json          # S&P 500 symbols
│   └── sp500-snapshot.json      # Latest bulk quotes
├── companies/
│   ├── AAPL-profile.json        # Company info
│   ├── AAPL-history-1y.json     # 1 year OHLCV
│   └── AAPL-history-5y.json     # 5 year OHLCV
├── crypto/
│   ├── BTC-history-5y.json
│   └── ETH-history-5y.json
└── benchmarks/
    └── market-ranges.json       # Computed benchmark ranges
```

### Browser Cache (Runtime)

```typescript
// localStorage keys
portfolio_holdings    // User's stock positions
portfolio_watchlist   // Watched stocks
last_quote_update     // Timestamp of last refresh
cached_quotes         // Recent quote data (15min TTL)
```

### API Route Cache (SvelteKit)

```typescript
// src/routes/api/quote/[symbol]/+server.ts
// 15-second cache for real-time quotes
export async function GET({ params, setHeaders }) {
  setHeaders({
    'Cache-Control': 'public, max-age=15'
  });
  // Fetch from Finnhub...
}
```

---

## Error Handling

### Rate Limit Errors

| Provider | HTTP Code | Retry Strategy |
|----------|-----------|----------------|
| Finnhub | 429 | Wait 1 second, retry |
| Twelve Data | 429 | Wait 60 seconds |
| Alpha Vantage | 200 (with error message) | Wait until next minute |
| SEC EDGAR | 429 | Wait 100ms, retry |

### Fallback Chain

```
1. Try primary provider
2. If rate limited → try fallback provider
3. If all fail → return cached data with "stale" flag
4. If no cache → return error to user
```
