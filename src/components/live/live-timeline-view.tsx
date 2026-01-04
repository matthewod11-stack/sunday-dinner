"use client";

import { useMemo } from "react";
import { Clock, ChefHat, CheckCircle2, AlertTriangle } from "lucide-react";
import type { Timeline } from "@/types";
import { LiveTaskCard } from "./live-task-card";
import { groupTasksForLive, getOverdueTasks } from "@/lib/services/execution";

interface LiveTimelineViewProps {
  timeline: Timeline;
  recipeNames: Map<string, string>;
  serveTime: Date;
  onCheckoff: (taskId: string) => void;
  onStartTimer?: (taskId: string, durationMinutes: number) => void;
}

/**
 * Live cooking timeline view
 *
 * Groups tasks into Now/Next/Later sections with real-time calculations.
 * Shows overdue warnings and current progress.
 */
export function LiveTimelineView({
  timeline,
  recipeNames,
  serveTime,
  onCheckoff,
  onStartTimer,
}: LiveTimelineViewProps) {
  const { now, next, later, completed } = useMemo(
    () => groupTasksForLive(timeline.tasks, serveTime, timeline.currentTaskId),
    [timeline.tasks, serveTime, timeline.currentTaskId]
  );

  const overdueTasks = useMemo(
    () => getOverdueTasks(timeline.tasks, serveTime),
    [timeline.tasks, serveTime]
  );

  return (
    <div className="space-y-8">
      {/* Overdue warning */}
      {overdueTasks.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              {overdueTasks.length} task{overdueTasks.length > 1 ? "s" : ""}{" "}
              overdue
            </span>
          </div>
          <p className="mt-1 text-sm text-amber-600">
            You&apos;re running a bit behind. Focus on the current task or tap
            &quot;I&apos;m Behind&quot; for help.
          </p>
        </div>
      )}

      {/* NOW Section */}
      <section>
        <SectionHeader
          icon={ChefHat}
          title="Now"
          count={now.length}
          variant="primary"
        />
        {now.length === 0 ? (
          <EmptySection message="All caught up!" />
        ) : (
          <div className="mt-3 space-y-3">
            {now.map((task) => (
              <LiveTaskCard
                key={task.id}
                task={task}
                recipeName={recipeNames.get(task.recipeId)}
                serveTime={serveTime}
                isNow
                onCheckoff={task.id ? () => onCheckoff(task.id!) : undefined}
                onStartTimer={
                  onStartTimer && task.id
                    ? (duration) => onStartTimer(task.id!, duration)
                    : undefined
                }
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
          subtitle={next.length > 0 ? "Starting soon" : undefined}
          variant="secondary"
        />
        {next.length === 0 ? (
          <EmptySection message="No upcoming tasks" />
        ) : (
          <div className="mt-3 space-y-2">
            {next.map((task) => (
              <LiveTaskCard
                key={task.id}
                task={task}
                recipeName={recipeNames.get(task.recipeId)}
                serveTime={serveTime}
                compact
                onCheckoff={task.id ? () => onCheckoff(task.id!) : undefined}
                onStartTimer={
                  onStartTimer && task.id
                    ? (duration) => onStartTimer(task.id!, duration)
                    : undefined
                }
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
              <LiveTaskCard
                key={task.id}
                task={task}
                recipeName={recipeNames.get(task.recipeId)}
                serveTime={serveTime}
                compact
              />
            ))}
          </div>
        )}
      </section>

      {/* COMPLETED Section - collapsed */}
      {completed.length > 0 && (
        <section>
          <SectionHeader
            icon={CheckCircle2}
            title="Completed"
            count={completed.length}
            variant="success"
          />
          <div className="mt-3 space-y-2">
            {completed.slice(0, 3).map((task) => (
              <LiveTaskCard
                key={task.id}
                task={task}
                recipeName={recipeNames.get(task.recipeId)}
                serveTime={serveTime}
                compact
              />
            ))}
            {completed.length > 3 && (
              <p className="text-center text-sm text-neutral-500">
                +{completed.length - 3} more completed
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
