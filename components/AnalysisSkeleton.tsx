import { Skeleton } from "@/components/ui/skeleton";

export function AnalysisSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading analysis">
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
