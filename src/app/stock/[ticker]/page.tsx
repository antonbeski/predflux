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
import { XMLParser } from "fast-xml-parser";


type Props = {
  params: { ticker: string };
};

async function getNewsFeed(): Promise<NewsItem[]> {
  noStore();
  try {
    const response = await fetch('https://www.nseindia.com/api/press-releases/rss', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch RSS feed:', response.status, response.statusText);
      const errorBody = await response.text();
      console.error('Error Body:', errorBody);
      return [];
    }

    const xmlText = await response.text();
    
    // The feed seems to return a 404 page sometimes, let's check for it.
    if (xmlText.includes('<title>404 - Not Found</title>')) {
        console.warn('NSE RSS feed returned a 404 page.');
        return [];
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const result = parser.parse(xmlText);
    
    let items: any[] = result?.rss?.channel?.item || [];

    // Ensure items is an array
    if (!Array.isArray(items)) {
        items = [items];
    }
    
    return items.slice(0, 5).map((item) => ({
      title: item.title || "No title",
      url: item.link || "#",
      source: "NSE India",
      sentiment: "Neutral", // Sentiment analysis would require an AI model
    }));
  } catch (error) {
    console.error("Error fetching or parsing RSS feed:", error);
    return [];
  }
}


export default async function StockDetailPage({ params }: Props) {
  const { ticker } = params;
  const stock = stockDetailsData[ticker.toUpperCase()];
  const news = await getNewsFeed();


  if (!stock) {
    return (
        <div className="text-center py-20">
            <h1 className="text-2xl font-bold">Stock Not Found</h1>
            <p className="text-muted-foreground">Detailed analysis for '{ticker.toUpperCase()}' is not available yet.</p>
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
