import type { MarketDataProvider, Quote, OHLC, NewsItem } from './index';

const minute = 60 * 1000;
const hour = 60 * minute;
const dayMs = 24 * hour;

function makeSeries(start: number, points: number, stepMs: number, base = 4600) {
  const out: OHLC[] = [];
  let last = base;
  for (let i = 0; i < points; i++) {
    const t = start + i * stepMs;
    const drift = (Math.random() - 0.5) * 8;
    const o = last;
    const c = Math.max(1, o + drift);
    const h = Math.max(o, c) + Math.random() * 3;
    const l = Math.min(o, c) - Math.random() * 3;
    const v = Math.round(1_000_000 + Math.random() * 2_000_000);
    out.push({ t, o: +o.toFixed(2), h: +h.toFixed(2), l: +l.toFixed(2), c: +c.toFixed(2), v });
    last = c;
  }
  return out;
}

export function mockProvider(): MarketDataProvider {
  return {
    async getQuote(symbol: string): Promise<Quote> {
      const now = Date.now();
      const last = 4600 + Math.sin(now / 1e7) * 30;
      const prev = 4587.78;
      const change = last - prev;
      return {
        symbol,
        longName: symbol === '^GSPC' ? 'S&P 500' : symbol,
        currency: 'USD',
        exchange: symbol.startsWith('^') ? 'INDEX' : 'NASDAQ',
        price: {
          last: +last.toFixed(2),
          change: +change.toFixed(2),
          changePct: +((change / prev) * 100).toFixed(2),
          asOf: new Date().toISOString(),
          session: 'regular',
        },
        stats: {
          previousClose: prev,
          open: prev + 2.2,
          dayRange: { min: 4_578.2, max: 4_610.55, current: +last.toFixed(2) },
          week52Range: { min: 4_100.1, max: 4_820.2, current: +last.toFixed(2) },
          volume: 170_234_567,
          avgVolume: 195_000_000,
          marketCap: symbol === '^GSPC' ? 40_000_000_000_000 : 2_500_000_000_000,
        },
      };
    },
    async getOHLC(symbol: string, range: string): Promise<OHLC[]> {
      const now = Date.now();
      if (range === '1D') return makeSeries(now - 6.5 * hour, 120, 3 * minute);
      if (range === '5D') return makeSeries(now - 5 * dayMs, 300, 24 * minute);
      if (range === '1M') return makeSeries(now - 30 * dayMs, 30, dayMs);
      if (range === '6M') return makeSeries(now - 182 * dayMs, 182, dayMs);
      if (range === 'YTD') return makeSeries(new Date(new Date().getFullYear(), 0, 1).valueOf(), 220, dayMs);
      if (range === '1Y') return makeSeries(now - 365 * dayMs, 260, dayMs);
      if (range === '5Y') return makeSeries(now - 5 * 365 * dayMs, 260, 7 * dayMs);
      return makeSeries(now - 10 * 365 * dayMs, 520, 7 * dayMs);
    },
    async getHistory(): Promise<OHLC[]> {
      const start = Date.now() - 160 * dayMs;
      return makeSeries(start, 120, dayMs);
    },
    async getNews(symbol: string): Promise<NewsItem[]> {
      const now = Date.now();
      return [
        {
          id: '1',
          title: `${symbol} edges higher amid mixed macro signals`,
          source: 'AltWire',
          url: 'https://example.com/1',
          publishedAt: new Date(now - 60 * minute).toISOString(),
        },
        {
          id: '2',
          title: `Analyst notes on ${symbol}: key levels into close`,
          source: 'StreetBeat',
          url: 'https://example.com/2',
          publishedAt: new Date(now - 6 * hour).toISOString(),
        },
      ];
    },
    async getOptionsChain(): Promise<{ rows: any[] }> {
      const base = 4600;
      const exps = ['2025-12-19', '2026-03-20'];
      const strikes = [4400, 4500, 4600, 4700, 4800];
      const rows: any[] = [];
      for (const exp of exps) {
        for (const k of strikes) {
          const mid = Math.max(0.5, Math.abs(base - k) / 100 + 2);
          rows.push({
            exp,
            strike: k,
            type: 'C',
            bid: +(mid - 0.2).toFixed(2),
            ask: +(mid + 0.2).toFixed(2),
            last: +mid.toFixed(2),
            iv: '18%',
            oi: Math.floor(Math.random() * 10_000),
            volume: Math.floor(Math.random() * 5_000),
          });
          rows.push({
            exp,
            strike: k,
            type: 'P',
            bid: +(mid - 0.3).toFixed(2),
            ask: +(mid + 0.3).toFixed(2),
            last: +mid.toFixed(2),
            iv: '20%',
            oi: Math.floor(Math.random() * 10_000),
            volume: Math.floor(Math.random() * 5_000),
          });
        }
      }
      return { rows };
    },
    async getIndexComponents(symbol: string): Promise<{ rows: any[] }> {
      if (symbol !== '^GSPC') return { rows: [] };
      const rows = [
        { symbol: 'AAPL', name: 'Apple Inc.', weight: '7.1%', last: 210.42, change: '+0.6%' },
        { symbol: 'MSFT', name: 'Microsoft Corp.', weight: '7.0%', last: 412.12, change: '+0.3%' },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: '6.5%', last: 118.55, change: '-0.2%' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: '3.5%', last: 168.4, change: '+0.1%' },
        { symbol: 'GOOGL', name: 'Alphabet Inc. A', weight: '2.2%', last: 145.9, change: '+0.4%' },
        { symbol: 'META', name: 'Meta Platforms Inc.', weight: '2.1%', last: 345.33, change: '+0.8%' },
      ];
      return { rows };
    },
  };
}
