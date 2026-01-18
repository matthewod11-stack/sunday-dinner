"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface UncertainFieldProps {
  /** Field name to check against uncertainFields array */
  fieldName: string;
  /** List of uncertain field names from extraction */
  uncertainFields: string[];
  /** Child elements to wrap */
  children: React.ReactNode;
  /** Additional CSS classes for the wrapper */
  className?: string;
}

/**
 * UncertainField - Wrapper that highlights fields needing review
 *
 * Wraps form fields and adds visual indicators when the field
 * was marked as uncertain during extraction.
 *
 * @example
 * ```tsx
 * <UncertainField fieldName="servingSize" uncertainFields={extraction.uncertainFields}>
 *   <Input value={recipe.servingSize} onChange={...} />
 * </UncertainField>
 * ```
 */
export function UncertainField({
  fieldName,
  uncertainFields,
  children,
  className,
}: UncertainFieldProps) {
  const isUncertain = uncertainFields.includes(fieldName);

  if (!isUncertain) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border border-dashed border-neutral-300 p-3",
        className
      )}
    >
      {/* Subtle indicator dot */}
      <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-amber-400" />

      {children}

      {/* Subtle hint */}
      <p className="mt-1.5 text-xs text-neutral-400 italic">
        AI estimate - adjust if needed
      </p>
    </div>
  );
}
