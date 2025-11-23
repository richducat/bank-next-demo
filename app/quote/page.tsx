import { redirect } from 'next/navigation';

export default function QuoteRedirect({ searchParams }: { searchParams: { s?: string } }) {
  const symbol = searchParams.s || '^GSPC';
  redirect(`/quote/${encodeURIComponent(symbol)}`);
}
