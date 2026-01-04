"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, ChevronRight, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui";
import { PageHeader } from "@/components/layout";
import type { MealSummary } from "@/types/meal";

export default function ShoppingPage() {
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch("/api/meals");
        if (!response.ok) throw new Error("Failed to fetch meals");
        const data = await response.json();
        setMeals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeals();
  }, []);

  // Filter to meals that are ready for shopping
  const shoppingReadyMeals = meals.filter(
    (m) =>
      m.status === "timeline_generated" ||
      m.status === "shopping_ready" ||
      m.status === "cooking"
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Shopping Lists" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Shopping Lists" />
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
      <PageHeader title="Shopping Lists" />

      {shoppingReadyMeals.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-neutral-700 mb-2">
            No shopping lists yet
          </h3>
          <p className="text-neutral-500 mb-6">
            Create a meal and generate a timeline to get started with shopping
            lists.
          </p>
          <Link href="/meals/new">
            <Button variant="primary">Plan a Meal</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {shoppingReadyMeals.map((meal) => (
            <Link
              key={meal.id}
              href={`/shopping/${meal.id}`}
              className="block bg-white border border-neutral-200 rounded-lg p-4 hover:border-terracotta-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-900">{meal.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-neutral-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(meal.serveTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {meal.guestCount} guests
                    </span>
                    <span className="flex items-center gap-1">
                      {meal.recipeCount} recipes
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
