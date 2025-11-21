'use server';

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

async function bybitRequest(endpoint: string, method: string = "GET", body?: any): Promise<BybitResponse> {
  const timestamp = Date.now().toString();
  let url = `${BYBIT_BASE_URL}${endpoint}`;
  let params = "";

  if (!BYBIT_API_KEY || !BYBIT_API_SECRET) {
    const errorResponse = {
        retCode: 10001,
        retMsg: "API key and secret are not configured on the server.",
        result: null,
        time: Date.now()
    };
    console.error(errorResponse.retMsg);
    return errorResponse as any;
  }
  
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

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
        const text = await response.text();
        console.error(`Bybit API Error for endpoint ${endpoint}: Received non-JSON response. Status: ${response.status}`, text.slice(0, 200));
        return {
            retCode: response.status,
            retMsg: `Bybit API returned a non-JSON response (likely an HTML error page). Status: ${response.status}`,
            result: null,
            time: Date.now()
        }
    }
    const data = await response.json();
    if (data.retCode !== 0) {
      console.error(`Bybit API Error for endpoint ${endpoint}:`, data.retMsg, 'Params:', body);
    }
    return data;
  } catch (error) {
    console.error(`Failed to fetch from Bybit API endpoint ${endpoint}:`, error);
    return {
        retCode: 500,
        retMsg: `Bybit API request failed: ${error instanceof Error ? error.message : "An unknown error occurred."}`,
        result: null,
        time: Date.now()
    };
  }
}

export async function getBalance() {
  if (!BYBIT_API_KEY || !BYBIT_API_SECRET) return 0;
  const result = await bybitRequest("/v5/account/wallet-balance", "GET", { accountType: "UNIFIED" });
  if (result.retCode === 0 && result.result?.list?.[0]) {
    return parseFloat(result.result.list[0].totalWalletBalance || "0");
  }
  return 0;
}

export async function getTickers(params: { category: 'linear' | 'spot', symbol: string }) {
    if (!BYBIT_API_KEY || !BYBIT_API_SECRET) return [];
    const result = await bybitRequest('/v5/market/tickers', 'GET', params);
    if (result.retCode === 0 && result.result?.list) {
        return result.result.list;
    }
    return [];
}


export async function getPositions() {
  if (!BYBIT_API_KEY || !BYBIT_API_SECRET) return [];
  const result = await bybitRequest("/v5/position/list", "GET", {
    category: "linear",
    settleCoin: "USDT"
  });
  if (result.retCode === 0 && result.result?.list) {
    return result.result.list.filter((pos: any) => parseFloat(pos.size) > 0);
  }
  return [];
}

export async function getOpenOrders() {
    if (!BYBIT_API_KEY || !BYBIT_API_SECRET) return [];
    try {
      const result = await bybitRequest("/v5/order/realtime", "GET", { 
        category: "linear",
        settleCoin: "USDT",
      });
      
      if (result.retCode === 0 && result.result?.list) {
        return result.result.list;
      }
      return [];
    } catch (error) {
      console.error("Error fetching open orders:", error);
      return [];
    }
}


export async function getClosedTrades() {
    if (!BYBIT_API_KEY || !BYBIT_API_SECRET) return [];
    try {
      const result = await bybitRequest("/v5/order/history", "GET", { 
        category: "linear", 
        limit: "100",
        settleCoin: "USDT"
      });
      
      if (result.retCode === 0 && result.result?.list) {
        return result.result.list.filter((order: any) => order.orderStatus === "Filled");
      }
      return [];
    } catch (error) {
      console.error("Error fetching closed trades:", error);
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
    if (!BYBIT_API_KEY || !BYBIT_API_SECRET) {
      return {
        retCode: 10001,
        retMsg: "API key and secret are not configured on the server.",
        result: null
      };
    }

    try {
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
        
        return await bybitRequest("/v5/order/create", "POST", orderParams);
    } catch (error) {
        console.error("Error in placeOrder:", error);
        return {
            retCode: 500,
            retMsg: error instanceof Error ? error.message : "An unknown error occurred while placing the order.",
            result: null
        };
    }
}

export async function getKlines(params: {
    category: 'linear' | 'spot';
    symbol: string;
    interval: '1' | '3' | '5' | '15' | '30' | '60' | '120' | '240' | '360' | '720' | 'D' | 'W' | 'M';
    start?: number;
    end?: number;
    limit?: number;
}) {
    if (!BYBIT_API_KEY || !BYBIT_API_SECRET) return [];
    const result = await bybitRequest('/v5/market/kline', 'GET', params);
    if (result.retCode === 0 && result.result?.list) {
        return result.result.list.map((k: any) => ({
            date: new Date(parseInt(k[0])).toISOString(),
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5]),
        })).reverse();
    }
    return [];
}
