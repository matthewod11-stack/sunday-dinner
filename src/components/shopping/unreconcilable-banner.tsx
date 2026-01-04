"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, X } from "lucide-react";
import type { UnreconcilableItem } from "@/types/shopping";
import { cn } from "@/lib/utils";

interface UnreconcilableBannerProps {
  items: UnreconcilableItem[];
  onDismiss?: () => void;
}

export function UnreconcilableBanner({
  items,
  onDismiss,
}: UnreconcilableBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) return null;

  const reasonLabels: Record<string, string> = {
    ambiguous_quantity: "Quantity not specified",
    unusual_unit: "Mixed units",
    uncategorized: "Unknown category",
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-amber-900">
              {items.length} item{items.length > 1 ? "s" : ""} need attention
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-amber-700 hover:text-amber-900 p-1"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-amber-700 hover:text-amber-900 p-1"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-amber-700 mt-1">
            These items couldn&apos;t be automatically consolidated. Check recipes
            for exact quantities.
          </p>

          {isExpanded && (
            <ul className="mt-3 space-y-2">
              {items.map((item, index) => (
                <li
                  key={index}
                  className={cn(
                    "text-sm p-2 rounded bg-white border border-amber-100"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-amber-900">
                      {item.name}
                    </span>
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                      {reasonLabels[item.reason] ?? item.reason}
                    </span>
                  </div>
                  {item.examples && item.examples.length > 0 && (
                    <p className="text-amber-700 mt-1 text-xs">
                      Examples: {item.examples.join(", ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
