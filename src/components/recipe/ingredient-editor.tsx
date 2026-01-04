"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Ingredient } from "@/types";

export interface IngredientEditorProps {
  /** Current list of ingredients */
  ingredients: Ingredient[];
  /** Callback when ingredients change */
  onChange: (ingredients: Ingredient[]) => void;
  /** Disable editing */
  disabled?: boolean;
}

/**
 * IngredientEditor - Editable list of recipe ingredients
 *
 * Features:
 * - Add/remove ingredients
 * - Edit quantity, unit, name, notes
 * - Nullable quantity for "to taste" items
 */
export function IngredientEditor({
  ingredients,
  onChange,
  disabled = false,
}: IngredientEditorProps) {
  /**
   * Update a single ingredient
   */
  const updateIngredient = React.useCallback(
    (index: number, updates: Partial<Ingredient>) => {
      const updated = [...ingredients];
      const current = updated[index];
      if (current) {
        updated[index] = { ...current, ...updates };
        onChange(updated);
      }
    },
    [ingredients, onChange]
  );

  /**
   * Remove an ingredient
   */
  const removeIngredient = React.useCallback(
    (index: number) => {
      const updated = ingredients.filter((_, i) => i !== index);
      onChange(updated);
    },
    [ingredients, onChange]
  );

  /**
   * Add a new blank ingredient
   */
  const addIngredient = React.useCallback(() => {
    onChange([
      ...ingredients,
      {
        name: "",
        quantity: null,
        unit: null,
      },
    ]);
  }, [ingredients, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Ingredients</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addIngredient}
          disabled={disabled}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {ingredients.length === 0 ? (
        <p className="py-4 text-center text-sm text-neutral-500">
          No ingredients yet. Click &quot;Add&quot; to add one.
        </p>
      ) : (
        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div
              key={ingredient.id ?? index}
              className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-white p-3"
            >
              {/* Quantity */}
              <div className="w-20">
                <Label className="sr-only">Quantity</Label>
                <Input
                  type="number"
                  placeholder="Qty"
                  value={ingredient.quantity ?? ""}
                  onChange={(e) =>
                    updateIngredient(index, {
                      quantity: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  disabled={disabled}
                  className="text-center"
                  step="0.25"
                  min="0"
                />
              </div>

              {/* Unit */}
              <div className="w-24">
                <Label className="sr-only">Unit</Label>
                <Input
                  type="text"
                  placeholder="unit"
                  value={ingredient.unit ?? ""}
                  onChange={(e) =>
                    updateIngredient(index, {
                      unit: e.target.value || null,
                    })
                  }
                  disabled={disabled}
                />
              </div>

              {/* Name */}
              <div className="flex-1">
                <Label className="sr-only">Ingredient name</Label>
                <Input
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) =>
                    updateIngredient(index, { name: e.target.value })
                  }
                  disabled={disabled}
                />
              </div>

              {/* Notes (on larger screens) */}
              <div className="hidden w-32 sm:block">
                <Label className="sr-only">Notes</Label>
                <Input
                  type="text"
                  placeholder="notes"
                  value={ingredient.notes ?? ""}
                  onChange={(e) =>
                    updateIngredient(index, { notes: e.target.value || undefined })
                  }
                  disabled={disabled}
                />
              </div>

              {/* Delete */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeIngredient(index)}
                disabled={disabled}
                className="shrink-0 text-neutral-400 hover:text-error"
                aria-label="Remove ingredient"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
