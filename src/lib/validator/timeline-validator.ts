/**
 * Deterministic Timeline Validator
 *
 * Pure validation functions for timeline tasks.
 * No side effects, no external dependencies.
 *
 * Detects:
 * - Oven conflicts (overlapping tasks requiring oven)
 * - Dependency violations (task starts before dependency ends)
 * - Invalid durations (zero or negative)
 * - Serve time violations (tasks ending after serve time)
 * - Missing dependencies (task depends on non-existent task)
 */

import type { Task, TimelineConflict, ConflictType, ConflictSeverity } from "@/types";
import type { ValidationResult } from "@/contracts/timeline-service";

/**
 * Check if two time ranges overlap
 */
function rangesOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  // Two ranges overlap if one starts before the other ends
  return start1 < end2 && start2 < end1;
}

/**
 * Create a conflict object
 */
function createConflict(
  type: ConflictType,
  taskIds: string[],
  description: string,
  severity: ConflictSeverity
): TimelineConflict {
  return { type, taskIds, description, severity };
}

/**
 * Format time relative to serve time for display
 */
function formatRelativeTime(minutes: number): string {
  if (minutes === 0) return "serve time";
  if (minutes > 0) return `${minutes} min after serve`;

  const absMinutes = Math.abs(minutes);
  if (absMinutes < 60) return `${absMinutes} min before`;

  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  if (mins === 0) return `${hours}h before`;
  return `${hours}h ${mins}m before`;
}

// ============================================================================
// Individual Validators
// ============================================================================

/**
 * Validate that no two oven tasks overlap in time
 *
 * @param tasks - Array of tasks to validate
 * @returns Array of oven overlap conflicts
 */
export function validateOvenConflicts(tasks: Task[]): TimelineConflict[] {
  const conflicts: TimelineConflict[] = [];
  const ovenTasks = tasks.filter((t) => t.requiresOven && t.id);

  // Compare each pair of oven tasks
  for (let i = 0; i < ovenTasks.length; i++) {
    for (let j = i + 1; j < ovenTasks.length; j++) {
      const taskA = ovenTasks[i]!;
      const taskB = ovenTasks[j]!;

      if (
        rangesOverlap(
          taskA.startTimeMinutes,
          taskA.endTimeMinutes,
          taskB.startTimeMinutes,
          taskB.endTimeMinutes
        )
      ) {
        // Check if temperatures differ (makes it worse)
        const tempMismatch =
          taskA.ovenTemp && taskB.ovenTemp && taskA.ovenTemp !== taskB.ovenTemp;

        const description = tempMismatch
          ? `"${taskA.title}" (${taskA.ovenTemp}°F) and "${taskB.title}" (${taskB.ovenTemp}°F) both need the oven from ${formatRelativeTime(Math.max(taskA.startTimeMinutes, taskB.startTimeMinutes))} to ${formatRelativeTime(Math.min(taskA.endTimeMinutes, taskB.endTimeMinutes))}`
          : `"${taskA.title}" and "${taskB.title}" both need the oven at the same time`;

        conflicts.push(
          createConflict(
            "oven_overlap",
            [taskA.id!, taskB.id!],
            description,
            "error" // Oven conflicts are always errors
          )
        );
      }
    }
  }

  return conflicts;
}

/**
 * Validate that task dependencies are satisfied
 *
 * Rules:
 * - A task cannot start before its dependencies end
 * - A dependency must exist in the task list
 *
 * @param tasks - Array of tasks to validate
 * @returns Array of dependency conflicts
 */
export function validateDependencies(tasks: Task[]): TimelineConflict[] {
  const conflicts: TimelineConflict[] = [];
  const taskMap = new Map(tasks.filter((t) => t.id).map((t) => [t.id!, t]));

  for (const task of tasks) {
    if (!task.id || !task.dependsOn || task.dependsOn.length === 0) continue;

    for (const depId of task.dependsOn) {
      const dependency = taskMap.get(depId);

      if (!dependency) {
        // Missing dependency
        conflicts.push(
          createConflict(
            "missing_dependency",
            [task.id],
            `"${task.title}" depends on a task that doesn't exist (ID: ${depId.slice(0, 8)}...)`,
            "error"
          )
        );
        continue;
      }

      // Task must start after dependency ends
      if (task.startTimeMinutes < dependency.endTimeMinutes) {
        conflicts.push(
          createConflict(
            "task_order",
            [task.id, depId],
            `"${task.title}" starts at ${formatRelativeTime(task.startTimeMinutes)} but depends on "${dependency.title}" which ends at ${formatRelativeTime(dependency.endTimeMinutes)}`,
            "error"
          )
        );
      }
    }
  }

  return conflicts;
}

