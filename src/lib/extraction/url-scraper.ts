import * as cheerio from "cheerio";
import type { ExtractionResult, Ingredient } from "@/types";
import { extractJsonLdRecipe } from "./site-handlers/json-ld";
import { extractGenericRecipe } from "./site-handlers/generic";

/**
 * URL scraping configuration
 */
interface ScraperConfig {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom user agent */
  userAgent?: string;
}

const DEFAULT_CONFIG: Required<ScraperConfig> = {
  timeout: 10000,
  userAgent:
    "Mozilla/5.0 (compatible; SundayDinner/1.0; +https://sundaydinner.app)",
};

/**
 * Result from URL scraping - extends ExtractionResult with URL metadata
 */
export interface UrlScrapingResult extends ExtractionResult {
  /** Original URL */
  sourceUrl: string;
  /** Site domain */
  siteDomain: string;
  /** Method used for extraction */
  extractionMethod: "json-ld" | "microdata" | "generic" | "vision-fallback";
}

/**
 * Validate and normalize a URL
 */
export function validateUrl(urlString: string): URL | null {
  try {
    const url = new URL(urlString);
    // Only allow http/https
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

/**
 * Fetch HTML content from a URL
 */
export async function fetchHtml(
  urlString: string,
  config: ScraperConfig = {}
): Promise<string> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), mergedConfig.timeout);

  try {
    const response = await fetch(urlString, {
      headers: {
        "User-Agent": mergedConfig.userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new Error(`Unexpected content type: ${contentType}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Main URL scraping function
 *
 * Extraction priority:
 * 1. JSON-LD schema.org Recipe (most reliable)
 * 2. Microdata (legacy but still used)
 * 3. Generic HTML parsing (fallback)
 *
 * @param urlString - URL to scrape
 * @param config - Optional scraper configuration
 * @returns Extraction result with recipe data
 */
export async function scrapeRecipeUrl(
  urlString: string,
  config: ScraperConfig = {}
): Promise<UrlScrapingResult> {
  // Validate URL
  const url = validateUrl(urlString);
  if (!url) {
    return {
      sourceUrl: urlString,
      siteDomain: "",
      extractionMethod: "generic",
      success: false,
      confidence: 0,
      error: "Invalid URL. Please enter a valid http or https URL.",
      uncertainFields: [],
    };
  }

  const siteDomain = url.hostname;

  try {
    // Fetch HTML
    const html = await fetchHtml(urlString, config);
    const $ = cheerio.load(html);

    // Try JSON-LD extraction first (most reliable)
    const jsonLdResult = extractJsonLdRecipe($);
    if (jsonLdResult.success) {
      return {
        ...jsonLdResult,
        sourceUrl: urlString,
        siteDomain,
        extractionMethod: "json-ld",
      };
    }

    // Try generic HTML extraction
    const genericResult = extractGenericRecipe($, url.hostname);
    if (genericResult.success) {
      return {
        ...genericResult,
        sourceUrl: urlString,
        siteDomain,
        extractionMethod: "generic",
      };
    }

    // All methods failed
    return {
      sourceUrl: urlString,
      siteDomain,
      extractionMethod: "generic",
      success: false,
      confidence: 0,
      error:
        "Could not extract recipe from this page. Try taking a screenshot and uploading it as a photo instead.",
      uncertainFields: [],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Handle specific error types
    if (errorMessage.includes("abort")) {
      return {
        sourceUrl: urlString,
        siteDomain,
        extractionMethod: "generic",
        success: false,
        confidence: 0,
        error: "Request timed out. The site may be slow or unreachable.",
        uncertainFields: [],
      };
    }

    return {
      sourceUrl: urlString,
      siteDomain,
      extractionMethod: "generic",
      success: false,
      confidence: 0,
      error: `Failed to fetch page: ${errorMessage}`,
      uncertainFields: [],
    };
  }
}

/**
 * Parse ingredient string into structured ingredient
 *
 * Examples:
 * - "2 cups flour" → { quantity: 2, unit: "cups", name: "flour" }
 * - "1/2 tsp salt" → { quantity: 0.5, unit: "tsp", name: "salt" }
 * - "3 eggs" → { quantity: 3, unit: null, name: "eggs" }
 * - "salt to taste" → { quantity: null, unit: null, name: "salt to taste" }
 */
export function parseIngredientString(text: string): Ingredient {
  const trimmed = text.trim();

  // Common patterns
  const patterns = [
    // "2 cups flour" or "1/2 tsp salt" or "1 1/2 cups sugar"
    /^(\d+(?:\s+\d+)?(?:\/\d+)?)\s*(cups?|tbsp?|tsp?|oz|lb|g|kg|ml|l|tablespoons?|teaspoons?|ounces?|pounds?|grams?|kilograms?|milliliters?|liters?|quarts?|pints?|gallons?|cloves?|heads?|bunche?s?|sprigs?|stalks?|slices?|pieces?|pinche?s?|dashe?s?|cans?|packages?|sticks?)\s+(.+)$/i,
    // "3 eggs" (number + name, no unit)
    /^(\d+(?:\s+\d+)?(?:\/\d+)?)\s+(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      const quantityStr = match[1];
      let quantity: number | null = null;

      // Parse fractions and mixed numbers
      if (quantityStr) {
        quantity = parseFraction(quantityStr);
      }

      if (match.length === 4 && match[2] && match[3]) {
        // Pattern with unit
        return {
          quantity,
          unit: normalizeUnit(match[2]),
          name: match[3].trim(),
        };
      } else if (match.length === 3 && match[2]) {
        // Pattern without unit
        return {
          quantity,
          unit: null,
          name: match[2].trim(),
        };
      }
    }
  }

  // Fallback: treat entire string as name with null quantity
  return {
    quantity: null,
    unit: null,
    name: trimmed,
  };
}

/**
 * Parse fraction or mixed number to decimal
 */
function parseFraction(str: string): number | null {
  const trimmed = str.trim();

  // Mixed number: "1 1/2"
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch && mixedMatch[1] && mixedMatch[2] && mixedMatch[3]) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const denom = parseInt(mixedMatch[3], 10);
    return denom > 0 ? whole + num / denom : null;
  }

  // Simple fraction: "1/2"
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch && fractionMatch[1] && fractionMatch[2]) {
    const num = parseInt(fractionMatch[1], 10);
    const denom = parseInt(fractionMatch[2], 10);
    return denom > 0 ? num / denom : null;
  }

  // Simple number
  const num = parseFloat(trimmed);
  return isNaN(num) ? null : num;
}

/**
 * Normalize unit abbreviations
 */
function normalizeUnit(unit: string): string {
  const normalized = unit.toLowerCase().trim();

  const unitMap: Record<string, string> = {
    tablespoon: "tbsp",
    tablespoons: "tbsp",
    tbsp: "tbsp",
    teaspoon: "tsp",
    teaspoons: "tsp",
    tsp: "tsp",
    ounce: "oz",
    ounces: "oz",
    oz: "oz",
    pound: "lb",
    pounds: "lb",
    lb: "lb",
    lbs: "lb",
    gram: "g",
    grams: "g",
    g: "g",
    kilogram: "kg",
    kilograms: "kg",
    kg: "kg",
    milliliter: "ml",
    milliliters: "ml",
    ml: "ml",
    liter: "l",
    liters: "l",
    l: "l",
    cup: "cup",
    cups: "cup",
    quart: "qt",
    quarts: "qt",
    pint: "pt",
    pints: "pt",
    gallon: "gal",
    gallons: "gal",
    clove: "clove",
    cloves: "clove",
    head: "head",
    heads: "head",
    bunch: "bunch",
    bunches: "bunch",
    sprig: "sprig",
    sprigs: "sprig",
    stalk: "stalk",
    stalks: "stalk",
    slice: "slice",
    slices: "slice",
    piece: "piece",
    pieces: "piece",
    pinch: "pinch",
    pinches: "pinch",
    dash: "dash",
    dashes: "dash",
    can: "can",
    cans: "can",
    package: "package",
    packages: "package",
    stick: "stick",
    sticks: "stick",
  };

  return unitMap[normalized] ?? normalized;
}
