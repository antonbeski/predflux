"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Stock } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

const RecommendationIcon = ({ recommendation }: { recommendation: Stock["recommendation"] }) => {
  switch (recommendation) {
    case "Buy":
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    case "Sell":
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    case "Hold":
      return <Minus className="h-5 w-5 text-gray-500" />;
    default:
      return null;
  }
};

export function StockTable({ stocks }: { stocks: Stock[] }) {
  const router = useRouter();

  const handleRowClick = (ticker: string) => {
    router.push(`/stock/${ticker}`);
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead className="hidden sm:table-cell">Company</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Change</TableHead>
            <TableHead className="text-right">Recommendation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.map((stock) => (
            <TableRow 
              key={stock.ticker} 
              onClick={() => handleRowClick(stock.ticker)} 
              className="cursor-pointer"
            >
              <TableCell>
                <div className="font-medium">{stock.ticker}</div>
                <div className="text-xs text-muted-foreground">{stock.exchange}</div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{stock.name}</TableCell>
              <TableCell className="text-right font-mono">₹{stock.price.toFixed(2)}</TableCell>
              <TableCell
                className={cn("text-right hidden sm:table-cell font-mono", {
                  "text-green-500": stock.change > 0,
                  "text-red-500": stock.change < 0,
                })}
              >
                {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <RecommendationIcon recommendation={stock.recommendation} />
                  <span className="hidden md:inline">{stock.recommendation}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
