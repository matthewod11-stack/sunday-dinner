"use client";

import { useState } from "react";
import {
  Clock,
  Flame,
  CheckCircle,
  Circle,
  Timer,
} from "lucide-react";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";
import { calculateRealTime, formatLiveTime } from "@/lib/services/execution";

interface LiveTaskCardProps {
  task: Task;
  recipeName?: string;
  serveTime: Date;
  isNow?: boolean;
  onCheckoff?: () => void;
  onStartTimer?: (durationMinutes: number) => void;
  compact?: boolean;
}

/**
 * Task card optimized for live cooking mode
 *
 * Shows actual clock times and includes timer trigger
 */
export function LiveTaskCard({
  task,
  recipeName,
  serveTime,
  isNow = false,
  onCheckoff,
  onStartTimer,
  compact = false,
}: LiveTaskCardProps) {
  const [isChecking, setIsChecking] = useState(false);

  const statusColors = {
    pending: "border-neutral-200 bg-white",
    in_progress: "border-primary bg-primary/5",
    completed: "border-secondary bg-secondary/5",
    skipped: "border-neutral-300 bg-neutral-100",
  };

  const realStartTime = calculateRealTime(task.startTimeMinutes, serveTime);
  const realEndTime = calculateRealTime(task.endTimeMinutes, serveTime);

  const handleCheckoff = async () => {
    if (!onCheckoff || task.status === "completed") return;

    setIsChecking(true);
    try {
      await onCheckoff();
    } finally {
      // Brief delay for animation
      setTimeout(() => setIsChecking(false), 300);
    }
  };

  const isCompleted = task.status === "completed" || task.status === "skipped";

  return (
    <div
      className={cn(
        "rounded-lg border-2 transition-all duration-300",
        statusColors[task.status],
        isNow && "ring-2 ring-primary ring-offset-2 shadow-lg",
        isChecking && "scale-[0.98] opacity-80",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkoff button - 44px touch target */}
        <button
          type="button"
          onClick={handleCheckoff}
          disabled={!onCheckoff || isCompleted}
          className={cn(
            "flex-shrink-0 -m-2 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-all",
            onCheckoff &&
              !isCompleted &&
              "cursor-pointer hover:bg-neutral-100 active:scale-95"
          )}
          aria-label={
            isCompleted ? `Task ${task.status}` : "Mark as complete"
          }
        >
          {isCompleted ? (
            <CheckCircle
              className={cn(
                "h-6 w-6 transition-transform",
                task.status === "completed" && "text-secondary",
                task.status === "skipped" && "text-neutral-500",
                isChecking && "scale-125"
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
        </button>

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

        {/* Timer button - 44px touch target */}
        {onStartTimer && !isCompleted && task.durationMinutes > 0 && (
          <button
            type="button"
            onClick={() => onStartTimer(task.durationMinutes)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400 hover:text-primary active:text-primary/80 transition-colors"
            aria-label={`Set ${task.durationMinutes} minute timer for ${task.title}`}
          >
            <Timer className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Completed timestamp */}
      {task.completedAt && (
        <div className="mt-2 text-xs text-neutral-400">
          Completed at {formatLiveTime(new Date(task.completedAt))}
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for dense lists
 */
export function LiveTaskCardCompact({
  task,
  serveTime,
}: {
  task: Task;
  serveTime: Date;
}) {
  return <LiveTaskCard task={task} serveTime={serveTime} compact />;
}
