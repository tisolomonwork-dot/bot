import { NextResponse } from 'next/server';
import { getBalance } from '@/lib/bybit-sdk';

export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const balance = await getBalance();
    return NextResponse.json(balance);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
