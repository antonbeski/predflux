import { stockDetailsData } from "@/lib/data";
import { StockDetailsCard } from "@/components/stock/stock-details-card";
import { AiAnalysisCard } from "@/components/stock/ai-analysis-card";
import { StockChart } from "@/components/stock/stock-chart";
import { NewsCard } from "@/components/stock/news-card";
import { RecommendationHistory } from "@/components/stock/recommendation-history";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NewsItem } from "@/lib/types";
import { unstable_noStore as noStore } from 'next/cache';
import { getNews } from "@/app/news/actions";


type Props = {
  params: { ticker: string };
};

async function getStockNews(ticker: string): Promise<NewsItem[]> {
  noStore();
  // For now, we'll just get the general news feed.
  // This could be adapted to search for news specific to the ticker.
  const allNews = await getNews(1);
  return allNews.filter(item => item.title.toLowerCase().includes(ticker.toLowerCase())).slice(0, 5);
}


export default async function StockDetailPage({ params }: Props) {
  const ticker = params.ticker;
  const stock = stockDetailsData[ticker.toUpperCase()];
  const news = await getStockNews(ticker);


  if (!stock) {
    return (
        <div className="text-center py-20">
            <h1 className="text-2xl font-bold">Stock Not Found</h1>
            <p className="text-muted-foreground">Detailed analysis for '{ticker.toUpperCase()}' is not available yet.</p>
             <Button variant="link" asChild className="mt-4">
              <Link href="/">
                <ArrowLeft />
                <span>Back to Dashboard</span>
              </Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <header className="flex-1">
          <h1 className="text-3xl font-bold font-headline tracking-tight">{stock.name} ({stock.ticker})</h1>
          <p className="text-muted-foreground">
            {stock.exchange}
          </p>
        </header>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-8">
          <StockDetailsCard stock={stock} />
          <StockChart priceHistory={stock.priceHistory} />
        </div>
        <div className="flex flex-col gap-8">
          <AiAnalysisCard analysis={stock.analysis} />
          <NewsCard news={news} />
          <RecommendationHistory history={stock.recommendationHistory} />
        </div>
      </div>
    </div>
  );
}
