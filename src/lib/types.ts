export type Asset = {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  change: number;
  exchange: 'Bybit' | 'Gemini';
  allocation: number;
};

export type Position = {
  symbol: string;
  size: number;
  entryPrice: number;
  pnl: number;
  pnlPercent: number;
};

export type Order = {
  symbol: string;
  side: 'Buy' | 'Sell';
  price: number;
  status: 'Open' | 'Filled' | 'Canceled';
  type: 'Limit' | 'Market';
};

export type MarketData = {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  sparkline: { month: string; value: number }[];
};

export type ExchangePortfolio = {
  name: 'Bybit' | 'Gemini';
  totalValue: number;
  assetCount: number;
  pnl: number;
};

export type Settings = {
  apiKeyBybit: string;
  apiSecretBybit: string;
and so on for Gemini keys...
  timezone: string;
  baseCurrency: 'USD' | 'USDT' | 'GHS' | 'NGN';
  riskPreference: 'conservative' | 'normal' | 'aggressive';
  aiTone: 'short' | 'detailed' | 'strict';
};

export type AiInsight = {
  summary: string;
  suggestedActions: {
    action: string;
    riskScore: 'low' | 'medium' | 'high';
    confidenceLevel: 'low' | 'medium' | 'high';
  }[];
  riskScore: 'low' | 'medium' | 'high';
  confidenceMeter: number;
};
