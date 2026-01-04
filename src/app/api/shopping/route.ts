import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { createShoppingService } from "@/lib/services/shopping";
import { createMealService } from "@/lib/services/meal";
import { ClaudeAIService } from "@/lib/services/ai";
import { z } from "zod";

const GenerateRequestSchema = z.object({
  mealId: z.string().uuid(),
});

/**
 * POST /api/shopping
 * Generate a shopping list for a meal
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = GenerateRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.format() },
        { status: 400 }
      );
    }
    const { mealId } = parseResult.data;

    const aiService = new ClaudeAIService();
    const mealService = createMealService(supabase, aiService);
    const shoppingService = createShoppingService(supabase);

    // Fetch the meal
    const meal = await mealService.get(mealId);
    if (!meal) {
      return NextResponse.json(
        { error: "Meal not found" },
        { status: 404 }
      );
    }

    // Generate the shopping list
    const list = await shoppingService.generate(meal);

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error generating shopping list:", error);
    return NextResponse.json(
      { error: "Failed to generate shopping list" },
      { status: 500 }
    );
  }
}
