import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { createAIService } from "@/lib/services/ai";
import { createTimelineService } from "@/lib/services/timeline";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/meals/[id]/timeline - Get timeline for a meal
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id: mealId } = await params;
    const aiService = createAIService();
    const timelineService = createTimelineService(supabase, aiService);

    const timeline = await timelineService.getByMealId(mealId);
    if (!timeline) {
      return NextResponse.json(
        { message: "No timeline found for this meal" },
        { status: 404 }
      );
    }

    return NextResponse.json(timeline);
  } catch (error) {
    console.error("Failed to get meal timeline:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to get timeline",
      },
      { status: 500 }
    );
  }
}
