"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Clock, Users, Search, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Recipe } from "@/types";

/**
 * Simplified recipe summary for picker display
 */
interface RecipeSummary {
  id: string;
  name: string;
  servingSize: number;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  sourceType: string | null;
}

interface RecipePickerProps {
  /** Currently selected recipe IDs */
  selectedIds: string[];
  /** Called when selection changes */
  onSelectionChange: (ids: string[]) => void;
  /** Maximum recipes that can be selected */
  maxSelections?: number;
  /** Disable the picker */
  disabled?: boolean;
}

/**
 * Recipe Picker Component
 *
 * Displays available recipes with search and selection.
 * Used in meal planning to select recipes to include.
 */
export function RecipePicker({
  selectedIds,
  onSelectionChange,
  maxSelections = 10,
  disabled = false,
}: RecipePickerProps) {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch recipes on mount
  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch("/api/recipes");
        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }
        const data = await response.json();
        setRecipes(
          data.map((r: Recipe) => ({
            id: r.id,
            name: r.name,
            servingSize: r.servingSize,
            prepTimeMinutes: r.prepTimeMinutes,
            cookTimeMinutes: r.cookTimeMinutes,
            sourceType: r.sourceType,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recipes");
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  // Toggle recipe selection
  const toggleSelection = useCallback(
    (recipeId: string) => {
      if (disabled) return;

      const isSelected = selectedIds.includes(recipeId);
      if (isSelected) {
        onSelectionChange(selectedIds.filter((id) => id !== recipeId));
      } else if (selectedIds.length < maxSelections) {
        onSelectionChange([...selectedIds, recipeId]);
      }
    },
    [selectedIds, onSelectionChange, maxSelections, disabled]
  );

  // Filter recipes by search query
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time display
  const formatTime = (minutes: number | null) => {
    if (minutes === null) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="muted">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-error">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (recipes.length === 0) {
    return (
      <Card variant="muted">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <ChefHat className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
            No recipes yet
          </h3>
          <p className="text-sm text-neutral-600">
            Add some recipes to your collection first, then come back to plan
            your meal.
          </p>
          <Button asChild variant="secondary" size="sm" className="mt-4">
            <a href="/recipes/new">Add Your First Recipe</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search recipes..."
          className="pl-10"
          disabled={disabled}
        />
      </div>

      {/* Selection count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-600">
          {selectedIds.length} of {maxSelections} recipes selected
        </span>
        {selectedIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectionChange([])}
            disabled={disabled}
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Recipe grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredRecipes.map((recipe) => {
          const isSelected = selectedIds.includes(recipe.id);
          const totalTime =
            (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

          return (
            <button
              key={recipe.id}
              type="button"
              onClick={() => toggleSelection(recipe.id)}
              disabled={
                disabled || (!isSelected && selectedIds.length >= maxSelections)
              }
              className={cn(
                "group relative rounded-xl border p-4 text-left transition-all",
                "hover:border-primary hover:shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isSelected
                  ? "border-primary bg-primary-light/30"
                  : "border-neutral-200 bg-surface"
              )}
            >
              {/* Selection indicator */}
              <div
                className={cn(
                  "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-white"
                    : "border-neutral-300 bg-white group-hover:border-primary"
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </div>

              {/* Recipe info */}
              <h4 className="mb-2 pr-8 font-display font-semibold text-foreground">
                {recipe.name}
              </h4>

              <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {recipe.servingSize} servings
                </span>
                {totalTime > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(totalTime)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {filteredRecipes.length === 0 && searchQuery && (
        <p className="py-4 text-center text-sm text-neutral-500">
          No recipes match &quot;{searchQuery}&quot;
        </p>
      )}
    </div>
  );
}
