"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
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
        "relative rounded-lg border-2 border-warning bg-warning/5 p-3",
        className
      )}
    >
      {/* Warning indicator */}
      <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-warning text-white shadow-sm">
        <AlertTriangle className="h-3.5 w-3.5" />
      </div>

      {children}

      {/* Review hint */}
      <p className="mt-2 text-xs text-warning">
        Please review - this field may need correction
      </p>
    </div>
  );
}
