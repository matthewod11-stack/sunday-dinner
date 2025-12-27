import { z } from "zod";
import type { Recipe } from "./recipe";

/**
 * Guest count for a meal
 *
 * For v1, we only track total. Dietary restrictions
 * are planned for v2 multi-user support.
 */
export interface GuestCount {
  /** Total number of guests */
  total: number;
  /** Dietary restrictions (v2 feature, included for future compatibility) */
  dietary?: string[];
}

/**
 * How a recipe scales for a specific meal
 *
 * Each recipe in a meal can have a different scaling factor.
 * Claude reviews scaling and flags concerns (e.g., yeast doesn't scale linearly).
 */
export interface ScalingFactor {
  /** Reference to the recipe being scaled */
  recipeId: string;
  /** Original recipe serving size */
  originalServingSize: number;
  /** Target serving size for this meal */
  targetServingSize: number;
  /** Calculated multiplier: target / original */
  multiplier: number;
  /** Claude's review notes: "Doubling yeast — consider 1.5x instead" */
  claudeReviewNotes?: string;
  /** When scaling was reviewed by Claude */
  reviewedAt?: string;
}

/**
 * Recipe with its scaling factor for a meal
 */
export interface RecipeWithScaling {
  /** The recipe data */
  recipe: Recipe;
  /** Scaling configuration for this meal */
  scaling: ScalingFactor;
}

/**
 * Meal planning status
 */
export type MealStatus =
  | "planning" // Still setting up recipes/guests
  | "timeline_generated" // Timeline has been created
  | "shopping_ready" // Shopping list generated
  | "cooking" // Live execution in progress
  | "complete"; // Meal finished

/**
 * Main meal planning data model
 *
 * A meal represents a single cooking event (e.g., "Holiday Dinner")
 * with multiple recipes scaled for the guest count.
 */
export interface Meal {
  /** Unique identifier (UUID from Supabase) */
  id?: string;
  /** Meal name, e.g., "Thanksgiving 2025" */
  name: string;

  /** When food should be served (ISO 8601 datetime) */
  serveTime: string;
  /** Guest information */
  guestCount: GuestCount;

  /** Recipes included in this meal with their scaling */
  recipes: RecipeWithScaling[];

  /** Current planning/execution status */
  status: MealStatus;

  /** Database timestamps */
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Lightweight meal reference (for lists, pickers)
 */
export interface MealSummary {
  id: string;
  name: string;
  serveTime: string;
  guestCount: number;
  recipeCount: number;
  status: MealStatus;
}

// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================

export const GuestCountSchema = z.object({
  total: z.number().int().positive(),
  dietary: z.array(z.string()).optional(),
});

export const ScalingFactorSchema = z.object({
  recipeId: z.string().uuid(),
  originalServingSize: z.number().int().positive(),
  targetServingSize: z.number().int().positive(),
  multiplier: z.number().positive(),
  claudeReviewNotes: z.string().optional(),
  reviewedAt: z.string().datetime().optional(),
});

export const MealStatusSchema = z.enum([
  "planning",
  "timeline_generated",
  "shopping_ready",
  "cooking",
  "complete",
]);

export const MealSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  serveTime: z.string().datetime(),
  guestCount: GuestCountSchema,
  recipes: z.array(
    z.object({
      recipe: z.any(), // RecipeSchema imported separately to avoid circular deps
      scaling: ScalingFactorSchema,
    })
  ),
  status: MealStatusSchema,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const MealSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  serveTime: z.string().datetime(),
  guestCount: z.number().int().positive(),
  recipeCount: z.number().int().nonnegative(),
  status: MealStatusSchema,
});

// Type inference from schemas
export type GuestCountInput = z.infer<typeof GuestCountSchema>;
export type ScalingFactorInput = z.infer<typeof ScalingFactorSchema>;
export type MealInput = z.infer<typeof MealSchema>;
export type MealSummaryInput = z.infer<typeof MealSummarySchema>;
