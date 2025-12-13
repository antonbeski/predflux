
'use server';

import { NewsItem } from '@/lib/types';
import { XMLParser } from 'fast-xml-parser';
import { unstable_noStore as noStore } from 'next/cache';

const NEWS_PER_PAGE = 10;

async function fetchAndParseFeed(url: string, source: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 600 } // Revalidate every 10 minutes
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${source} feed:`, response.status, response.statusText);
      return [];
    }

    const xmlText = await response.text();
    if (xmlText.trim().startsWith('<!DOCTYPE html>')) {
      console.warn(`${source} RSS feed did not return valid XML.`);
      return [];
    }
    
    const parser = new XMLParser({ ignoreAttributes: false, trim: true });
    const result = parser.parse(xmlText);
    
    let items: any[] = result?.rss?.channel?.item || result?.feed?.entry || [];
    if (!Array.isArray(items)) {
      items = [items];
    }
    
    return items.map((item: any) => ({
      title: item.title || 'No title',
      url: item.link?.['@_href'] || item.link || '#',
      source: source,
      sentiment: 'Neutral', // Placeholder
      publishedDate: item.pubDate || item.published || item.updated || new Date().toISOString(),
    })).filter(item => item.title && item.url !== '#');
  } catch (error) {
    console.error(`Error fetching or parsing ${source} feed:`, error);
    return [];
  }
}

export async function getNews(page: number = 1): Promise<NewsItem[]> {
  noStore();
  
  const feeds = [
    { url: 'https://www.moneycontrol.com/rss/latestnews.xml', source: 'Moneycontrol' },
    { url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', source: 'Economic Times' },
  ];

  const allNewsPromises = feeds.map(feed => fetchAndParseFeed(feed.url, feed.source));
  
  const allNewsArrays = await Promise.all(allNewsPromises);

  const allNews = allNewsArrays.flat();

  // Sort by date descending
  allNews.sort((a, b) => {
    const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
    const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
    return dateB - dateA;
  });

  const uniqueNews: NewsItem[] = [];
  const seenUrls = new Set<string>();

  for (const item of allNews) {
    if (!seenUrls.has(item.url)) {
      uniqueNews.push(item);
      seenUrls.add(item.url);
    }
  }

  const startIndex = (page - 1) * NEWS_PER_PAGE;
  const endIndex = page * NEWS_PER_PAGE;
  
  return uniqueNews.slice(startIndex, endIndex);
}
