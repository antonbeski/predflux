
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
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { searchStocks } from "@/ai/flows/search-stocks";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

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
  exchange: string;
};

const UserNav = () => {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (isUserLoading) {
        return <Loader2 className="h-5 w-5 animate-spin" />;
    }

    if (!user) {
        return (
            <Button asChild variant="outline" size="sm">
                <Link href="/login">Sign In</Link>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
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
    if (!query.trim()) {
      setResults([]);
      setPopoverOpen(false);
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const response = await searchStocks({ query });
        setResults(response.results || []);
        if (response.results && response.results.length > 0) {
          setPopoverOpen(true);
        } else {
          setPopoverOpen(false);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
        setPopoverOpen(false);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleSelect = (symbol: string) => {
    router.push(`/stock/${encodeURIComponent(symbol)}`);
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
              <form onSubmit={(e) => {
                e.preventDefault();
                if(results.length > 0) {
                  handleSelect(results[0].ticker);
                } else if(query) {
                  handleSelect(query.toUpperCase());
                }
              }}>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search any stock..."
                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-full"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && results.length > 0 && setPopoverOpen(true)}
                  />
                  {loading && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />}
                </div>
              </form>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[--radix-popover-trigger-width] p-0"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {results.length > 0 ? (
                  <ul className="max-h-96 overflow-y-auto">
                    {results.slice(0, 10).map((stock) => (
                       <li 
                         key={`${stock.ticker}-${stock.name}`}
                         className="p-4 border-b last:border-b-0 hover:bg-accent cursor-pointer"
                         onClick={() => handleSelect(stock.ticker)}
                       >
                         <div className="flex justify-between items-center">
                           <div>
                             <p className="font-semibold">{stock.ticker}</p>
                             <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
                           </div>
                         </div>
                       </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found.
                  </div>
                )}
            </PopoverContent>
          </Popover>
        </div>
        <ThemeToggle />
        <UserNav />
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
