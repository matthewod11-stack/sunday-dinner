import Link from "next/link";
import { ArrowLeft, Camera, Link as LinkIcon, FileText, PenLine, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Add Recipe page - method selection for recipe ingestion.
 *
 * Supports:
 * - Photo upload (Claude Vision extraction) - ACTIVE
 * - URL paste (recipe site scraping) - Coming Week 4
 * - PDF upload - Coming Week 4
 * - Manual entry - Coming Week 3
 */
export default function NewRecipePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/recipes"
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Recipes
      </Link>

      <PageHeader
        title="Add a Recipe"
        description="Digitize a family recipe in the way that works best for you"
      />

      {/* Method selection cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Photo Upload - ACTIVE */}
        <Link href="/recipes/new/photo" className="block">
          <Card
            variant="outlined"
            className="group relative h-full cursor-pointer overflow-hidden transition-all hover:border-primary hover:shadow-md"
          >
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary transition-transform group-hover:scale-110">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                Photo Upload
              </h3>
              <p className="mb-4 text-sm text-neutral-600">
                Take a photo of a handwritten or printed recipe card.
                We&apos;ll extract the ingredients and steps.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Get started
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </CardContent>
            {/* Decorative corner */}
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary-light/30" />
          </Card>
        </Link>

        {/* URL Paste */}
        <Card variant="outlined" className="group relative overflow-hidden">
          <CardContent className="p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-light text-secondary transition-transform group-hover:scale-110">
              <LinkIcon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
              Paste a URL
            </h3>
            <p className="mb-4 text-sm text-neutral-600">
              Found a recipe online? Paste the link and we&apos;ll
              pull in the details automatically.
            </p>
            <span className="inline-flex items-center rounded-full bg-accent-light px-3 py-1 text-xs font-medium text-accent">
              Coming in Phase 2
            </span>
          </CardContent>
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-secondary-light/30" />
        </Card>

        {/* PDF Upload */}
        <Card variant="outlined" className="group relative overflow-hidden">
          <CardContent className="p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-info-light text-info transition-transform group-hover:scale-110">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
              Upload PDF
            </h3>
            <p className="mb-4 text-sm text-neutral-600">
              Have a recipe saved as a PDF? Upload it and we&apos;ll
              do the rest.
            </p>
            <span className="inline-flex items-center rounded-full bg-accent-light px-3 py-1 text-xs font-medium text-accent">
              Coming in Phase 2
            </span>
          </CardContent>
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-info-light/30" />
        </Card>

        {/* Manual Entry */}
        <Card variant="outlined" className="group relative overflow-hidden">
          <CardContent className="p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light text-accent transition-transform group-hover:scale-110">
              <PenLine className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
              Type It In
            </h3>
            <p className="mb-4 text-sm text-neutral-600">
              Know the recipe by heart? Enter it manually with our
              guided form.
            </p>
            <span className="inline-flex items-center rounded-full bg-accent-light px-3 py-1 text-xs font-medium text-accent">
              Coming in Phase 2
            </span>
          </CardContent>
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-accent-light/30" />
        </Card>
      </div>

      {/* Info note */}
      <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-surface-muted p-6 text-center">
        <p className="text-sm text-neutral-600">
          <strong>Photo Upload</strong> is ready! Other methods coming in <strong>Week 4</strong>.
          <br />
          Start by snapping a photo of your favorite recipe card.
        </p>
      </div>
    </div>
  );
}
