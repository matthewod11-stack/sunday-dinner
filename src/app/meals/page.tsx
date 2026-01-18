"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarPlus, CalendarDays, Users, Clock, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MealCalendarEmpty } from "@/components/empty-states";
import type { MealSummary, MealStatus } from "@/types";

/**
 * Meals page - displays planned family gatherings.
 */
export default function MealsPage() {
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasRecipes, setHasRecipes] = useState(false);

  // Fetch meals and check for recipes
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch meals and recipes in parallel
        const [mealsRes, recipesRes] = await Promise.all([
          fetch("/api/meals"),
          fetch("/api/recipes?limit=1"),
        ]);

        if (mealsRes.ok) {
          const mealsData = await mealsRes.json();
          setMeals(mealsData.meals ?? []);
        }

        if (recipesRes.ok) {
          const recipesData = await recipesRes.json();
          setHasRecipes(recipesData.length > 0);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Format date for display
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days > 0 && days <= 7) {
      return date.toLocaleDateString("en-US", { weekday: "long" });
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Get status badge color
  const getStatusColor = (status: MealStatus) => {
    switch (status) {
      case "planning":
        return "bg-amber-100 text-amber-700";
      case "timeline_generated":
        return "bg-blue-100 text-blue-700";
      case "shopping_ready":
        return "bg-green-100 text-green-700";
      case "cooking":
        return "bg-primary-light text-primary";
      case "complete":
        return "bg-neutral-100 text-neutral-600";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  const getStatusLabel = (status: MealStatus) => {
    switch (status) {
      case "planning":
        return "Planning";
      case "timeline_generated":
        return "Timeline Ready";
      case "shopping_ready":
        return "Shopping Ready";
      case "cooking":
        return "Cooking";
      case "complete":
        return "Complete";
      default:
        return status;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-8 w-40" />
            <Skeleton className="h-5 w-56" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader title="Meal Plans" description="Plan your Sunday gatherings">
        <Button asChild variant="secondary">
          <Link href="/meals/new">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Plan a Meal
          </Link>
        </Button>
      </PageHeader>

      {meals.length === 0 ? (
        <MealCalendarEmpty hasRecipes={hasRecipes} />
      ) : (
        <div className="space-y-4">
          {meals.map((meal) => (
            <Link key={meal.id} href={`/meals/${meal.id}`}>
              <Card className="transition-all hover:border-primary hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-3">
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {meal.name}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(meal.status)}`}
                      >
                        {getStatusLabel(meal.status)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(meal.serveTime)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {formatTime(meal.serveTime)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {meal.guestCount} guests
                      </span>
                      {meal.recipeCount > 0 && (
                        <span className="text-neutral-400">
                          {meal.recipeCount} recipe{meal.recipeCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
