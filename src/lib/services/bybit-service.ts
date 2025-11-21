// This file is now a client-side service to call our own Next.js API routes.
// It does NOT contain any secret keys and is safe for the client.

async function fetcher(url: string, options: RequestInit = {}) {
    const res = await fetch(url, {
        ...options,
        cache: 'no-store', // Ensure fresh data
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'An unknown API error occurred.' }));
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
    }
    return res.json();
}


export async function getBalance(): Promise<number> {
  try {
    const data = await fetcher('/api/bybit/balance');
    return data.totalWalletBalance ? parseFloat(data.totalWalletBalance) : 0;
  } catch (error) {
    console.error("Failed to fetch balance:", error);
    return 0; // Return a safe default
  }
}

export async function getPositions(): Promise<any[]> {
  try {
    return await fetcher('/api/bybit/positions');
  } catch (error) {
    console.error("Failed to fetch positions:", error);
    return []; // Return a safe default
  }
}

export async function getOpenOrders(): Promise<any[]> {
  try {
    return await fetcher('/api/bybit/orders');
  } catch (error) {
    console.error("Failed to fetch open orders:", error);
    return [];
  }
}


export async function getKlines(params: {
    symbol: string;
    interval: '1' | '3' | '5' | '15' | '30' | '60' | '120' | '240' | '360' | '720' | 'D' | 'W' | 'M';
    limit: number;
}): Promise<any[]> {
    const query = new URLSearchParams({
        symbol: params.symbol,
        interval: params.interval,
        limit: params.limit.toString(),
    }).toString();

    try {
        return await fetcher(`/api/bybit/kline?${query}`);
    } catch (error) {
        console.error("Failed to fetch klines:", error);
        return [];
    }
}

export async function getTickers(params: { symbol: string }): Promise<any[]> {
    const query = new URLSearchParams({ symbol: params.symbol }).toString();
    try {
        return await fetcher(`/api/bybit/tickers?${query}`);
    } catch (error) {
        console.error("Failed to fetch tickers:", error);
        return [];
    }
}


export async function placeOrder(order: {
    symbol: string, 
    side: 'Buy' | 'Sell', 
    qty: number, 
    price?: number, 
    stopLoss?: number, 
    takeProfit?: number
}) {
    const response = await fetch('/api/bybit/place-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Failed to place order.');
    }
    
    // The API route now ensures retCode is 0, so we can just return the result
    return result;
}
