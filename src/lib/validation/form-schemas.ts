/**
 * Form validation schemas for Sunday Dinner
 *
 * These schemas handle USER INPUT (strings, form fields) and transform
 * them into validated domain types. Separate from domain schemas in
 * src/types/ which validate already-parsed data structures.
 *
 * Key differences:
 * - Accept string inputs for numbers (user types "42" not 42)
 * - Parse fractions for ingredient quantities ("1/2")
 * - Provide user-friendly error messages
 * - Transform to proper types via .transform()
 */

import { z } from "zod";
import {
  parseFraction,
  parsePositiveInt,
  parseNonNegativeInt,
  normalizeString,
  parseDateTime,
} from "./parsers";

// ============================================================================
// Recipe Manual Entry Form
// ============================================================================

/**
 * Schema for a single ingredient in the recipe form
 *
 * Accepts string inputs and transforms to proper types.
 * Quantity supports fractions ("1/2", "1 1/2") and "to taste" (empty → null).
 */
export const RecipeIngredientFormSchema = z.object({
  /** Ingredient quantity as string (supports fractions, decimals, or empty) */
  quantity: z
    .string()
    .transform((val) => parseFraction(val))
    .pipe(z.number().positive().nullable())
    .describe("Quantity (e.g., '1.5', '1/2', or leave empty for 'to taste')"),

  /** Unit of measurement (optional) */
  unit: z
    .string()
    .transform((val) => normalizeString(val) || null)
    .pipe(z.string().max(50).nullable())
    .describe("Unit (e.g., 'cups', 'tbsp', 'lb')"),

  /** The ingredient name */
  item: z
    .string()
    .min(1, "Ingredient name is required")
    .max(200, "Ingredient name must be 200 characters or less")
    .transform((val) => val.trim()),

  /** Preparation notes (optional) */
  notes: z
    .string()
    .max(200, "Notes must be 200 characters or less")
    .transform((val) => normalizeString(val))
    .optional(),
});

/**
 * Schema for a single instruction step in the recipe form
 */
export const RecipeInstructionFormSchema = z.object({
  /** The step description */
  text: z
    .string()
    .min(1, "Instruction text is required")
    .max(1000, "Instruction must be 1000 characters or less")
    .transform((val) => val.trim()),

  /** Duration for timer-able steps (optional, as string input) */
  durationMinutes: z
    .string()
    .transform((val) => parseNonNegativeInt(val))
    .pipe(z.number().int().nonnegative().nullable())
    .optional()
    .describe("Duration in minutes (optional, for timer steps)"),
});

/**
 * Main recipe manual entry form schema
 *
 * INPUT: Form data with string values
 * OUTPUT: Validated recipe data ready for storage
 *
 * @example
 * const formData = {
 *   title: "Chocolate Chip Cookies",
 *   servings: "24",
 *   prepTimeMinutes: "15",
 *   cookTimeMinutes: "12",
 *   ingredients: [
 *     { quantity: "2", unit: "cups", item: "flour", notes: "sifted" },
 *     { quantity: "1/2", unit: "cup", item: "butter", notes: "" }
 *   ],
 *   instructions: [
 *     { text: "Preheat oven to 350°F", durationMinutes: "" },
 *     { text: "Mix dry ingredients", durationMinutes: "5" }
 *   ]
 * };
 *
 * const validated = RecipeManualEntryFormSchema.parse(formData);
 * // validated.servings is now number 24
 * // validated.ingredients[1].quantity is now number 0.5
 */
