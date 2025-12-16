import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StockDetailLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" disabled>
          <ArrowLeft />
        </Button>
        <header className="flex-1 space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </header>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* Stock Details Card Skeleton */}
          <Card>
            <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Stock Chart Skeleton */}
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-8">
            {/* AI Analysis Card Skeleton */}
            <Card>
                <CardHeader className="space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-7 w-20 rounded-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                </CardContent>
            </Card>

            {/* News Card Skeleton */}
            <Card>
                <CardHeader className="space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                    <div key={index} className="space-y-2 border-b pb-4 last:border-b-0">
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
