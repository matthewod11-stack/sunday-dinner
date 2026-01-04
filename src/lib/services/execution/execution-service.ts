"use client";

import type { Timeline, Task, TaskStatus } from "@/types";

/**
 * Execution state for live cooking mode
 */
export type ExecutionState =
  | "not_started"
  | "walkthrough"
  | "cooking"
  | "completed";

/**
 * Undo action that can be reverted within time window
 */
export interface UndoableAction {
  taskId: string;
  previousStatus: TaskStatus;
  expiresAt: number; // Date.now() + 30000
}

/**
 * Live execution context
 */
export interface LiveExecutionContext {
  timeline: Timeline;
  serveTime: Date;
  realStartTime: Date | null;
  executionState: ExecutionState;
  completedTaskIds: Set<string>;
  undoableActions: UndoableAction[];
}

/**
 * Calculate actual clock time for a task based on serve time
 *
 * @param minutesRelative - Minutes relative to serve time (negative = before)
 * @param serveTime - The target serve time
 * @returns Actual Date when the task should start
 */
export function calculateRealTime(
  minutesRelative: number,
  serveTime: Date
): Date {
  return new Date(serveTime.getTime() + minutesRelative * 60 * 1000);
}

/**
 * Format time for display in live mode
 */
export function formatLiveTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format time remaining until serve time
 */
export function formatTimeRemaining(serveTime: Date): string {
  const now = Date.now();
  const remaining = serveTime.getTime() - now;

  if (remaining <= 0) {
    return "Serve time!";
  }

  const minutes = Math.floor(remaining / 60000);
  if (minutes < 60) {
    return `${minutes}m until dinner`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h until dinner`;
  }
  return `${hours}h ${mins}m until dinner`;
}

/**
 * Calculate progress through cooking tasks
 */
export function calculateProgress(tasks: Task[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const completed = tasks.filter(
    (t) => t.status === "completed" || t.status === "skipped"
  ).length;
  const total = tasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

/**
 * Group tasks for live view (similar to planning but with real time calculations)
 */
export function groupTasksForLive(
  tasks: Task[],
  serveTime: Date,
  currentTaskId?: string
): {
  now: Task[];
  next: Task[];
  later: Task[];
  completed: Task[];
} {
  const currentTime = new Date();
  const currentMinutesFromServe = Math.floor(
    (currentTime.getTime() - serveTime.getTime()) / 60000
  );

  const completed = tasks.filter(
    (t) => t.status === "completed" || t.status === "skipped"
  );
  const pending = tasks.filter(
    (t) => t.status === "pending" || t.status === "in_progress"
  );

  // Sort by start time
  const sorted = [...pending].sort(
    (a, b) => a.startTimeMinutes - b.startTimeMinutes
  );

  // NOW: Current task or first task that should be active based on current time
  let nowTask: Task | undefined;

  if (currentTaskId) {
    nowTask = sorted.find((t) => t.id === currentTaskId);
  }

  if (!nowTask) {
    // Find task that should be active based on current time
    nowTask = sorted.find(
      (t) =>
        t.startTimeMinutes <= currentMinutesFromServe &&
        t.endTimeMinutes > currentMinutesFromServe
    );
  }

  if (!nowTask && sorted.length > 0) {
    // Default to first pending task
    nowTask = sorted[0];
  }

  const now = nowTask ? [nowTask] : [];

  // Remaining tasks
  const remaining = nowTask
    ? sorted.filter((t) => t.id !== nowTask!.id)
    : sorted;

  // NEXT: Tasks starting within 30 minutes of now task ending
  const nextThreshold = nowTask
    ? nowTask.endTimeMinutes + 30
    : currentMinutesFromServe + 30;

  const next = remaining
    .filter((t) => t.startTimeMinutes <= nextThreshold)
    .slice(0, 5);

  // LATER: Everything else
  const nextIds = new Set(next.map((t) => t.id));
  const later = remaining.filter((t) => !nextIds.has(t.id));

  return { now, next, later, completed };
}

/**
 * Extract equipment needs from first hour of tasks
 */
export function extractEquipmentNeeds(
  tasks: Task[],
  serveTime: Date
): string[] {
  // First hour = tasks starting up to 60 minutes before current time threshold
  const firstHourTasks = tasks.filter((t) => {
    const realTime = calculateRealTime(t.startTimeMinutes, serveTime);
    const minutesFromNow =
      (realTime.getTime() - Date.now()) / 60000;
    return minutesFromNow <= 60;
  });

  const equipment: Set<string> = new Set();

  // Equipment keywords to look for
  const equipmentKeywords: Record<string, string> = {
    oven: "Oven",
    preheat: "Oven",
    bake: "Oven",
    roast: "Oven",
    broil: "Oven",
    mixer: "Stand Mixer",
    whisk: "Whisk",
    blender: "Blender",
    "food processor": "Food Processor",
    processor: "Food Processor",
    skillet: "Skillet",
    pan: "Pan",
    pot: "Large Pot",
    saucepan: "Saucepan",
    "dutch oven": "Dutch Oven",
    "sheet pan": "Sheet Pan",
    "baking sheet": "Baking Sheet",
    "cutting board": "Cutting Board",
    knife: "Knife",
    "stand mixer": "Stand Mixer",
    thermometer: "Thermometer",
    grill: "Grill",
    colander: "Colander",
    strainer: "Strainer",
  };

  for (const task of firstHourTasks) {
    const text = `${task.title} ${task.description || ""}`.toLowerCase();

    for (const [keyword, equipmentName] of Object.entries(equipmentKeywords)) {
      if (text.includes(keyword)) {
        equipment.add(equipmentName);
      }
    }

    // Special case: oven tasks
    if (task.requiresOven) {
      equipment.add(task.ovenTemp ? `Oven (${task.ovenTemp}°F)` : "Oven");
    }
  }

  return Array.from(equipment).sort();
}

/**
 * Check if undo action is still valid (within 30 second window)
 */
export function isUndoValid(action: UndoableAction): boolean {
  return Date.now() < action.expiresAt;
}

/**
 * Create an undoable action for task checkoff
 */
export function createUndoableAction(
  taskId: string,
  previousStatus: TaskStatus
): UndoableAction {
  return {
    taskId,
    previousStatus,
    expiresAt: Date.now() + 30000, // 30 seconds
  };
}

/**
 * Get tasks that should have started by now (for "overdue" indicator)
 */
export function getOverdueTasks(tasks: Task[], serveTime: Date): Task[] {
  const currentMinutesFromServe = Math.floor(
    (Date.now() - serveTime.getTime()) / 60000
  );

  return tasks.filter(
    (t) =>
      t.status === "pending" &&
      t.startTimeMinutes < currentMinutesFromServe
  );
}
