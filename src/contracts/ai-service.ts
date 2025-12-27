import type {
  ExtractionResult,
  Recipe,
  ScalingFactor,
  Task,
  Timeline,
  RecalculationSuggestion,
} from "@/types";

/**
 * Supported image MIME types for Claude Vision
 */
export type ImageMimeType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

/**
 * Input for timeline generation
 */
export interface TimelineGenerationInput {
  /** Recipes to include in timeline */
  recipes: Recipe[];
  /** Scaling factors for each recipe */
  scaling: ScalingFactor[];
  /** When food should be served (ISO datetime) */
  serveTime: string;
  /** Number of guests */
  guestCount: number;
}

/**
 * AIService: Abstraction layer for all Claude API calls
 *
 * This interface decouples the application from the specific
 * Claude model/version. Implementations can be swapped for:
 * - Different Claude models (Sonnet, Opus)
 * - Mock implementations for testing
 * - Future model upgrades
 *
 * All methods return structured data validated with Zod schemas.
 * Malformed responses should throw errors.
 *
 * @example
 * ```typescript
 * const aiService: AIService = new ClaudeAIService(apiKey);
 * const result = await aiService.visionExtractRecipe(imageBase64, "image/jpeg");
 * if (result.success) {
 *   // Use extracted recipe data
 * }
 * ```
 */
export interface AIService {
  /**
   * Extract structured recipe data from image via Claude Vision
   *
   * Used for:
   * - Handwritten recipe card photos
   * - Printed recipe photos
   * - Recipe book scans
   *
   * @param imageBase64 - Base64-encoded image data
   * @param mimeType - Image MIME type
   * @returns Structured extraction result with confidence scores
   *
   * @throws Error if Claude API fails or returns malformed data
   */
  visionExtractRecipe(imageBase64: string, mimeType: ImageMimeType): Promise<ExtractionResult>;

  /**
   * Parse recipe data from URL
   *
   * Handles common recipe sites:
   * - AllRecipes, NYT Cooking, Food Network
   * - JSON-LD structured data (schema.org/Recipe)
   * - Microdata parsing
   * - Generic heuristic fallback
   *
   * @param url - Full recipe URL
   * @param siteType - Optional hint for site-specific parsing
   * @returns Structured extraction result
   *
   * @throws Error if URL is unreachable or parsing fails
   */
  parseRecipeUrl(url: string, siteType?: string): Promise<ExtractionResult>;

  /**
   * Parse recipe from single-page PDF
   *
   * Converts PDF to image and uses vision extraction.
   * Only single-page PDFs are supported in v1.
   *
   * @param pdfBase64 - Base64-encoded PDF data
   * @returns Structured extraction result
   *
   * @throws Error if PDF is multi-page or extraction fails
   */
  parsePdf(pdfBase64: string): Promise<ExtractionResult>;

  /**
   * Generate cooking timeline from meal recipes
   *
   * Claude generates a logical task sequence:
   * - Works backwards from serveTime
   * - Estimates task durations
   * - Creates dependency chains (prep → cook)
   * - Considers oven constraints
   *
   * @param input - Recipes, scaling, serve time, guest count
   * @returns Array of tasks ready for validation
   *
   * @throws Error if Claude API fails
   */
  generateTimeline(input: TimelineGenerationInput): Promise<Task[]>;

  /**
   * Review recipe scaling and flag concerns
   *
   * Identifies non-linear scaling issues:
   * - "Doubling yeast — consider 1.5x instead"
   * - "Baking time may need adjustment for larger volume"
   * - "Spice levels don't scale linearly"
   *
   * @param recipe - Original recipe
   * @param scaling - Proposed scaling factor
   * @returns Review notes (empty string if no concerns)
   */
  reviewScaling(recipe: Recipe, scaling: ScalingFactor): Promise<string>;

  /**
   * Suggest timeline recalculation when running behind
   *
   * Called when user taps "I'm behind" during cooking.
   * Returns exactly ONE suggestion with clear description.
   *
   * @param timeline - Current timeline state
   * @param currentTime - Current time (ISO datetime)
   * @param behind - Optional context about delay
   * @returns Single recalculation suggestion
   *
   * @example
   * ```typescript
   * const suggestion = await aiService.suggestRecalculation(
   *   timeline,
   *   new Date().toISOString(),
   *   "I'm about 15 minutes behind"
   * );
   * // suggestion.description: "Push 'Mash potatoes' from 4:45 → 5:00? This shifts 2 other tasks."
   * ```
   */
  suggestRecalculation(
    timeline: Timeline,
    currentTime: string,
    behind?: string
  ): Promise<RecalculationSuggestion>;
}
