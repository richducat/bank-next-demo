import QuoteView from '@/components/QuoteView';

export default function QuotePage({ params }: { params: { symbol: string } }) {
  const symbol = decodeURIComponent(params.symbol);
  return <QuoteView symbol={symbol} />;
}
