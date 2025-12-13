import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { StockDetails } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BrainCircuit } from "lucide-react";

export function AiAnalysisCard({ analysis }: { analysis: StockDetails['analysis'] }) {
    const recommendationColor =
    analysis.recommendation === "Buy"
      ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
      : analysis.recommendation === "Sell"
      ? "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
      : "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30";
      
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="size-5" />
            <span>AI Analysis</span>
        </CardTitle>
        <CardDescription>Gemini 2.5 Flash Recommendation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm">Recommendation</span>
          <Badge variant="outline" className={cn("text-base font-semibold", recommendationColor)}>
            {analysis.recommendation}
          </Badge>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-sm">Reasoning</h4>
          <p className="text-sm text-muted-foreground">{analysis.reasoning}</p>
        </div>
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-sm">Confidence</h4>
                <span className="text-sm font-mono font-medium">{(analysis.confidenceScore * 100).toFixed(0)}%</span>
            </div>
            <Progress value={analysis.confidenceScore * 100} aria-label={`${(analysis.confidenceScore * 100).toFixed(0)}% confidence`} />
        </div>
      </CardContent>
    </Card>
  );
}
