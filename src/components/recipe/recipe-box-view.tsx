"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { RecipeBoxEmpty } from "@/components/empty-states";
import {
  RecipeCard,
  CategorySidebar,
  CategoryDropdown,
  RecipeDetailPanel,
} from "@/components/recipe";
import type { Recipe, RecipeCategory } from "@/types";
import type { CategoryCount } from "./category-sidebar";

export interface RecipeBoxViewProps {
  recipes: Recipe[];
}

/**
 * Recipe Box View - Three-panel layout with category filtering
 */
export function RecipeBoxView({ recipes }: RecipeBoxViewProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") as RecipeCategory | null;
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  // Filter recipes by category
  const filteredRecipes = useMemo(() => {
    if (!activeCategory) return recipes;
    return recipes.filter(
      (r) => (r.category ?? "other") === activeCategory
    );
  }, [recipes, activeCategory]);

  // Calculate category counts
  const categoryCounts = useMemo((): CategoryCount[] => {
    const counts = new Map<RecipeCategory | null, number>();
    for (const recipe of recipes) {
      const cat = recipe.category ?? null;
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([category, count]) => ({
      category,
      count,
    }));
  }, [recipes]);

  // Get selected recipe
  const selectedRecipe = useMemo(
    () => filteredRecipes.find((r) => r.id === selectedRecipeId) ?? null,
    [filteredRecipes, selectedRecipeId]
  );

  // Clear selection when filter changes
  const handleCardClick = (recipeId: string) => {
    setSelectedRecipeId((current) =>
      current === recipeId ? null : recipeId
    );
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8">
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
        <>
          {/* Mobile category filter */}
          <div className="mb-6">
            <CategoryDropdown
              categoryCounts={categoryCounts}
              totalCount={recipes.length}
            />
          </div>

          {/* Three-panel layout */}
          <div className="flex gap-8">
            {/* Left sidebar - desktop only */}
            <CategorySidebar
              categoryCounts={categoryCounts}
              totalCount={recipes.length}
            />

            {/* Main card grid */}
            <main className="flex-1 min-w-0">
              {filteredRecipes.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-neutral-200 p-12 text-center">
                  <p className="text-neutral-500">
                    No recipes in this category yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      isSelected={selectedRecipeId === recipe.id}
                      onClick={() => handleCardClick(recipe.id!)}
                    />
                  ))}
                </div>
              )}
            </main>

            {/* Right detail panel - xl screens only */}
            <RecipeDetailPanel
              recipe={selectedRecipe}
              onClose={() => setSelectedRecipeId(null)}
            />
          </div>
        </>
      )}
    </div>
  );
}
