import { NextResponse } from 'next/server';
import { getPositions } from '@/lib/bybit-sdk';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const positions = await getPositions();
    return NextResponse.json(positions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
