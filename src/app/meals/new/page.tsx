import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { MealForm } from "@/components/meals";

/**
 * Create New Meal page
 *
 * Step 1 of meal planning: Set name, serve time, and guest count.
 * After creation, redirects to meal detail page for recipe selection.
 */
export default function NewMealPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/meals"
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Meals
      </Link>

      <PageHeader
        title="Plan a Gathering"
        description="Tell us about your Sunday dinner and we'll help coordinate everything"
      />

      <MealForm mode="create" />
    </div>
  );
}
