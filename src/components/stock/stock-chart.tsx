"use client";

import {
  Line,
  LineChart,
  XAxis,
  Tooltip,
  YAxis
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
};

export function StockChart({ priceHistory }: { priceHistory: { date: string; price: number }[] }) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/30">
      <CardHeader>
        <CardTitle>Price History (30 Days)</CardTitle>
        <CardDescription>
          An overview of the stock's performance over the last month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            data={priceHistory}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <YAxis
              dataKey="price"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `₹${value}`}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <Tooltip
              cursor={true}
              content={<ChartTooltipContent
                indicator="line"
                formatter={(value) => `₹${Number(value).toFixed(2)}`}
                labelFormatter={(label, payload) => {
                  if (!payload || !payload.length) return label;
                  return new Date(payload[0].payload.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })
                }}
              />}
            />
            <Line
              dataKey="price"
              type="monotone"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
