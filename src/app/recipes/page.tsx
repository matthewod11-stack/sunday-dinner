import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { RecipeBoxEmpty } from "@/components/empty-states";

/**
 * Recipes page - displays the user's recipe collection.
 *
 * For now, shows the empty state. Future phases will:
 * - Fetch recipes from Supabase
 * - Display in a responsive grid
 * - Support search and filtering
 */
export default function RecipesPage() {
  // TODO: Fetch recipes from Supabase in Phase 2
  const recipes: unknown[] = [];

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
        // Future: Recipe grid
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Recipe cards will go here */}
        </div>
      )}
    </div>
  );
}
