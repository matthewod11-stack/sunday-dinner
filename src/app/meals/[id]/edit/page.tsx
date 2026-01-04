"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { MealForm } from "@/components/meals";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Meal } from "@/types";

/**
 * Edit Meal Page
 *
 * Allows editing meal name, serve time, and guest count.
 */
export default function EditMealPage() {
  const params = useParams();
  const router = useRouter();
  const mealId = params.id as string;

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch meal data
  useEffect(() => {
    async function fetchMeal() {
      try {
        const response = await fetch(`/api/meals/${mealId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Meal not found");
          }
          throw new Error("Failed to fetch meal");
        }
        const data = await response.json();
        setMeal(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load meal");
      } finally {
        setLoading(false);
      }
    }

    fetchMeal();
  }, [mealId]);

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <Skeleton className="mb-6 h-6 w-32" />
        <Skeleton className="mb-2 h-10 w-48" />
        <Skeleton className="mb-8 h-5 w-72" />
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !meal) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <Link
          href="/meals"
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meals
        </Link>
        <Card variant="muted">
          <CardContent className="p-8 text-center">
            <p className="text-error">{error ?? "Meal not found"}</p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => router.push("/meals")}
            >
              Return to Meals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      {/* Back link */}
      <Link
        href={`/meals/${mealId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Meal
      </Link>

      <PageHeader title="Edit Meal" description={`Update details for "${meal.name}"`} />

      <MealForm
        mode="edit"
        mealId={mealId}
        initialData={{
          name: meal.name,
          serveTime: meal.serveTime,
          guestCount: meal.guestCount.total,
        }}
        onSuccess={() => router.push(`/meals/${mealId}`)}
      />
    </div>
  );
}
