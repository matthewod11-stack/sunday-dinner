import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  /** Page title - displays in Fraunces display font */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Optional action slot (button, link, etc.) - renders on the right */
  children?: React.ReactNode;
  /** Additional classes for the container */
  className?: string;
}

/**
 * Reusable page header with title, optional description, and action slot.
 *
 * Features:
 * - Fraunces display font for the title
 * - Decorative terracotta underline flourish
 * - Responsive layout (stacks on mobile)
 * - Action slot for page-level CTAs
 */
export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
          {/* Decorative underline flourish */}
          <span
            className="mt-2 block h-1 w-16 rounded-full bg-gradient-to-r from-primary to-primary/50"
            aria-hidden="true"
          />
        </h1>
        {description && (
          <p className="max-w-2xl text-neutral-600">{description}</p>
        )}
      </div>

      {/* Action slot */}
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}
