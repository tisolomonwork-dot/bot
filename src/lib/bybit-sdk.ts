// lib/bybit-sdk.ts
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

// Generates signature for private endpoints
function createSignature(params: string, timestamp: string): string {
  if (!BYBIT_API_SECRET) return '';
  const paramStr = timestamp + BYBIT_API_KEY + "5000" + params;
  return CryptoJS.HmacSHA256(paramStr, BYBIT_API_SECRET).toString(CryptoJS.enc.Hex);
}

async function bybitRequest(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: any,
  isPrivate: boolean = true
): Promise<any> {
  let url = `${BYBIT_BASE_URL}${endpoint}`;
  let payload = "";

  if (method === "GET" && body) {
    payload = new URLSearchParams(body).toString();
    if (payload) url += `?${payload}`;
  } else if (method === "POST" && body) {
    payload = JSON.stringify(body);
  }

  const timestamp = Date.now().toString();

  const headers: HeadersInit = {};
  if (isPrivate) {
    if (!BYBIT_API_KEY || !BYBIT_API_SECRET) {
      throw new Error("Bybit API key/secret not configured.");
    }
    headers["X-BAPI-API-KEY"] = BYBIT_API_KEY!;
    headers["X-BAPI-TIMESTAMP"] = timestamp;
    headers["X-BAPI-RECV-WINDOW"] = "5000";
    headers["X-BAPI-SIGN"] = createSignature(payload, timestamp);
  }

  if (method === "POST" && body) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(url, { method, headers, body: method === "POST" ? payload : undefined });
    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      return {
        retCode: res.status,
        retMsg: `Bybit non-JSON response for ${endpoint}: ${text.slice(0, 100)}`,
        result: null,
        time: Date.now(),
      };
    }

    const data: BybitResponse = await res.json();
    return data;
  } catch (err: any) {
    return { retCode: 500, retMsg: err.message, result: null, time: Date.now() };
  }
}

// ------------------ Public Endpoints ------------------

// Market tickers
export async function getTickers(params: { category: 'linear' | 'spot', symbol: string }) {
  const result = await bybitRequest("/v5/market/tickers", "GET", params, false);
  if (result.retCode !== 0) throw new Error(result.retMsg);
  return result.result.list || [];
}

// Market klines
export async function getKlines(params: {
  category: 'linear' | 'spot';
  symbol: string;
  interval: string;
  limit: number;
}) {
  const result = await bybitRequest("/v5/market/kline", "GET", params, false);
  if (result.retCode !== 0) throw new Error(result.retMsg);
  return (result.result.list || []).map((k: any) => ({
    date: new Date(parseInt(k[0])).toISOString(),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  })).reverse();
}

// ------------------ Private Endpoints ------------------

// Wallet balance
export async function getBalance() {
  const result = await bybitRequest("/v5/account/wallet-balance", "GET", { accountType: "UNIFIED" });
  if (result.retCode !== 0) throw new Error(result.retMsg);
  return result.result.list?.[0] || null;
}

// Positions
export async function getPositions() {
  const result = await bybitRequest("/v5/position/list", "GET", { category: "linear", settleCoin: "USDT" });
  if (result.retCode !== 0) throw new Error(result.retMsg);
  return result.result.list || [];
}

// Open orders
export async function getOpenOrders() {
  const result = await bybitRequest("/v5/order/realtime", "GET", { category: "linear", settleCoin: "USDT" });
  if (result.retCode !== 0) throw new Error(result.retMsg);
  return result.result.list || [];
}

// Place an order
export async function placeOrder(order: any) {
  const result = await bybitRequest("/v5/order/create", "POST", order);
  if (result.retCode !== 0) throw new Error(result.retMsg);
  return result.result;
}
