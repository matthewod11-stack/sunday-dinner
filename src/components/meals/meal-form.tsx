"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Users, Utensils, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";
import {
  MealCreationFormSchema,
  safeParseWithErrors,
} from "@/lib/validation/form-schemas";
import type { Meal } from "@/types";

interface MealFormProps {
  /** Initial values for editing */
  initialData?: {
    name: string;
    serveTime: string;
    guestCount: number;
  };
  /** Form mode */
  mode?: "create" | "edit";
  /** Meal ID for edit mode */
  mealId?: string;
  /** Callback after successful save */
  onSuccess?: (meal: Meal) => void;
}

/**
 * Meal creation/edit form
 *
 * Uses MealCreationFormSchema for validation.
 * Submits to server action for database operations.
 */
export function MealForm({
  initialData,
  mode = "create",
  mealId,
  onSuccess,
}: MealFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [name, setName] = useState(initialData?.name ?? "");
  const [serveTime, setServeTime] = useState(() => {
    if (initialData?.serveTime) {
      // Convert ISO to datetime-local format
      return initialData.serveTime.slice(0, 16);
    }
    // Default to next Sunday at 5 PM
    const today = new Date();
    const daysUntilSunday = (7 - today.getDay()) % 7 || 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    nextSunday.setHours(17, 0, 0, 0);
    return nextSunday.toISOString().slice(0, 16);
  });
  const [guestCount, setGuestCount] = useState(
    initialData?.guestCount?.toString() ?? "20"
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});

      // Validate form data
      const result = safeParseWithErrors(MealCreationFormSchema, {
        name,
        serveTime,
        guestCount,
      });

      if (!result.success) {
        setErrors(result.errors);
        return;
      }

      setIsSubmitting(true);

      try {
        const endpoint =
          mode === "create" ? "/api/meals" : `/api/meals/${mealId}`;
        const method = mode === "create" ? "POST" : "PATCH";

        const response = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: result.data.name,
            serveTime: result.data.serveTime,
            guestCount: result.data.guestCount,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to save meal");
        }

        const meal = await response.json();

        showToast.success(
          mode === "create"
            ? "Meal created! Now add some recipes."
            : "Meal updated successfully."
        );

        if (onSuccess) {
          onSuccess(meal);
        } else {
          router.push(`/meals/${meal.id}`);
        }
      } catch (error) {
        showToast.error(
          error instanceof Error ? error.message : "Failed to save meal"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, serveTime, guestCount, mode, mealId, router, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Meal Name */}
      <div className="space-y-2">
        <Label htmlFor="name" required>
          Meal Name
        </Label>
        <div className="relative">
          <Utensils className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Easter Sunday Dinner"
            className="pl-10"
            error={!!errors.name}
            autoFocus
          />
        </div>
        {errors.name && (
          <p className="flex items-center gap-1 text-sm text-error">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.name}
          </p>
        )}
        <p className="text-xs text-neutral-500">
          Give your gathering a memorable name
        </p>
      </div>

      {/* Serve Time */}
      <div className="space-y-2">
        <Label htmlFor="serveTime" required>
          Serve Time
        </Label>
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            id="serveTime"
            type="datetime-local"
            value={serveTime}
            onChange={(e) => setServeTime(e.target.value)}
            className="pl-10"
            error={!!errors.serveTime}
          />
        </div>
        {errors.serveTime && (
          <p className="flex items-center gap-1 text-sm text-error">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.serveTime}
          </p>
        )}
        <p className="text-xs text-neutral-500">
          When should food be ready to serve? We&apos;ll build your timeline
          backwards from here.
        </p>
      </div>

      {/* Guest Count */}
      <div className="space-y-2">
        <Label htmlFor="guestCount" required>
          Number of Guests
        </Label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            id="guestCount"
            type="number"
            min={1}
            max={100}
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            placeholder="20"
            className="pl-10"
            error={!!errors.guestCount}
          />
        </div>
        {errors.guestCount && (
          <p className="flex items-center gap-1 text-sm text-error">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.guestCount}
          </p>
        )}
        <p className="text-xs text-neutral-500">
          Total guests including yourself. We&apos;ll scale recipes to match.
        </p>
      </div>

      {/* Info Card */}
      <Card variant="muted">
        <CardContent className="p-4">
          <h3 className="mb-2 font-display text-sm font-semibold text-foreground">
            What happens next?
          </h3>
          <ul className="space-y-1.5 text-xs text-neutral-600">
            <li className="flex items-start gap-2">
              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-secondary-light text-xs font-medium text-secondary">
                1
              </span>
              <span>Select recipes from your collection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-secondary-light text-xs font-medium text-secondary">
                2
              </span>
              <span>Adjust portions for your guest count</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-secondary-light text-xs font-medium text-secondary">
                3
              </span>
              <span>Get a step-by-step cooking timeline</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {mode === "create" ? "Create Meal" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
