"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  Search,
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { searchStocks } from "@/ai/flows/search-stocks";
import { dailyRecommendations } from "@/lib/data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-primary"
  >
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M17 7h4v4" />
  </svg>
);

const NavLink = ({ href, children, isActive, isMobile = false }: { href: string; children: React.ReactNode; isActive: boolean; isMobile?: boolean }) => (
  <Link
    href={href}
    className={cn(
      "transition-colors hover:text-foreground",
      isActive ? "text-foreground" : "text-muted-foreground",
      isMobile ? "text-lg" : "text-sm font-medium"
    )}
  >
    {children}
  </Link>
);


type SearchResult = {
  ticker: string;
  name: string;
  reason: string;
};

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isPopoverOpen, setPopoverOpen] = React.useState(false);

  const isActive = (path: string, exact = false) => {
    return exact ? pathname === path : pathname.startsWith(path);
  }

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
    router.push(`/stock/${ticker}`);
    setQuery("");
    setResults([]);
    setPopoverOpen(false);
  };
  
  const navLinks = (
    <>
      <NavLink href="/" isActive={isActive("/", true)}>Dashboard</NavLink>
      <NavLink href="/news" isActive={isActive("/news")}>News</NavLink>
    </>
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <Link href="/" className="flex items-center gap-2 mr-6">
        <Logo />
        <h1 className="text-xl font-semibold font-headline hidden md:block">PREDFLUX</h1>
      </Link>

      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {navLinks}
      </nav>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search stocks with AI..."
                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-full"
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
                        className="w-full text-left p-3 hover:bg-accent"
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
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
             <Link href="/" className="flex items-center gap-2 mb-6">
              <Logo />
              <h1 className="text-xl font-semibold font-headline">PREDFLUX</h1>
            </Link>
            <nav className="grid gap-6 text-lg font-medium">
                <NavLink href="/" isActive={isActive("/", true)} isMobile>Dashboard</NavLink>
                <NavLink href="/news" isActive={isActive("/news")} isMobile>News</NavLink>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