/**
 * Validate that all task durations are positive
 *
 * @param tasks - Array of tasks to validate
 * @returns Array of duration conflicts
 */
export function validateDurations(tasks: Task[]): TimelineConflict[] {
  const conflicts: TimelineConflict[] = [];

  for (const task of tasks) {
    if (!task.id) continue;

    if (task.durationMinutes <= 0) {
      conflicts.push(
        createConflict(
          "negative_duration",
          [task.id],
          `"${task.title}" has invalid duration: ${task.durationMinutes} minutes`,
          "error"
        )
      );
    }

    // Also check that endTime is consistent
    const expectedEnd = task.startTimeMinutes + task.durationMinutes;
    if (task.endTimeMinutes !== expectedEnd) {
      // This is a data integrity warning, not a blocker
      conflicts.push(
        createConflict(
          "negative_duration", // Reusing type for consistency issues
          [task.id],
          `"${task.title}" has inconsistent end time (expected ${expectedEnd}, got ${task.endTimeMinutes})`,
          "warning"
        )
      );
    }
  }

  return conflicts;
}

/**
 * Validate that no tasks end after serve time
 *
 * @param tasks - Array of tasks to validate
 * @returns Array of serve time conflicts
 */
export function validateServeTime(tasks: Task[]): TimelineConflict[] {
  const conflicts: TimelineConflict[] = [];

  for (const task of tasks) {
    if (!task.id) continue;

    if (task.endTimeMinutes > 0) {
      conflicts.push(
        createConflict(
          "serve_time",
          [task.id],
          `"${task.title}" ends ${task.endTimeMinutes} minutes after serve time`,
          "error"
        )
      );
    }

    // Warning for tasks that end exactly at serve time with no buffer
    if (task.endTimeMinutes === 0 && task.durationMinutes > 5) {
      conflicts.push(
        createConflict(
          "serve_time",
          [task.id],
          `"${task.title}" ends exactly at serve time - consider building in a buffer`,
          "warning"
        )
      );
    }
  }

  return conflicts;
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Run all validations on a timeline
 *
 * @param tasks - Array of tasks to validate
 * @returns Complete validation result with all conflicts
 */
export function validateTimeline(tasks: Task[]): ValidationResult {
  // Run all validators
  const allConflicts: TimelineConflict[] = [
    ...validateOvenConflicts(tasks),
    ...validateDependencies(tasks),
    ...validateDurations(tasks),
    ...validateServeTime(tasks),
  ];

  // Group conflicts by task for the invalidTasks array
  const taskErrors = new Map<string, string[]>();

  for (const conflict of allConflicts) {
    if (conflict.severity === "error") {
      for (const taskId of conflict.taskIds) {
        const existing = taskErrors.get(taskId) ?? [];
        existing.push(conflict.description);
        taskErrors.set(taskId, existing);
      }
    }
  }

  const invalidTasks = Array.from(taskErrors.entries()).map(
    ([taskId, errors]) => ({ taskId, errors })
  );

  // Timeline is valid if there are no error-level conflicts
  const hasErrors = allConflicts.some((c) => c.severity === "error");

  return {
    isValid: !hasErrors,
    conflicts: allConflicts,
    invalidTasks,
  };
}

/**
 * Check if a timeline has any blocking conflicts (errors)
 */
export function hasBlockingConflicts(tasks: Task[]): boolean {
  const result = validateTimeline(tasks);
  return !result.isValid;
}

/**
 * Get only error-level conflicts (warnings are informational)
 */
export function getBlockingConflicts(tasks: Task[]): TimelineConflict[] {
  const result = validateTimeline(tasks);
  return result.conflicts.filter((c) => c.severity === "error");
}

/**
 * Get only warning-level conflicts
 */
export function getWarningConflicts(tasks: Task[]): TimelineConflict[] {
  const result = validateTimeline(tasks);
  return result.conflicts.filter((c) => c.severity === "warning");
}
