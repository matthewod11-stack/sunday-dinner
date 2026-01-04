import type { SupabaseClient } from "@supabase/supabase-js";
import type { AIService } from "@/contracts/ai-service";
import type {
  MealService,
  CreateMealInput,
  ListMealsOptions,
} from "@/contracts/meal-service";
import type {
  Meal,
  MealSummary,
  MealStatus,
  GuestCount,
  ScalingFactor,
  RecipeWithScaling,
  Recipe,
} from "@/types";

/**
 * Row shape from Supabase meals table
 */
interface MealRow {
  id: string;
  name: string;
  serve_time: string;
  guest_count: { total: number; dietary?: string[] };
  status: MealStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Row shape from Supabase meal_recipes junction table
 */
interface MealRecipeRow {
  id: string;
  meal_id: string;
  recipe_id: string;
  original_serving_size: number;
  target_serving_size: number;
  multiplier: number;
  claude_review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

/**
 * Recipe row shape from Supabase
 */
interface RecipeRow {
  id: string;
  name: string;
  description: string | null;
  source_type: "photo" | "url" | "pdf" | "manual" | null;
  source: string | null;
  source_image_url: string | null;
  serving_size: number;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  ingredients: Recipe["ingredients"];
  instructions: Recipe["instructions"];
  notes: string | null;
  uncertain_fields: string[] | null;
  extraction_confidence: Record<string, number> | null;
  created_at: string;
  updated_at: string;
}

/**
 * SupabaseMealService: MealService implementation using Supabase
 *
 * Handles meal CRUD operations and recipe scaling with Claude review.
 *
 * @example
 * ```typescript
 * const mealService = new SupabaseMealService(supabase, aiService);
 * const meal = await mealService.create({
 *   name: "Thanksgiving 2025",
 *   serveTime: "2025-11-27T17:00:00Z",
 *   guestCount: 20
 * });
 * ```
 */
export class SupabaseMealService implements MealService {
  constructor(
    private supabase: SupabaseClient,
    private aiService: AIService
  ) {}

  /**
   * Create a new meal
   */
  async create(input: CreateMealInput): Promise<Meal> {
    const guestCount: GuestCount = { total: input.guestCount };

    const { data, error } = await this.supabase
      .from("meals")
      .insert({
        name: input.name,
        serve_time: input.serveTime,
        guest_count: guestCount,
        status: "planning" as MealStatus,
      })
      .select()
      .single<MealRow>();

    if (error) {
      throw new Error(`Failed to create meal: ${error.message}`);
    }
    if (!data) {
      throw new Error("No data returned from meal creation");
    }

    return this.transformMealRow(data, []);
  }

  /**
   * Get a meal by ID with all recipes and scaling
   */
  async get(mealId: string): Promise<Meal | null> {
    // Fetch meal
    const { data: mealData, error: mealError } = await this.supabase
      .from("meals")
      .select("*")
      .eq("id", mealId)
      .single<MealRow>();

    if (mealError) {
      if (mealError.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Failed to fetch meal: ${mealError.message}`);
    }
    if (!mealData) {
      return null;
    }

    // Fetch meal_recipes with recipe data
    const recipesWithScaling = await this.fetchMealRecipes(mealId);

    return this.transformMealRow(mealData, recipesWithScaling);
  }

  /**
   * List meals with optional filtering
   */
  async list(options?: ListMealsOptions): Promise<MealSummary[]> {
    let query = this.supabase
      .from("meals")
      .select("id, name, serve_time, guest_count, status, created_at")
      .order("serve_time", { ascending: true });

    if (options?.status) {
      query = query.eq("status", options.status);
    }
    if (options?.afterDate) {
      query = query.gte("serve_time", options.afterDate);
    }
    if (options?.beforeDate) {
      query = query.lte("serve_time", options.beforeDate);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit ?? 20) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list meals: ${error.message}`);
    }

    // Get recipe counts for each meal
    const mealIds = (data ?? []).map((m) => m.id as string);
    const recipeCounts = await this.getRecipeCounts(mealIds);

    return (data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      serveTime: row.serve_time as string,
      guestCount: (row.guest_count as GuestCount).total,
      recipeCount: recipeCounts.get(row.id as string) ?? 0,
      status: row.status as MealStatus,
    }));
  }

