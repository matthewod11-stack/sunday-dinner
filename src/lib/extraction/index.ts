/**
 * Recipe extraction module
 *
 * Provides URL scraping and PDF parsing for recipe ingestion
 */

// URL scraping
export {
  scrapeRecipeUrl,
  validateUrl,
  fetchHtml,
  parseIngredientString,
  type UrlScrapingResult,
} from "./url-scraper";

// Site handlers
export { extractJsonLdRecipe, extractGenericRecipe } from "./site-handlers";

// PDF parsing
export {
  convertPdfToImage,
  parsePdfRecipe,
  readFileAsArrayBuffer,
  type PdfImageResult,
} from "./pdf-parser";
