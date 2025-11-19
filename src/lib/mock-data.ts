import type { Asset, Position, Order, MarketData, ExchangePortfolio, AiInsight } from '@/lib/types';

export const exchangePortfolios: ExchangePortfolio[] = [
  {
    name: 'Bybit',
    totalValue: 52034.87,
    assetCount: 4,
    pnl: 1245.67,
  },
  {
    name: 'Gemini',
    totalValue: 21890.12,
    assetCount: 3,
    pnl: -345.12,
  },
];

export const totalPortfolioValue = exchangePortfolios.reduce((acc, p) => acc + p.totalValue, 0);
export const total24hChange = 2.15; // percentage

export const assets: Asset[] = [
  {
    id: 'btc', name: 'Bitcoin', symbol: 'BTC', balance: 0.75, value: 49500.00, change: 2.5, exchange: 'Bybit', allocation: 45
  },
  {
    id: 'eth', name: 'Ethereum', symbol: 'ETH', balance: 10, value: 34000.00, change: 1.8, exchange: 'Bybit', allocation: 30
  },
  {
    id: 'sol', name: 'Solana', symbol: 'SOL', balance: 150, value: 21000.00, change: -3.2, exchange: 'Gemini', allocation: 15
  },
  {
    id: 'usdt', name: 'Tether', symbol: 'USDT', balance: 10000, value: 10000.00, change: 0.0, exchange: 'Bybit', allocation: 10
  },
  {
    id: 'doge', name: 'Dogecoin', symbol: 'DOGE', balance: 50000, value: 7500.00, change: 10.5, exchange: 'Gemini', allocation: 5
  },
];

export const aiInsight: AiInsight = {
  summary: 'The market is showing bullish momentum, primarily led by BTC. Your portfolio is well-positioned to capitalize on this, but watch for a potential pullback in altcoins.',
  suggestedActions: [
    {
      action: 'Consider taking partial profits on DOGE.',
      riskScore: 'low',
      confidenceLevel: 'high',
    },
    {
      action: 'Monitor ETH for a breakout above $3,500.',
      riskScore: 'medium',
      confidenceLevel: 'medium',
    },
    {
      action: 'Increase BTC allocation if it holds the $65k support.',
      riskScore: 'medium',
      confidenceLevel: 'low',
    },
  ],
  riskScore: 'low',
  confidenceMeter: 85,
};

export const marketData: MarketData[] = [
  { 
    symbol: 'BTC/USD', 
    price: 66000, 
    change: 2.5, 
    volume: 45000000000,
    sparkline: [
      { month: "Jan", value: 38000 }, { month: "Feb", value: 42000 }, { month: "Mar", value: 55000 }, { month: "Apr", value: 62000 }, { month: "May", value: 58000 }, { month: "Jun", value: 66000 }
    ]
  },
  { 
    symbol: 'ETH/USD', 
    price: 3400, 
    change: 1.8, 
    volume: 22000000000,
    sparkline: [
      { month: "Jan", value: 2200 }, { month: "Feb", value: 2500 }, { month: "Mar", value: 3000 }, { month: "Apr", value: 3500 }, { month: "May", value: 3200 }, { month: "Jun", value: 3400 }
    ]
  },
  { 
    symbol: 'SOL/USD', 
    price: 140, 
    change: -3.2, 
    volume: 3000000000,
    sparkline: [
      { month: "Jan", value: 90 }, { month: "Feb", value: 110 }, { month: "Mar", value: 130 }, { month: "Apr", value: 180 }, { month: "May", value: 150 }, { month: "Jun", value: 140 }
    ]
  },
];

export const chartData = [
  { date: "2024-07-01", open: 67000, high: 67500, low: 66800, close: 67200 },
  { date: "2024-07-02", open: 67200, high: 68000, low: 67100, close: 67800 },
  { date: "2024-07-03", open: 67800, high: 68200, low: 67500, close: 67900 },
  { date: "2024-07-04", open: 67900, high: 68500, low: 67800, close: 68300 },
  { date: "2024-07-05", open: 68300, high: 69000, low: 68100, close: 68800 },
  { date: "2024-07-06", open: 68800, high: 68900, low: 68000, close: 68100 },
  { date: "2024-07-07", open: 68100, high: 68300, low: 67500, close: 67700 },
];


export const positions: Position[] = [
  { symbol: 'BTC/USD', size: 0.5, entryPrice: 62000, pnl: 2000, pnlPercent: 6.45 },
  { symbol: 'ETH/USD', size: 10, entryPrice: 3200, pnl: 2000, pnlPercent: 6.25 },
  { symbol: 'SOL/USD', size: 100, entryPrice: 160, pnl: -2000, pnlPercent: -12.5 },
];

export const openOrders: Order[] = [
  { symbol: 'BTC/USD', side: 'Buy', price: 65000, status: 'Open', type: 'Limit' },
  { symbol: 'ETH/USD', side: 'Sell', price: 3600, status: 'Open', type: 'Limit' },
];
