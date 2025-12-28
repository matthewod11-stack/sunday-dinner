import * as React from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Base skeleton loading placeholder.
 * Uses a warm shimmer effect matching the Warm Heirloom palette.
 */
function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md",
        "bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200",
        "animate-shimmer",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Pre-composed skeleton for recipe/meal cards.
 */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface overflow-hidden",
        className
      )}
    >
      {/* Image placeholder */}
      <Skeleton className="h-40 w-full rounded-none" />
      {/* Content area */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        {/* Description */}
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Pre-composed skeleton for text blocks.
 */
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for avatar/profile images.
 */
function SkeletonAvatar({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <Skeleton
      className={cn("rounded-full", sizeClasses[size], className)}
    />
  );
}

export { Skeleton, SkeletonCard, SkeletonText, SkeletonAvatar };
