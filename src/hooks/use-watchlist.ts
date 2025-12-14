'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from './use-toast';

export interface WatchlistItem {
  symbol: string;
  addedAt: any; // Can be a server timestamp
}

export function useWatchlist() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const watchlistCollectionRef = useMemoFirebase(() => {
      if (!user) return null;
      return collection(firestore, 'users', user.uid, 'watchlist');
  }, [firestore, user]);
  
  const { data: watchlist, isLoading: isWatchlistLoading } = useCollection<WatchlistItem>(watchlistCollectionRef);

  const watchlistSymbols = useMemoFirebase(() => {
    return watchlist?.map(item => item.symbol) || [];
  }, [watchlist]);

  const addToWatchlist = (symbol: string) => {
    if (!user) {
      toast({ variant: "destructive", title: "Please sign in to add to watchlist."});
      return;
    }
    const watchlistItem: WatchlistItem = {
      symbol,
      addedAt: serverTimestamp(),
    };
    const docRef = doc(firestore, 'users', user.uid, 'watchlist', symbol);
    setDocumentNonBlocking(docRef, watchlistItem, { merge: true });
    toast({ title: `${symbol} added to your watchlist.`});
  };

  const removeFromWatchlist = (symbol: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'watchlist', symbol);
    deleteDocumentNonBlocking(docRef);
    toast({ title: `${symbol} removed from your watchlist.`});
  };

  const isInWatchlist = (symbol: string) => {
    return watchlistSymbols.includes(symbol);
  };

  return {
    watchlist,
    watchlistSymbols,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    isLoading: isUserLoading || isWatchlistLoading,
  };
}
