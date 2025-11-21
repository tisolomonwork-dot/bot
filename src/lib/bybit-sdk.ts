// Server-side only SDK for Bybit
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

// Generate HMAC signature
function createSignature(params: string, timestamp: string): string {
  if (!BYBIT_API_SECRET || !BYBIT_API_KEY) return '';
  const paramStr = timestamp + BYBIT_API_KEY + "5000" + params;
  return CryptoJS.HmacSHA256(paramStr, BYBIT_API_SECRET).toString(CryptoJS.enc.Hex);
}

async function bybitRequest(endpoint: string, method: string = "GET", body?: any, auth: boolean = true): Promise<any> {
  let url = `${BYBIT_BASE_URL}${endpoint}`;
  let paramsStr = "";

  // GET query string
  if (method === "GET" && body) {
    paramsStr = new URLSearchParams(body).toString();
    if (paramsStr) url += `?${paramsStr}`;
  }

  // POST body string
  if (method === "POST" && body) {
    paramsStr = JSON.stringify(body);
  }

  const headers: HeadersInit = {};

  // Only sign private requests
  if (auth) {
    if (!BYBIT_API_KEY || !BYBIT_API_SECRET) {
      const errorMsg = "Bybit API key or secret missing.";
      console.error(errorMsg);
      return { retCode: 10001, retMsg: errorMsg, result: null, time: Date.now() };
    }
    const timestamp = Date.now().toString();
    const signature = createSignature(paramsStr, timestamp);
    headers["X-BAPI-API-KEY"] = BYBIT_API_KEY;
    headers["X-BAPI-TIMESTAMP"] = timestamp;
    headers["X-BAPI-SIGN"] = signature;
    headers["X-BAPI-RECV-WINDOW"] = "5000";
  }

  if (method === "POST" && body) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(url, { method, headers, body: method === "POST" ? paramsStr : undefined, cache: 'no-store' });

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error(`Bybit non-JSON response for ${endpoint}: ${res.status} ${text.slice(0, 100)}`);
      return { retCode: res.status, retMsg: "Non-JSON response", result: null, time: Date.now() };
    }

    const data: BybitResponse = await res.json();
    return data;

  } catch (e: any) {
    console.error(`Bybit request failed for ${endpoint}: ${e.message}`);
    return { retCode: 500, retMsg: e.message, result: null, time: Date.now() };
  }
}

// Private endpoints
export async function getBalance() {
  const result = await bybitRequest("/v5/account/wallet-balance", "GET", { accountType: "UNIFIED" });
  if (result.retCode !== 0) throw new Error(result.retMsg);
  return result?.result?.list?.[0] || null;
}

export async function getPositions() {
  const result = await bybitRequest("/v5/position/list", "GET", { category: "linear", settleCoin: "USDT" });
  if (result.retCode !== 0) throw new Error(result.retMsg);
  return result?.result?.list || [];
}

export async function getOpenOrders() {
  const result = await bybitRequest("/v5/order/realtime", "GET", { category: "linear", settleCoin: "USDT" });
  if (result.retCode !== 0) throw new Error(result.retMsg);
  return result?.result?.list || [];
}

export async function placeOrder(order: any) {
  return bybitRequest("/v5/order/create", "POST", order);
}

// Public endpoints (no signature)
export async function getTickers(params: { category: 'linear' | 'spot', symbol: string }) {
  const result = await bybitRequest('/v5/market/tickers', 'GET', params, false);
  if (result.retCode !== 0) throw new Error(result.retMsg);
  return result?.result?.list || [];
}

export async function getKlines(params: { category: 'linear' | 'spot'; symbol: string; interval: string; limit: number }) {
  const result = await bybitRequest('/v5/market/kline', 'GET', params, false);
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
