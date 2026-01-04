"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UncertainField } from "./uncertain-field";
import { IngredientEditor } from "./ingredient-editor";
import { InstructionEditor } from "./instruction-editor";
import type { Ingredient, Instruction } from "@/types";

export interface RecipeFormData {
  name: string;
  description: string;
  servingSize: number;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  ingredients: Ingredient[];
  instructions: Instruction[];
  notes: string;
}

export interface RecipeFormProps {
  /** Initial form data */
  initialData: Partial<RecipeFormData>;
  /** Fields that need review */
  uncertainFields: string[];
  /** Callback when form data changes */
  onChange: (data: RecipeFormData) => void;
  /** Disable form editing */
  disabled?: boolean;
}

/**
 * RecipeForm - Editable form for recipe data
 *
 * Used in both correction UI and manual entry.
 * Highlights uncertain fields from extraction.
 */
export function RecipeForm({
  initialData,
  uncertainFields,
  onChange,
  disabled = false,
}: RecipeFormProps) {
  // Form state
  const [name, setName] = React.useState(initialData.name ?? "");
  const [description, setDescription] = React.useState(
    initialData.description ?? ""
  );
  const [servingSize, setServingSize] = React.useState(
    initialData.servingSize ?? 4
  );
  const [prepTimeMinutes, setPrepTimeMinutes] = React.useState<number | null>(
    initialData.prepTimeMinutes ?? null
  );
  const [cookTimeMinutes, setCookTimeMinutes] = React.useState<number | null>(
    initialData.cookTimeMinutes ?? null
  );
  const [ingredients, setIngredients] = React.useState<Ingredient[]>(
    initialData.ingredients ?? []
  );
  const [instructions, setInstructions] = React.useState<Instruction[]>(
    initialData.instructions ?? []
  );
  const [notes, setNotes] = React.useState(initialData.notes ?? "");

  // Notify parent of changes
  React.useEffect(() => {
    onChange({
      name,
      description,
      servingSize,
      prepTimeMinutes,
      cookTimeMinutes,
      ingredients,
      instructions,
      notes,
    });
  }, [
    name,
    description,
    servingSize,
    prepTimeMinutes,
    cookTimeMinutes,
    ingredients,
    instructions,
    notes,
    onChange,
  ]);

  return (
    <div className="space-y-6">
      {/* Basic Info Section */}
      <section className="space-y-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Basic Info
        </h3>

        {/* Recipe Name */}
        <UncertainField fieldName="name" uncertainFields={uncertainFields}>
          <div>
            <Label htmlFor="recipe-name">Recipe Name *</Label>
            <Input
              id="recipe-name"
              type="text"
              placeholder="e.g., Grandma's Apple Pie"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={disabled}
              required
            />
          </div>
        </UncertainField>

        {/* Description */}
        <div>
          <Label htmlFor="recipe-description">Description</Label>
          <textarea
            id="recipe-description"
            placeholder="Brief description of this recipe..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={disabled}
            className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={2}
          />
        </div>

        {/* Serving Size and Times */}
        <div className="grid gap-4 sm:grid-cols-3">
          <UncertainField
            fieldName="servingSize"
            uncertainFields={uncertainFields}
          >
            <div>
              <Label htmlFor="serving-size">Servings *</Label>
              <Input
                id="serving-size"
                type="number"
                placeholder="4"
                value={servingSize}
                onChange={(e) =>
                  setServingSize(Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                disabled={disabled}
                min="1"
                required
              />
            </div>
          </UncertainField>

          <UncertainField
            fieldName="prepTimeMinutes"
            uncertainFields={uncertainFields}
          >
            <div>
              <Label htmlFor="prep-time">Prep Time (min)</Label>
              <Input
                id="prep-time"
                type="number"
                placeholder="30"
                value={prepTimeMinutes ?? ""}
                onChange={(e) =>
                  setPrepTimeMinutes(
                    e.target.value ? parseInt(e.target.value, 10) : null
                  )
                }
                disabled={disabled}
                min="0"
              />
            </div>
          </UncertainField>

          <UncertainField
            fieldName="cookTimeMinutes"
            uncertainFields={uncertainFields}
          >
            <div>
              <Label htmlFor="cook-time">Cook Time (min)</Label>
              <Input
                id="cook-time"
                type="number"
                placeholder="60"
                value={cookTimeMinutes ?? ""}
                onChange={(e) =>
                  setCookTimeMinutes(
                    e.target.value ? parseInt(e.target.value, 10) : null
                  )
                }
                disabled={disabled}
                min="0"
              />
            </div>
          </UncertainField>
        </div>
      </section>

      {/* Ingredients Section */}
      <section className="space-y-4">
        <UncertainField
          fieldName="ingredients"
          uncertainFields={uncertainFields}
          className="p-4"
        >
          <IngredientEditor
            ingredients={ingredients}
            onChange={setIngredients}
            disabled={disabled}
          />
        </UncertainField>
      </section>

      {/* Instructions Section */}
      <section className="space-y-4">
        <UncertainField
          fieldName="instructions"
          uncertainFields={uncertainFields}
          className="p-4"
        >
          <InstructionEditor
            instructions={instructions}
            onChange={setInstructions}
            disabled={disabled}
          />
        </UncertainField>
      </section>

      {/* Notes Section */}
      <section className="space-y-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Notes
        </h3>
        <textarea
          placeholder="Any additional notes, tips, or variations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={disabled}
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          rows={3}
        />
      </section>
    </div>
  );
}
