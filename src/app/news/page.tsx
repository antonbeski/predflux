import { getMarketNews } from '@/lib/yfinance-actions';
import { NewsList } from './news-list';
import type { NewsItem } from '@/lib/types';


async function getNews() {
  const newsData = await getMarketNews();
  // Return only the first 10 for the initial load. More will be loaded via infinite scroll.
  const formattedNews: NewsItem[] = newsData.slice(0, 10).map((item: any) => ({
    title: item.title,
    url: item.link,
    source: item.publisher,
    sentiment: 'Neutral', // yahoo-finance2 does not provide sentiment
    publishedDate: item.providerPublishTime ? new Date(item.providerPublishTime).toISOString() : new Date().toISOString(),
    publisher: item.publisher,
  }));
  return formattedNews;
}


export default async function NewsPage() {
  const initialNews = await getNews();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Market News</h1>
        <p className="text-muted-foreground">
          Latest updates from the world of finance.
        </p>
      </header>
      <NewsList initialNews={initialNews} />
    </div>
  );
}
