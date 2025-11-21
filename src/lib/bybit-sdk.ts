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

// Creates signature for Bybit v5
function createSignature(payload: string, timestamp: string): string {
    return CryptoJS.HmacSHA256(timestamp + BYBIT_API_KEY + "5000" + payload, BYBIT_API_SECRET!).toString(CryptoJS.enc.Hex);
}

// Unified request function
async function bybitRequest(endpoint: string, method: "GET" | "POST" = "GET", body?: any): Promise<BybitResponse> {
    if (!BYBIT_API_KEY || !BYBIT_API_SECRET) throw new Error("Bybit keys not configured.");

    const timestamp = Date.now().toString();
    let url = `${BYBIT_BASE_URL}${endpoint}`;
    let payload = "";

    if (method === "GET" && body) {
        // Sort query params alphabetically before signing
        const sortedKeys = Object.keys(body).sort();
        const query = sortedKeys.map(k => `${k}=${body[k]}`).join("&");
        payload = query;
        if (query) url += `?${query}`;
    } else if (method === "POST" && body) {
        // Stringify once, reuse for signing and body
        payload = JSON.stringify(body);
    }

    const signature = createSignature(payload, timestamp);

    const headers: HeadersInit = {
        "X-BAPI-API-KEY": BYBIT_API_KEY!,
        "X-BAPI-TIMESTAMP": timestamp,
        "X-BAPI-SIGN": signature,
        "X-BAPI-RECV-WINDOW": "5000",
    };

    const options: RequestInit = { method, headers, cache: 'no-store' };
    if (method === "POST") {
        headers["Content-Type"] = "application/json";
        options.body = payload;
    }

    const res = await fetch(url, options);

    const text = await res.text();
    if (!res.headers.get("content-type")?.includes("application/json")) {
        console.error("Non-JSON response:", text);
        return { retCode: res.status, retMsg: text.slice(0, 100), result: null, time: Date.now() };
    }

    return JSON.parse(text);
}

export async function getBalance() {
    const r = await bybitRequest("/v5/account/wallet-balance", "GET", { accountType: "UNIFIED" });
    if (r.retCode !== 0) throw new Error(r.retMsg);
    return r.result?.list?.[0] || null;
}

export async function getPositions() {
    const r = await bybitRequest("/v5/position/list", "GET", { category: "linear", settleCoin: "USDT" });
    if (r.retCode !== 0) throw new Error(r.retMsg);
    return r.result?.list || [];
}

export async function getTickers(params: { category: 'linear'|'spot'; symbol: string }) {
    const r = await bybitRequest("/v5/market/tickers", "GET", params);
    if (r.retCode !== 0) throw new Error(r.retMsg);
    return r.result?.list || [];
}

export async function placeOrder(order: any) {
    return bybitRequest("/v5/order/create", "POST", order);
}
