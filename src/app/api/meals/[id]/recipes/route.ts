import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { createAIService } from "@/lib/services/ai";
import { createMealService } from "@/lib/services/meal";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Request schema for adding a recipe to a meal
 */
const AddRecipeSchema = z.object({
  recipeId: z.string().uuid("Invalid recipe ID"),
  targetServings: z.number().int().positive().max(500),
});

/**
 * POST /api/meals/[id]/recipes - Add a recipe to a meal
 *
 * This triggers Claude's scaling review for the recipe.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: mealId } = await params;
    const body = await request.json();

    // Validate input
    const parsed = AddRecipeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    // Create services
    const aiService = createAIService();
    const mealService = createMealService(supabase, aiService);

    // Add recipe with scaling review
    const meal = await mealService.addRecipe(
      mealId,
      parsed.data.recipeId,
      parsed.data.targetServings
    );

    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    console.error("Failed to add recipe to meal:", error);

    // Handle specific errors
    const message = error instanceof Error ? error.message : "Failed to add recipe";
    const status = message.includes("not found")
      ? 404
      : message.includes("already added")
        ? 409
        : 500;

    return NextResponse.json({ message }, { status });
  }
}

/**
 * Request schema for updating recipe scaling
 */
const UpdateScalingSchema = z.object({
  recipeId: z.string().uuid("Invalid recipe ID"),
  targetServings: z.number().int().positive().max(500),
});

/**
 * PATCH /api/meals/[id]/recipes - Update recipe scaling
 *
 * This triggers a new Claude scaling review.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id: mealId } = await params;
    const body = await request.json();

    // Validate input
    const parsed = UpdateScalingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    // Create services
    const aiService = createAIService();
    const mealService = createMealService(supabase, aiService);

    // Update scaling with review
    const meal = await mealService.updateRecipeScaling(
      mealId,
      parsed.data.recipeId,
      parsed.data.targetServings
    );

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Failed to update recipe scaling:", error);

    const message =
      error instanceof Error ? error.message : "Failed to update scaling";
    const status = message.includes("not found") ? 404 : 500;

    return NextResponse.json({ message }, { status });
  }
}

/**
 * Request schema for removing a recipe
 */
const RemoveRecipeSchema = z.object({
  recipeId: z.string().uuid("Invalid recipe ID"),
});

/**
 * DELETE /api/meals/[id]/recipes - Remove a recipe from a meal
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: mealId } = await params;
    const body = await request.json();

    // Validate input
    const parsed = RemoveRecipeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    // Create services
    const aiService = createAIService();
    const mealService = createMealService(supabase, aiService);

    // Remove recipe
    const meal = await mealService.removeRecipe(mealId, parsed.data.recipeId);

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Failed to remove recipe from meal:", error);

    const message =
      error instanceof Error ? error.message : "Failed to remove recipe";
    const status = message.includes("not found") ? 404 : 500;

    return NextResponse.json({ message }, { status });
  }
}
