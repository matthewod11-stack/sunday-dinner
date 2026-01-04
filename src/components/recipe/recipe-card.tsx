"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, Users, Camera, Link as LinkIcon, FileText, PenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Recipe, RecipeSourceType } from "@/types";

export interface RecipeCardProps {
  recipe: Recipe;
}

/**
 * Get icon for source type
 */
function SourceIcon({ sourceType }: { sourceType?: RecipeSourceType }) {
  switch (sourceType) {
    case "photo":
      return <Camera className="h-3.5 w-3.5" />;
    case "url":
      return <LinkIcon className="h-3.5 w-3.5" />;
    case "pdf":
      return <FileText className="h-3.5 w-3.5" />;
    case "manual":
    default:
      return <PenLine className="h-3.5 w-3.5" />;
  }
}

/**
 * RecipeCard - Summary card for recipe list view
 */
export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime =
    (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

  return (
    <Link href={`/recipes/${recipe.id}`} className="block">
      <Card
        variant="outlined"
        className="group h-full cursor-pointer transition-all hover:border-primary hover:shadow-md"
      >
        <CardContent className="p-5">
          {/* Source type badge */}
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
              <SourceIcon sourceType={recipe.sourceType} />
              {recipe.sourceType ?? "manual"}
            </span>
          </div>

          {/* Recipe name */}
          <h3 className="mb-2 font-display text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
            {recipe.name}
          </h3>

          {/* Description */}
          {recipe.description && (
            <p className="mb-3 line-clamp-2 text-sm text-neutral-600">
              {recipe.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
            {/* Servings */}
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4" />
              {recipe.servingSize}
            </span>

            {/* Total time */}
            {totalTime > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {totalTime} min
              </span>
            )}

            {/* Ingredient count */}
            <span className="text-neutral-400">
              {recipe.ingredients.length} ingredients
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
