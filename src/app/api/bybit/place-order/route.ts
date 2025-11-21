import { NextResponse } from 'next/server';
import { placeOrder } from '@/lib/bybit-sdk';

export async function POST(request: Request) {
  try {
    const order = await request.json();
    const result = await placeOrder(order);
    if (result.retCode !== 0) {
      return NextResponse.json({ error: result.retMsg }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
