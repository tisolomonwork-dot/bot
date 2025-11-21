// This file is a server-side only SDK for Bybit.
// It contains secret keys and should never be imported into a client component.
import CryptoJS from 'crypto-js';

const BYBIT_API_KEY = process.env.BYBIT_API_KEY;
const BYBIT_API_SECRET = process.env.BYBIT_API_SECRET;
const BYBIT_BASE_URL = "https://api.bybit.com";

interface BybitResponse {
  retCode: number;
  retMsg: string;
  result: any;
  time: number;
}

function createSignature(params: string, timestamp: string): string {
    if (!BYBIT_API_SECRET) {
        return '';
    }
    const paramStr = timestamp + BYBIT_API_KEY + "5000" + params;
    return CryptoJS.HmacSHA256(paramStr, BYBIT_API_SECRET).toString(CryptoJS.enc.Hex);
}

async function bybitRequest(endpoint: string, method: string = "GET", body?: any): Promise<any> {
  if (!BYBIT_API_KEY || !BYBIT_API_SECRET) {
    const errorMsg = "Bybit API key and/or secret are not configured on the server.";
    console.error(errorMsg);
    // Return a structured error that the client can understand
    return { retCode: 10001, retMsg: errorMsg, result: null, time: Date.now() };
  }

  const timestamp = Date.now().toString();
  let url = `${BYBIT_BASE_URL}${endpoint}`;
  let params = "";
  
  if (method === "GET" && body) {
    params = new URLSearchParams(body).toString();
    if(params) {
      url += `?${params}`;
    }
  } else if (method === "POST" && body) {
    params = JSON.stringify(body);
  }

  const signature = createSignature(params, timestamp);

  const headers: HeadersInit = {
    "X-BAPI-API-KEY": BYBIT_API_KEY,
    "X-BAPI-TIMESTAMP": timestamp,
    "X-BAPI-SIGN": signature,
    "X-BAPI-RECV-WINDOW": "5000",
  };

  const options: RequestInit = {
    method,
    headers,
    cache: 'no-store'
  };

  if (method === "POST" && body) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
        const text = await response.text();
        const errorMsg = `Bybit API Error for endpoint ${endpoint}: Received non-JSON response. Status: ${response.status} ${text.slice(0, 100)}`;
        console.error(errorMsg);
        throw new Error(`Bybit API returned status ${response.status}. Check Vercel logs for details.`);
    }

    const data: BybitResponse = await response.json();
    
    // The API route handler will now check for non-zero retCode, so we can pass it through.
    // This allows client components to potentially handle specific Bybit errors if needed.
    return data;

  } catch (error: any) {
    // This catches network errors or JSON parsing errors
    const errorMsg = `Failed during Bybit request to ${endpoint}: ${error.message}`;
    console.error(errorMsg);
    throw new Error(errorMsg); // Re-throw to be caught by the API route handler
  }
}

export async function getBalance() {
  const result = await bybitRequest("/v5/account/wallet-balance", "GET", { accountType: "UNIFIED" });
  if (result.retCode !== 0) throw new Error(result.retMsg);
  return result?.result?.list?.[0] || null;
}

export async function getTickers(params: { category: 'linear' | 'spot', symbol: string }) {
    const result = await bybitRequest('/v5/market/tickers', 'GET', params);
    if (result.retCode !== 0) throw new Error(result.retMsg);
    return result?.result?.list || [];
}

export async function getPositions() {
  const result = await bybitRequest("/v5/position/list", "GET", {
    category: "linear",
    settleCoin: "USDT"
  });
  if (result.retCode !== 0) throw new Error(result.retMsg);
  return result?.result?.list || [];
}

export async function getOpenOrders() {
  const result = await bybitRequest("/v5/order/realtime", "GET", {
    category: "linear",
    settleCoin: "USDT",
  });
  if (result.retCode !== 0) throw new Error(result.retMsg);
  return result?.result?.list || [];
}

export async function placeOrder(order: any) {
    return bybitRequest("/v5/order/create", "POST", order);
}

export async function getKlines(params: {
    category: 'linear' | 'spot';
    symbol: string;
    interval: string;
    limit: number;
}) {
    const result = await bybitRequest('/v5/market/kline', 'GET', params);
    if (result.retCode !== 0) throw new Error(result.retMsg);
    return (result?.result?.list || []).map((k: any) => ({
        date: new Date(parseInt(k[0])).toISOString(),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
    })).reverse();
}
