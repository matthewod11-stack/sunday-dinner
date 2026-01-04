"use client";

import { AlertTriangle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { TimelineConflict } from "@/types";

interface ConflictBannerProps {
  conflicts: TimelineConflict[];
  onResolve?: (conflictIndex: number) => void;
}

/**
 * ConflictBanner displays timeline validation conflicts
 *
 * Shows errors (blocking) and warnings (informational) with
 * expandable details for each conflict.
 */
export function ConflictBanner({ conflicts, onResolve }: ConflictBannerProps) {
  const [expanded, setExpanded] = useState(true);

  if (conflicts.length === 0) {
    return null;
  }

  const errors = conflicts.filter((c) => c.severity === "error");
  const warnings = conflicts.filter((c) => c.severity === "warning");
  const hasErrors = errors.length > 0;

  return (
    <div
      className={`rounded-lg border-2 ${
        hasErrors
          ? "border-red-300 bg-red-50"
          : "border-amber-300 bg-amber-50"
      }`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          {hasErrors ? (
            <XCircle className="h-5 w-5 text-red-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          )}
          <div className="text-left">
            <h3
              className={`font-semibold ${
                hasErrors ? "text-red-800" : "text-amber-800"
              }`}
            >
              {hasErrors ? "Timeline Has Conflicts" : "Timeline Warnings"}
            </h3>
            <p
              className={`text-sm ${
                hasErrors ? "text-red-600" : "text-amber-600"
              }`}
            >
              {errors.length > 0 && (
                <span>
                  {errors.length} error{errors.length !== 1 ? "s" : ""}
                </span>
              )}
              {errors.length > 0 && warnings.length > 0 && " · "}
              {warnings.length > 0 && (
                <span>
                  {warnings.length} warning{warnings.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-neutral-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-neutral-500" />
        )}
      </button>

      {/* Expanded conflict list */}
      {expanded && (
        <div className="border-t border-neutral-200 px-4 pb-4">
          <ul className="mt-3 space-y-2">
            {/* Errors first */}
            {errors.map((conflict, index) => (
              <ConflictItem
                key={`error-${index}`}
                conflict={conflict}
                onResolve={onResolve ? () => onResolve(index) : undefined}
              />
            ))}
            {/* Then warnings */}
            {warnings.map((conflict, index) => (
              <ConflictItem
                key={`warning-${index}`}
                conflict={conflict}
                onResolve={
                  onResolve ? () => onResolve(errors.length + index) : undefined
                }
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Individual conflict item
 */
function ConflictItem({
  conflict,
  onResolve,
}: {
  conflict: TimelineConflict;
  onResolve?: () => void;
}) {
  const isError = conflict.severity === "error";

  return (
    <li
      className={`flex items-start gap-3 rounded-md p-2 ${
        isError ? "bg-red-100" : "bg-amber-100"
      }`}
    >
      <span className="mt-0.5">
        {isError ? (
          <XCircle className="h-4 w-4 text-red-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
      </span>
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            isError ? "text-red-800" : "text-amber-800"
          }`}
        >
          {getConflictTypeLabel(conflict.type)}
        </p>
        <p className={`text-sm ${isError ? "text-red-700" : "text-amber-700"}`}>
          {conflict.description}
        </p>
      </div>
      {onResolve && (
        <button
          type="button"
          onClick={onResolve}
          className={`text-sm font-medium underline ${
            isError
              ? "text-red-700 hover:text-red-800"
              : "text-amber-700 hover:text-amber-800"
          }`}
        >
          Edit
        </button>
      )}
    </li>
  );
}

/**
 * Get human-readable label for conflict type
 */
function getConflictTypeLabel(type: TimelineConflict["type"]): string {
  switch (type) {
    case "oven_overlap":
      return "Oven Conflict";
    case "task_order":
      return "Task Order Issue";
    case "negative_duration":
      return "Invalid Duration";
    case "serve_time":
      return "Serve Time Issue";
    case "missing_dependency":
      return "Missing Dependency";
    default:
      return "Conflict";
  }
}
