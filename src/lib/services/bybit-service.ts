// This file is a client-side service to call our own Next.js API routes.
// It does NOT contain any secret keys and is safe for the client.

// Helper to determine the base URL for API requests.
// On the server, it uses the Vercel URL. In the browser, it uses a relative path.
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side requests can use a relative path
    return '';
  }
  // Server-side requests need an absolute path
  return `https://${process.env.VERCEL_URL || 'localhost:3000'}`;
};

async function fetcher(url: string, options: RequestInit = {}) {
    const fullUrl = `${getBaseUrl()}${url}`;
    const res = await fetch(fullUrl, {
        ...options,
        cache: 'no-store',
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'An unknown API error occurred.' }));
        throw new Error(errorData.error || `Request to ${url} failed with status ${res.status}`);
    }
    return res.json();
}


export async function getBalance(): Promise<number> {
  try {
    const data = await fetcher('/api/bybit/balance');
    return data.totalWalletBalance ? parseFloat(data.totalWalletBalance) : 0;
  } catch (error) {
    console.error("Failed to fetch balance:", error);
    return 0; 
  }
}

export async function getPositions(): Promise<any[]> {
  try {
    return await fetcher('/api/bybit/positions');
  } catch (error) {
    console.error("Failed to fetch positions:", error);
    return [];
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
    interval: string;
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
    // This function will throw an error on failure, which will be caught by the form handler.
    const result = await fetcher('/api/bybit/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
    });
    
    // The API route now ensures retCode is 0, so we can just return the result
    return result;
}
