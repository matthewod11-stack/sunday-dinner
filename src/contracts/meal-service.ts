import type { Meal, MealSummary, MealStatus, ScalingFactor } from "@/types";

/**
 * Options for listing meals
 */
export interface ListMealsOptions {
  /** Maximum number of meals to return */
  limit?: number;
  /** Number of meals to skip (for pagination) */
  offset?: number;
  /** Filter by status */
  status?: MealStatus;
  /** Only meals after this date */
  afterDate?: string;
  /** Only meals before this date */
  beforeDate?: string;
}

/**
 * Input for creating a new meal
 */
export interface CreateMealInput {
  /** Meal name */
  name: string;
  /** When food should be served (ISO datetime) */
  serveTime: string;
  /** Number of guests */
  guestCount: number;
}

/**
 * MealService: Handles meal planning and recipe scaling
 *
 * Owned by Agent B (Week 3).
 * Depends on: Supabase, AIService (for scaling review)
 *
 * Responsibilities:
 * - Create, read, update, delete meals
 * - Add/remove recipes with scaling
 * - Get Claude's review of scaling concerns
 *
 * @example
 * ```typescript
 * const mealService: MealService = new SupabaseMealService(supabase, aiService);
 *
 * // Create meal
 * const meal = await mealService.create({
 *   name: "Thanksgiving 2025",
 *   serveTime: "2025-11-27T17:00:00Z",
 *   guestCount: 20
 * });
 *
 * // Add recipe with scaling
 * await mealService.addRecipe(meal.id, turkeyRecipeId, 20);
 * // Review notes: "Large turkey needs extra roasting time"
 * ```
 */
export interface MealService {
  /**
   * Create a new meal
   *
   * @param input - Meal name, serve time, guest count
   * @returns Created meal with empty recipes array
   */
  create(input: CreateMealInput): Promise<Meal>;

  /**
   * Get a meal by ID
   *
   * Includes full recipe data with scaling.
   *
   * @param mealId - Meal UUID
   * @returns Meal or null if not found
   */
  get(mealId: string): Promise<Meal | null>;

  /**
   * List meals with optional filtering
   *
   * Returns summaries for efficiency (no full recipe data).
   *
   * @param options - Pagination and filtering options
   * @returns Array of meal summaries
   */
  list(options?: ListMealsOptions): Promise<MealSummary[]>;

  /**
   * Update meal details
   *
   * @param mealId - Meal UUID
   * @param updates - Partial meal data (name, serveTime, guestCount)
   * @returns Updated meal
   *
   * @throws Error if meal not found
   */
  update(
    mealId: string,
    updates: Partial<Pick<Meal, "name" | "serveTime" | "guestCount" | "status">>
  ): Promise<Meal>;

  /**
   * Delete a meal
   *
   * Also deletes associated timelines and shopping lists.
   *
   * @param mealId - Meal UUID
   *
   * @throws Error if meal not found
   */
  delete(mealId: string): Promise<void>;

  /**
   * Add a recipe to the meal with scaling
   *
   * Claude reviews the scaling and returns notes
   * if there are concerns (e.g., yeast doesn't scale linearly).
   *
   * @param mealId - Meal UUID
   * @param recipeId - Recipe UUID to add
   * @param targetServingSize - Desired serving size
   * @returns Updated meal with scaling notes
   *
   * @throws Error if recipe not found or already in meal
   */
  addRecipe(mealId: string, recipeId: string, targetServingSize: number): Promise<Meal>;

  /**
   * Update scaling for a recipe in the meal
   *
   * @param mealId - Meal UUID
   * @param recipeId - Recipe UUID
   * @param targetServingSize - New desired serving size
   * @returns Updated meal with new scaling notes
   */
  updateRecipeScaling(mealId: string, recipeId: string, targetServingSize: number): Promise<Meal>;

  /**
   * Remove a recipe from the meal
   *
   * @param mealId - Meal UUID
   * @param recipeId - Recipe UUID to remove
   * @returns Updated meal
   *
   * @throws Error if recipe not in meal
   */
  removeRecipe(mealId: string, recipeId: string): Promise<Meal>;

  /**
   * Get scaling factor for a recipe in a meal
   *
   * @param mealId - Meal UUID
   * @param recipeId - Recipe UUID
   * @returns Scaling factor or null if recipe not in meal
   */
  getScaling(mealId: string, recipeId: string): Promise<ScalingFactor | null>;
}
