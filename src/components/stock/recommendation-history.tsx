import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockDetails } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function RecommendationHistory({ history }: { history: StockDetails['recommendationHistory'] }) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/30">
      <CardHeader>
        <CardTitle>Recommendation History</CardTitle>
        <CardDescription>Past AI recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Rec.</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="text-sm">
                  {new Date(item.date).toLocaleDateString('en-CA')}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn({
                      "border-green-500/50 text-green-600 dark:text-green-400": item.recommendation === "Buy",
                      "border-red-500/50 text-red-600 dark:text-red-400": item.recommendation === "Sell",
                    })}
                  >
                    {item.recommendation}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">₹{item.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
