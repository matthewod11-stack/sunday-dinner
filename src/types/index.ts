/**
 * Sunday Dinner Type Definitions
 *
 * Core data models for the application:
 * - Recipe: Ingredient, Instruction, Recipe, ExtractionResult
 * - Meal: GuestCount, ScalingFactor, Meal, RecipeWithScaling
 * - Timeline: Task, Timeline, TimelineConflict, RecalculationSuggestion
 * - Shopping: ShoppingItem, ShoppingList, UnreconcilableItem
 */

// Recipe types
export type {
  Ingredient,
  Instruction,
  Recipe,
  RecipeSourceType,
  RecipeCategory,
  ExtractionResult,
  IngredientInput,
  InstructionInput,
  RecipeInput,
  ExtractionResultInput,
} from "./recipe";

export {
  IngredientSchema,
  InstructionSchema,
  RecipeSchema,
  RecipeSourceTypeSchema,
  RecipeCategorySchema,
  ExtractionResultSchema,
} from "./recipe";

// Meal types
export type {
  GuestCount,
  ScalingFactor,
  RecipeWithScaling,
  MealStatus,
  Meal,
  MealSummary,
  GuestCountInput,
  ScalingFactorInput,
  MealInput,
  MealSummaryInput,
} from "./meal";

export {
  GuestCountSchema,
  ScalingFactorSchema,
  MealStatusSchema,
  MealSchema,
  MealSummarySchema,
} from "./meal";

// Timeline types
export type {
  TaskStatus,
  ConflictType,
  ConflictSeverity,
  Task,
  TimelineConflict,
  Timeline,
  RecalculationSuggestion,
  TaskInput,
  TimelineConflictInput,
  TimelineInput,
  RecalculationSuggestionInput,
} from "./timeline";

export {
  TaskStatusSchema,
  ConflictTypeSchema,
  ConflictSeveritySchema,
  TaskSchema,
  TimelineConflictSchema,
  TimelineSchema,
  RecalculationSuggestionSchema,
} from "./timeline";

// Shopping types
export type {
  StoreSection,
  UnreconcilableReason,
  ShoppingItem,
  UnreconcilableItem,
  ShoppingList,
  ShoppingItemInput,
  UnreconcilableItemInput,
  ShoppingListInput,
} from "./shopping";

export {
  StoreSectionSchema,
  UnreconcilableReasonSchema,
  ShoppingItemSchema,
  UnreconcilableItemSchema,
  ShoppingListSchema,
  STANDARD_UNITS,
  UNIT_CONVERSIONS,
} from "./shopping";

// Share types
export type {
  ShareToken,
  ShareLinkResult,
  ShareMealData,
  TokenValidationResult,
  ShareTokenInput,
  ShareLinkResultInput,
  ShareMealDataInput,
  TokenValidationResultInput,
} from "./share";

export {
  ShareTokenSchema,
  ShareLinkResultSchema,
  ShareMealDataSchema,
  TokenValidationResultSchema,
} from "./share";
