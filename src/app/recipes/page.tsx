import { Suspense } from "react";
import { RecipeBoxView } from "@/components/recipe";
import { supabase } from "@/lib/supabase/client";
import type { Recipe } from "@/types";

// Disable caching so router.refresh() works after deletes
export const dynamic = "force-dynamic";

/**
 * Fetch recipes from Supabase
 */
async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch recipes:", error);
    return [];
  }

  // Transform database columns to Recipe interface
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    sourceType: row.source_type,
    category: row.category ?? undefined,
    source: row.source ?? undefined,
    sourceImageUrl: row.source_image_url ?? undefined,
    servingSize: row.serving_size,
    prepTimeMinutes: row.prep_time_minutes,
    cookTimeMinutes: row.cook_time_minutes,
    ingredients: row.ingredients ?? [],
    instructions: row.instructions ?? [],
    notes: row.notes ?? undefined,
    uncertainFields: row.uncertain_fields ?? undefined,
    extractionConfidence: row.extraction_confidence ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Loading fallback for the recipe box view
 */
function RecipeBoxLoading() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-neutral-200 rounded mb-2" />
        <div className="h-4 w-64 bg-neutral-100 rounded mb-8" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-neutral-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Recipes page - displays the user's recipe collection.
 *
 * Server component that fetches recipes from Supabase
 * and passes to client component for interactive three-panel layout.
 */
export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <Suspense fallback={<RecipeBoxLoading />}>
      <RecipeBoxView recipes={recipes} />
    </Suspense>
  );
}
