"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { PageHeader } from "@/components/layout";
import { ShoppingList } from "@/components/shopping";
import type { ShoppingList as ShoppingListType } from "@/types/shopping";
import type { Meal } from "@/types/meal";
import { createShoppingService } from "@/lib/services/shopping";
import { supabase } from "@/lib/supabase/client";

export default function MealShoppingPage() {
  const params = useParams();
  const mealId = params.mealId as string;

  const [list, setList] = useState<ShoppingListType | null>(null);
  const [meal, setMeal] = useState<Meal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recipe name lookup
  const recipeNames = new Map<string, string>();
  if (meal) {
    for (const { recipe } of meal.recipes) {
      if (recipe.id) {
        recipeNames.set(recipe.id, recipe.name);
      }
    }
  }

  // Fetch meal and shopping list
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch meal
        const mealResponse = await fetch(`/api/meals/${mealId}`);
        if (!mealResponse.ok) throw new Error("Failed to fetch meal");
        const mealData = await mealResponse.json();
        setMeal(mealData);

        // Try to fetch existing shopping list
        const listResponse = await fetch(`/api/meals/${mealId}/shopping`);
        if (listResponse.ok) {
          const listData = await listResponse.json();
          setList(listData);
        }
        // 404 is fine - list just doesn't exist yet
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mealId]);

  // Generate shopping list
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId }),
      });

      if (!response.ok) throw new Error("Failed to generate shopping list");
      const data = await response.json();
      setList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate shopping list
  const handleRegenerate = useCallback(async () => {
    try {
      const response = await fetch(`/api/meals/${mealId}/shopping`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to regenerate shopping list");
      const data = await response.json();
      setList(data);
    } catch (err) {
      console.error("Error regenerating:", err);
      throw err;
    }
  }, [mealId]);

  // Check an item
  const handleCheck = useCallback(
    async (itemId: string) => {
      if (!list?.id) return;
      try {
        const response = await fetch(`/api/shopping/${list.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "check", itemId }),
        });

        if (!response.ok) throw new Error("Failed to check item");
        const data = await response.json();
        setList(data);
      } catch (err) {
        console.error("Error checking item:", err);
      }
    },
    [list?.id]
  );

  // Uncheck an item
  const handleUncheck = useCallback(
    async (itemId: string) => {
      if (!list?.id) return;
      try {
        const response = await fetch(`/api/shopping/${list.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "uncheck", itemId }),
        });

        if (!response.ok) throw new Error("Failed to uncheck item");
        const data = await response.json();
        setList(data);
      } catch (err) {
        console.error("Error unchecking item:", err);
      }
    },
    [list?.id]
  );

  // Toggle staple - this updates localStorage and refreshes the list
  const handleToggleStaple = useCallback(
    async (itemName: string, isStaple: boolean) => {
      const shoppingService = createShoppingService(supabase);

      if (isStaple) {
        await shoppingService.markStaple(itemName);
      } else {
        await shoppingService.unmarkStaple(itemName);
      }

      // Update local state
      if (list) {
        setList({
          ...list,
          items: list.items.map((item) =>
            item.name.toLowerCase() === itemName.toLowerCase()
              ? { ...item, isStaple }
              : item
          ),
        });
      }
    },
    [list]
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Shopping List" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Shopping List" />
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/shopping"
        className="inline-flex items-center gap-2 text-neutral-600 hover:text-terracotta-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        All Shopping Lists
      </Link>

      <PageHeader title={meal?.name ?? "Shopping List"} />

      {!list ? (
        // No list yet - show generate button
        <div className="text-center py-12">
          <p className="text-neutral-600 mb-6">
            Generate a shopping list from your meal recipes.
          </p>
          <Button
            variant="primary"
            onClick={handleGenerate}
            loading={isGenerating}
          >
            Generate Shopping List
          </Button>
        </div>
      ) : (
        // Show the list
        <ShoppingList
          list={list}
          onCheck={handleCheck}
          onUncheck={handleUncheck}
          onToggleStaple={handleToggleStaple}
          onRegenerate={handleRegenerate}
          recipeNames={recipeNames}
          mealName={meal?.name}
        />
      )}
    </div>
  );
}
