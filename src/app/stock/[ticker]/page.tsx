import { stockDetailsData } from "@/lib/data";
import { StockDetailsCard } from "@/components/stock/stock-details-card";
import { AiAnalysisCard } from "@/components/stock/ai-analysis-card";
import { StockChart } from "@/components/stock/stock-chart";
import { NewsCard } from "@/components/stock/news-card";
import { RecommendationHistory } from "@/components/stock/recommendation-history";

type Props = {
  params: { ticker: string };
};

export default function StockDetailPage({ params }: Props) {
  const { ticker } = params;
  const stock = stockDetailsData[ticker.toUpperCase()];

  if (!stock) {
    return (
        <div className="text-center py-20">
            <h1 className="text-2xl font-bold">Stock Not Found</h1>
            <p className="text-muted-foreground">Detailed analysis for '{ticker.toUpperCase()}' is not available yet.</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{stock.name} ({stock.ticker})</h1>
        <p className="text-muted-foreground">
          {stock.exchange}
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <StockDetailsCard stock={stock} />
          <StockChart priceHistory={stock.priceHistory} />
        </div>
        <div className="flex flex-col gap-6">
          <AiAnalysisCard analysis={stock.analysis} />
          <NewsCard news={stock.news} />
          <RecommendationHistory history={stock.recommendationHistory} />
        </div>
      </div>
    </div>
  );
}
