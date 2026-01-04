import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * GET /api/live/[mealId]
 * Get live execution state for a meal
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ mealId: string }> }
) {
  const { mealId } = await params;

  try {
    // Get meal with serve time
    const { data: meal, error: mealError } = await supabase
      .from("meals")
      .select("*")
      .eq("id", mealId)
      .single();

    if (mealError || !meal) {
      return NextResponse.json(
        { error: "Meal not found" },
        { status: 404 }
      );
    }

    // Get timeline for this meal
    const { data: timeline, error: timelineError } = await supabase
      .from("timelines")
      .select("*")
      .eq("meal_id", mealId)
      .single();

    if (timelineError || !timeline) {
      return NextResponse.json(
        { error: "Timeline not found. Generate a timeline first." },
        { status: 404 }
      );
    }

    // Get tasks for this timeline
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("timeline_id", timeline.id)
      .order("start_time_minutes", { ascending: true });

    if (tasksError) {
      return NextResponse.json(
        { error: "Failed to load tasks" },
        { status: 500 }
      );
    }

    // Get recipe names for display
    interface TaskRow {
      recipe_id: string;
    }
    const taskList = (tasks || []) as TaskRow[];
    const recipeIds = Array.from(
      new Set(taskList.map((t: TaskRow) => t.recipe_id))
    );
    const { data: recipes } = await supabase
      .from("recipes")
      .select("id, title")
      .in("id", recipeIds);

    const recipeNames: Record<string, string> = {};
    for (const r of recipes || []) {
      recipeNames[r.id as string] = r.title as string;
    }

    // Transform database records to Timeline type
    const liveState = {
      timeline: {
        id: timeline.id,
        mealId: timeline.meal_id,
        tasks: (tasks || []).map((t) => ({
          id: t.id,
          mealId: t.meal_id,
          recipeId: t.recipe_id,
          instructionId: t.instruction_id,
          title: t.title,
          description: t.description,
          startTimeMinutes: t.start_time_minutes,
          durationMinutes: t.duration_minutes,
          endTimeMinutes: t.end_time_minutes,
          requiresOven: t.requires_oven,
          ovenTemp: t.oven_temp,
          dependsOn: t.depends_on,
          status: t.status,
          completedAt: t.completed_at,
          notes: t.notes,
        })),
        hasConflicts: timeline.has_conflicts || false,
        conflicts: timeline.conflicts || [],
        isRunning: timeline.is_running || false,
        startedAt: timeline.started_at,
        currentTaskId: timeline.current_task_id,
        createdAt: timeline.created_at,
        updatedAt: timeline.updated_at,
      },
      meal: {
        id: meal.id,
        name: meal.name,
        serveTime: meal.serve_time,
        guestCount: meal.guest_count,
      },
      recipeNames,
    };

    return NextResponse.json(liveState);
  } catch (error) {
    console.error("Error fetching live state:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
