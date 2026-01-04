import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Users,
  Camera,
  Link as LinkIcon,
  FileText,
  PenLine,
  Pencil,
  Trash2,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import type { Recipe, RecipeSourceType } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Fetch a single recipe by ID
 */
async function getRecipe(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description ?? undefined,
    sourceType: data.source_type,
    source: data.source ?? undefined,
    sourceImageUrl: data.source_image_url ?? undefined,
    servingSize: data.serving_size,
    prepTimeMinutes: data.prep_time_minutes,
    cookTimeMinutes: data.cook_time_minutes,
    ingredients: data.ingredients ?? [],
    instructions: data.instructions ?? [],
    notes: data.notes ?? undefined,
    uncertainFields: data.uncertain_fields ?? undefined,
    extractionConfidence: data.extraction_confidence ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Get icon for source type
 */
function SourceIcon({ sourceType }: { sourceType?: RecipeSourceType }) {
  switch (sourceType) {
    case "photo":
      return <Camera className="h-4 w-4" />;
    case "url":
      return <LinkIcon className="h-4 w-4" />;
    case "pdf":
      return <FileText className="h-4 w-4" />;
    case "manual":
    default:
      return <PenLine className="h-4 w-4" />;
  }
}

/**
 * Recipe Detail Page
 */
export default async function RecipeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  const totalTime =
    (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/recipes"
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Recipe Box
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
              <SourceIcon sourceType={recipe.sourceType} />
              {recipe.sourceType ?? "manual"}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {recipe.name}
          </h1>
          {recipe.description && (
            <p className="mt-2 text-neutral-600">{recipe.description}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/recipes/${recipe.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="text-error hover:bg-error/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-8 flex flex-wrap items-center gap-6 text-neutral-600">
        <span className="inline-flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="font-medium">{recipe.servingSize}</span> servings
        </span>
        {recipe.prepTimeMinutes && (
          <span className="inline-flex items-center gap-2">
            <Clock className="h-5 w-5 text-secondary" />
            <span className="font-medium">{recipe.prepTimeMinutes}</span> min prep
          </span>
        )}
        {recipe.cookTimeMinutes && (
          <span className="inline-flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            <span className="font-medium">{recipe.cookTimeMinutes}</span> min cook
          </span>
        )}
        {totalTime > 0 && (
          <span className="text-neutral-400">
            Total: {totalTime} min
          </span>
        )}
      </div>

      {/* Two-column layout for ingredients and instructions */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Ingredients - left column */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
                Ingredients
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={ingredient.id ?? index} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      {ingredient.quantity != null && (
                        <span className="font-medium">{ingredient.quantity}</span>
                      )}{" "}
                      {ingredient.unit && <span>{ingredient.unit}</span>}{" "}
                      <span>{ingredient.name}</span>
                      {ingredient.notes && (
                        <span className="text-neutral-500">
                          {" "}({ingredient.notes})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Instructions - right column */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
                Instructions
              </h2>
              <ol className="space-y-6">
                {recipe.instructions.map((instruction, index) => (
                  <li key={instruction.id ?? index} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light font-display font-semibold text-primary">
                      {instruction.stepNumber}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-foreground">{instruction.description}</p>
                      {/* Step metadata */}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                        {instruction.durationMinutes && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {instruction.durationMinutes} min
                          </span>
                        )}
                        {instruction.ovenRequired && (
                          <span className="inline-flex items-center gap-1 text-accent">
                            <Flame className="h-4 w-4" />
                            {instruction.ovenTemp ?? 350}°F
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notes section */}
      {recipe.notes && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="mb-2 font-display text-xl font-semibold text-foreground">
              Notes
            </h2>
            <p className="text-neutral-600 whitespace-pre-wrap">{recipe.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Extraction confidence (if available) */}
      {recipe.extractionConfidence && (
        <div className="mt-8 text-center text-xs text-neutral-400">
          Extracted with{" "}
          {Math.round((recipe.extractionConfidence.overall ?? 0) * 100)}%
          confidence
        </div>
      )}
    </div>
  );
}
