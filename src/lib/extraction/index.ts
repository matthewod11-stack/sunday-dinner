/**
 * Recipe extraction module
 *
 * Provides URL scraping for recipe ingestion.
 *
 * NOTE: PDF parsing is in a separate module (@/lib/extraction/client)
 * because pdf.js requires browser APIs (DOMMatrix, Canvas) that don't
 * exist in Node.js. Import PDF functions from "./client" in client
 * components only.
 */

// URL scraping (server-safe)
export {
  scrapeRecipeUrl,
  validateUrl,
  fetchHtml,
  parseIngredientString,
  type UrlScrapingResult,
} from "./url-scraper";

// Site handlers (server-safe)
export { extractJsonLdRecipe, extractGenericRecipe } from "./site-handlers";
