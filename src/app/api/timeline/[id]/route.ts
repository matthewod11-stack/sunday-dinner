import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { createAIService } from "@/lib/services/ai";
import { createTimelineService } from "@/lib/services/timeline";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/timeline/[id] - Get a timeline by ID
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const aiService = createAIService();
    const timelineService = createTimelineService(supabase, aiService);

    const timeline = await timelineService.get(id);
    if (!timeline) {
      return NextResponse.json(
        { message: "Timeline not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(timeline);
  } catch (error) {
    console.error("Failed to get timeline:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to get timeline",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/timeline/[id] - Update timeline (validate, update task, etc.)
 *
 * Request body options:
 * - { action: "validate" } - Re-validate the timeline
 * - { action: "updateTask", taskId, updates } - Update a single task
 * - { action: "deleteTask", taskId } - Delete a task
 * - { action: "reorderTasks", taskOrder } - Reorder tasks
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const aiService = createAIService();
    const timelineService = createTimelineService(supabase, aiService);

    const timeline = await timelineService.get(id);
    if (!timeline) {
      return NextResponse.json(
        { message: "Timeline not found" },
        { status: 404 }
      );
    }

    let updated = timeline;

    switch (body.action) {
      case "validate":
        const validationResult = timelineService.validate(timeline);
        return NextResponse.json(validationResult);

      case "updateTask":
        if (!body.taskId || !body.updates) {
          return NextResponse.json(
            { message: "taskId and updates are required" },
            { status: 400 }
          );
        }
        updated = await timelineService.updateTask(id, body.taskId, body.updates);
        break;

      case "deleteTask":
        if (!body.taskId) {
          return NextResponse.json(
            { message: "taskId is required" },
            { status: 400 }
          );
        }
        updated = await timelineService.deleteTask(id, body.taskId);
        break;

      case "reorderTasks":
        if (!body.taskOrder || !Array.isArray(body.taskOrder)) {
          return NextResponse.json(
            { message: "taskOrder array is required" },
            { status: 400 }
          );
        }
        updated = await timelineService.reorderTasks(id, body.taskOrder);
        break;

      default:
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update timeline:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to update timeline",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/timeline/[id] - Delete a timeline
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const aiService = createAIService();
    const timelineService = createTimelineService(supabase, aiService);

    await timelineService.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete timeline:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to delete timeline",
      },
      { status: 500 }
    );
  }
}
