import { LoadingRegion, Skeleton } from '../ui/States';

/** Suspense fallback shown while a lazily loaded route chunk downloads. */
export function PageFallback() {
  return (
    <LoadingRegion label="Loading page">
      <Skeleton className="mb-2 h-7 w-48" />
      <Skeleton className="mb-8 h-4 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="mt-4 h-80" />
    </LoadingRegion>
  );
}
