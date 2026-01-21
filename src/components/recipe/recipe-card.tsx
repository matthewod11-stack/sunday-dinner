"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Users, Camera, Link as LinkIcon, FileText, PenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Recipe, RecipeSourceType, RecipeCategory } from "@/types";
import { cn } from "@/lib/utils";

export interface RecipeCardProps {
  recipe: Recipe;
  /** Whether this card is selected (for three-panel layout) */
  isSelected?: boolean;
  /** Click handler (optional, for selection vs navigation) */
  onClick?: () => void;
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
 * Get source badge color based on type
 */
function getSourceBadgeStyles(sourceType?: RecipeSourceType) {
  switch (sourceType) {
    case "photo":
      return "bg-amber-50 text-amber-700";
    case "url":
      return "bg-blue-50 text-blue-700";
    case "pdf":
      return "bg-emerald-50 text-emerald-700";
    case "manual":
    default:
      return "bg-stone-100 text-stone-600";
  }
}

/**
 * Get category badge class
 */
function getCategoryBadgeClass(category?: RecipeCategory): string {
  const badgeClasses: Record<RecipeCategory, string> = {
    "main-dish": "badge-main-dish",
    "side-dish": "badge-side-dish",
    appetizer: "badge-appetizer",
    dessert: "badge-dessert",
    bread: "badge-bread",
    salad: "badge-salad",
    soup: "badge-soup",
    beverage: "badge-beverage",
    other: "badge-other",
  };
  return badgeClasses[category ?? "other"] ?? "badge-other";
}

/**
 * Get category display label
 */
function getCategoryLabel(category?: RecipeCategory): string {
  const labels: Record<RecipeCategory, string> = {
    "main-dish": "Main",
    "side-dish": "Side",
    appetizer: "Appetizer",
    dessert: "Dessert",
    bread: "Bread",
    salad: "Salad",
    soup: "Soup",
    beverage: "Drink",
    other: "Other",
  };
  return labels[category ?? "other"] ?? "Other";
}

/**
 * Get fallback gradient based on recipe name initial
 */
function getFallbackGradient(name: string): string {
  const initial = name.charAt(0).toUpperCase();
  const charCode = initial.charCodeAt(0);

  // Map to warm color gradients
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
 * Recipe thumbnail with fallback
 */
function RecipeThumbnail({
  recipe,
  className
}: {
  recipe: Recipe;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const hasImage = recipe.sourceImageUrl && !hasError;
  const initial = recipe.name.charAt(0).toUpperCase();
  const gradientClass = getFallbackGradient(recipe.name);

  return (
    <div
      className={cn(
        "relative aspect-[16/9] w-full overflow-hidden rounded-t-md",
        className
      )}
    >
      {hasImage ? (
        <>
          {/* Blur placeholder while loading */}
          {isLoading && (
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br",
                gradientClass,
                "animate-pulse"
              )}
            />
          )}
          <Image
            src={recipe.sourceImageUrl!}
            alt={recipe.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => setHasError(true)}
          />
        </>
      ) : (
        /* Gradient fallback with initial */
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
            gradientClass
          )}
        >
          <span className="font-display text-4xl font-bold text-white/60">
            {initial}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * RecipeCard - Summary card for recipe list view (Mela-style with thumbnail)
 */
export function RecipeCard({ recipe, isSelected, onClick }: RecipeCardProps) {
  const totalTime =
    (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

  const cardContent = (
    <Card
      variant="outlined"
      className={cn(
        "group h-full cursor-pointer overflow-hidden transition-all",
        "hover-warm-glow shadow-warm-hover",
        "hover:border-primary/50",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Thumbnail banner */}
      <RecipeThumbnail recipe={recipe} />

      <CardContent className="relative p-4">
        {/* Badges row */}
        <div className="mb-2 flex items-center gap-2">
          {/* Category badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              getCategoryBadgeClass(recipe.category)
            )}
          >
            {getCategoryLabel(recipe.category)}
          </span>
          {/* Source type badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
              getSourceBadgeStyles(recipe.sourceType)
            )}
          >
            <SourceIcon sourceType={recipe.sourceType} />
          </span>
        </div>

        {/* Recipe name */}
        <h3 className="mb-1 font-display text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
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
  );

  // If onClick provided, use button behavior (for selection in three-panel)
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left"
      >
        {cardContent}
      </button>
    );
  }

  // Default: link to recipe detail
  return (
    <Link href={`/recipes/${recipe.id}`} className="block">
      {cardContent}
    </Link>
  );
}
