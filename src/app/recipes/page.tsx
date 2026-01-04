import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { RecipeBoxEmpty } from "@/components/empty-states";
import { RecipeCard } from "@/components/recipe";
import { supabase } from "@/lib/supabase/client";
import type { Recipe } from "@/types";

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
 * Recipes page - displays the user's recipe collection.
 *
 * Server component that fetches recipes from Supabase
 * and displays them in a responsive grid.
 */
export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        title="Your Recipe Box"
        description="Family recipes, ready for Sunday dinner"
      >
        <Button asChild>
          <Link href="/recipes/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Recipe
          </Link>
        </Button>
      </PageHeader>

      {recipes.length === 0 ? (
        <RecipeBoxEmpty />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
