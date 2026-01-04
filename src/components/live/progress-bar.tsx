"use client";

import { useMemo } from "react";
import type { Task } from "@/types";
import { calculateProgress, formatTimeRemaining } from "@/lib/services/execution";

interface ProgressBarProps {
  tasks: Task[];
  serveTime: Date;
}

/**
 * Progress indicator showing completed/total tasks
 * with time remaining until serve time
 */
export function ProgressBar({ tasks, serveTime }: ProgressBarProps) {
  const { completed, total, percentage } = useMemo(
    () => calculateProgress(tasks),
    [tasks]
  );

  const timeRemaining = useMemo(
    () => formatTimeRemaining(serveTime),
    [serveTime]
  );

  // Gradient from terracotta to sage as progress increases
  const gradientStyle = {
    background: `linear-gradient(90deg,
      var(--color-primary) 0%,
      var(--color-primary) ${percentage}%,
      var(--color-secondary) 100%)`,
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm border border-neutral-200">
      {/* Progress text */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">
          {completed} / {total} tasks
        </span>
        <span className="text-sm text-neutral-500">{timeRemaining}</span>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full bg-neutral-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            ...gradientStyle,
          }}
        />
      </div>

      {/* Percentage label */}
      <div className="mt-1 text-center">
        <span className="text-xs font-medium text-neutral-400">
          {percentage}% complete
        </span>
      </div>
    </div>
  );
}
