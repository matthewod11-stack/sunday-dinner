import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";

const UpdateTaskSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "skipped"]).optional(),
  notes: z.string().optional(),
});

/**
 * PATCH /api/live/[mealId]/tasks/[taskId]
 * Update task status (checkoff, undo, skip)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ mealId: string; taskId: string }> }
) {
  const { mealId, taskId } = await params;

  try {
    const body = await request.json();
    const parsed = UpdateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { status, notes } = parsed.data;

    // Verify task belongs to a timeline for this meal
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, timeline_id, status, timelines!inner(meal_id)")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Check meal ownership - timelines can be object or array depending on join
    const timelines = task.timelines as unknown as { meal_id: string } | { meal_id: string }[];
    const timeline = Array.isArray(timelines) ? timelines[0] : timelines;
    if (!timeline || timeline.meal_id !== mealId) {
      return NextResponse.json(
        { error: "Task does not belong to this meal" },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      updateData.status = status;

      // Set or clear completed_at based on status
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      } else if (status === "pending") {
        updateData.completed_at = null;
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update task
    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating task:", updateError);
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    // If completed, advance current_task_id to next pending task
    if (status === "completed") {
      const { data: nextTask } = await supabase
        .from("tasks")
        .select("id")
        .eq("timeline_id", task.timeline_id)
        .eq("status", "pending")
        .order("start_time_minutes", { ascending: true })
        .limit(1)
        .single();

      if (nextTask) {
        await supabase
          .from("timelines")
          .update({ current_task_id: nextTask.id })
          .eq("id", task.timeline_id);

        // Set next task to in_progress
        await supabase
          .from("tasks")
          .update({ status: "in_progress" })
          .eq("id", nextTask.id);
      } else {
        // No more pending tasks - cooking complete!
        await supabase
          .from("timelines")
          .update({ current_task_id: null })
          .eq("id", task.timeline_id);
      }
    }

    return NextResponse.json({
      success: true,
      task: {
        id: updatedTask.id,
        status: updatedTask.status,
        completedAt: updatedTask.completed_at,
        notes: updatedTask.notes,
      },
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
