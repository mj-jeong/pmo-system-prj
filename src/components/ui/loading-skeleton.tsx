import * as React from "react";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// LoadingSkeleton - Animated skeleton placeholders for loading states.
// Supports card, table, and text variants to match the layout being loaded.
// ---------------------------------------------------------------------------

/** Base skeleton pulse element */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export type SkeletonVariant = "card" | "table" | "text";

export interface LoadingSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant matching the layout being loaded */
  variant?: SkeletonVariant;
  /** Number of skeleton items to render (default 3) */
  count?: number;
}

/** Renders a single skeleton card matching the dashboard summary card shape */
function CardSkeleton() {
  return (
    <div className="rounded-lg border p-6 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

/** Renders a skeleton table with header and rows */
function TableSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="rounded-lg border">
      {/* Header */}
      <div className="flex items-center gap-4 border-b p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28 ml-auto" />
      </div>
      {/* Rows */}
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b p-4 last:border-b-0">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-20 ml-auto rounded-md" />
        </div>
      ))}
    </div>
  );
}

/** Renders skeleton text lines */
function TextSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === count - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

function LoadingSkeleton({
  className,
  variant = "card",
  count = 3,
  ...props
}: LoadingSkeletonProps) {
  return (
    <div className={cn(className)} {...props}>
      {variant === "card" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}
      {variant === "table" && <TableSkeleton count={count} />}
      {variant === "text" && <TextSkeleton count={count} />}
    </div>
  );
}

export { Skeleton, LoadingSkeleton, CardSkeleton, TableSkeleton, TextSkeleton };
