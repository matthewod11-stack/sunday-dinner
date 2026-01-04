import type { SupabaseClient } from "@supabase/supabase-js";
import type { AIService, TimelineGenerationInput } from "@/contracts/ai-service";
import type { TimelineService, ValidationResult } from "@/contracts/timeline-service";
import type {
  Timeline,
  Task,
  TaskStatus,
  Meal,
  RecalculationSuggestion,
  TimelineConflict,
} from "@/types";
import { validateTimeline } from "@/lib/validator";

/**
 * Row shape from Supabase timelines table
 */
interface TimelineRow {
  id: string;
  meal_id: string;
  has_conflicts: boolean;
  conflicts: TimelineConflict[];
  is_running: boolean;
  started_at: string | null;
  current_task_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Row shape from Supabase tasks table
 */
interface TaskRow {
  id: string;
  timeline_id: string;
  meal_id: string;
  recipe_id: string;
  instruction_id: string | null;
  title: string;
  description: string | null;
  start_time_minutes: number;
  duration_minutes: number;
  end_time_minutes: number;
  requires_oven: boolean;
  oven_temp: number | null;
  depends_on: string[];
  status: TaskStatus;
  completed_at: string | null;
  notes: string | null;
  is_valid: boolean;
  validation_errors: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * SupabaseTimelineService: TimelineService implementation using Supabase
 *
 * Handles timeline generation via Claude, deterministic validation,
 * and all timeline CRUD operations.
 *
 * @example
 * ```typescript
 * const timelineService = new SupabaseTimelineService(supabase, aiService);
 * const timeline = await timelineService.generate(meal);
 * if (timeline.hasConflicts) {
 *   console.log("Conflicts:", timeline.conflicts);
 * }
 * ```
 */
export class SupabaseTimelineService implements TimelineService {
  constructor(
    private supabase: SupabaseClient,
    private aiService: AIService
  ) {}

  /**
   * Generate a timeline from a meal's recipes
   *
   * 1. Calls Claude AI to generate tasks
   * 2. Runs deterministic validation
   * 3. Returns timeline with any conflicts flagged
   */
  async generate(meal: Meal): Promise<Timeline> {
    if (!meal.id) {
      throw new Error("Meal must have an ID to generate timeline");
    }

    if (meal.recipes.length === 0) {
      throw new Error("Meal must have at least one recipe to generate timeline");
    }

    // Prepare input for AI service
    const input: TimelineGenerationInput = {
      recipes: meal.recipes.map((r) => r.recipe),
      scaling: meal.recipes.map((r) => r.scaling),
      serveTime: meal.serveTime,
      guestCount: meal.guestCount.total,
    };

    // Generate tasks via Claude
    const generatedTasks = await this.aiService.generateTimeline(input);

    // Assign meal and recipe IDs to tasks
    const tasksWithIds = this.assignTaskIds(generatedTasks, meal);

    // Validate the timeline
    const validationResult = validateTimeline(tasksWithIds);

    // Create timeline object
    const timeline: Timeline = {
      mealId: meal.id,
      tasks: tasksWithIds,
      hasConflicts: !validationResult.isValid,
      conflicts: validationResult.conflicts,
    };

    return timeline;
  }

  /**
   * Get a timeline by ID
   */
  async get(timelineId: string): Promise<Timeline | null> {
    const { data: timelineData, error: timelineError } = await this.supabase
      .from("timelines")
      .select("*")
      .eq("id", timelineId)
      .single<TimelineRow>();

    if (timelineError) {
      if (timelineError.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch timeline: ${timelineError.message}`);
    }

    if (!timelineData) {
      return null;
    }

    const tasks = await this.fetchTasks(timelineId);
    return this.transformTimelineRow(timelineData, tasks);
  }

  /**
   * Get timeline for a specific meal
   */
  async getByMealId(mealId: string): Promise<Timeline | null> {
    const { data: timelineData, error: timelineError } = await this.supabase
      .from("timelines")
      .select("*")
      .eq("meal_id", mealId)
      .single<TimelineRow>();

    if (timelineError) {
      if (timelineError.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch timeline: ${timelineError.message}`);
    }

    if (!timelineData) {
      return null;
    }

    const tasks = await this.fetchTasks(timelineData.id);
    return this.transformTimelineRow(timelineData, tasks);
  }

