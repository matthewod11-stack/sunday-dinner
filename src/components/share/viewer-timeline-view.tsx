"use client";

import { useMemo } from "react";
import { Clock, ChefHat, CheckCircle2, Eye } from "lucide-react";
import type { Timeline, Task } from "@/types";
import { ViewerTaskCard } from "./viewer-task-card";
import { groupTasksForLive } from "@/lib/services/execution";

interface ViewerTimelineViewProps {
  timeline: Timeline;
  tasks: Task[];
  recipeNames: Record<string, string>;
  serveTime: Date;
}

/**
 * Read-only timeline view for share link viewers
 *
 * Groups tasks into Now/Next/Later sections.
 * No checkoff or timer functionality - just viewing.
 */
export function ViewerTimelineView({
  timeline,
  tasks,
  recipeNames,
  serveTime,
}: ViewerTimelineViewProps) {
  const recipeNamesMap = useMemo(
    () => new Map(Object.entries(recipeNames)),
    [recipeNames]
  );

  const { now, next, later, completed } = useMemo(
    () => groupTasksForLive(tasks, serveTime, timeline.currentTaskId),
    [tasks, serveTime, timeline.currentTaskId]
  );

  return (
    <div className="space-y-8">
      {/* Viewer badge */}
      <div className="flex items-center justify-center gap-2 rounded-lg bg-neutral-100 py-2 px-4">
        <Eye className="h-4 w-4 text-neutral-500" />
        <span className="text-sm text-neutral-600">
          Viewing live cooking progress
        </span>
      </div>

      {/* NOW Section */}
      <section>
        <SectionHeader
          icon={ChefHat}
          title="Now"
          count={now.length}
          variant="primary"
        />
        {now.length === 0 ? (
          <EmptySection message="Waiting for cooking to start..." />
        ) : (
          <div className="mt-3 space-y-3">
            {now.map((task) => (
              <ViewerTaskCard
                key={task.id}
                task={task}
                recipeName={recipeNamesMap.get(task.recipeId)}
                serveTime={serveTime}
                isNow
              />
            ))}
          </div>
        )}
      </section>

      {/* NEXT Section */}
      <section>
        <SectionHeader
          icon={Clock}
          title="Next"
          count={next.length}
          subtitle={next.length > 0 ? "Coming up" : undefined}
          variant="secondary"
        />
        {next.length === 0 ? (
          <EmptySection message="No upcoming tasks" />
        ) : (
          <div className="mt-3 space-y-2">
            {next.map((task) => (
              <ViewerTaskCard
                key={task.id}
                task={task}
                recipeName={recipeNamesMap.get(task.recipeId)}
                serveTime={serveTime}
                compact
              />
            ))}
          </div>
        )}
      </section>

      {/* LATER Section */}
      <section>
        <SectionHeader
          icon={Clock}
          title="Later"
          count={later.length}
          variant="muted"
        />
        {later.length === 0 ? (
          <EmptySection message="No remaining tasks" />
        ) : (
          <div className="mt-3 space-y-2">
            {later.map((task) => (
              <ViewerTaskCard
                key={task.id}
                task={task}
                recipeName={recipeNamesMap.get(task.recipeId)}
                serveTime={serveTime}
                compact
              />
            ))}
          </div>
        )}
      </section>

      {/* COMPLETED Section */}
      {completed.length > 0 && (
        <section>
          <SectionHeader
            icon={CheckCircle2}
            title="Completed"
            count={completed.length}
            variant="success"
          />
          <div className="mt-3 space-y-2">
            {completed.slice(0, 5).map((task) => (
              <ViewerTaskCard
                key={task.id}
                task={task}
                recipeName={recipeNamesMap.get(task.recipeId)}
                serveTime={serveTime}
                compact
              />
            ))}
            {completed.length > 5 && (
              <p className="text-center text-sm text-neutral-500">
                +{completed.length - 5} more completed
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Section header with icon and count
 */
function SectionHeader({
  icon: Icon,
  title,
  count,
  subtitle,
  variant = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
  subtitle?: string;
  variant?: "primary" | "secondary" | "muted" | "success";
}) {
  const colors = {
    primary: "text-primary",
    secondary: "text-amber-600",
    muted: "text-neutral-500",
    success: "text-secondary",
  };

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-5 w-5 ${colors[variant]}`} />
      <h2 className="font-display text-lg font-semibold text-foreground">
        {title}
      </h2>
      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
        {count}
      </span>
      {subtitle && (
        <span className="text-sm text-neutral-500">{subtitle}</span>
      )}
    </div>
  );
}

/**
 * Empty state for a section
 */
function EmptySection({ message }: { message: string }) {
  return (
    <div className="mt-3 rounded-lg border-2 border-dashed border-neutral-200 p-6 text-center">
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  );
}
