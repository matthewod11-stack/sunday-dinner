import type { Timeline, Task, Meal, RecalculationSuggestion, TimelineConflict } from "@/types";

/**
 * Result of timeline validation
 */
export interface ValidationResult {
  /** Whether timeline is valid (no errors) */
  isValid: boolean;
  /** List of detected conflicts */
  conflicts: TimelineConflict[];
  /** Tasks with validation errors */
  invalidTasks: Array<{
    taskId: string;
    errors: string[];
  }>;
}

/**
 * TimelineService: Generates and manages cooking timelines
 *
 * Owned by Agent B (Weeks 4-5, 7-9 for live execution).
 * Depends on: Supabase, AIService
 *
 * Responsibilities:
 * - Generate timelines from meal recipes (via Claude)
 * - Validate timelines deterministically
 * - Manage task CRUD and reordering
 * - Handle live execution (checkoff, undo, recalculation)
 *
 * Timeline Generation Flow:
 * 1. Claude generates initial task sequence
 * 2. Deterministic validator checks for conflicts
 * 3. Conflicts shown in UI before saving
 * 4. User can edit tasks to resolve conflicts
 *
 * @example
 * ```typescript
 * const timelineService: TimelineService = new SupabaseTimelineService(supabase, aiService);
 *
 * // Generate timeline
 * const timeline = await timelineService.generate(meal);
 * if (timeline.hasConflicts) {
 *   // Show conflict banner: "Turkey and casserole both need oven at 4:30-5:00"
 * }
 *
 * // During cooking
 * await timelineService.checkoff(timeline.id, taskId);
 * ```
 */
export interface TimelineService {
  /**
   * Generate timeline from meal recipes
   *
   * Uses Claude to create task sequence, then validates
   * deterministically for conflicts.
   *
   * @param meal - Meal with recipes and scaling
   * @returns Generated timeline (may have conflicts)
   */
  generate(meal: Meal): Promise<Timeline>;

  /**
   * Get a timeline by ID
   *
   * @param timelineId - Timeline UUID
   * @returns Timeline or null if not found
   */
  get(timelineId: string): Promise<Timeline | null>;

  /**
   * Get timeline for a meal
   *
   * @param mealId - Meal UUID
   * @returns Timeline or null if not generated yet
   */
  getByMealId(mealId: string): Promise<Timeline | null>;

  /**
   * Save timeline to database
   *
   * @param timeline - Timeline to save
   * @returns Saved timeline with ID
   */
  save(timeline: Timeline): Promise<Timeline>;

  /**
   * Delete a timeline
   *
   * @param timelineId - Timeline UUID
   */
  delete(timelineId: string): Promise<void>;

  /**
   * Validate timeline deterministically
   *
   * Checks for:
   * - Oven conflicts (overlapping tasks requiring oven)
   * - Task order violations (dependency issues)
   * - Negative/zero durations
   * - Tasks ending after serve time
   *
   * @param timeline - Timeline to validate
   * @returns Validation result with conflicts
   */
  validate(timeline: Timeline): ValidationResult;

  /**
   * Update a single task
   *
   * Triggers re-validation after update.
   *
   * @param timelineId - Timeline UUID
   * @param taskId - Task UUID
   * @param updates - Partial task data
   * @returns Updated timeline
   *
   * @throws Error if task not found
   */
  updateTask(timelineId: string, taskId: string, updates: Partial<Task>): Promise<Timeline>;

  /**
   * Delete a task from timeline
   *
   * Handles dependency cleanup (removes task from others' dependsOn).
   *
   * @param timelineId - Timeline UUID
   * @param taskId - Task UUID
   * @returns Updated timeline
   */
  deleteTask(timelineId: string, taskId: string): Promise<Timeline>;

  /**
   * Reorder tasks in timeline
   *
   * @param timelineId - Timeline UUID
   * @param taskOrder - Array of task IDs in new order
   * @returns Updated timeline
   */
  reorderTasks(timelineId: string, taskOrder: string[]): Promise<Timeline>;

  /**
   * Regenerate timeline when recipes change
   *
   * Called when recipes are added/removed from meal.
   *
   * @param mealId - Meal UUID
   * @returns New timeline
   */
  regenerate(mealId: string): Promise<Timeline>;

  // =========================================================================
  // Live Execution Methods (Week 7-9)
  // =========================================================================

  /**
   * Start live cooking mode
   *
   * Anchors timeline to current time and sets first task as current.
   *
   * @param timelineId - Timeline UUID
   * @returns Updated timeline with isRunning=true
   */
  startCooking(timelineId: string): Promise<Timeline>;

  /**
   * Check off a task (mark as completed)
   *
   * Sets task status to "completed" and advances currentTaskId.
   *
   * @param timelineId - Timeline UUID
   * @param taskId - Task UUID
   * @returns Updated timeline
   */
  checkoff(timelineId: string, taskId: string): Promise<Timeline>;

  /**
   * Undo a checkoff (within 30 seconds)
   *
   * @param timelineId - Timeline UUID
   * @param taskId - Task UUID
   * @returns Updated timeline
   *
   * @throws Error if more than 30 seconds have passed
   */
  undoCheckoff(timelineId: string, taskId: string): Promise<Timeline>;

  /**
   * Get recalculation suggestion when running behind
   *
   * Uses Claude to suggest ONE adjustment.
   *
   * @param timelineId - Timeline UUID
   * @param currentTime - Current time (ISO datetime)
   * @param reason - Optional context about delay
   * @returns Recalculation suggestion
   */
  suggestRecalculation(
    timelineId: string,
    currentTime: string,
    reason?: string
  ): Promise<RecalculationSuggestion>;

  /**
   * Apply a recalculation suggestion
   *
   * Validates before applying.
   *
   * @param timelineId - Timeline UUID
   * @param suggestion - Suggestion from suggestRecalculation
   * @returns Updated timeline
   *
   * @throws Error if validation fails
   */
  applyRecalculation(timelineId: string, suggestion: RecalculationSuggestion): Promise<Timeline>;

  /**
   * Push all remaining tasks by a fixed amount
   *
   * Offline fallback when Claude is unavailable.
   *
   * @param timelineId - Timeline UUID
   * @param minutes - Minutes to push (default: 15)
   * @returns Updated timeline
   */
  pushAllTasks(timelineId: string, minutes?: number): Promise<Timeline>;

  /**
   * End cooking session
   *
   * @param timelineId - Timeline UUID
   * @returns Updated timeline with isRunning=false
   */
  endCooking(timelineId: string): Promise<Timeline>;
}
