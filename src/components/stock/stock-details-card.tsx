import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockDetails } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StockDetailsCard({ stock }: { stock: StockDetails }) {
  const isPositive = stock.change > 0;
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/30">
      <CardHeader>
        <CardTitle>Current Market Data</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Price</p>
          <p className="text-2xl font-bold font-mono">₹{stock.price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Day's Change</p>
          <p className={cn(
            "text-2xl font-bold font-mono",
            isPositive ? "text-green-500" : "text-red-500"
          )}>
            {isPositive ? "+" : ""}{stock.change.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">% Change</p>
          <p className={cn(
            "text-2xl font-bold font-mono",
            isPositive ? "text-green-500" : "text-red-500"
          )}>
            {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Exchange</p>
          <p className="text-2xl font-bold">{stock.exchange}</p>
        </div>
      </CardContent>
    </Card>
  );
}
