'use server';

import type { NewsItem } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { getMarketNews } from '@/lib/yfinance-actions';

const NEWS_PER_PAGE = 10;

export async function getNews(page: number = 1): Promise<NewsItem[]> {
  noStore();
  
  const allNews = await getMarketNews();

  const formattedNews: NewsItem[] = allNews.map((item: any) => ({
    title: item.title,
    url: item.link,
    source: item.publisher,
    sentiment: 'Neutral', // Placeholder
    publishedDate: new Date(item.providerPublishTime).toISOString(),
    publisher: item.publisher,
  }));

  const startIndex = (page - 1) * NEWS_PER_PAGE;
  const endIndex = page * NEWS_PER_PAGE;
  
  return formattedNews.slice(startIndex, endIndex);
}
