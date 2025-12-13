
'use client';

import { StockTable } from "@/components/dashboard/stock-table";
import { dailyRecommendations } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Today's AI-powered stock recommendations for NSE & BSE.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Daily Market Pulse</CardTitle>
          <CardDescription>
            {currentDate ? `Recommendations generated on ${currentDate}.` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockTable stocks={dailyRecommendations} />
        </CardContent>
      </Card>
    </div>
  );
}
