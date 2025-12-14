'use client';

import { useWatchlist } from '@/hooks/use-watchlist';
import { Button } from '@/components/ui/button';
import { Star, StarOff, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export function WatchlistButton({ ticker }: { ticker: string }) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isLoading } = useWatchlist();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const isWatched = isInWatchlist(ticker);

  const handleToggleWatchlist = () => {
    if (!user) {
        router.push('/login');
        return;
    }
    if (isWatched) {
      removeFromWatchlist(ticker);
    } else {
      addToWatchlist(ticker);
    }
  };

  if (isUserLoading || isLoading) {
    return <Button variant="outline" size="icon" disabled><Loader2 className="animate-spin" /></Button>;
  }

  return (
    <Button variant="outline" size="icon" onClick={handleToggleWatchlist} aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}>
      {isWatched ? <Star className="text-yellow-400 fill-yellow-400" /> : <Star />}
    </Button>
  );
}
