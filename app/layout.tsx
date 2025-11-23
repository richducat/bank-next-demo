import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AltFinance Quote',
  description: 'Yahoo Finance-style quote page with original theme',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="header-inner container">
            <div className="brand">AltFinance</div>
            <form action="/quote/" className="search" method="get">
              <input name="s" placeholder="Search symbol (e.g., AAPL, ^GSPC)" aria-label="Symbol" />
              <button type="submit">Go</button>
            </form>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
