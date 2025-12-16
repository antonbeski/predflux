import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function NewsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-5 w-1/2" />
      </header>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {[...Array(10)].map((_, i) => (
              <li key={i} className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-5/6" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
