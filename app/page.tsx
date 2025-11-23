'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [sym, setSym] = useState('^GSPC');
  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <h1>Quote Explorer</h1>
      <p>Type a symbol and jump to the full quote page layout.</p>
      <div style={{ display: 'flex', gap: 8, maxWidth: 520 }}>
        <input
          value={sym}
          onChange={(e) => setSym(e.target.value)}
          placeholder="AAPL, TSLA, ^GSPC"
          style={{ flex: 1, padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10 }}
        />
        <button
          onClick={() => router.push(`/quote/${encodeURIComponent(sym)}`)}
          style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc' }}
        >
          Open
        </button>
      </div>
      <p><span className="badge">Tip</span> Try <code>^GSPC</code>, <code>AAPL</code>, or <code>MSFT</code>.</p>
    </section>
  );
}
