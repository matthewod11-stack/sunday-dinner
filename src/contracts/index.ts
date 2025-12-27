/**
 * Sunday Dinner Service Contracts
 *
 * These interfaces define the APIs for core services.
 * Implementations are in src/lib/services/.
 *
 * Contracts are read-only for parallel agents:
 * - If you need to modify a contract, document in KNOWN_ISSUES.md
 *   with "COORDINATION NEEDED" tag
 *
 * Service Ownership:
 * - AIService: Foundation (both agents use)
 * - RecipeService: Agent A (Weeks 3-4)
 * - MealService: Agent B (Week 3)
 * - TimelineService: Agent B (Weeks 4-5, 7-9)
 * - ShoppingService: Agent A (Week 5)
 */

// AI Service (foundation for all AI operations)
export type { AIService, ImageMimeType, TimelineGenerationInput } from "./ai-service";

// Recipe Service (Agent A)
export type { RecipeService, ListRecipesOptions } from "./recipe-service";

// Meal Service (Agent B)
export type { MealService, ListMealsOptions, CreateMealInput } from "./meal-service";

// Timeline Service (Agent B)
export type { TimelineService, ValidationResult } from "./timeline-service";

// Shopping Service (Agent A)
export type { ShoppingService, ListItemsOptions } from "./shopping-service";
