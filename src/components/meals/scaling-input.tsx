"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, AlertTriangle, Scale, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScalingInputProps {
  /** Recipe ID */
  recipeId: string;
  /** Recipe name for display */
  recipeName: string;
  /** Original serving size */
  originalServings: number;
  /** Current target servings */
  targetServings: number;
  /** Callback when target changes */
  onTargetChange: (recipeId: string, targetServings: number) => void;
  /** Claude's review notes (if any) */
  reviewNotes?: string;
  /** Whether scaling review is loading */
  reviewLoading?: boolean;
  /** Suggested serving size from meal guest count */
  suggestedServings?: number;
  /** Disable input */
  disabled?: boolean;
}

/**
 * Scaling Input Component
 *
 * Allows adjusting target servings for a recipe in a meal.
 * Shows the scaling multiplier and any Claude review notes.
 */
export function ScalingInput({
  recipeId,
  recipeName,
  originalServings,
  targetServings,
  onTargetChange,
  reviewNotes,
  reviewLoading = false,
  suggestedServings,
  disabled = false,
}: ScalingInputProps) {
  const [localValue, setLocalValue] = useState(targetServings.toString());

  // Sync local value when prop changes
  useEffect(() => {
    setLocalValue(targetServings.toString());
  }, [targetServings]);

  // Calculate multiplier
  const multiplier = targetServings / originalServings;

  // Handle input change with debounce
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalValue(value);

      const parsed = parseInt(value, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 500) {
        onTargetChange(recipeId, parsed);
      }
    },
    [recipeId, onTargetChange]
  );

  // Format multiplier for display
  const formatMultiplier = (mult: number): string => {
    if (mult === 1) return "1x (no change)";
    if (mult < 1) return `${mult.toFixed(2)}x (smaller batch)`;
    if (mult <= 2) return `${mult.toFixed(2)}x`;
    if (mult <= 5) return `${mult.toFixed(1)}x (large batch)`;
    return `${mult.toFixed(1)}x (very large batch)`;
  };

  // Determine if scaling is significant
  const isSignificant = multiplier > 3 || multiplier < 0.5;

  return (
    <Card
      className={cn(
        "transition-colors",
        reviewNotes ? "border-amber-300" : "border-neutral-200"
      )}
    >
      <CardContent className="p-4">
        {/* Recipe name */}
        <h4 className="mb-3 font-display font-semibold text-foreground">
          {recipeName}
        </h4>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Original servings (read-only) */}
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">Original Recipe</Label>
            <div className="flex h-10 items-center gap-2 rounded-lg bg-neutral-100 px-3 text-sm text-neutral-600">
              <Users className="h-4 w-4" />
              <span>{originalServings} servings</span>
            </div>
          </div>

          {/* Target servings (editable) */}
          <div className="space-y-1.5">
            <Label htmlFor={`scaling-${recipeId}`} className="text-xs">
              Target Servings
            </Label>
            <div className="relative">
              <Scale className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                id={`scaling-${recipeId}`}
                type="number"
                min={1}
                max={500}
                value={localValue}
                onChange={handleChange}
                className="pl-10"
                disabled={disabled}
              />
            </div>
            {suggestedServings && suggestedServings !== targetServings && (
              <button
                type="button"
                onClick={() => onTargetChange(recipeId, suggestedServings)}
                className="text-xs text-primary hover:underline"
                disabled={disabled}
              >
                Match guest count ({suggestedServings})
              </button>
            )}
          </div>
        </div>

        {/* Multiplier display */}
        <div
          className={cn(
            "mt-3 flex items-center gap-2 text-sm",
            isSignificant ? "text-amber-600" : "text-neutral-600"
          )}
        >
          {isSignificant && <AlertTriangle className="h-4 w-4" />}
          <span>Scaling: {formatMultiplier(multiplier)}</span>
        </div>

        {/* Claude review notes */}
        {reviewLoading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Reviewing scaling...</span>
          </div>
        )}

        {reviewNotes && !reviewLoading && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Scaling Note</p>
                <p className="mt-1 text-amber-700">{reviewNotes}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ScalingListProps {
  /** Selected recipes with scaling info */
  recipes: Array<{
    id: string;
    name: string;
    originalServings: number;
    targetServings: number;
    reviewNotes?: string;
    reviewLoading?: boolean;
  }>;
  /** Callback when scaling changes */
  onScalingChange: (recipeId: string, targetServings: number) => void;
  /** Suggested servings from guest count */
  suggestedServings?: number;
  /** Disable all inputs */
  disabled?: boolean;
}

/**
 * Scaling List Component
 *
 * Renders scaling inputs for multiple recipes.
 */
export function ScalingList({
  recipes,
  onScalingChange,
  suggestedServings,
  disabled = false,
}: ScalingListProps) {
  if (recipes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-surface-muted p-6 text-center">
        <p className="text-sm text-neutral-600">
          Select recipes above to adjust their portions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recipes.map((recipe) => (
        <ScalingInput
          key={recipe.id}
          recipeId={recipe.id}
          recipeName={recipe.name}
          originalServings={recipe.originalServings}
          targetServings={recipe.targetServings}
          onTargetChange={onScalingChange}
          reviewNotes={recipe.reviewNotes}
          reviewLoading={recipe.reviewLoading}
          suggestedServings={suggestedServings}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
