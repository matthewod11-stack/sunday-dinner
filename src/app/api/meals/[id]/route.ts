import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { createAIService } from "@/lib/services/ai";
import { createMealService } from "@/lib/services/meal";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/meals/[id] - Get a meal by ID
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const aiService = createAIService();
    const mealService = createMealService(supabase, aiService);

    const meal = await mealService.get(id);
    if (!meal) {
      return NextResponse.json({ message: "Meal not found" }, { status: 404 });
    }

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Failed to get meal:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to get meal" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/meals/[id] - Update a meal
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const aiService = createAIService();
    const mealService = createMealService(supabase, aiService);

    const meal = await mealService.update(id, {
      name: body.name,
      serveTime: body.serveTime,
      guestCount: body.guestCount ? { total: body.guestCount } : undefined,
      status: body.status,
    });

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Failed to update meal:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update meal" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/meals/[id] - Delete a meal
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const aiService = createAIService();
    const mealService = createMealService(supabase, aiService);

    await mealService.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete meal:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete meal" },
      { status: 500 }
    );
  }
}