  /**
   * Save a timeline to the database
   *
   * Creates both the timeline record and all tasks.
   */
  async save(timeline: Timeline): Promise<Timeline> {
    // Check if timeline already exists
    const existing = await this.getByMealId(timeline.mealId);
    if (existing) {
      // Update existing timeline
      return this.updateExisting(existing.id!, timeline);
    }

    // Insert new timeline
    const { data: timelineData, error: timelineError } = await this.supabase
      .from("timelines")
      .insert({
        meal_id: timeline.mealId,
        has_conflicts: timeline.hasConflicts,
        conflicts: timeline.conflicts,
        is_running: timeline.isRunning ?? false,
        started_at: timeline.startedAt ?? null,
        current_task_id: null, // Set after tasks are created
      })
      .select()
      .single<TimelineRow>();

    if (timelineError) {
      throw new Error(`Failed to save timeline: ${timelineError.message}`);
    }

    // Insert tasks
    const tasksToInsert = timeline.tasks.map((task, index) => ({
      timeline_id: timelineData.id,
      meal_id: timeline.mealId,
      recipe_id: task.recipeId,
      instruction_id: task.instructionId ?? null,
      title: task.title,
      description: task.description ?? null,
      start_time_minutes: task.startTimeMinutes,
      duration_minutes: task.durationMinutes,
      end_time_minutes: task.endTimeMinutes,
      requires_oven: task.requiresOven ?? false,
      oven_temp: task.ovenTemp ?? null,
      depends_on: task.dependsOn ?? [],
      status: task.status,
      completed_at: task.completedAt ?? null,
      notes: task.notes ?? null,
      is_valid: task.isValid ?? true,
      validation_errors: task.validationErrors ?? [],
      sort_order: index,
    }));

    const { error: tasksError } = await this.supabase
      .from("tasks")
      .insert(tasksToInsert);

    if (tasksError) {
      // Rollback timeline if tasks fail
      await this.supabase.from("timelines").delete().eq("id", timelineData.id);
      throw new Error(`Failed to save tasks: ${tasksError.message}`);
    }

    // Fetch and return complete timeline
    const saved = await this.get(timelineData.id);
    if (!saved) {
      throw new Error("Failed to retrieve saved timeline");
    }
    return saved;
  }

  /**
   * Delete a timeline
   */
  async delete(timelineId: string): Promise<void> {
    const { error } = await this.supabase
      .from("timelines")
      .delete()
      .eq("id", timelineId);

    if (error) {
      throw new Error(`Failed to delete timeline: ${error.message}`);
    }
  }

  /**
   * Validate a timeline deterministically
   */
  validate(timeline: Timeline): ValidationResult {
    return validateTimeline(timeline.tasks);
  }

  /**
   * Update a single task
   */
  async updateTask(
    timelineId: string,
    taskId: string,
    updates: Partial<Task>
  ): Promise<Timeline> {
    const updateData: Record<string, unknown> = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.startTimeMinutes !== undefined) {
      updateData.start_time_minutes = updates.startTimeMinutes;
      // Recalculate end time
      const duration = updates.durationMinutes;
      if (duration !== undefined) {
        updateData.end_time_minutes = updates.startTimeMinutes + duration;
      }
    }
    if (updates.durationMinutes !== undefined) {
      updateData.duration_minutes = updates.durationMinutes;
    }
    if (updates.requiresOven !== undefined) updateData.requires_oven = updates.requiresOven;
    if (updates.ovenTemp !== undefined) updateData.oven_temp = updates.ovenTemp;
    if (updates.dependsOn !== undefined) updateData.depends_on = updates.dependsOn;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { error } = await this.supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId)
      .eq("timeline_id", timelineId);

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }

