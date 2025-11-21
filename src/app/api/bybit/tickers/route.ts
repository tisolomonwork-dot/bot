import { NextResponse } from 'next/server';
import { getTickers } from '@/lib/bybit-sdk';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tickers = await getTickers({ category: 'linear', symbol: 'BTCUSDT' });
    return NextResponse.json(tickers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
