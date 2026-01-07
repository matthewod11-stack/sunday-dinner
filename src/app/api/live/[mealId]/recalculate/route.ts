import { NextRequest, NextResponse } from "next/server";
import { createAIService } from "@/lib/services/ai";
import type { Timeline } from "@/types";

interface RecalculateRequest {
  timeline: Timeline;
  currentTime: string;
  context?: string;
}

/**
 * POST /api/live/[mealId]/recalculate
 *
 * Request a recalculation suggestion from Claude when running behind schedule.
 * Returns a single suggestion for how to adjust the timeline.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mealId: string }> }
) {
  try {
    const { mealId } = await params;
    const body: RecalculateRequest = await request.json();

    if (!body.timeline || !body.currentTime) {
      return NextResponse.json(
        { error: "Missing required fields: timeline, currentTime" },
        { status: 400 }
      );
    }

    // Verify timeline belongs to this meal
    if (body.timeline.mealId !== mealId) {
      return NextResponse.json(
        { error: "Timeline mealId does not match route parameter" },
        { status: 400 }
      );
    }

    // Call Claude for recalculation suggestion
    const aiService = createAIService();
    const suggestion = await aiService.suggestRecalculation(
      body.timeline,
      body.currentTime,
      body.context
    );

    return NextResponse.json(suggestion);
  } catch (err) {
    console.error("Recalculation error:", err);

    // Handle specific error types
    if (err instanceof Error) {
      if (err.message.includes("API")) {
        return NextResponse.json(
          { error: "AI service temporarily unavailable" },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to generate recalculation suggestion" },
      { status: 500 }
    );
  }
}
