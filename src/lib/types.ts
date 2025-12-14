export type Recommendation = "Buy" | "Sell" | "Hold";

export interface Stock {
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  recommendation: Recommendation;
  reason: string;
}

export type NewsItem = {
  title: string;
  source: string;
  sentiment: "Positive" | "Negative" | "Neutral";
  url: string;
  publishedDate?: string;
  publisher: string;
};

export interface StockDetails extends Stock {
  priceHistory: { date: string; price: number }[];
  news: NewsItem[];
  analysis: {
    recommendation: Recommendation;
    reasoning: string;
    confidenceScore: number;
  };
}
