import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/recipes/[id] - Get a single recipe
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data: recipe, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
      }
      console.error("Failed to fetch recipe:", error);
      return NextResponse.json(
        { error: "Failed to fetch recipe" },
        { status: 500 }
      );
    }

    // Transform to match Recipe interface
    const transformedRecipe = {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description ?? undefined,
      sourceType: recipe.source_type,
      category: recipe.category ?? undefined,
      source: recipe.source ?? undefined,
      sourceImageUrl: recipe.source_image_url ?? undefined,
      servingSize: recipe.serving_size,
      prepTimeMinutes: recipe.prep_time_minutes,
      cookTimeMinutes: recipe.cook_time_minutes,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      notes: recipe.notes ?? undefined,
      uncertainFields: recipe.uncertain_fields ?? undefined,
      extractionConfidence: recipe.extraction_confidence ?? undefined,
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
    };

    return NextResponse.json(transformedRecipe);
  } catch (error) {
    console.error("Recipe fetch failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch recipe" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/recipes/[id] - Delete a recipe
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // First get the recipe to check if it has an image to delete
    const { data: recipe } = await supabase
      .from("recipes")
      .select("source_image_url")
      .eq("id", id)
      .single();

    // Delete the recipe
    const { error: deleteError } = await supabase
      .from("recipes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Failed to delete recipe:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete recipe" },
        { status: 500 }
      );
    }

    // Try to delete the image from storage if it exists
    if (recipe?.source_image_url) {
      try {
        // Extract path from URL
        const url = new URL(recipe.source_image_url);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/recipe-images\/(.+)/);
        if (pathMatch?.[1]) {
          await supabase.storage.from("recipe-images").remove([pathMatch[1]]);
        }
      } catch {
        // Ignore image deletion errors - recipe is already deleted
        console.warn("Failed to delete recipe image, continuing...");
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Recipe deletion failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