    // Re-validate and update timeline conflicts
    const timeline = await this.get(timelineId);
    if (!timeline) {
      throw new Error("Timeline not found after update");
    }

    return this.revalidateAndSave(timeline);
  }

  /**
   * Delete a task from timeline
   */
  async deleteTask(timelineId: string, taskId: string): Promise<Timeline> {
    // Remove this task from any depends_on arrays
    const { data: dependentTasks } = await this.supabase
      .from("tasks")
      .select("id, depends_on")
      .eq("timeline_id", timelineId)
      .contains("depends_on", [taskId]);

    if (dependentTasks) {
      for (const task of dependentTasks) {
        const newDependsOn = (task.depends_on as string[]).filter(
          (id) => id !== taskId
        );
        await this.supabase
          .from("tasks")
          .update({ depends_on: newDependsOn })
          .eq("id", task.id);
      }
    }

    // Delete the task
    const { error } = await this.supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("timeline_id", timelineId);

    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }

    const timeline = await this.get(timelineId);
    if (!timeline) {
      throw new Error("Timeline not found after delete");
    }

    return this.revalidateAndSave(timeline);
  }

  /**
   * Reorder tasks in timeline
   */
  async reorderTasks(timelineId: string, taskOrder: string[]): Promise<Timeline> {
    // Update sort_order for each task
    for (let i = 0; i < taskOrder.length; i++) {
      await this.supabase
        .from("tasks")
        .update({ sort_order: i })
        .eq("id", taskOrder[i])
        .eq("timeline_id", timelineId);
    }

    const timeline = await this.get(timelineId);
    if (!timeline) {
      throw new Error("Timeline not found after reorder");
    }
    return timeline;
  }

  /**
   * Regenerate timeline when recipes change
   */
  async regenerate(mealId: string): Promise<Timeline> {
    // This would need access to MealService to fetch the meal
    // For now, we throw an error - caller should use generate() with the meal
    void mealId; // Placeholder - will be used in Week 5
    throw new Error(
      "regenerate() requires meal data. Use generate(meal) directly instead."
    );
  }

  // =========================================================================
  // Live Execution Methods (Week 7-9, stubbed for now)
  // =========================================================================

  async startCooking(timelineId: string): Promise<Timeline> {
    const { error } = await this.supabase
      .from("timelines")
      .update({
        is_running: true,
        started_at: new Date().toISOString(),
      })
      .eq("id", timelineId);

    if (error) {
      throw new Error(`Failed to start cooking: ${error.message}`);
    }

    // Set first pending task as current
    const timeline = await this.get(timelineId);
    if (!timeline) {
      throw new Error("Timeline not found");
    }

    const firstPending = timeline.tasks.find((t) => t.status === "pending");
    if (firstPending?.id) {
      await this.supabase
        .from("timelines")
        .update({ current_task_id: firstPending.id })
        .eq("id", timelineId);
    }

    return (await this.get(timelineId))!;
  }

  async checkoff(timelineId: string, taskId: string): Promise<Timeline> {
    const { error } = await this.supabase
      .from("tasks")
      .update({
        status: "completed" as TaskStatus,
        completed_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("timeline_id", timelineId);

    if (error) {
      throw new Error(`Failed to checkoff task: ${error.message}`);
    }

    // Advance to next pending task
    const timeline = await this.get(timelineId);
    if (!timeline) {
      throw new Error("Timeline not found");
    }

    const nextPending = timeline.tasks.find((t) => t.status === "pending");
    await this.supabase
      .from("timelines")
      .update({ current_task_id: nextPending?.id ?? null })
      .eq("id", timelineId);

    return (await this.get(timelineId))!;
  }

  async undoCheckoff(timelineId: string, taskId: string): Promise<Timeline> {
    // Check if within 30 seconds
    const { data: task } = await this.supabase
      .from("tasks")
      .select("completed_at")
      .eq("id", taskId)
      .single<{ completed_at: string | null }>();

    if (task?.completed_at) {
      const completedAt = new Date(task.completed_at);
      const now = new Date();
      const diffSeconds = (now.getTime() - completedAt.getTime()) / 1000;

      if (diffSeconds > 30) {
        throw new Error("Cannot undo checkoff after 30 seconds");
      }
    }

    const { error } = await this.supabase
      .from("tasks")
      .update({
        status: "pending" as TaskStatus,
        completed_at: null,
      })
      .eq("id", taskId)
      .eq("timeline_id", timelineId);

    if (error) {
      throw new Error(`Failed to undo checkoff: ${error.message}`);
    }

    return (await this.get(timelineId))!;
  }

  async suggestRecalculation(
    timelineId: string,
    currentTime: string,
    reason?: string
  ): Promise<RecalculationSuggestion> {
    const timeline = await this.get(timelineId);
    if (!timeline) {
      throw new Error("Timeline not found");
    }

    return this.aiService.suggestRecalculation(timeline, currentTime, reason);
  }

  async applyRecalculation(
    timelineId: string,
    suggestion: RecalculationSuggestion
  ): Promise<Timeline> {
    // Apply the suggested time change
    await this.supabase
      .from("tasks")
      .update({
        start_time_minutes: suggestion.newStartTimeMinutes,
        end_time_minutes: suggestion.newStartTimeMinutes, // Will be recalculated
      })
      .eq("id", suggestion.taskId);

    // Re-fetch and revalidate
    const timeline = await this.get(timelineId);
    if (!timeline) {
      throw new Error("Timeline not found");
    }

    return this.revalidateAndSave(timeline);
  }

  async pushAllTasks(timelineId: string, minutes = 15): Promise<Timeline> {
    // Get all pending tasks
    const { data: tasks } = await this.supabase
      .from("tasks")
      .select("id, start_time_minutes, end_time_minutes")
      .eq("timeline_id", timelineId)
      .eq("status", "pending");

    if (tasks) {
      for (const task of tasks) {
        await this.supabase
          .from("tasks")
          .update({
            start_time_minutes: (task.start_time_minutes as number) + minutes,
            end_time_minutes: (task.end_time_minutes as number) + minutes,
          })
          .eq("id", task.id);
      }
    }

    return (await this.get(timelineId))!;
  }

  async endCooking(timelineId: string): Promise<Timeline> {
    const { error } = await this.supabase
      .from("timelines")
      .update({
        is_running: false,
        current_task_id: null,
      })
      .eq("id", timelineId);

    if (error) {
      throw new Error(`Failed to end cooking: ${error.message}`);
    }

    return (await this.get(timelineId))!;
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  /**
   * Assign proper IDs to generated tasks
   */
  private assignTaskIds(tasks: Task[], meal: Meal): Task[] {
    // Map recipe names to IDs for matching
    const recipeMap = new Map(
      meal.recipes.map((r) => [r.recipe.name.toLowerCase(), r.recipe.id!])
    );

    // Default to first recipe if no match
    const defaultRecipeId = meal.recipes[0]?.recipe.id ?? "";

    return tasks.map((task) => {
      // Try to find matching recipe ID
      let recipeId = task.recipeId;
      if (!recipeId || !recipeId.match(/^[0-9a-f-]{36}$/i)) {
        // If recipeId looks like a name, try to match
        const matchedId = recipeMap.get(task.recipeId.toLowerCase());
        recipeId = matchedId ?? defaultRecipeId;
      }

      return {
        ...task,
        mealId: meal.id!,
        recipeId,
        // Ensure endTimeMinutes is calculated
        endTimeMinutes: task.startTimeMinutes + task.durationMinutes,
        status: task.status ?? "pending",
      };
    });
  }

  /**
   * Fetch all tasks for a timeline
   */
  private async fetchTasks(timelineId: string): Promise<Task[]> {
    const { data, error } = await this.supabase
      .from("tasks")
      .select("*")
      .eq("timeline_id", timelineId)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    return (data ?? []).map((row) => this.transformTaskRow(row as TaskRow));
  }

  /**
   * Update an existing timeline
   */
  private async updateExisting(
    timelineId: string,
    timeline: Timeline
  ): Promise<Timeline> {
    // Delete existing tasks
    await this.supabase.from("tasks").delete().eq("timeline_id", timelineId);

    // Update timeline record
    await this.supabase
      .from("timelines")
      .update({
        has_conflicts: timeline.hasConflicts,
        conflicts: timeline.conflicts,
      })
      .eq("id", timelineId);

    // Insert new tasks
    const tasksToInsert = timeline.tasks.map((task, index) => ({
      timeline_id: timelineId,
      meal_id: timeline.mealId,
      recipe_id: task.recipeId,
      instruction_id: task.instructionId ?? null,
      title: task.title,
      description: task.description ?? null,
      start_time_minutes: task.startTimeMinutes,
      duration_minutes: task.durationMinutes,
      end_time_minutes: task.endTimeMinutes,
      requires_oven: task.requiresOven ?? false,
      oven_temp: task.ovenTemp ?? null,
      depends_on: task.dependsOn ?? [],
      status: task.status,
      completed_at: task.completedAt ?? null,
      notes: task.notes ?? null,
      is_valid: task.isValid ?? true,
      validation_errors: task.validationErrors ?? [],
      sort_order: index,
    }));

    const { error } = await this.supabase.from("tasks").insert(tasksToInsert);

    if (error) {
      throw new Error(`Failed to update tasks: ${error.message}`);
    }

    return (await this.get(timelineId))!;
  }

  /**
   * Revalidate a timeline and save conflicts
   */
  private async revalidateAndSave(timeline: Timeline): Promise<Timeline> {
    const validationResult = validateTimeline(timeline.tasks);

    await this.supabase
      .from("timelines")
      .update({
        has_conflicts: !validationResult.isValid,
        conflicts: validationResult.conflicts,
      })
      .eq("id", timeline.id);

    return (await this.get(timeline.id!))!;
  }

  /**
   * Transform Supabase timeline row to Timeline type
   */
  private transformTimelineRow(row: TimelineRow, tasks: Task[]): Timeline {
    return {
      id: row.id,
      mealId: row.meal_id,
      tasks,
      hasConflicts: row.has_conflicts,
      conflicts: row.conflicts,
      isRunning: row.is_running,
      startedAt: row.started_at ?? undefined,
      currentTaskId: row.current_task_id ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Transform Supabase task row to Task type
   */
  private transformTaskRow(row: TaskRow): Task {
    return {
      id: row.id,
      mealId: row.meal_id,
      recipeId: row.recipe_id,
      instructionId: row.instruction_id ?? undefined,
      title: row.title,
      description: row.description ?? undefined,
      startTimeMinutes: row.start_time_minutes,
      durationMinutes: row.duration_minutes,
      endTimeMinutes: row.end_time_minutes,
      requiresOven: row.requires_oven,
      ovenTemp: row.oven_temp ?? undefined,
      dependsOn: row.depends_on,
      status: row.status,
      completedAt: row.completed_at ?? undefined,
      notes: row.notes ?? undefined,
      isValid: row.is_valid,
      validationErrors: row.validation_errors,
    };
  }
}

/**
 * Factory function to create a SupabaseTimelineService
 */
export function createTimelineService(
  supabase: SupabaseClient,
  aiService: AIService
): TimelineService {
  return new SupabaseTimelineService(supabase, aiService);
}