export const RecipeManualEntryFormSchema = z
  .object({
    /** Recipe title */
    title: z
      .string()
      .min(1, "Recipe title is required")
      .max(100, "Recipe title must be 100 characters or less")
      .transform((val) => val.trim()),

    /** Recipe description (optional) */
    description: z
      .string()
      .max(500, "Description must be 500 characters or less")
      .transform((val) => normalizeString(val))
      .optional(),

    /** Number of servings (as string input) */
    servings: z
      .string()
      .min(1, "Number of servings is required")
      .transform((val) => parsePositiveInt(val))
      .pipe(
        z
          .number()
          .int()
          .positive("Please enter a valid number of servings (1 or more)")
          .refine((val) => val !== null, {
            message: "Please enter a valid whole number for servings",
          })
      ),

    /** Prep time in minutes (optional, as string) */
    prepTimeMinutes: z
      .string()
      .transform((val) => parseNonNegativeInt(val))
      .pipe(z.number().int().nonnegative().nullable())
      .optional()
      .describe("Prep time in minutes"),

    /** Cook time in minutes (optional, as string) */
    cookTimeMinutes: z
      .string()
      .transform((val) => parseNonNegativeInt(val))
      .pipe(z.number().int().nonnegative().nullable())
      .optional()
      .describe("Cook time in minutes"),

    /** List of ingredients (at least one required) */
    ingredients: z
      .array(RecipeIngredientFormSchema)
      .min(1, "At least one ingredient is required")
      .max(100, "Maximum 100 ingredients allowed"),

    /** List of instructions (at least one required) */
    instructions: z
      .array(RecipeInstructionFormSchema)
      .min(1, "At least one instruction step is required")
      .max(100, "Maximum 100 instruction steps allowed"),

    /** General recipe notes (optional) */
    notes: z
      .string()
      .max(2000, "Notes must be 2000 characters or less")
      .transform((val) => normalizeString(val))
      .optional(),
  })
  .strict();

/**
 * Input type: what the form provides
 */
export type RecipeManualEntryFormInput = {
  title: string;
  description?: string;
  servings: string;
  prepTimeMinutes?: string;
  cookTimeMinutes?: string;
  ingredients: Array<{
    quantity: string;
    unit: string;
    item: string;
    notes?: string;
  }>;
  instructions: Array<{
    text: string;
    durationMinutes?: string;
  }>;
  notes?: string;
};

/**
 * Output type: validated and transformed data
 */
export type RecipeManualEntryFormOutput = z.infer<
  typeof RecipeManualEntryFormSchema
>;

// ============================================================================
// Meal Creation Form
// ============================================================================

/**
 * Meal creation form schema
 *
 * INPUT: Form data with string datetime and guest count
 * OUTPUT: Validated meal metadata
 *
 * @example
 * const formData = {
 *   name: "Easter Dinner 2024",
 *   serveTime: "2024-04-20T18:00:00",
 *   guestCount: "24"
 * };
 *
 * const validated = MealCreationFormSchema.parse(formData);
 * // validated.guestCount is now number 24
 * // validated.serveTime is validated ISO string
 */
export const MealCreationFormSchema = z
  .object({
    /** Meal name */
    name: z
      .string()
      .min(1, "Meal name is required")
      .max(100, "Meal name must be 100 characters or less")
      .transform((val) => val.trim()),

    /** When food should be served (datetime picker input) */
    serveTime: z
      .string()
      .min(1, "Serve time is required")
      .transform((val) => {
        try {
          return parseDateTime(val);
        } catch {
          throw new Error("Please enter a valid date and time");
        }
      })
      .pipe(z.string().datetime())
      .refine(
        (val) => {
          // Must be in the future (allow up to 5 minutes in the past for form submission delays)
          const date = new Date(val);
          const now = new Date();
          const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
          return date >= fiveMinutesAgo;
        },
        {
          message: "Serve time must be in the future",
        }
      ),

    /** Number of guests (as string input) */
    guestCount: z
      .string()
      .min(1, "Number of guests is required")
      .transform((val) => parsePositiveInt(val))
      .pipe(
        z
          .number()
          .int()
          .positive("Please enter a valid number of guests (1 or more)")
          .min(1, "At least 1 guest is required")
          .max(100, "Maximum 100 guests allowed")
          .refine((val) => val !== null, {
            message: "Please enter a valid whole number for guest count",
          })
      ),
  })
  .strict();

/**
 * Input type for meal creation form
 */
export type MealCreationFormInput = {
  name: string;
  serveTime: string;
  guestCount: string;
};

/**
 * Output type: validated meal creation data
 */
export type MealCreationFormOutput = z.infer<typeof MealCreationFormSchema>;

// ============================================================================
// Recipe Scaling Form
// ============================================================================

/**
 * Recipe scaling form schema
 *
 * Supports two input modes:
 * 1. Direct scaling factor (e.g., "2.5" for 2.5x)
 * 2. Target servings (automatically calculates factor)
 *
 * At least one must be provided. If both provided, scalingFactor takes precedence.
 *
 * @example
 * // Mode 1: Direct scaling factor
 * const formData1 = { scalingFactor: "2.5" };
 * const validated1 = RecipeScalingFormSchema.parse(formData1);
 * // validated1.scalingFactor = 2.5
 *
 * // Mode 2: Target servings (requires originalServings context)
 * const formData2 = { targetServings: "12", originalServings: "4" };
 * const validated2 = RecipeScalingFormSchema.parse(formData2);
 * // validated2.scalingFactor = 3 (calculated: 12 / 4)
 */
