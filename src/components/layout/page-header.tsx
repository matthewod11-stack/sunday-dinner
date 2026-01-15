import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  /** Page title - displays in Playfair Display font */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Optional action slot (button, link, etc.) - renders on the right */
  children?: React.ReactNode;
  /** Additional classes for the container */
  className?: string;
}

/**
 * Reusable page header with NYT editorial styling.
 *
 * Features:
 * - Playfair Display font for the title
 * - Thick rule line separator (editorial style)
 * - Clean typography hierarchy
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
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          {title}
        </h1>
        {/* Editorial rule line */}
        <div
          className="h-0.5 w-12 bg-neutral-900"
          aria-hidden="true"
        />
        {description && (
          <p className="max-w-2xl font-body text-text-tertiary">{description}</p>
        )}
      </div>

      {/* Action slot */}
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}
