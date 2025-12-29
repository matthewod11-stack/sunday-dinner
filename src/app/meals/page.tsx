import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { MealCalendarEmpty } from "@/components/empty-states";

/**
 * Meals page - displays planned family gatherings.
 *
 * For now, shows the empty state. Future phases will:
 * - Fetch meals from Supabase
 * - Display upcoming and past meals
 * - Show meal progress (planning, ready, cooking, done)
 */
export default function MealsPage() {
  // TODO: Fetch meals and recipes from Supabase in Phase 2
  const meals: unknown[] = [];
  const recipes: unknown[] = []; // Check if user has any recipes

  const hasRecipes = recipes.length > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        title="Meal Plans"
        description="Plan your Sunday gatherings"
      >
        <Button asChild variant="secondary" disabled={!hasRecipes}>
          <Link href="/meals/new">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Plan a Meal
          </Link>
        </Button>
      </PageHeader>

      {meals.length === 0 ? (
        <MealCalendarEmpty hasRecipes={hasRecipes} />
      ) : (
        // Future: Meal timeline/list
        <div className="space-y-4">
          {/* Meal cards will go here */}
        </div>
      )}
    </div>
  );
}
