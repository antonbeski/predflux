import type { Stock, StockDetails } from "./types";

export const dailyRecommendations: Stock[] = [
  {
    ticker: "RELIANCE",
    name: "Reliance Industries",
    exchange: "NSE",
    price: 2855.75,
    change: 25.45,
    changePercent: 0.9,
    recommendation: "Buy",
    reason: "Strong performance in retail and telecom sectors expected to drive growth.",
  },
  {
    ticker: "TCS",
    name: "Tata Consultancy",
    exchange: "NSE",
    price: 3845.2,
    change: -12.1,
    changePercent: -0.31,
    recommendation: "Hold",
    reason: "Stable earnings but facing short-term headwinds in the European market.",
  },
  {
    ticker: "HDFCBANK",
    name: "HDFC Bank",
    exchange: "BSE",
    price: 1529.5,
    change: 5.8,
    changePercent: 0.38,
    recommendation: "Buy",
    reason: "Consistent loan book growth and improving net interest margins.",
  },
  {
    ticker: "INFY",
    name: "Infosys",
    exchange: "NSE",
    price: 1502.9,
    change: -30.55,
    changePercent: -1.99,
    recommendation: "Sell",
    reason: "Guidance revision downwards due to project cancellations from major clients.",
  },
  {
    ticker: "ICICIBANK",
    name: "ICICI Bank",
    exchange: "BSE",
    price: 1120.0,
    change: 15.1,
    changePercent: 1.36,
    recommendation: "Buy",
    reason: "Strong digital presence and robust growth in retail lending.",
  },
];

const deterministicRandom = (seed: string) => {
  let h = 1779033703, i = 0, c;
  for (i = 0; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  }
}

const generatePriceHistory = (base: number, ticker: string) => {
  const history = [];
  let currentPrice = base;
  const random = deterministicRandom(ticker);
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString().split("T")[0],
      price: parseFloat(currentPrice.toFixed(2)),
    });
    currentPrice *= 1 + (random() - 0.48) / 10;
  }
  return history;
};

const analysisReasons: {[key: string]: string} = {
  RELIANCE: "Based on strong performance in retail and telecom sectors, the outlook is positive. The recent dip provides a good entry point. The O2C margin concern is noted but outweighed by growth in other areas.",
  TCS: "The company shows stable earnings but is facing short-term headwinds in the European market which justifies a hold position. Wait for market stabilization before making new investments.",
  HDFCBANK: "With consistent loan book growth and improving net interest margins, HDFC Bank presents a strong buy case. The banking sector outlook is also favorable.",
  INFY: "A downward revision in guidance due to project cancellations from major clients is a significant concern. It is advisable to sell and reassess after the next earnings report.",
  ICICIBANK: "The bank's strong digital presence and robust growth in retail lending make it a compelling buy. The current valuation is attractive for new entrants."
}

const recommendationHistories: {[key: string]: StockDetails['recommendationHistory']} = {
  RELIANCE: [
    { date: "2024-07-15", recommendation: "Buy", price: 2805.1 },
    { date: "2024-06-20", recommendation: "Hold", price: 2750.45 },
    { date: "2024-05-10", recommendation: "Buy", price: 2710.0 },
  ],
  TCS: [
    { date: "2024-07-15", recommendation: "Hold", price: 3850.0 },
    { date: "2024-06-20", recommendation: "Hold", price: 3800.0 },
    { date: "2024-05-10", recommendation: "Buy", price: 3750.0 },
  ],
  HDFCBANK: [
    { date: "2024-07-15", recommendation: "Buy", price: 1520.0 },
    { date: "2024-06-20", recommendation: "Buy", price: 1500.0 },
    { date: "2024-05-10", recommendation: "Hold", price: 1480.0 },
  ],
  INFY: [
    { date: "2024-07-15", recommendation: "Sell", price: 1530.0 },
    { date: "2024-06-20", recommendation: "Hold", price: 1580.0 },
    { date: "2024-05-10", recommendation: "Hold", price: 1600.0 },
  ],
  ICICIBANK: [
    { date: "2024-07-15", recommendation: "Buy", price: 1105.0 },
    { date: "2024-06-20", recommendation: "Buy", price: 1080.0 },
    { date: "2024-05-10", recommendation: "Buy", price: 1050.0 },
  ]
}

const confidenceScores: {[key: string]: number} = {
  RELIANCE: 0.88,
  TCS: 0.76,
  HDFCBANK: 0.92,
  INFY: 0.81,
  ICICIBANK: 0.95
}

export const stockDetailsData: { [key: string]: StockDetails } = 
  dailyRecommendations.reduce((acc, stock) => {
    acc[stock.ticker] = {
      ...stock,
      priceHistory: generatePriceHistory(stock.price, stock.ticker),
      news: [],
      recommendationHistory: recommendationHistories[stock.ticker] || [],
      analysis: {
        recommendation: stock.recommendation,
        reasoning: analysisReasons[stock.ticker] || stock.reason,
        confidenceScore: confidenceScores[stock.ticker] || 0.8,
      },
    };
    return acc;
  }, {} as {[key: string]: StockDetails});
