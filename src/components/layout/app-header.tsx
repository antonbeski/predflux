
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [isPopoverOpen, setPopoverOpen] = React.useState(false);
  const [isSheetOpen, setSheetOpen] = React.useState(false);

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
    
    setPopoverOpen(true);

    const performSearch = async () => {
      setLoading(true);
      try {
        const response = await searchStocks({ query });
        const validResults = response.results?.filter(stock => stock.ticker) || [];
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
    setPopoverOpen(false);
    setSheetOpen(false); // Close mobile sheet on navigation
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
        <Image src="/logo.png" alt="PREDFLUX Logo" width={32} height={32} />
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
                    placeholder="Search..."
                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-full"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim() && setPopoverOpen(true)}
                  />
                </div>
              </form>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[--radix-popover-trigger-width] p-0"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="loader"></div>
                  </div>
                ) : results.length > 0 ? (
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
                    No results found for &quot;{query}&quot;.
                  </div>
                )}
            </PopoverContent>
          </Popover>
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
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Switch Theme</span>
                  <ThemeToggle />
                </div>
                <Separator />
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
