import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { createAIService } from "@/lib/services/ai";
import { createMealService } from "@/lib/services/meal";
import { createTimelineService } from "@/lib/services/timeline";

/**
 * POST /api/timeline/generate - Generate a timeline for a meal
 *
 * Request body: { mealId: string }
 * Response: Timeline with tasks and any conflicts
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mealId } = body;

    if (!mealId) {
      return NextResponse.json(
        { message: "mealId is required" },
        { status: 400 }
      );
    }

    const aiService = createAIService();
    const mealService = createMealService(supabase, aiService);
    const timelineService = createTimelineService(supabase, aiService);

    // Fetch the meal with its recipes
    const meal = await mealService.get(mealId);
    if (!meal) {
      return NextResponse.json({ message: "Meal not found" }, { status: 404 });
    }

    if (meal.recipes.length === 0) {
      return NextResponse.json(
        { message: "Meal must have at least one recipe to generate timeline" },
        { status: 400 }
      );
    }

    // Generate the timeline
    const timeline = await timelineService.generate(meal);

    // Save to database
    const saved = await timelineService.save(timeline);

    // Update meal status
    await mealService.update(mealId, { status: "timeline_generated" });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Failed to generate timeline:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to generate timeline",
      },
      { status: 500 }
    );
  }
}
