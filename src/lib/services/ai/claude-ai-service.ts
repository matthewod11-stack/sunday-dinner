import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type {
  AIService,
  ImageMimeType,
  TimelineGenerationInput,
} from "@/contracts/ai-service";
import type {
  ExtractionResult,
  Recipe,
  Task,
  Timeline,
  RecalculationSuggestion,
  ScalingFactor,
} from "@/types";
import {
  ExtractionResultSchema,
  TaskSchema,
  RecalculationSuggestionSchema,
} from "@/types";
import {
  RECIPE_EXTRACTION_PROMPT,
  TIMELINE_GENERATION_PROMPT,
  SCALING_REVIEW_PROMPT,
  RECALCULATION_PROMPT,
} from "./prompts";

/**
 * ClaudeAIService: Implementation of AIService using Anthropic's Claude API
 *
 * This service wraps all Claude API calls and provides:
 * - Vision-based recipe extraction
 * - Timeline generation from recipes
 * - Scaling review for non-linear effects
 * - Recalculation suggestions when running behind
 *
 * All methods return structured data validated with Zod schemas.
 *
 * @example
 * ```typescript
 * const aiService = new ClaudeAIService();
 * const result = await aiService.visionExtractRecipe(imageBase64, "image/jpeg");
 * if (result.success) {
 *   console.log(result.name, result.ingredients);
 * }
 * ```
 */
export class ClaudeAIService implements AIService {
  private client: Anthropic;
  private model = "claude-sonnet-4-5-20250929";
  private maxTokens = 4096;

  /**
   * Create a new ClaudeAIService instance
   *
   * @param apiKey - Optional API key. Defaults to ANTHROPIC_API_KEY env var.
   */
  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is required. " +
          "Set it in your .env.local file."
      );
    }
    this.client = new Anthropic({ apiKey: key });
  }

  /**
   * Extract structured recipe data from image via Claude Vision
   *
   * @param imageBase64 - Base64-encoded image data (without data URL prefix)
   * @param mimeType - Image MIME type (image/jpeg, image/png, etc.)
   * @returns Structured extraction result with confidence scores
   * @throws Error if Claude API fails or returns malformed data
   */
  async visionExtractRecipe(
    imageBase64: string,
    mimeType: ImageMimeType
  ): Promise<ExtractionResult> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: "Extract the recipe from this image. Follow the JSON format specified in your instructions.",
              },
            ],
          },
        ],
        system: RECIPE_EXTRACTION_PROMPT,
      });

      const parsed = this.parseJsonResponse(response);
      return ExtractionResultSchema.parse(parsed);
    } catch (error) {
      return this.handleExtractionError(error);
    }
  }

  /**
   * Parse recipe data from URL
   *
   * @throws Error - Not implemented in Week 2 (coming in Week 4)
   */
  async parseRecipeUrl(
    url: string,
    siteType?: string
  ): Promise<ExtractionResult> {
    // TODO: Implement in Week 4 (Agent A)
    // Will use cheerio for HTML parsing + JSON-LD extraction
    const hint = siteType ? ` (site type: ${siteType})` : "";
    throw new Error(
      `parseRecipeUrl not yet implemented for ${url}${hint}. ` +
        "Coming in Week 4. Use visionExtractRecipe with a screenshot for now."
    );
  }

  /**
   * Parse recipe from single-page PDF
   *
   * @throws Error - Not implemented in Week 2 (coming in Week 4)
   */
  async parsePdf(pdfBase64: string): Promise<ExtractionResult> {
    // TODO: Implement in Week 4 (Agent A)
    // Will use pdfjs-dist to convert PDF to image, then visionExtractRecipe
    const sizeKb = Math.round(pdfBase64.length / 1024);
    throw new Error(
      `parsePdf not yet implemented (received ${sizeKb}KB PDF). ` +
        "Coming in Week 4. Use visionExtractRecipe with a screenshot for now."
    );
  }

  /**
   * Generate cooking timeline from meal recipes
   *
   * @param input - Recipes, scaling factors, serve time, guest count
   * @returns Array of tasks ready for validation
   * @throws Error if Claude API fails
   */
  async generateTimeline(input: TimelineGenerationInput): Promise<Task[]> {
    try {
      // Build the user message with all recipe details
      const recipesSummary = input.recipes
        .map((recipe, i) => {
          const scale = input.scaling[i];
          const multiplier = scale ? scale.multiplier : 1;
          return `
### Recipe ${i + 1}: ${recipe.name}
- Original serving size: ${recipe.servingSize}
- Scaling factor: ${multiplier}x (serving ${recipe.servingSize * multiplier})
- Prep time: ${recipe.prepTimeMinutes ?? "unknown"} min
- Cook time: ${recipe.cookTimeMinutes ?? "unknown"} min

**Ingredients:**
${recipe.ingredients.map((ing) => `- ${ing.quantity ?? "?"} ${ing.unit ?? ""} ${ing.name}${ing.notes ? ` (${ing.notes})` : ""}`).join("\n")}

**Instructions:**
${recipe.instructions.map((inst) => `${inst.stepNumber}. ${inst.description}${inst.durationMinutes ? ` (${inst.durationMinutes} min)` : ""}${inst.ovenRequired ? ` [OVEN: ${inst.ovenTemp}°F]` : ""}`).join("\n")}
`;
        })
        .join("\n---\n");

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          {
            role: "user",
            content: `Create a cooking timeline for the following meal:

**Serve Time:** ${input.serveTime}
**Guest Count:** ${input.guestCount}
**Meal ID:** meal-${Date.now()}

${recipesSummary}

Generate a complete timeline of tasks, working backwards from the serve time. Output ONLY the JSON array of tasks.`,
          },
        ],
        system: TIMELINE_GENERATION_PROMPT,
      });

      const parsed = this.parseJsonResponse(response);

      // Validate as array of tasks
      const tasksArray = z.array(TaskSchema).parse(parsed);
      return tasksArray;
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API error during timeline generation: ${error.message}`);
      }
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid timeline response format: ${error.issues.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  }

  /**
   * Review recipe scaling and flag concerns
   *
   * @param recipe - Original recipe
   * @param scaling - Proposed scaling factor
   * @returns Review notes (empty string if no concerns)
   */
  async reviewScaling(
    recipe: Recipe,
    scaling: ScalingFactor
  ): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500, // Scaling review is short
        messages: [
          {
            role: "user",
            content: `Review this scaling request:

