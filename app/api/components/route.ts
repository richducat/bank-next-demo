import { NextRequest, NextResponse } from 'next/server';
import { provider } from '@/lib/providers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') || '^GSPC';
  const data = await provider.getIndexComponents(symbol);
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
