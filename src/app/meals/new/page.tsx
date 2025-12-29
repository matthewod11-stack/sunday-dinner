import Link from "next/link";
import { ArrowLeft, Users, Clock, UtensilsCrossed } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Plan Meal page - placeholder for Phase 2 implementation.
 *
 * Will support:
 * - Setting serve time and guest count
 * - Selecting recipes from library
 * - Adjusting scaling factors
 * - Generating cooking timeline
 */
export default function NewMealPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
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

      {/* Planning steps preview */}
      <div className="space-y-4">
        {/* Step 1: Event Details */}
        <Card variant="muted">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary-light font-display text-lg font-semibold text-secondary">
              1
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-display text-lg font-semibold text-foreground">
                Set the Details
              </h3>
              <p className="text-sm text-neutral-600">
                When is dinner? How many guests? This helps us calculate
                portions and timing.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
                  <Clock className="h-4 w-4" />
                  Serve time
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
                  <Users className="h-4 w-4" />
                  Guest count
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Select Recipes */}
        <Card variant="muted">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary-light font-display text-lg font-semibold text-secondary">
              2
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-display text-lg font-semibold text-foreground">
                Pick Your Recipes
              </h3>
              <p className="text-sm text-neutral-600">
                Choose from your recipe box. We&apos;ll show how each dish
                scales and flag any concerns.
              </p>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
                  <UtensilsCrossed className="h-4 w-4" />
                  Select from your collection
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Generate Timeline */}
        <Card variant="muted">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary-light font-display text-lg font-semibold text-secondary">
              3
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-display text-lg font-semibold text-foreground">
                Get Your Timeline
              </h3>
              <p className="text-sm text-neutral-600">
                We&apos;ll create a step-by-step cooking schedule, working
                backwards from serve time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Shopping List */}
        <Card variant="muted">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary-light font-display text-lg font-semibold text-secondary">
              4
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-display text-lg font-semibold text-foreground">
                Shop With Confidence
              </h3>
              <p className="text-sm text-neutral-600">
                Get a consolidated shopping list with scaled quantities,
                organized by store section.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info note */}
      <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-surface-muted p-6 text-center">
        <p className="text-sm text-neutral-600">
          Meal planning features are coming in <strong>Phase 2 (Week 3)</strong>.
          <br />
          Add some recipes first, then come back to plan your gathering!
        </p>
      </div>
    </div>
  );
}