export const RecipeScalingFormSchema = z
  .object({
    /** Direct scaling factor (e.g., "2.5" for 2.5x recipe) */
    scalingFactor: z
      .string()
      .transform((val) => {
        if (!val || val.trim() === "") return null;
        const parsed = parseFraction(val);
        return parsed;
      })
      .pipe(z.number().positive().nullable())
      .optional(),

    /** Target number of servings (alternative to scalingFactor) */
    targetServings: z
      .string()
      .transform((val) => parsePositiveInt(val))
      .pipe(z.number().int().positive().nullable())
      .optional(),

    /** Original recipe servings (required when using targetServings) */
    originalServings: z
      .string()
      .transform((val) => parsePositiveInt(val))
      .pipe(z.number().int().positive().nullable())
      .optional(),
  })
  .strict()
  .refine(
    (data) => {
      // At least one scaling method must be provided
      return (
        (data.scalingFactor !== null && data.scalingFactor !== undefined) ||
        (data.targetServings !== null && data.targetServings !== undefined)
      );
    },
    {
      message:
        "Please provide either a scaling factor or target number of servings",
      path: ["scalingFactor"],
    }
  )
  .refine(
    (data) => {
      // If targetServings provided, originalServings is required
      if (
        data.targetServings !== null &&
        data.targetServings !== undefined &&
        data.targetServings > 0
      ) {
        return (
          data.originalServings !== null &&
          data.originalServings !== undefined &&
          data.originalServings > 0
        );
      }
      return true;
    },
    {
      message:
        "Original serving size is required when specifying target servings",
      path: ["originalServings"],
    }
  )
  .transform((data) => {
    // Calculate scaling factor if using targetServings mode
    if (data.scalingFactor && data.scalingFactor > 0) {
      // Direct scaling factor provided - use it
      return {
        scalingFactor: data.scalingFactor,
        targetServings: data.targetServings || null,
        originalServings: data.originalServings || null,
      };
    } else if (
      data.targetServings &&
      data.originalServings &&
      data.targetServings > 0 &&
      data.originalServings > 0
    ) {
      // Calculate scaling factor from target servings
      return {
        scalingFactor: data.targetServings / data.originalServings,
        targetServings: data.targetServings,
        originalServings: data.originalServings,
      };
    }

    // Should never reach here due to refinements, but TypeScript needs it
    throw new Error("Invalid scaling configuration");
  });

/**
 * Input type for scaling form
 */
export type RecipeScalingFormInput = {
  scalingFactor?: string;
  targetServings?: string;
  originalServings?: string;
};

/**
 * Output type: validated scaling data with calculated factor
 */
export type RecipeScalingFormOutput = z.infer<typeof RecipeScalingFormSchema>;

// ============================================================================
// Common Validation Utilities
// ============================================================================

/**
 * Format Zod errors into user-friendly messages
 *
 * @param error - Zod validation error
 * @returns Object mapping field paths to error messages
 *
 * @example
 * try {
 *   RecipeManualEntryFormSchema.parse(formData);
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     const errors = formatValidationErrors(error);
 *     // { "title": "Recipe title is required", "servings": "Please enter a valid number" }
 *   }
 * }
 */
export function formatValidationErrors(
  error: z.ZodError
): Record<string, string> {
  const formatted: Record<string, string> = {};

  error.issues.forEach((err) => {
    const path = err.path.join(".");
    if (!formatted[path]) {
      // Use the first error for each field
      formatted[path] = err.message;
    }
  });

  return formatted;
}

/**
 * Safe parse with formatted errors
 *
 * Returns either validated data or error messages object.
 *
 * @param schema - Zod schema to validate against
 * @param data - Input data to validate
 * @returns Success with data or failure with errors
 *
 * @example
 * const result = safeParseWithErrors(RecipeManualEntryFormSchema, formData);
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.log(result.errors); // { field: "error message" }
 * }
 */
export function safeParseWithErrors<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
):
  | { success: true; data: z.infer<T> }
  | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: formatValidationErrors(result.error),
  };
}
