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
    throw new Error("Bybit API key and secret are not configured on the server.");
  }

  const timestamp = Date.now().toString();
  let url = `${BYBIT_BASE_URL}${endpoint}`;
  let params = "";
  
  if (method === "GET" && body) {
    const queryParams = new URLSearchParams(body).toString();
    params = queryParams;
    url += `?${queryParams}`;
  } else if (method === "POST" && body) {
    params = JSON.stringify(body);
  }

  const signature = createSignature(params, timestamp);

  const headers: any = {
    "X-BAPI-API-KEY": BYBIT_API_KEY,
    "X-BAPI-TIMESTAMP": timestamp,
    "X-BAPI-SIGN": signature,
    "X-BAPI-RECV-WINDOW": "5000",
  };

  if (method === "POST") {
    headers["Content-Type"] = "application/json";
  }

  const options: RequestInit = {
    method,
    headers,
    cache: 'no-store'
  };

  if (method === "POST" && body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const text = await response.text();

  if (!response.ok) {
    const errorMsg = `Bybit API Error for endpoint ${endpoint}: Received non-JSON response. Status: ${response.status} ${text.slice(0, 100)}`;
    console.error(errorMsg);
    throw new Error(`Bybit API returned a non-JSON response (likely an HTML error page). Status: ${response.status}`);
  }
  
  try {
    const data: BybitResponse = JSON.parse(text);
    if (data.retCode !== 0) {
      console.error(`Bybit API Error for endpoint ${endpoint}:`, data.retMsg, 'Params:', body);
      throw new Error(data.retMsg || 'Bybit API request failed.');
    }
    return data.result;
  } catch (e) {
    console.error(`Bybit API Error for endpoint ${endpoint}: Failed to parse JSON response.`, text.slice(0, 200));
    throw new Error("Failed to parse JSON response from Bybit.");
  }
}

export async function getBalance() {
  const result = await bybitRequest("/v5/account/wallet-balance", "GET", { accountType: "UNIFIED" });
  return result?.list?.[0] || { totalWalletBalance: '0' };
}

export async function getTickers(params: { category: 'linear' | 'spot', symbol: string }) {
    const result = await bybitRequest('/v5/market/tickers', 'GET', params);
    return result?.list || [];
}

export async function getPositions() {
  const result = await bybitRequest("/v5/position/list", "GET", {
    category: "linear",
    settleCoin: "USDT"
  });
  return (result?.list || []).filter((pos: any) => parseFloat(pos.size) > 0);
}

export async function getOpenOrders() {
  const result = await bybitRequest("/v5/order/realtime", "GET", {
    category: "linear",
    settleCoin: "USDT",
  });
  return result?.list || [];
}

export async function placeOrder(order: {
    symbol: string, 
    side: 'Buy' | 'Sell', 
    qty: number, 
    stopLoss?: number, 
    takeProfit?: number
}) {
    const { symbol, side, qty, stopLoss, takeProfit } = order;
    const positionIdx = side === "Buy" ? 1 : 2;
    
    const orderParams: any = {
      category: "linear",
      symbol,
      side,
      orderType: "Market",
      qty: qty.toString(),
      positionIdx,
    };
    
    if (stopLoss) {
      orderParams.stopLoss = stopLoss.toString();
    }
    
    if (takeProfit) {
      orderParams.takeProfit = takeProfit.toString();
    }
    
    // The bybitRequest function now throws on error, so we don't need to check retCode here.
    return bybitRequest("/v5/order/create", "POST", orderParams);
}

export async function getKlines(params: {
    category: 'linear' | 'spot';
    symbol: string;
    interval: '1' | '3' | '5' | '15' | '30' | '60' | '120' | '240' | '360' | '720' | 'D' | 'W' | 'M';
    limit: number;
}) {
    const result = await bybitRequest('/v5/market/kline', 'GET', params);
    return (result?.list || []).map((k: any) => ({
        date: new Date(parseInt(k[0])).toISOString(),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
    })).reverse();
}
