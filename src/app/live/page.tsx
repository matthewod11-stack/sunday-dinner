"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChefHat, Clock, Users, ArrowRight, Play, Calendar } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button, Card } from "@/components/ui";

interface MealSummary {
  id: string;
  name: string;
  serve_time: string;
  guest_count: number;
  has_timeline: boolean;
  is_running: boolean;
}

/**
 * Live Mode - Select a meal to cook
 */
export default function LivePage() {
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeals() {
      try {
        // Fetch meals with timeline status
        const response = await fetch("/api/meals");
        if (response.ok) {
          const data = await response.json();
          setMeals(data.meals || []);
        }
      } catch (error) {
        console.error("Failed to fetch meals:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMeals();
  }, []);

  // Filter to meals with timelines (ready to cook)
  const readyMeals = meals.filter((m) => m.has_timeline);
  const upcomingMeals = readyMeals
    .filter((m) => new Date(m.serve_time) > new Date())
    .sort((a, b) => new Date(a.serve_time).getTime() - new Date(b.serve_time).getTime());

  // Currently cooking meals
  const cookingMeals = readyMeals.filter((m) => m.is_running);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <PageHeader
          title="Live Cooking"
          description="Select a meal to start cooking"
        />

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-neutral-500">Loading meals...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Currently Cooking */}
            {cookingMeals.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  In Progress
                </h2>
                <div className="space-y-3">
                  {cookingMeals.map((meal) => (
                    <MealCard key={meal.id} meal={meal} isCooking />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Meals */}
            {upcomingMeals.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-500" />
                  Ready to Cook
                </h2>
                <div className="space-y-3">
                  {upcomingMeals.map((meal) => (
                    <MealCard key={meal.id} meal={meal} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {readyMeals.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-neutral-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
                  <ChefHat className="h-10 w-10 text-neutral-400" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  No Meals Ready
                </h3>
                <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                  Create a meal and generate a timeline first, then come back here
                  to start cooking.
                </p>
                <Link href="/meals/new">
                  <Button variant="primary">Plan a Meal</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Meal card for selection
 */
function MealCard({
  meal,
  isCooking = false,
}: {
  meal: MealSummary;
  isCooking?: boolean;
}) {
  const serveTime = new Date(meal.serve_time);
  const isToday = isSameDay(serveTime, new Date());
  const isTomorrow = isSameDay(
    serveTime,
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );

  const dateLabel = isToday
    ? "Today"
    : isTomorrow
      ? "Tomorrow"
      : serveTime.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });

  return (
    <Link href={`/live/${meal.id}`}>
      <Card
        variant={isCooking ? "elevated" : "default"}
        interactive
        className="p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-foreground">{meal.name}</h3>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {dateLabel} at{" "}
                {serveTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {meal.guest_count} guests
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCooking && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Cooking
              </span>
            )}
            {isCooking ? (
              <ArrowRight className="h-5 w-5 text-primary" />
            ) : (
              <Play className="h-5 w-5 text-neutral-400" />
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

/**
 * Check if two dates are the same day
 */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
