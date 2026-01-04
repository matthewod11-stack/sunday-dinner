import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * POST /api/live/[mealId]/start
 * Start cooking - anchor timeline to real time
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ mealId: string }> }
) {
  const { mealId } = await params;

  try {
    // Get timeline for this meal
    const { data: timeline, error: timelineError } = await supabase
      .from("timelines")
      .select("id, is_running")
      .eq("meal_id", mealId)
      .single();

    if (timelineError || !timeline) {
      return NextResponse.json(
        { error: "Timeline not found. Generate a timeline first." },
        { status: 404 }
      );
    }

    if (timeline.is_running) {
      return NextResponse.json(
        { error: "Cooking session already started" },
        { status: 400 }
      );
    }

    // Get first pending task to set as current
    const { data: firstTask } = await supabase
      .from("tasks")
      .select("id")
      .eq("timeline_id", timeline.id)
      .eq("status", "pending")
      .order("start_time_minutes", { ascending: true })
      .limit(1)
      .single();

    // Update timeline to running state
    const startedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("timelines")
      .update({
        is_running: true,
        started_at: startedAt,
        current_task_id: firstTask?.id || null,
        updated_at: startedAt,
      })
      .eq("id", timeline.id);

    if (updateError) {
      console.error("Error starting cooking:", updateError);
      return NextResponse.json(
        { error: "Failed to start cooking session" },
        { status: 500 }
      );
    }

    // Set first task to in_progress
    if (firstTask) {
      await supabase
        .from("tasks")
        .update({ status: "in_progress" })
        .eq("id", firstTask.id);
    }

    return NextResponse.json({
      success: true,
      startedAt,
      currentTaskId: firstTask?.id || null,
    });
  } catch (error) {
    console.error("Error starting cooking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
