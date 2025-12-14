
import { StockDetailsCard } from "@/components/stock/stock-details-card";
import { AiAnalysisCard } from "@/components/stock/ai-analysis-card";
import { StockChart } from "@/components/stock/stock-chart";
import { NewsCard } from "@/components/stock/news-card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { unstable_noStore as noStore } from 'next/cache';
import { getCompanyNews, getQuote, getStockCandles } from "@/lib/yfinance-actions";
import { analyzeStockDataAndGenerateRecommendations } from "@/ai/flows/analyze-stock-data-and-generate-recommendations";
import { WatchlistButton } from "@/components/stock/watchlist-button";
import type { NewsItem } from "@/lib/types";

type Props = {
  params: { ticker: string };
};


async function getStockData(ticker: string) {
    noStore();
    try {
        const quotePromise = getQuote(ticker);

        const today = new Date();
        const oneMonthAgo = new Date(new Date().setMonth(today.getMonth() - 1));

        const candlesPromise = getStockCandles(ticker, oneMonthAgo, today);
        const newsPromise = getCompanyNews(ticker);

        const [quote, candles, news] = await Promise.all([
            quotePromise,
            candlesPromise,
            newsPromise
        ]);
        
        if (!quote || !quote.symbol) {
            return null;
        }

        const priceHistory = candles.map((candle: any) => ({
            date: candle.date.toISOString().split('T')[0],
            price: candle.close
        }));
        
        const formattedNews: NewsItem[] = news.slice(0, 5).map((item: any) => ({
            title: item.title,
            url: item.link,
            source: item.publisher,
            sentiment: 'Neutral',
            publishedDate: item.providerPublishTime ? new Date(item.providerPublishTime).toISOString() : new Date().toISOString(),
            publisher: item.publisher,
        }));

        const analysisInput = {
            stockTicker: ticker,
            newsData: JSON.stringify(formattedNews.map(n => n.title)),
            financialData: JSON.stringify({
                currentPrice: quote.regularMarketPrice,
                previousClose: quote.regularMarketPreviousClose,
                change: quote.regularMarketChange,
                percentChange: quote.regularMarketChangePercent,
            }),
        };
        const analysis = await analyzeStockDataAndGenerateRecommendations(analysisInput);

        return {
            ticker: quote.symbol,
            name: quote.longName || quote.shortName || ticker,
            exchange: quote.exchangeName || quote.fullExchangeName || 'N/A',
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            priceHistory,
            news: formattedNews,
            analysis,
        };

    } catch (error) {
        console.error(`Failed to fetch stock data for ${ticker}:`, error);
        return null;
    }
}


export default async function StockDetailPage({ params }: Props) {
  const ticker = decodeURIComponent(params.ticker).toUpperCase();
  const stock = await getStockData(ticker);

  if (!stock) {
    return (
        <div className="text-center py-20">
            <h1 className="text-2xl font-bold">Stock Not Found</h1>
            <p className="text-muted-foreground">Could not retrieve data for '{ticker}'. Please check the symbol and try again.</p>
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
        <WatchlistButton ticker={stock.ticker} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-8">
          <StockDetailsCard stock={stock} />
          <StockChart priceHistory={stock.priceHistory} />
        </div>
        <div className="flex flex-col gap-8">
          <AiAnalysisCard analysis={stock.analysis} />
          <NewsCard news={stock.news} />
        </div>
      </div>
    </div>
  );
}
