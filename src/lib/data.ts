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

const generatePriceHistory = (base: number) => {
  const history = [];
  let currentPrice = base;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString().split("T")[0],
      price: parseFloat(currentPrice.toFixed(2)),
    });
    currentPrice *= 1 + (Math.random() - 0.48) / 10;
  }
  return history;
};

export const stockDetailsData: { [key: string]: StockDetails } = {
  RELIANCE: {
    ...dailyRecommendations[0],
    priceHistory: generatePriceHistory(2855.75),
    news: [
      { title: "Reliance Retail posts record quarterly profit", source: "Livemint", sentiment: "Positive", url: "#" },
      { title: "Jio adds 5 million subscribers in May", source: "Economic Times", sentiment: "Positive", url: "#" },
      { title: "Concerns over O2C business margins loom", source: "Reuters", sentiment: "Negative", url: "#" },
    ],
    recommendationHistory: [
      { date: "2024-07-15", recommendation: "Buy", price: 2805.1 },
      { date: "2024-06-20", recommendation: "Hold", price: 2750.45 },
      { date: "2024-05-10", recommendation: "Buy", price: 2710.0 },
    ],
    analysis: {
      recommendation: "Buy",
      reasoning: "Based on strong performance in retail and telecom sectors, the outlook is positive. The recent dip provides a good entry point. The O2C margin concern is noted but outweighed by growth in other areas.",
      confidenceScore: 0.85,
    },
  },
};
