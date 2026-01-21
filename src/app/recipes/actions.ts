"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/client";

/**
 * Delete a recipe by ID (Server Action)
 */
export async function deleteRecipe(recipeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // First get the recipe to check if it has an image to delete
    const { data: recipe } = await supabase
      .from("recipes")
      .select("source_image_url")
      .eq("id", recipeId)
      .single();

    // Delete the recipe
    const { error: deleteError } = await supabase
      .from("recipes")
      .delete()
      .eq("id", recipeId);

    if (deleteError) {
      console.error("Failed to delete recipe:", deleteError);
      return { success: false, error: "Failed to delete recipe" };
    }

    // Try to delete the image from storage if it exists
    if (recipe?.source_image_url) {
      try {
        const url = new URL(recipe.source_image_url);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/recipe-images\/(.+)/);
        if (pathMatch?.[1]) {
          await supabase.storage.from("recipe-images").remove([pathMatch[1]]);
        }
      } catch {
        // Ignore image deletion errors
        console.warn("Failed to delete recipe image, continuing...");
      }
    }

    // Revalidate the recipes pages
    revalidatePath("/recipes");

    return { success: true };
  } catch (error) {
    console.error("Recipe deletion failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete recipe"
    };
  }
}
