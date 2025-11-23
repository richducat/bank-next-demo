import { NextRequest, NextResponse } from 'next/server';
import { provider } from '@/lib/providers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') || '^GSPC';
  const range = searchParams.get('range') || '1D';
  const data = await provider.getOHLC(symbol, range);
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
