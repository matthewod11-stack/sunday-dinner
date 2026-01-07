"use client";

import { Clock, Flame, CheckCircle, Circle } from "lucide-react";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";
import { calculateRealTime, formatLiveTime } from "@/lib/services/execution";

interface ViewerTaskCardProps {
  task: Task;
  recipeName?: string;
  serveTime: Date;
  isNow?: boolean;
  compact?: boolean;
}

/**
 * Read-only task card for share link viewers
 *
 * Shows task status visually but has no interaction.
 * Displays actual clock times based on serve time.
 */
export function ViewerTaskCard({
  task,
  recipeName,
  serveTime,
  isNow = false,
  compact = false,
}: ViewerTaskCardProps) {
  const statusColors = {
    pending: "border-neutral-200 bg-white",
    in_progress: "border-primary bg-primary/5",
    completed: "border-secondary bg-secondary/5",
    skipped: "border-neutral-300 bg-neutral-100",
  };

  const realStartTime = calculateRealTime(task.startTimeMinutes, serveTime);
  const realEndTime = calculateRealTime(task.endTimeMinutes, serveTime);

  const isCompleted = task.status === "completed" || task.status === "skipped";

  return (
    <div
      className={cn(
        "rounded-lg border-2 transition-all duration-300",
        statusColors[task.status],
        isNow && "ring-2 ring-primary ring-offset-2 shadow-lg",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status indicator (read-only) */}
        <div
          className={cn(
            "flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          )}
          aria-label={`Task ${task.status}`}
        >
          {isCompleted ? (
            <CheckCircle
              className={cn(
                "h-6 w-6",
                task.status === "completed" && "text-secondary",
                task.status === "skipped" && "text-neutral-500"
              )}
            />
          ) : (
            <Circle
              className={cn(
                "h-6 w-6",
                task.status === "pending" && "text-neutral-300",
                task.status === "in_progress" && "text-primary"
              )}
            />
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={cn(
                "font-medium text-foreground",
                isCompleted && "line-through text-neutral-500"
              )}
            >
              {task.title}
            </h4>
            {task.requiresOven && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                <Flame className="h-3 w-3" />
                {task.ovenTemp ? `${task.ovenTemp}°F` : "Oven"}
              </span>
            )}
          </div>

          {/* Description */}
          {!compact && task.description && (
            <p
              className={cn(
                "mt-1 text-sm text-neutral-600 line-clamp-2",
                isCompleted && "text-neutral-400"
              )}
            >
              {task.description}
            </p>
          )}

          {/* Meta row with real times */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
            {/* Time display - actual clock time */}
            <span className="flex items-center gap-1 font-medium">
              <Clock className="h-4 w-4" />
              {formatLiveTime(realStartTime)}
              <span className="text-neutral-300">→</span>
              {formatLiveTime(realEndTime)}
            </span>

            {/* Duration */}
            <span className="text-neutral-400">
              {task.durationMinutes} min
            </span>

            {/* Recipe source */}
            {recipeName && (
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs">
                {recipeName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Completed timestamp */}
      {task.completedAt && (
        <div className="mt-2 ml-[56px] text-xs text-neutral-400">
          Completed at {formatLiveTime(new Date(task.completedAt))}
        </div>
      )}
    </div>
  );
}