  /**
   * Update meal details
   */
  async update(
    mealId: string,
    updates: Partial<Pick<Meal, "name" | "serveTime" | "guestCount" | "status">>
  ): Promise<Meal> {
    const updateData: Record<string, unknown> = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.serveTime !== undefined) {
      updateData.serve_time = updates.serveTime;
    }
    if (updates.guestCount !== undefined) {
      updateData.guest_count = updates.guestCount;
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    const { data, error } = await this.supabase
      .from("meals")
      .update(updateData)
      .eq("id", mealId)
      .select()
      .single<MealRow>();

    if (error) {
      throw new Error(`Failed to update meal: ${error.message}`);
    }
    if (!data) {
      throw new Error("Meal not found");
    }

    const recipesWithScaling = await this.fetchMealRecipes(mealId);
    return this.transformMealRow(data, recipesWithScaling);
  }

  /**
   * Delete a meal
   */
  async delete(mealId: string): Promise<void> {
    const { error } = await this.supabase
      .from("meals")
      .delete()
      .eq("id", mealId);

    if (error) {
      throw new Error(`Failed to delete meal: ${error.message}`);
    }
  }

  /**
   * Add a recipe to the meal with scaling
   *
   * Claude reviews the scaling and returns notes if there are concerns.
   */
  async addRecipe(
    mealId: string,
    recipeId: string,
    targetServingSize: number
  ): Promise<Meal> {
    // Fetch the recipe to get original serving size
    const { data: recipeData, error: recipeError } = await this.supabase
      .from("recipes")
      .select("*")
      .eq("id", recipeId)
      .single<RecipeRow>();

    if (recipeError) {
      throw new Error(`Recipe not found: ${recipeError.message}`);
    }

    const originalServingSize = recipeData.serving_size;
    const multiplier = targetServingSize / originalServingSize;

    // Create scaling factor for review
    const scalingFactor: ScalingFactor = {
      recipeId,
      originalServingSize,
      targetServingSize,
      multiplier,
    };

    // Get Claude's scaling review
    const recipe = this.transformRecipeRow(recipeData);
    let claudeReviewNotes: string | null = null;
    let reviewedAt: string | null = null;

    try {
      const review = await this.aiService.reviewScaling(recipe, scalingFactor);
      if (review && review.trim().length > 0) {
        claudeReviewNotes = review;
        reviewedAt = new Date().toISOString();
      }
    } catch (e) {
      // Scaling review is non-critical, log and continue
      console.warn("Scaling review failed:", e);
    }

    // Insert into meal_recipes
    const { error: insertError } = await this.supabase
      .from("meal_recipes")
      .insert({
        meal_id: mealId,
        recipe_id: recipeId,
        original_serving_size: originalServingSize,
        target_serving_size: targetServingSize,
        multiplier,
        claude_review_notes: claudeReviewNotes,
        reviewed_at: reviewedAt,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        throw new Error("Recipe already added to this meal");
      }
      throw new Error(`Failed to add recipe: ${insertError.message}`);
    }

    // Return updated meal
    const meal = await this.get(mealId);
    if (!meal) {
      throw new Error("Meal not found after adding recipe");
    }
    return meal;
  }

  /**
   * Update scaling for a recipe in the meal
   */
  async updateRecipeScaling(
    mealId: string,
    recipeId: string,
    targetServingSize: number
  ): Promise<Meal> {
    // Get the meal_recipes row first
    const { data: existingData, error: fetchError } = await this.supabase
      .from("meal_recipes")
      .select("original_serving_size")
      .eq("meal_id", mealId)
      .eq("recipe_id", recipeId)
      .single<{ original_serving_size: number }>();

    if (fetchError || !existingData) {
      throw new Error("Recipe not found in meal");
    }

    const multiplier = targetServingSize / existingData.original_serving_size;

    // Get recipe for scaling review
    const { data: recipeData } = await this.supabase
      .from("recipes")
      .select("*")
      .eq("id", recipeId)
      .single<RecipeRow>();

    let claudeReviewNotes: string | null = null;
    let reviewedAt: string | null = null;

    if (recipeData) {
      const recipe = this.transformRecipeRow(recipeData);
      const scalingFactor: ScalingFactor = {
        recipeId,
        originalServingSize: existingData.original_serving_size,
        targetServingSize,
        multiplier,
      };

      try {
        const review = await this.aiService.reviewScaling(
          recipe,
          scalingFactor
        );
        if (review && review.trim().length > 0) {
          claudeReviewNotes = review;
          reviewedAt = new Date().toISOString();
        }
      } catch (e) {
        console.warn("Scaling review failed:", e);
      }
    }

    // Update the scaling
    const { error: updateError } = await this.supabase
      .from("meal_recipes")
      .update({
        target_serving_size: targetServingSize,
        multiplier,
        claude_review_notes: claudeReviewNotes,
        reviewed_at: reviewedAt,
      })
      .eq("meal_id", mealId)
      .eq("recipe_id", recipeId);

    if (updateError) {
      throw new Error(`Failed to update scaling: ${updateError.message}`);
    }

    const meal = await this.get(mealId);
    if (!meal) {
      throw new Error("Meal not found after updating scaling");
    }
    return meal;
  }

