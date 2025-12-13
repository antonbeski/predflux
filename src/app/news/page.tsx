import { getNews } from './actions';
import { NewsList } from './news-list';

export default async function NewsPage() {
  const initialNews = await getNews(1);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Market News</h1>
        <p className="text-muted-foreground">
          Latest updates from NSE & BSE.
        </p>
      </header>
      <NewsList initialNews={initialNews} />
    </div>
  );
}
