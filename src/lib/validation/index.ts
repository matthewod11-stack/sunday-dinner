/**
 * Form validation exports
 *
 * Barrel export for all validation schemas and utilities.
 */

// Form schemas
export {
  RecipeIngredientFormSchema,
  RecipeInstructionFormSchema,
  RecipeManualEntryFormSchema,
  MealCreationFormSchema,
  RecipeScalingFormSchema,
  formatValidationErrors,
  safeParseWithErrors,
} from "./form-schemas";

// Type exports
export type {
  RecipeManualEntryFormInput,
  RecipeManualEntryFormOutput,
  MealCreationFormInput,
  MealCreationFormOutput,
  RecipeScalingFormInput,
  RecipeScalingFormOutput,
} from "./form-schemas";

// Parser utilities (may be useful for custom validation)
export {
  parseFraction,
  parsePositiveInt,
  parseNonNegativeInt,
  normalizeString,
  emptyToNull,
  parseDateTime,
} from "./parsers";
