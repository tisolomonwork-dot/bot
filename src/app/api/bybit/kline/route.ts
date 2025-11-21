import { NextResponse } from 'next/server';
import { getKlines } from '@/lib/bybit-sdk';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval');
  const limit = searchParams.get('limit');

  if (!symbol || !interval || !limit) {
    return NextResponse.json({ error: 'Missing required query parameters: symbol, interval, limit' }, { status: 400 });
  }

  try {
    const klines = await getKlines({
      category: 'linear',
      symbol,
      interval: interval as any, 
      limit: parseInt(limit),
    });
    return NextResponse.json(klines);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
