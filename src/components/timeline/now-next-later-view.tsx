"use client";

import { useMemo } from "react";
import { Clock, ChefHat, CheckCircle2 } from "lucide-react";
import type { Task, Timeline } from "@/types";
import { TaskCard } from "./task-card";

interface NowNextLaterViewProps {
  timeline: Timeline;
  recipeNames?: Map<string, string>;
  serveTime?: Date;
  onCheckoff?: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
}

/**
 * NowNextLaterView groups tasks into three temporal sections:
 *
 * - NOW: Current task or first pending task
 * - NEXT: Tasks starting within 30 minutes of now
 * - LATER: All remaining tasks
 *
 * This is the primary view for both planning and live execution.
 */
export function NowNextLaterView({
  timeline,
  recipeNames,
  serveTime,
  onCheckoff,
  onEditTask,
}: NowNextLaterViewProps) {
  const { now, next, later, completed } = useMemo(() => {
    return groupTasks(timeline.tasks, timeline.currentTaskId);
  }, [timeline.tasks, timeline.currentTaskId]);

  const isLive = timeline.isRunning;

  return (
    <div className="space-y-8">
      {/* NOW Section */}
      <section>
        <SectionHeader
          icon={ChefHat}
          title="Now"
          count={now.length}
          variant="primary"
        />
        {now.length === 0 ? (
          <EmptySection message="No active tasks" />
        ) : (
          <div className="mt-3 space-y-3">
            {now.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                recipeName={recipeNames?.get(task.recipeId)}
                serveTime={serveTime}
                isNow
                onCheckoff={
                  onCheckoff && task.id ? () => onCheckoff(task.id!) : undefined
                }
                onEdit={
                  onEditTask && task.id ? () => onEditTask(task.id!) : undefined
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
              <TaskCard
                key={task.id}
                task={task}
                recipeName={recipeNames?.get(task.recipeId)}
                serveTime={serveTime}
                compact
                onCheckoff={
                  onCheckoff && task.id ? () => onCheckoff(task.id!) : undefined
                }
                onEdit={
                  onEditTask && task.id ? () => onEditTask(task.id!) : undefined
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
              <TaskCard
                key={task.id}
                task={task}
                recipeName={recipeNames?.get(task.recipeId)}
                serveTime={serveTime}
                compact
                onEdit={
                  onEditTask && task.id ? () => onEditTask(task.id!) : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* COMPLETED Section (collapsed by default in live mode) */}
      {completed.length > 0 && (
        <section>
          <SectionHeader
            icon={CheckCircle2}
            title="Completed"
            count={completed.length}
            variant="success"
          />
          <div className="mt-3 space-y-2">
            {completed.slice(0, isLive ? 3 : completed.length).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                recipeName={recipeNames?.get(task.recipeId)}
                serveTime={serveTime}
                compact
              />
            ))}
            {isLive && completed.length > 3 && (
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

/**
 * Group tasks into Now, Next, Later, and Completed
 */
function groupTasks(
  tasks: Task[],
  currentTaskId?: string
): {
  now: Task[];
  next: Task[];
  later: Task[];
  completed: Task[];
} {
  const completed = tasks.filter(
    (t) => t.status === "completed" || t.status === "skipped"
  );
  const pending = tasks.filter(
    (t) => t.status === "pending" || t.status === "in_progress"
  );

  // Sort pending tasks by start time
  const sorted = [...pending].sort(
    (a, b) => a.startTimeMinutes - b.startTimeMinutes
  );

  // NOW: Current task or first pending
  const nowTask = currentTaskId
    ? sorted.find((t) => t.id === currentTaskId)
    : sorted[0];

  const now = nowTask ? [nowTask] : [];

  // Get remaining tasks (excluding now)
  const remaining = nowTask
    ? sorted.filter((t) => t.id !== nowTask.id)
    : sorted;

  // NEXT: Tasks starting within 30 minutes of the "now" task's end
  // Or the first few tasks if no "now" task
  const nextThreshold = nowTask
    ? nowTask.endTimeMinutes + 30
    : (sorted[0]?.startTimeMinutes ?? 0) + 30;

  const next = remaining.filter(
    (t) => t.startTimeMinutes <= nextThreshold
  ).slice(0, 5); // Max 5 in "next"

  // LATER: Everything else
  const nextIds = new Set(next.map((t) => t.id));
  const later = remaining.filter((t) => !nextIds.has(t.id));

  return { now, next, later, completed };
}
