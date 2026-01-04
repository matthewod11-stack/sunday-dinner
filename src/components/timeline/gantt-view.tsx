"use client";

import { useMemo } from "react";
import { Flame } from "lucide-react";
import type { Task, Timeline } from "@/types";
import { cn } from "@/lib/utils";

interface GanttViewProps {
  timeline: Timeline;
  recipeNames?: Map<string, string>;
  recipeColors?: Map<string, string>;
  serveTime?: Date;
  onTaskClick?: (taskId: string) => void;
}

/**
 * Recipe color palette for visual distinction
 */
const RECIPE_COLORS = [
  "bg-primary/70 border-primary",
  "bg-secondary/70 border-secondary",
  "bg-amber-400/70 border-amber-500",
  "bg-blue-400/70 border-blue-500",
  "bg-purple-400/70 border-purple-500",
  "bg-pink-400/70 border-pink-500",
];

/**
 * GanttView displays tasks as horizontal bars on a timeline
 *
 * Features:
 * - Color-coded by recipe
 * - Time scale along bottom
 * - Oven indicators
 * - Click to edit
 */
export function GanttView({
  timeline,
  recipeNames,
  recipeColors: customColors,
  serveTime,
  onTaskClick,
}: GanttViewProps) {
  // Calculate time bounds
  const { minTime, maxTime, scale, recipeColorMap } = useMemo(() => {
    const pendingTasks = timeline.tasks.filter(
      (t) => t.status !== "completed" && t.status !== "skipped"
    );

    if (pendingTasks.length === 0) {
      return { minTime: -180, maxTime: 0, scale: 180, recipeColorMap: new Map() };
    }

    const min = Math.min(...pendingTasks.map((t) => t.startTimeMinutes));
    const max = Math.max(...pendingTasks.map((t) => t.endTimeMinutes));

    // Add some padding
    const paddedMin = Math.floor(min / 30) * 30 - 30;
    const paddedMax = Math.min(30, Math.ceil(max / 30) * 30 + 30);

    // Build recipe color map if not provided
    const colorMap = customColors ?? new Map<string, string>();
    if (!customColors) {
      const recipeIds = Array.from(new Set(timeline.tasks.map((t) => t.recipeId)));
      recipeIds.forEach((id, i) => {
        colorMap.set(id, RECIPE_COLORS[i % RECIPE_COLORS.length]!);
      });
    }

    return {
      minTime: paddedMin,
      maxTime: paddedMax,
      scale: paddedMax - paddedMin,
      recipeColorMap: colorMap,
    };
  }, [timeline.tasks, customColors]);

  // Generate time markers
  const timeMarkers = useMemo(() => {
    const markers: number[] = [];
    for (let t = minTime; t <= maxTime; t += 30) {
      markers.push(t);
    }
    return markers;
  }, [minTime, maxTime]);

  // Group tasks by recipe for visual separation
  const tasksByRecipe = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    for (const task of timeline.tasks) {
      const existing = grouped.get(task.recipeId) ?? [];
      existing.push(task);
      grouped.set(task.recipeId, existing);
    }
    return grouped;
  }, [timeline.tasks]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Recipe legend */}
        <div className="mb-4 flex flex-wrap gap-3">
          {Array.from(tasksByRecipe.keys()).map((recipeId) => (
            <div key={recipeId} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-3 w-3 rounded-sm border",
                  recipeColorMap.get(recipeId)
                )}
              />
              <span className="text-sm text-neutral-600">
                {recipeNames?.get(recipeId) ?? "Recipe"}
              </span>
            </div>
          ))}
        </div>

        {/* Gantt chart area */}
        <div className="relative">
          {/* Time grid lines */}
          <div className="absolute inset-0 flex">
            {timeMarkers.map((marker) => (
              <div
                key={marker}
                className="flex-1 border-l border-neutral-200 first:border-l-0"
                style={{ width: `${100 / timeMarkers.length}%` }}
              />
            ))}
          </div>

          {/* Task rows - one per recipe */}
          <div className="relative space-y-2 py-2">
            {Array.from(tasksByRecipe.entries()).map(([recipeId, tasks]) => (
              <div key={recipeId} className="relative h-12">
                {tasks
                  .filter((t) => t.status !== "completed" && t.status !== "skipped")
                  .map((task) => {
                    const left =
                      ((task.startTimeMinutes - minTime) / scale) * 100;
                    const width = (task.durationMinutes / scale) * 100;

                    return (
                      <GanttBar
                        key={task.id}
                        task={task}
                        left={left}
                        width={width}
                        colorClass={recipeColorMap.get(recipeId) ?? RECIPE_COLORS[0]!}
                        onClick={
                          onTaskClick && task.id
                            ? () => onTaskClick(task.id!)
                            : undefined
                        }
                      />
                    );
                  })}
              </div>
            ))}
          </div>

          {/* Serve time indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500"
            style={{ left: `${((0 - minTime) / scale) * 100}%` }}
          >
            <span className="absolute -top-5 -translate-x-1/2 rounded bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
              Serve
            </span>
          </div>
        </div>

        {/* Time scale */}
        <div className="mt-2 flex border-t border-neutral-200 pt-2">
          {timeMarkers.map((marker) => (
            <div
              key={marker}
              className="flex-1 text-center text-xs text-neutral-500"
            >
              {formatTimeMarker(marker, serveTime)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Individual task bar in the Gantt chart
 */
function GanttBar({
  task,
  left,
  width,
  colorClass,
  onClick,
}: {
  task: Task;
  left: number;
  width: number;
  colorClass: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "absolute top-1 h-10 rounded border-2 px-2 py-1 text-left transition-all",
        colorClass,
        onClick && "cursor-pointer hover:opacity-80",
        "overflow-hidden"
      )}
      style={{
        left: `${left}%`,
        width: `${Math.max(width, 3)}%`, // Minimum width for visibility
      }}
      title={task.title}
    >
      <div className="flex items-center gap-1">
        {task.requiresOven && (
          <Flame className="h-3 w-3 flex-shrink-0 text-amber-800" />
        )}
        <span className="truncate text-xs font-medium text-white/90">
          {task.title}
        </span>
      </div>
    </button>
  );
}

/**
 * Format time marker for display
 */
function formatTimeMarker(minutes: number, serveTime?: Date): string {
  if (!serveTime) {
    if (minutes === 0) return "Serve";
    if (minutes > 0) return `+${minutes}m`;
    return `${minutes}m`;
  }

  const time = new Date(serveTime.getTime() + minutes * 60 * 1000);
  return time.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
