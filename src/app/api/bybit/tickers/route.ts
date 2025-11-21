import { NextResponse } from 'next/server';
import { getTickers } from '@/lib/bybit-sdk';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Missing required query parameter: symbol' }, { status: 400 });
  }

  try {
    const tickers = await getTickers({ category: 'linear', symbol });
    return NextResponse.json(tickers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
