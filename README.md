# AltFinance Quote — Yahoo Finance–style Quote Page (Original Theme)

A production-ready **Next.js** app that mirrors the information architecture and layout patterns of Yahoo Finance's quote page
(**Summary, Chart, News, Historical Data, Options, Components**), using **original design tokens** and a **pluggable market data provider**.

- ✅ App Router (Next 14)
- ✅ Two-column responsive layout
- ✅ Quote header with live-like updates
- ✅ Chart with time ranges (1D, 5D, 1M, 6M, YTD, 1Y, 5Y, MAX)
- ✅ Key stats grid (Day/52W range bars)
- ✅ News feed
- ✅ Historical data table
- ✅ Options chain (provider-dependent; mocked by default)
- ✅ Index components for index symbols (mocked by default)
- ✅ API routes with provider abstraction (mock default, Polygon optional)
- ✅ CI via GitHub Actions
- ✅ Dockerfile

> **Legal note**: This project **does not** copy Yahoo Finance code, branding, or assets. It recreates common finance UI patterns with an original theme.
> Do not scrape Yahoo content. Use your own licensed market-data provider in production.

---

## Quick start

```bash
# 1) Install deps
npm install

# 2) Configure env (mock by default)
cp .env.example .env.local
# Edit DATA_PROVIDER=mock or set to polygon and add POLYGON_API_KEY

# 3) Run dev
npm run dev
# Open http://localhost:3000
# Navigate to /quote/%5EGSPC (i.e., ^GSPC) or /quote/AAPL to see the layout.
```

## Provider selection

- `mock` (default): ships working demo data for common symbols.
- `polygon`: set `DATA_PROVIDER=polygon` and `POLYGON_API_KEY=...`. Note that some index symbols differ between vendors.
  You may need to map symbols (e.g., `^GSPC` → vendor-specific ticker). See `lib/providers/polygon.ts` for a minimal example.

## Deploy

Push to GitHub and deploy on your preferred platform (e.g., Vercel). Add env vars (`DATA_PROVIDER`, `POLYGON_API_KEY` if used) before deploying.

## License

MIT — see LICENSE.
