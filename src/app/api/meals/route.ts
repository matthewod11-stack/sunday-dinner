import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { createAIService } from "@/lib/services/ai";
import { createMealService } from "@/lib/services/meal";
import { MealCreationFormSchema } from "@/lib/validation/form-schemas";
import type { MealStatus } from "@/types";

/**
 * POST /api/meals - Create a new meal
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = MealCreationFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    // Create services
    const aiService = createAIService();
    const mealService = createMealService(supabase, aiService);

    // Create meal
    const meal = await mealService.create({
      name: parsed.data.name,
      serveTime: parsed.data.serveTime,
      guestCount: parsed.data.guestCount,
    });

    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    console.error("Failed to create meal:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create meal" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/meals - List all meals
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const includeTimeline = searchParams.get("include_timeline") === "true";

    // Create services
    const aiService = createAIService();
    const mealService = createMealService(supabase, aiService);

    // List meals
    const meals = await mealService.list({
      status: status as MealStatus | undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    // If include_timeline requested or we're listing for live mode
    if (includeTimeline || !searchParams.has("include_timeline")) {
      // Fetch timeline status for all meals
      const mealIds = meals.map((m) => m.id);
      const { data: timelines } = await supabase
        .from("timelines")
        .select("meal_id, is_running")
        .in("meal_id", mealIds);

      interface TimelineRow {
        meal_id: string;
        is_running: boolean;
      }
      const timelineMap = new Map(
        ((timelines || []) as TimelineRow[]).map((t) => [t.meal_id, t])
      );

      // Add timeline info to meals
      const mealsWithTimeline = meals.map((meal) => ({
        ...meal,
        has_timeline: timelineMap.has(meal.id),
        is_running: timelineMap.get(meal.id)?.is_running || false,
      }));

      return NextResponse.json({ meals: mealsWithTimeline });
    }

    return NextResponse.json({ meals });
  } catch (error) {
    console.error("Failed to list meals:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to list meals" },
      { status: 500 }
    );
  }
}
