import { NextRequest, NextResponse } from 'next/server';
import { getTickers } from '@/lib/bybit-sdk';

export async function GET(req: NextRequest) {
  try {
    const symbol = req.nextUrl.searchParams.get('symbol') || 'BTCUSDT';
    const category = (req.nextUrl.searchParams.get('category') as 'linear' | 'spot') || 'linear';
    const data = await getTickers({ symbol, category });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
