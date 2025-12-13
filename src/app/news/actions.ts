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
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${source} feed:`, response.status, response.statusText);
      return [];
    }

    const xmlText = await response.text();
    if (xmlText.includes('<title>404 - Not Found</title>')) {
      console.warn(`${source} RSS feed returned a 404 page.`);
      return [];
    }
    
    const parser = new XMLParser({ ignoreAttributes: false });
    const result = parser.parse(xmlText);
    let items: any[] = result?.rss?.channel?.item || [];
    if (!Array.isArray(items)) {
      items = [items];
    }
    
    return items.map((item: any) => ({
      title: item.title || 'No title',
      url: item.link || '#',
      source: source,
      sentiment: 'Neutral', // Placeholder
      publishedDate: item.pubDate || new Date().toISOString(),
    }));
  } catch (error) {
    console.error(`Error fetching or parsing ${source} feed:`, error);
    return [];
  }
}


export async function getNews(page: number = 1): Promise<NewsItem[]> {
  noStore();
  const nseUrl = 'https://www.nseindia.com/api/press-releases/rss';
  const bseUrl = 'https://www.bseindia.com/RssFeed/Equity.xml';

  const [nseNews, bseNews] = await Promise.all([
    fetchAndParseFeed(nseUrl, 'NSE India'),
    fetchAndParseFeed(bseUrl, 'BSE India'),
  ]);

  const allNews = [...nseNews, ...bseNews];

  // Sort by date descending
  allNews.sort((a, b) => new Date(b.publishedDate!).getTime() - new Date(a.publishedDate!).getTime());

  const startIndex = (page - 1) * NEWS_PER_PAGE;
  const endIndex = page * NEWS_PER_PAGE;
  
  return allNews.slice(startIndex, endIndex);
}
