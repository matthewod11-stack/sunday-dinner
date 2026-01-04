"use client";

import { Clock, Flame, CheckCircle, Circle, Pause, SkipForward } from "lucide-react";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  recipeName?: string;
  serveTime?: Date;
  isNow?: boolean;
  onCheckoff?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

/**
 * TaskCard displays a single cooking task
 *
 * Shows title, timing, status, and optionally oven indicator.
 * Can be used in list view or compact mode.
 */
export function TaskCard({
  task,
  recipeName,
  serveTime,
  isNow = false,
  onCheckoff,
  onEdit,
  compact = false,
}: TaskCardProps) {
  const statusColors = {
    pending: "border-neutral-200 bg-white",
    in_progress: "border-primary bg-primary/5",
    completed: "border-secondary bg-secondary/5",
    skipped: "border-neutral-300 bg-neutral-100",
  };

  const StatusIcon = getStatusIcon(task.status);

  return (
    <div
      className={cn(
        "rounded-lg border-2 transition-all",
        statusColors[task.status],
        isNow && "ring-2 ring-primary ring-offset-2",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status indicator - 44px touch target for mobile */}
        <button
          type="button"
          onClick={onCheckoff}
          disabled={!onCheckoff || task.status === "completed" || task.status === "skipped"}
          className={cn(
            "flex-shrink-0 -m-2 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center",
            onCheckoff && task.status === "pending" && "cursor-pointer hover:opacity-70 active:scale-95"
          )}
          aria-label={task.status === "pending" ? "Mark as complete" : `Task ${task.status}`}
        >
          <StatusIcon
            className={cn(
              "h-5 w-5",
              task.status === "pending" && "text-neutral-400",
              task.status === "in_progress" && "text-primary",
              task.status === "completed" && "text-secondary",
              task.status === "skipped" && "text-neutral-500"
            )}
          />
        </button>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                "font-medium",
                task.status === "completed" && "line-through text-neutral-500",
                task.status === "skipped" && "line-through text-neutral-400"
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

          {/* Description (optional) */}
          {!compact && task.description && (
            <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
            {/* Time display */}
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTaskTime(task.startTimeMinutes, serveTime)}
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

        {/* Edit button - 44px touch target for mobile */}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-sm text-neutral-500 hover:text-primary active:text-primary/80"
            aria-label={`Edit ${task.title}`}
          >
            Edit
          </button>
        )}
      </div>

      {/* Validation errors */}
      {task.validationErrors && task.validationErrors.length > 0 && (
        <div className="mt-2 rounded bg-red-50 p-2">
          <p className="text-xs font-medium text-red-700">
            {task.validationErrors[0]}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Get the appropriate status icon component
 */
function getStatusIcon(status: Task["status"]) {
  switch (status) {
    case "pending":
      return Circle;
    case "in_progress":
      return Pause;
    case "completed":
      return CheckCircle;
    case "skipped":
      return SkipForward;
  }
}

/**
 * Format task time relative to serve time
 */
function formatTaskTime(minutesRelative: number, serveTime?: Date): string {
  if (!serveTime) {
    // Just show relative time
    if (minutesRelative === 0) return "At serve time";
    if (minutesRelative > 0) return `${minutesRelative}m after`;

    const abs = Math.abs(minutesRelative);
    if (abs < 60) return `${abs}m before`;

    const hours = Math.floor(abs / 60);
    const mins = abs % 60;
    if (mins === 0) return `${hours}h before`;
    return `${hours}h ${mins}m before`;
  }

  // Calculate actual time
  const taskTime = new Date(serveTime.getTime() + minutesRelative * 60 * 1000);
  return taskTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Compact version of TaskCard for dense lists
 */
export function TaskCardCompact({
  task,
  serveTime,
}: {
  task: Task;
  serveTime?: Date;
}) {
  return (
    <TaskCard
      task={task}
      serveTime={serveTime}
      compact
    />
  );
}
