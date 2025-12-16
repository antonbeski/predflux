
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
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { searchStocks } from "@/ai/flows/search-stocks";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import Image from "next/image";

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

const UserNav = ({ isMobile = false }: { isMobile?: boolean }) => {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (isUserLoading) {
      return (
        <div className="flex items-center justify-center w-full">
            <div className="loader" style={{width: '24px', height: '24px', borderWidth: '4px' }}></div>
        </div>
      );
    }

    if (!user) {
        return (
            <Button asChild variant={isMobile ? "secondary" : "default"} size="sm" className={cn(isMobile && "w-full")}>
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
  const [isSearchOpen, setSearchOpen] = React.useState(false);
  const [isSheetOpen, setSheetOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const isActive = (path: string, exact = false) => {
    return exact ? pathname === path : pathname.startsWith(path);
  }

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const response = await searchStocks({ query });
        const validResults = response.results?.filter(stock => stock && stock.ticker) || [];
        setResults(validResults);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
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
    setSearchOpen(false);
    setSheetOpen(false); // Close mobile sheet on navigation
  };
  
  const navLinks = (
    <>
      <NavLink href="/" isActive={isActive("/", true)}>Dashboard</NavLink>
      <NavLink href="/news" isActive={isActive("/news")}>News</NavLink>
    </>
  );

  const handleSearchOpen = (open: boolean) => {
    setSearchOpen(open);
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <Link href="/" className="flex items-center gap-2 mr-6">
        <Image src="/logo.png" alt="PREDFLUX Logo" width={32} height={32} />
        <h1 className="text-xl font-semibold font-headline hidden md:block">PREDFLUX</h1>
      </Link>

      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {navLinks}
      </nav>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
            <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => handleSearchOpen(true)}>
                <Search className="mr-2 h-4 w-4" />
                <span className="w-full text-left">Search...</span>
            </Button>
            <Dialog open={isSearchOpen} onOpenChange={handleSearchOpen}>
                <DialogContent className="sm:max-w-xl p-0" onOpenAutoFocus={(e) => {
                  e.preventDefault();
                  searchInputRef.current?.focus();
                }}>
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>Search Stocks</DialogTitle>
                         <form onSubmit={(e) => {
                            e.preventDefault();
                            if(results.length > 0) {
                              handleSelect(results[0].ticker);
                            } else if(query) {
                              handleSelect(query.toUpperCase());
                            }
                          }}>
                            <div className="relative mt-4">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                ref={searchInputRef}
                                type="search"
                                placeholder="Search by ticker or company name..."
                                className="w-full appearance-none bg-background pl-8 shadow-none"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                              />
                            </div>
                          </form>
                    </DialogHeader>
                    <div className="h-96 overflow-y-auto">
                        {loading ? (
                          <div className="flex justify-center items-center h-full">
                            <div className="loader"></div>
                          </div>
                        ) : query.trim() && results.length > 0 ? (
                          <ul>
                            {results.slice(0, 20).map((stock) => (
                               <li 
                                 key={`${stock.ticker}-${stock.name}`}
                                 className="p-4 border-t last:border-b-0 hover:bg-accent cursor-pointer"
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
                        ) : query.trim() && !loading ? (
                          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                            No results found for &quot;{query}&quot;.
                          </div>
                        ) : (
                             <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                Start typing to search for a stock.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
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
              <Image src="/logo.png" alt="PREDFLUX Logo" width={32} height={32} />
              <h1 className="text-xl font-semibold font-headline">PREDFLUX</h1>
            </Link>
            <div className="flex flex-col gap-6">
              <nav className="grid gap-4 text-lg font-medium">
                  <NavLink href="/" isActive={isActive("/", true)} isMobile>Dashboard</NavLink>
                  <NavLink href="/news" isActive={isActive("/news")} isMobile>News</NavLink>
              </nav>
              <Separator />
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Switch Theme</span>
                  <ThemeToggle />
                </div>
                <UserNav isMobile={true} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <UserNav />
        </div>
      </div>
    </header>
  );
}
