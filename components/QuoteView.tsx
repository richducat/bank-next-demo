'use client';
import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

type PricePoint = { last: number; change: number; changePct: number; asOf: string; session: 'regular' | 'pre' | 'post' };
type RangeStat = { min: number; max: number; current: number };
type KeyStats = {
  previousClose?: number;
  open?: number;
  dayRange?: RangeStat;
  week52Range?: RangeStat;
  volume?: number;
  avgVolume?: number;
  marketCap?: number;
};
type Quote = { symbol: string; longName: string; currency: string; exchange: string; price: PricePoint; stats: KeyStats };
type OHLC = { t: number; o: number; h: number; l: number; c: number; v?: number };
type NewsItem = { id: string; title: string; source: string; url: string; publishedAt: string };

type Tab = 'summary' | 'chart' | 'news' | 'community' | 'history' | 'options' | 'components';
type Range = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatNumber(n?: number) {
  if (n == null || Number.isNaN(n)) return '—';
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  return Intl.NumberFormat().format(n);
}

function pct(p?: number) {
  if (p == null || Number.isNaN(p)) return '—';
  return `${p >= 0 ? '+' : ''}${p.toFixed(2)}%`;
}

export default function QuoteView({ symbol }: { symbol: string }) {
  const [tab, setTab] = useState<Tab>('summary');
  const [range, setRange] = useState<Range>('1D');

  const { data: quote } = useSWR<Quote>(`/api/quote?symbol=${encodeURIComponent(symbol)}`, fetcher, { refreshInterval: 2500 });
  const { data: ohlc } = useSWR<OHLC[]>(`/api/ohlc?symbol=${encodeURIComponent(symbol)}&range=${range}`, fetcher);
  const { data: news } = useSWR<NewsItem[]>(`/api/news?symbol=${encodeURIComponent(symbol)}`, fetcher);
  const { data: hist } = useSWR<OHLC[]>(`/api/history?symbol=${encodeURIComponent(symbol)}`, fetcher);

  const price = quote?.price;
  const stats = quote?.stats;
  const isUp = (price?.change ?? 0) >= 0;

  const chartData = useMemo(() => {
    const points = ohlc ?? [];
    return {
      labels: points.map((p) => p.t),
      datasets: [
        {
          label: symbol,
          data: points.map((p) => p.c),
          borderColor: '#3958ff',
          backgroundColor: 'rgba(57,88,255,0.15)',
          fill: false,
          tension: 0.2,
        },
      ],
    };
  }, [ohlc, symbol]);

  const chartOpts: any = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
      scales: {
        x: { type: 'time', time: { unit: 'day' }, ticks: { maxRotation: 0 } },
        y: { beginAtZero: false },
      },
    }),
    []
  );

  return (
    <div className="grid">
      {/* Main */}
      <section>
        <article className="card">
          <header className="quote-header" aria-live="polite">
            <div>
              <div className="symbol">{quote?.symbol ?? symbol}</div>
              <div className="name">{quote?.longName ?? '—'} · {quote?.exchange ?? '—'} · {quote?.currency ?? 'USD'}</div>
            </div>
            <div />
            <div className="price-wrap">
              <div className="price">{price ? price.last.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}</div>
              <div className={`delta ${isUp ? 'up' : 'down'}`}>
                {isUp ? '▲' : '▼'} {price ? price.change.toFixed(2) : '—'} ({price ? pct(price.changePct) : '—'})
              </div>
              <div className="meta">
                {price ? (price.session === 'regular' ? 'At close' : price.session === 'pre' ? 'Pre-market' : 'After hours') : ''}
                {' · '}
                {price ? new Date(price.asOf).toLocaleTimeString() : ''}
              </div>
            </div>
          </header>

          {/* Tabs */}
          <nav className="tabs" role="tablist" aria-label="Quote sections">
            {(
              [
                ['summary', 'Summary'],
                ['chart', 'Chart'],
                ['news', 'News'],
                ['community', 'Community'],
                ['history', 'Historical Data'],
                ['options', 'Options'],
                ['components', 'Components'],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button key={key} role="tab" className="tab" aria-selected={tab === key} onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
          </nav>

          {/* Time range toolbar (Summary & Chart) */}
          {(tab === 'summary' || tab === 'chart') && (
            <div className="toolbar" role="toolbar" aria-label="Time ranges">
              {(['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'MAX'] as Range[]).map((r) => (
                <button key={r} className="chip" aria-pressed={range === r} onClick={() => setRange(r)}>
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Content switcher */}
          {tab === 'summary' && (
            <section aria-label="Key stats" className="stats">
              <Stat label="Previous Close" value={formatNumber(stats?.previousClose)} />
              <Stat label="Open" value={formatNumber(stats?.open)} />
              <Stat label="Day's Range" value={<RangeBar stat={stats?.dayRange} />} />
              <Stat label="52 Week Range" value={<RangeBar stat={stats?.week52Range} />} />
              <Stat label="Volume" value={formatNumber(stats?.volume)} />
              <Stat label="Avg. Volume" value={formatNumber(stats?.avgVolume)} />
              <Stat label="Market Cap" value={formatNumber(stats?.marketCap)} />
              <section className="card" style={{ margin: '12px 16px 16px', padding: 16, gridColumn: '1 / -1' }}>
                <div style={{ height: 420 }}>
                  <Line data={chartData} options={chartOpts} />
                </div>
              </section>
            </section>
          )}

          {tab === 'chart' && (
            <section className="card" style={{ margin: '12px 16px 16px', padding: 16 }}>
              <div style={{ height: 520 }}>
                <Line data={chartData} options={chartOpts} />
              </div>
            </section>
          )}

          {tab === 'news' && (
            <section className="card" style={{ margin: '12px 16px 16px', padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>Latest news</h3>
              <ul style={{ paddingLeft: 18 }}>
                {(news ?? []).map((n) => (
                  <li key={n.id} style={{ marginBottom: 8 }}>
                    <a href={n.url} target="_blank" rel="noreferrer">
                      {n.title}
                    </a>{' '}
                    <span className="meta">· {n.source} · {new Date(n.publishedAt).toLocaleString()}</span>
                  </li>
                ))}
                {(!news || news.length === 0) && <li className="meta">No news available (using mock provider).</li>}
              </ul>
            </section>
          )}

          {tab === 'history' && (
            <section className="card" style={{ margin: '12px 16px 16px', padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>Historical Data</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Open</th>
                      <th>High</th>
                      <th>Low</th>
                      <th>Close</th>
                      <th>Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(hist ?? [])
                      .slice()
                      .reverse()
                      .map((row) => (
                        <tr key={row.t}>
                          <td>{new Date(row.t).toLocaleDateString()}</td>
                          <td>{row.o.toFixed(2)}</td>
                          <td>{row.h.toFixed(2)}</td>
                          <td>{row.l.toFixed(2)}</td>
                          <td>{row.c.toFixed(2)}</td>
                          <td>{row.v ? row.v.toLocaleString() : '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === 'options' && <OptionsChain symbol={symbol} />}

          {tab === 'components' && <IndexComponents symbol={symbol} />}
        </article>
      </section>

      {/* Aside */}
      <aside className="aside-stack">
        <div className="card aside-card">
          <h3 style={{ marginTop: 0 }}>Performance outlook</h3>
          <p className="meta">Short · Mid · Long term (demo)</p>
        </div>
        <div className="card aside-card">
          <h3 style={{ marginTop: 0 }}>People also watch</h3>
          <ul className="meta">
            <li>^DJI · Dow Jones</li>
            <li>^IXIC · Nasdaq Composite</li>
            <li>VTI · Total Market</li>
          </ul>
        </div>
        <div className="card aside-card">
          <h3 style={{ marginTop: 0 }}>About</h3>
          <p className="meta">This demo mirrors common finance UI patterns with original styling. Not affiliated with Yahoo or S&P.</p>
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <dl className="stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </dl>
  );
}

function RangeBar({ stat }: { stat?: { min: number; max: number; current: number } }) {
  if (!stat) return <span>—</span>;
  const span = stat.max - stat.min || 1;
  const pctVal = Math.max(0, Math.min(100, ((stat.current - stat.min) / span) * 100));
  return (
    <div className="range" role="img" aria-label={`Range ${stat.min} to ${stat.max}, current ${stat.current}`}>
      <span className="meta">{stat.min.toFixed(2)}</span>
      <div className="range-bar" aria-hidden="true">
        <div className="range-fill" style={{ width: `${pctVal}%` }} />
      </div>
      <span className="meta" style={{ textAlign: 'right' }}>{stat.max.toFixed(2)}</span>
    </div>
  );
}

function OptionsChain({ symbol }: { symbol: string }) {
  const { data } = useSWR(`/api/options?symbol=${encodeURIComponent(symbol)}`, fetcher);
  const rows = (data?.rows ?? []) as any[];
  return (
    <section className="card" style={{ margin: '12px 16px 16px', padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Options (mock/provider dependent)</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Expiration</th>
              <th>Strike</th>
              <th>Type</th>
              <th>Bid</th>
              <th>Ask</th>
              <th>Last</th>
              <th>IV</th>
              <th>OI</th>
              <th>Vol</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.exp}-${r.type}-${r.strike}`}>
                <td>{r.exp}</td>
                <td>{r.strike}</td>
                <td>{r.type}</td>
                <td>{r.bid}</td>
                <td>{r.ask}</td>
                <td>{r.last}</td>
                <td>{r.iv}</td>
                <td>{r.oi}</td>
                <td>{r.volume}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="meta">
                  No options available for provider (mock by default).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function IndexComponents({ symbol }: { symbol: string }) {
  const { data } = useSWR(`/api/components?symbol=${encodeURIComponent(symbol)}`, fetcher);
  const rows = (data?.rows ?? []) as any[];
  return (
    <section className="card" style={{ margin: '12px 16px 16px', padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Index Components</h3>
      <p className="meta">Demo list (provider required for full, licensed constituents).</p>
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Weight</th>
              <th>Last</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.symbol}>
                <td>{r.symbol}</td>
                <td>{r.name}</td>
                <td>{r.weight ?? '—'}</td>
                <td>{r.last?.toFixed ? r.last.toFixed(2) : r.last}</td>
                <td>{r.change ?? '—'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="meta">
                  No components for this symbol.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
