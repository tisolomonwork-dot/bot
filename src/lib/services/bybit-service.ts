'use server';

import CryptoJS from 'crypto-js';

const BYBIT_API_KEY = process.env.BYBIT_API_KEY || "RhoADnQnBB8csLKXUZ";
const BYBIT_API_SECRET = process.env.BYBIT_API_SECRET || "7kYPwUFixFTtiWJHfhaPptjj3oyjAk6tCc02";
const BYBIT_BASE_URL = "https://api.bybit.com";

interface BybitResponse {
  retCode: number;
  retMsg: string;
  result: any;
  time: number;
}

function createSignature(params: string, timestamp: string): string {
  const message = timestamp + BYBIT_API_KEY + "5000" + params;
  return CryptoJS.HmacSHA256(message, BYBIT_API_SECRET).toString();
}

async function bybitRequest(endpoint: string, method: string = "GET", body?: any): Promise<BybitResponse> {
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
  };

  if (method === "POST" && body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (data.retCode !== 0) {
      console.error(`Bybit API Error for endpoint ${endpoint}:`, data.retMsg);
    }
    return data;
  } catch (error) {
    console.error(`Failed to fetch from Bybit API endpoint ${endpoint}:`, error);
    throw new Error(`Bybit API request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getBalance() {
  const result = await bybitRequest("/v5/account/wallet-balance", "GET", { accountType: "UNIFIED" });
  if (result.retCode === 0 && result.result?.list?.[0]) {
    return parseFloat(result.result.list[0].totalWalletBalance || "0");
  }
  return 0;
}

export async function getCurrentPrice(symbol: string = "BTCUSDT") {
  const result = await bybitRequest("/v5/market/tickers", "GET", { category: "linear", symbol });
  if (result.retCode === 0 && result.result?.list?.[0]) {
    return parseFloat(result.result.list[0].lastPrice);
  }
  return 0;
}

export async function getPositions() {
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
    
    const result = await bybitRequest("/v5/order/create", "POST", orderParams);

    if (result.retCode === 0) {
        return { success: true, orderId: result.result.orderId };
    }
    
    throw new Error(result.retMsg || "Failed to place order");
}
