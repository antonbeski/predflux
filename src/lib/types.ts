export type Recommendation = "Buy" | "Sell" | "Hold";

export interface Stock {
  ticker: string;
  name: string;
  exchange: "NSE" | "BSE";
  price: number;
  change: number;
  changePercent: number;
  recommendation: Recommendation;
  reason: string;
}

export interface StockDetails extends Stock {
  priceHistory: { date: string; price: number }[];
  news: { title: string; source: string; sentiment: "Positive" | "Negative" | "Neutral"; url: string }[];
  recommendationHistory: { date: string; recommendation: Recommendation; price: number }[];
  analysis: {
    recommendation: Recommendation;
    reasoning: string;
    confidenceScore: number;
  };
}