  /**
   * Remove a recipe from the meal
   */
  async removeRecipe(mealId: string, recipeId: string): Promise<Meal> {
    const { error } = await this.supabase
      .from("meal_recipes")
      .delete()
      .eq("meal_id", mealId)
      .eq("recipe_id", recipeId);

    if (error) {
      throw new Error(`Failed to remove recipe: ${error.message}`);
    }

    const meal = await this.get(mealId);
    if (!meal) {
      throw new Error("Meal not found after removing recipe");
    }
    return meal;
  }

  /**
   * Get scaling factor for a recipe in a meal
   */
  async getScaling(
    mealId: string,
    recipeId: string
  ): Promise<ScalingFactor | null> {
    const { data, error } = await this.supabase
      .from("meal_recipes")
      .select("*")
      .eq("meal_id", mealId)
      .eq("recipe_id", recipeId)
      .single<MealRecipeRow>();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to get scaling: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      recipeId: data.recipe_id,
      originalServingSize: data.original_serving_size,
      targetServingSize: data.target_serving_size,
      multiplier: data.multiplier,
      claudeReviewNotes: data.claude_review_notes ?? undefined,
      reviewedAt: data.reviewed_at ?? undefined,
    };
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  /**
   * Fetch meal recipes with full recipe data
   */
  private async fetchMealRecipes(
    mealId: string
  ): Promise<RecipeWithScaling[]> {
    const { data, error } = await this.supabase
      .from("meal_recipes")
      .select(
        `
        *,
        recipes (*)
      `
      )
      .eq("meal_id", mealId);

    if (error) {
      throw new Error(`Failed to fetch meal recipes: ${error.message}`);
    }

    return (data ?? []).map((row) => {
      const mealRecipe = row as MealRecipeRow & { recipes: RecipeRow };
      const recipe = this.transformRecipeRow(mealRecipe.recipes);
      const scaling: ScalingFactor = {
        recipeId: mealRecipe.recipe_id,
        originalServingSize: mealRecipe.original_serving_size,
        targetServingSize: mealRecipe.target_serving_size,
        multiplier: mealRecipe.multiplier,
        claudeReviewNotes: mealRecipe.claude_review_notes ?? undefined,
        reviewedAt: mealRecipe.reviewed_at ?? undefined,
      };
      return { recipe, scaling };
    });
  }

  /**
   * Get recipe counts for multiple meals
   */
  private async getRecipeCounts(
    mealIds: string[]
  ): Promise<Map<string, number>> {
    if (mealIds.length === 0) {
      return new Map();
    }

    const { data, error } = await this.supabase
      .from("meal_recipes")
      .select("meal_id")
      .in("meal_id", mealIds);

    if (error) {
      console.warn("Failed to get recipe counts:", error.message);
      return new Map();
    }

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const mealId = row.meal_id as string;
      counts.set(mealId, (counts.get(mealId) ?? 0) + 1);
    }
    return counts;
  }

  /**
   * Transform Supabase meal row to Meal type
   */
  private transformMealRow(
    row: MealRow,
    recipes: RecipeWithScaling[]
  ): Meal {
    return {
      id: row.id,
      name: row.name,
      serveTime: row.serve_time,
      guestCount: row.guest_count as GuestCount,
      recipes,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Transform Supabase recipe row to Recipe type
   */
  private transformRecipeRow(row: RecipeRow): Recipe {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      sourceType: row.source_type ?? undefined,
      source: row.source ?? undefined,
      sourceImageUrl: row.source_image_url ?? undefined,
      servingSize: row.serving_size,
      prepTimeMinutes: row.prep_time_minutes,
      cookTimeMinutes: row.cook_time_minutes,
      ingredients: row.ingredients ?? [],
      instructions: row.instructions ?? [],
      notes: row.notes ?? undefined,
      uncertainFields: row.uncertain_fields ?? undefined,
      extractionConfidence: row.extraction_confidence ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

/**
 * Factory function to create a SupabaseMealService
 */
export function createMealService(
  supabase: SupabaseClient,
  aiService: AIService
): MealService {
  return new SupabaseMealService(supabase, aiService);
}
