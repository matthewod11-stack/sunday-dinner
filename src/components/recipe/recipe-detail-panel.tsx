"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  Users,
  ChefHat,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/types";
import { cn } from "@/lib/utils";

export interface RecipeDetailPanelProps {
  recipe: Recipe | null;
  onClose?: () => void;
}

/**
 * Get fallback gradient based on recipe name initial
 */
function getFallbackGradient(name: string): string {
  const initial = name.charAt(0).toUpperCase();
  const charCode = initial.charCodeAt(0);

  const gradients = [
    "from-amber-100 to-orange-100",
    "from-rose-100 to-pink-100",
    "from-emerald-100 to-teal-100",
    "from-violet-100 to-purple-100",
    "from-sky-100 to-blue-100",
  ];

  const index = charCode % gradients.length;
  // Default fallback guaranteed since we're using modulo
  return gradients[index] ?? "from-amber-100 to-orange-100";
}

/**
 * Detail panel showing recipe preview
 */
export function RecipeDetailPanel({ recipe, onClose }: RecipeDetailPanelProps) {
  const [imageError, setImageError] = useState(false);

  if (!recipe) {
    return (
      <aside className="hidden xl:flex w-96 flex-shrink-0 flex-col items-center justify-center border-l border-neutral-200 bg-neutral-50 p-8">
        <ChefHat className="h-12 w-12 text-neutral-300 mb-3" />
        <p className="text-sm text-neutral-500 text-center">
          Select a recipe to preview
        </p>
      </aside>
    );
  }

  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
  const hasImage = recipe.sourceImageUrl && !imageError;
  const gradientClass = getFallbackGradient(recipe.name);
  const initial = recipe.name.charAt(0).toUpperCase();

  return (
    <aside className="hidden xl:flex w-96 flex-shrink-0 flex-col border-l border-neutral-200 bg-white overflow-hidden">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-100">
        <h2 className="font-display text-lg font-semibold truncate pr-2">
          {recipe.name}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-100 text-neutral-400"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Open Full Recipe button - prominently at top */}
      <div className="p-4 border-b border-neutral-100">
        <Button asChild className="w-full">
          <Link href={`/recipes/${recipe.id}`}>
            Open Full Recipe
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full">
          {hasImage ? (
            <Image
              src={recipe.sourceImageUrl!}
              alt={recipe.name}
              fill
              sizes="384px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
                gradientClass
              )}
            >
              <span className="font-display text-6xl font-bold text-white/50">
                {initial}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 space-y-4">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {recipe.servingSize} servings
            </span>
            {totalTime > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {totalTime} min
              </span>
            )}
          </div>

          {/* Description */}
          {recipe.description && (
            <p className="text-sm text-neutral-600 leading-relaxed">
              {recipe.description}
            </p>
          )}

          {/* Ingredients preview */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Ingredients ({recipe.ingredients.length})
            </h3>
            <ul className="space-y-1 text-sm text-neutral-700">
              {recipe.ingredients.slice(0, 5).map((ing, i) => (
                <li key={ing.id ?? i} className="flex items-start gap-2">
                  <span className="text-neutral-300">•</span>
                  <span>
                    {ing.quantity && (
                      <span className="font-medium">{ing.quantity}</span>
                    )}{" "}
                    {ing.unit && <span>{ing.unit}</span>} {ing.name}
                  </span>
                </li>
              ))}
              {recipe.ingredients.length > 5 && (
                <li className="text-xs text-neutral-400 pl-4">
                  +{recipe.ingredients.length - 5} more...
                </li>
              )}
            </ul>
          </div>

          {/* Source info */}
          {recipe.source && (
            <div className="pt-2 border-t border-neutral-100">
              <span className="text-xs text-neutral-400">
                Source: {recipe.source}
              </span>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}
