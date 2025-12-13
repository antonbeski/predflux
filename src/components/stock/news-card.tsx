import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function NewsCardSkeleton() {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/30">
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
          <CardDescription>Recent headlines and sentiment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-3 w-1/4" />
                {index < 2 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

export function NewsCard({ news }: { news: NewsItem[] | null }) {
    if (news === null) {
        return <NewsCardSkeleton />;
    }

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/30">
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
        <CardDescription>Recent headlines from the market</CardDescription>
      </CardHeader>
      <CardContent>
        {news.length > 0 ? (
            <ul className="space-y-4">
            {news.map((item, index) => (
                <li key={index} className="space-y-1">
                <div className="flex justify-between items-start gap-4">
                    <Link href={item.url} className="text-sm font-medium hover:underline flex-1" target="_blank" rel="noopener noreferrer">
                    {item.title}
                    </Link>
                    <Badge
                    variant="outline"
                    className={cn("whitespace-nowrap", {
                        "border-green-500/50 text-green-600 dark:text-green-400": item.sentiment === "Positive",
                        "border-red-500/50 text-red-600 dark:text-red-400": item.sentiment === "Negative",
                        "border-gray-500/50 text-gray-600 dark:text-gray-400": item.sentiment === "Neutral",
                    })}
                    >
                    {item.sentiment}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.source}</p>
                {index < news.length - 1 && <Separator className="mt-3" />}
                </li>
            ))}
            </ul>
        ) : (
            <p className="text-sm text-muted-foreground text-center">No news available at the moment.</p>
        )}
      </CardContent>
    </Card>
  );
}
