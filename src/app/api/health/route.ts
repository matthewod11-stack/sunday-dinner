import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * Health check endpoint that verifies Supabase connectivity.
 *
 * GET /api/health
 *
 * Returns:
 * - 200: { status: "ok", database: "connected", tables: [...] }
 * - 503: { status: "error", message: "..." }
 */
export async function GET() {
  try {
    // Test read from recipes table
    const { data: recipes, error: recipesError } = await supabase
      .from("recipes")
      .select("id")
      .limit(1);

    if (recipesError) {
      return NextResponse.json(
        {
          status: "error",
          message: `Database error: ${recipesError.message}`,
          code: recipesError.code,
        },
        { status: 503 }
      );
    }

    // Test read from meals table
    const { error: mealsError } = await supabase
      .from("meals")
      .select("id")
      .limit(1);

    if (mealsError) {
      return NextResponse.json(
        {
          status: "error",
          message: `Meals table error: ${mealsError.message}`,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      tables: {
        recipes: "accessible",
        meals: "accessible",
      },
      recipeCount: recipes?.length ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
