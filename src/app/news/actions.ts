'use server';

import { NewsItem } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { getMarketNews } from '@/lib/finnhub/finnhub-actions';

const NEWS_PER_PAGE = 10;

export async function getNews(page: number = 1): Promise<NewsItem[]> {
  noStore();
  
  const allNews = await getMarketNews('general');

  const formattedNews: NewsItem[] = allNews.map((item: any) => ({
    title: item.headline,
    url: item.url,
    source: item.source,
    sentiment: 'Neutral', // Placeholder
    publishedDate: new Date(item.datetime * 1000).toISOString(),
  }));

  const startIndex = (page - 1) * NEWS_PER_PAGE;
  const endIndex = page * NEWS_PER_PAGE;
  
  return formattedNews.slice(startIndex, endIndex);
}
