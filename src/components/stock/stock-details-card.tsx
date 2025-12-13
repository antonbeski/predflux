import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StockDetails } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StockDetailsCard({ stock }: { stock: StockDetails }) {
  const isPositive = stock.change > 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Market Data</CardTitle>
        <CardDescription>Real-time price information</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Price</p>
          <p className="text-2xl font-bold font-mono">₹{stock.price.toFixed(2)}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Change</p>
          <p className={cn(
            "text-2xl font-bold font-mono",
            isPositive ? "text-green-500" : "text-red-500"
          )}>
            {isPositive ? "+" : ""}{stock.change.toFixed(2)}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">% Change</p>
          <p className={cn(
            "text-2xl font-bold font-mono",
            isPositive ? "text-green-500" : "text-red-500"
          )}>
            {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Exchange</p>
          <p className="text-2xl font-bold">{stock.exchange}</p>
        </div>
      </CardContent>
    </Card>
  );
}
