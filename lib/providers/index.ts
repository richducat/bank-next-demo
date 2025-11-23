import { mockProvider } from './mock';
import { polygonProvider } from './polygon';

export type Quote = {
  symbol: string;
  longName: string;
  currency: string;
  exchange: string;
  price: { last: number; change: number; changePct: number; asOf: string; session: 'regular' | 'pre' | 'post' };
  stats: {
    previousClose?: number;
    open?: number;
    dayRange?: { min: number; max: number; current: number };
    week52Range?: { min: number; max: number; current: number };
    volume?: number;
    avgVolume?: number;
    marketCap?: number;
  };
};
export type OHLC = { t: number; o: number; h: number; l: number; c: number; v?: number };
export type NewsItem = { id: string; title: string; source: string; url: string; publishedAt: string };

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<Quote>;
  getOHLC(symbol: string, range: string): Promise<OHLC[]>;
  getHistory(symbol: string): Promise<OHLC[]>;
  getNews(symbol: string): Promise<NewsItem[]>;
  getOptionsChain(symbol: string): Promise<{ rows: any[] }>;
  getIndexComponents(symbol: string): Promise<{ rows: any[] }>;
}

function pickProvider(): MarketDataProvider {
  const p = (process.env.DATA_PROVIDER || 'mock').toLowerCase();
  if (p === 'polygon') return polygonProvider();
  return mockProvider();
}

export const provider = pickProvider();
