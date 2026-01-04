import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { createShoppingService } from "@/lib/services/shopping";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/meals/[id]/shopping
 * Get shopping list for a meal
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id: mealId } = await params;
    const shoppingService = createShoppingService(supabase);

    const list = await shoppingService.getByMealId(mealId);
    if (!list) {
      return NextResponse.json(
        { error: "Shopping list not found for this meal" },
        { status: 404 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error fetching shopping list:", error);
    return NextResponse.json(
      { error: "Failed to fetch shopping list" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/meals/[id]/shopping
 * Regenerate shopping list for a meal
 */
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id: mealId } = await params;
    const shoppingService = createShoppingService(supabase);

    const list = await shoppingService.regenerate(mealId);

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error regenerating shopping list:", error);
    return NextResponse.json(
      { error: "Failed to regenerate shopping list" },
      { status: 500 }
    );
  }
}
