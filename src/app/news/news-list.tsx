
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getNews } from './actions';
import type { NewsItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export function NewsList({ initialNews }: { initialNews: NewsItem[] }) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef(null);

  const loadMoreNews = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const newNews = await getNews(page);
    if (newNews.length > 0) {
      setNews((prev) => [...prev, ...newNews]);
      setPage((prev) => prev + 1);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreNews();
        }
      },
      { threshold: 1.0 }
    );

    const loader = loaderRef.current;
    if (loader) {
      observer.observe(loader);
    }

    return () => {
      if (loader) {
        observer.unobserve(loader);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoading, page]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      // Using a consistent format helps prevent hydration issues
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y">
          {news.map((item, index) => (
            <li key={`${item.url}-${index}`} className="p-4 hover:bg-accent">
               <div className="flex justify-between items-start gap-4">
                  <div className='flex-1'>
                    <Link href={item.url} className="text-base font-medium hover:underline" target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.source} - {formatDate(item.publishedDate!)}
                    </p>
                  </div>
                  <Badge variant="outline">{item.sentiment}</Badge>
                </div>
            </li>
          ))}
        </ul>
        <div ref={loaderRef} className="flex justify-center items-center h-20">
          {isLoading && <Loader2 className="animate-spin" />}
          {!hasMore && <p className="text-sm text-muted-foreground">No more news to load.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