**Recipe:** ${recipe.name}
**Original serving size:** ${recipe.servingSize}
**Scaling factor:** ${scaling.multiplier}x
**Target servings:** ${recipe.servingSize * scaling.multiplier}

**Ingredients:**
${recipe.ingredients.map((ing) => `- ${ing.quantity ?? "?"} ${ing.unit ?? ""} ${ing.name}`).join("\n")}

**Key cooking steps:**
${recipe.instructions.filter((i) => i.ovenRequired || (i.durationMinutes && i.durationMinutes > 10)).map((i) => `- ${i.description}`).join("\n") || "- Standard stovetop/prep steps"}

Flag any scaling concerns. If none, respond with an empty string.`,
          },
        ],
        system: SCALING_REVIEW_PROMPT,
      });

      // Scaling review returns plain text, not JSON
      const text =
        response.content[0]?.type === "text" ? response.content[0].text : "";
      return text.trim();
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        // Non-critical: return empty string if scaling review fails
        console.error("Scaling review failed:", error.message);
        return "";
      }
      throw error;
    }
  }

  /**
   * Suggest timeline recalculation when running behind
   *
   * @param timeline - Current timeline state
   * @param currentTime - Current time (ISO datetime)
   * @param behind - Optional context about delay
   * @returns Single recalculation suggestion
   */
  async suggestRecalculation(
    timeline: Timeline,
    currentTime: string,
    behind?: string
  ): Promise<RecalculationSuggestion> {
    try {
      // Summarize current timeline state
      const pendingTasks = timeline.tasks.filter((t) => t.status === "pending");
      const completedTasks = timeline.tasks.filter(
        (t) => t.status === "completed"
      );
      const currentTask = timeline.tasks.find(
        (t) => t.id === timeline.currentTaskId
      );

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `The cook is running behind schedule and needs help adjusting the timeline.

**Current Time:** ${currentTime}
**Context:** ${behind ?? "Cook indicated they are behind schedule"}

**Current Task:** ${currentTask ? `${currentTask.title} (started at ${currentTask.startTimeMinutes} min relative to serve)` : "None active"}

**Completed Tasks (${completedTasks.length}):**
${completedTasks.slice(-3).map((t) => `- ${t.title}`).join("\n") || "- None yet"}

**Pending Tasks (${pendingTasks.length}):**
${pendingTasks.slice(0, 5).map((t) => `- ${t.title} (starts at ${t.startTimeMinutes} min, duration ${t.durationMinutes} min)${t.requiresOven ? " [OVEN]" : ""}`).join("\n")}

Suggest ONE adjustment to help get back on track. Output ONLY the JSON suggestion.`,
          },
        ],
        system: RECALCULATION_PROMPT,
      });

      const parsed = this.parseJsonResponse(response);
      return RecalculationSuggestionSchema.parse(parsed);
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API error during recalculation: ${error.message}`);
      }
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid recalculation response format: ${error.issues.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  /**
   * Parse JSON from Claude's text response
   *
   * Handles:
   * - Raw JSON responses
   * - JSON wrapped in markdown code blocks (```json ... ```)
   * - JSON wrapped in plain code blocks (``` ... ```)
   */
  private parseJsonResponse(response: Anthropic.Message): unknown {
    const content = response.content[0];
    if (!content || content.type !== "text") {
      throw new Error("No text content in Claude response");
    }

    const text = content.text.trim();

    // Try to extract JSON from markdown code blocks
    const jsonBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    const jsonStr =
      jsonBlockMatch && jsonBlockMatch[1] ? jsonBlockMatch[1].trim() : text;

    try {
      return JSON.parse(jsonStr);
    } catch {
      throw new Error(
        `Failed to parse JSON from Claude response. Raw text: ${text.slice(0, 200)}...`
      );
    }
  }

  /**
   * Handle extraction errors gracefully
   *
   * Returns a failed ExtractionResult instead of throwing,
   * allowing the UI to show appropriate error state.
   */
  private handleExtractionError(error: unknown): ExtractionResult {
    let errorMessage = "Unknown extraction error";

    if (error instanceof Anthropic.APIError) {
      errorMessage = `Claude API error: ${error.message}`;
    } else if (error instanceof z.ZodError) {
      errorMessage = `Invalid response format: ${error.issues.map((e) => e.message).join(", ")}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("Recipe extraction failed:", errorMessage);

    return {
      confidence: 0,
      uncertainFields: [],
      error: errorMessage,
      success: false,
    };
  }
}

/**
 * Factory function to create a ClaudeAIService instance
 *
 * @param apiKey - Optional API key. Defaults to ANTHROPIC_API_KEY env var.
 * @returns Configured ClaudeAIService instance
 */
export function createAIService(apiKey?: string): AIService {
  return new ClaudeAIService(apiKey);
}
