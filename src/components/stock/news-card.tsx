import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StockDetails } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NewsCard({ news }: { news: StockDetails['news'] }) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/30">
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
        <CardDescription>Recent headlines and sentiment</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
