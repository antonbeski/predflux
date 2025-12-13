"use client";
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Loader2 } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { searchStocks } from "@/ai/flows/search-stocks";
import { dailyRecommendations } from "@/lib/data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type SearchResult = {
  ticker: string;
  name: string;
  reason: string;
};

export function AppHeader() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isPopoverOpen, setPopoverOpen] = React.useState(false);

  React.useEffect(() => {
    if (!query) {
      setResults([]);
      setPopoverOpen(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setPopoverOpen(true);
      const availableStocks = dailyRecommendations.map(({ ticker, name }) => ({ ticker, name }));
      try {
        const response = await searchStocks({ query, stocks: availableStocks });
        setResults(response.results);
      } catch (error) {
        console.error("AI search failed:", error);
        setResults([]);
      }
      setLoading(false);
    };

    const debounceTimeout = setTimeout(performSearch, 500);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleSelect = (ticker: string) => {
    if (ticker.toUpperCase() === 'RELIANCE') {
      router.push(`/stock/${ticker}`);
    }
    setQuery("");
    setResults([]);
    setPopoverOpen(false);
  };
  
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="w-full flex-1">
        <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search stocks with AI..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {loading && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />}
              </div>
            </form>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            {results.length > 0 ? (
              <ul className="divide-y">
                {results.map((stock) => (
                  <li key={stock.ticker}>
                    <button
                      onClick={() => handleSelect(stock.ticker)}
                      disabled={stock.ticker.toUpperCase() !== 'RELIANCE'}
                      className="w-full text-left p-3 hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                         <Avatar className="h-8 w-8 text-xs">
                           <AvatarFallback>{stock.ticker.slice(0,2)}</AvatarFallback>
                         </Avatar>
                        <div>
                          <p className="font-semibold">{stock.name} ({stock.ticker})</p>
                          <p className="text-sm text-muted-foreground">{stock.reason}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              !loading && query && <p className="p-4 text-sm text-muted-foreground text-center">No results found.</p>
            )}
          </PopoverContent>
        </Popover>
      </div>
      <ThemeToggle />
    </header>
  );
}
