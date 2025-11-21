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
        // This case is handled in bybitRequest, but as a safeguard.
        return '';
    }
    // As per Bybit V5 API docs: timestamp + apiKey + recvWindow + (queryParams || requestBody)
    const paramStr = timestamp + BYBIT_API_KEY + "5000" + params;
    return CryptoJS.HmacSHA256(paramStr, BYBIT_API_SECRET).toString(CryptoJS.enc.Hex);
}

async function bybitRequest(endpoint: string, method: string = "GET", body?: any): Promise<any> {
  if (!BYBIT_API_KEY || !BYBIT_API_SECRET) {
    console.error("Bybit API key and secret are not configured on the server.");
    // Return a structured error that the client can understand
    return { retCode: 10001, retMsg: "Bybit API key and secret are not configured on the server.", result: null };
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

  // This is the crucial part: Check for non-OK responses (like 403)
  // which often return HTML, not JSON.
  if (!response.ok) {
    const errorMsg = `Bybit API Error for endpoint ${endpoint}: Received non-JSON response. Status: ${response.status} ${text.slice(0, 100)}`;
    console.error(errorMsg);
    throw new Error(`Bybit API returned status ${response.status}. Check Vercel logs for details.`);
  }
  
  try {
    const data: BybitResponse = JSON.parse(text);
    if (data.retCode !== 0) {
      console.error(`Bybit API Error for endpoint ${endpoint}:`, data.retMsg, 'Params:', body);
      // Throw an error that the client-side fetcher can catch and display
      throw new Error(data.retMsg || 'Bybit API request failed.');
    }
    return data.result;
  } catch (e) {
    // This catches errors from JSON.parse if the response is not valid JSON
    console.error(`Bybit API Error for endpoint ${endpoint}: Failed to parse JSON response.`, text.slice(0, 200));
    throw new Error("Failed to parse JSON response from Bybit.");
  }
}

export async function getBalance() {
  const result = await bybitRequest("/v5/account/wallet-balance", "GET", { accountType: "UNIFIED" });
  // The API returns a list, we want the first (and usually only) item.
  // The structure is { list: [ { ... balance info ... } ] }
  return result?.list?.[0] || { totalWalletBalance: '0' };
}

export async function getTickers(params: { category: 'linear' | 'spot', symbol: string }) {
    const result = await bybitRequest('/v5/market/tickers', 'GET', params);
    return result?.list || [];
}

export async function getPositions() {
  const result = await bybitRequest("/v5/position/list", "GET", {
    category: "linear",
    settleCoin: "USDT" // Or whatever coin you are trading with
  });
  // Filter out positions that are closed (size is 0)
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
    // For linear perpetuals, positionIdx is used to distinguish between long and short mode.
    // 1 for long, 2 for short.
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
    
    // We now return the whole response object from bybitRequest, which includes retCode and retMsg
    return bybitRequest("/v5/order/create", "POST", orderParams);
}

export async function getKlines(params: {
    category: 'linear' | 'spot';
    symbol: string;
    interval: '1' | '3' | '5' | '15' | '30' | '60' | '120' | '240' | '360' | '720' | 'D' | 'W' | 'M';
    limit: number;
}) {
    const result = await bybitRequest('/v5/market/kline', 'GET', params);
    // Bybit returns kline data as an array of arrays. We map it to an array of objects.
    // [timestamp, open, high, low, close, volume, turnover]
    return (result?.list || []).map((k: any) => ({
        date: new Date(parseInt(k[0])).toISOString(),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
    })).reverse(); // Reverse to have the most recent data last
}
