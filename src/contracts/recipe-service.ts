import type { Recipe, ExtractionResult } from "@/types";

/**
 * Options for listing recipes
 */
export interface ListRecipesOptions {
  /** Maximum number of recipes to return */
  limit?: number;
  /** Number of recipes to skip (for pagination) */
  offset?: number;
  /** Search query for recipe name */
  search?: string;
  /** Filter by source type */
  sourceType?: "photo" | "url" | "pdf" | "manual";
}

/**
 * RecipeService: Handles recipe CRUD and extraction operations
 *
 * Owned by Agent A (Weeks 3-4).
 * Depends on: Supabase, AIService
 *
 * Responsibilities:
 * - Create, read, update, delete recipes
 * - Extract recipes from photos, URLs, PDFs
 * - Store recipe images in Supabase Storage
 *
 * @example
 * ```typescript
 * const recipeService: RecipeService = new SupabaseRecipeService(supabase, aiService);
 *
 * // Extract from photo
 * const result = await recipeService.extractFromImage(imageBase64);
 * if (result.success) {
 *   // Show side-by-side correction UI
 *   const corrected = await showCorrectionUI(result);
 *   const saved = await recipeService.create(corrected);
 * }
 * ```
 */
export interface RecipeService {
  /**
   * Create a new recipe
   *
   * @param recipe - Recipe data (without id, createdAt, updatedAt)
   * @returns Saved recipe with generated ID and timestamps
   */
  create(recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">): Promise<Recipe>;

  /**
   * Get a recipe by ID
   *
   * @param recipeId - Recipe UUID
   * @returns Recipe or null if not found
   */
  get(recipeId: string): Promise<Recipe | null>;

  /**
   * List all recipes with optional filtering
   *
   * @param options - Pagination and filtering options
   * @returns Array of recipes
   */
  list(options?: ListRecipesOptions): Promise<Recipe[]>;

  /**
   * Update an existing recipe
   *
   * @param recipeId - Recipe UUID
   * @param updates - Partial recipe data to update
   * @returns Updated recipe
   *
   * @throws Error if recipe not found
   */
  update(recipeId: string, updates: Partial<Recipe>): Promise<Recipe>;

  /**
   * Delete a recipe
   *
   * Also removes associated image from storage.
   *
   * @param recipeId - Recipe UUID
   *
   * @throws Error if recipe not found or in use by a meal
   */
  delete(recipeId: string): Promise<void>;

  /**
   * Extract recipe data from image
   *
   * Uses Claude Vision to extract structured data.
   * Returns extraction result for side-by-side correction UI.
   *
   * @param imageBase64 - Base64-encoded image
   * @returns Extraction result with uncertain fields highlighted
   */
  extractFromImage(imageBase64: string): Promise<ExtractionResult>;

  /**
   * Extract recipe data from URL
   *
   * Scrapes and parses recipe from web page.
   * Handles common recipe sites + generic parsing.
   *
   * @param url - Recipe URL
   * @param siteType - Optional hint for site-specific parsing
   * @returns Extraction result
   */
  extractFromUrl(url: string, siteType?: string): Promise<ExtractionResult>;

  /**
   * Extract recipe data from PDF
   *
   * Converts single-page PDF to image and extracts.
   *
   * @param pdfBase64 - Base64-encoded PDF
   * @returns Extraction result
   *
   * @throws Error if PDF is multi-page
   */
  extractFromPdf(pdfBase64: string): Promise<ExtractionResult>;

  /**
   * Upload recipe source image to storage
   *
   * Compresses image to <500KB before upload.
   *
   * @param recipeId - Recipe UUID
   * @param imageBase64 - Base64-encoded image
   * @returns Storage URL for the uploaded image
   */
  uploadSourceImage(recipeId: string, imageBase64: string): Promise<string>;
}
