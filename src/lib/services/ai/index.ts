/**
 * AI Service Module
 *
 * Provides the AIService abstraction layer for all Claude API interactions.
 * This module exports the ClaudeAIService implementation and a factory function.
 *
 * @example
 * ```typescript
 * import { createAIService } from '@/lib/services/ai';
 *
 * const aiService = createAIService();
 * const result = await aiService.visionExtractRecipe(imageBase64, 'image/jpeg');
 * ```
 */

export { ClaudeAIService, createAIService } from "./claude-ai-service";
export {
  RECIPE_EXTRACTION_PROMPT,
  TIMELINE_GENERATION_PROMPT,
  SCALING_REVIEW_PROMPT,
  RECALCULATION_PROMPT,
} from "./prompts";
