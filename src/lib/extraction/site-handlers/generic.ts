import type { CheerioAPI } from "cheerio";
import type { ExtractionResult, Ingredient, Instruction } from "@/types";
import { parseIngredientString } from "../url-scraper";

/**
 * Site-specific selectors for common recipe websites
 *
 * Fallback for sites without JSON-LD or with malformed data
 */
interface SiteSelectors {
  title?: string;
  ingredients?: string;
  instructions?: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
}

const SITE_SELECTORS: Record<string, SiteSelectors> = {
  "allrecipes.com": {
    title: "h1.article-heading",
    ingredients: ".mntl-structured-ingredients__list-item",
    instructions: ".mntl-sc-block-group--LI p",
    servings: ".mntl-recipe-details__value",
    prepTime: ".mntl-recipe-details__value",
    cookTime: ".mntl-recipe-details__value",
  },
  "cooking.nytimes.com": {
    title: "h1[data-testid='headline']",
    ingredients: "[data-testid='ingredient-list-container'] li",
    instructions: "[data-testid='instructions-container'] li",
    servings: "[data-testid='yield']",
    prepTime: "[data-testid='prep-time']",
    cookTime: "[data-testid='cook-time']",
  },
  "foodnetwork.com": {
    title: ".o-AssetTitle__a-Headline",
    ingredients: ".o-Ingredients__a-Ingredient",
    instructions: ".o-Method__m-Body p",
    servings: ".o-RecipeInfo__a-Description--Yield",
    prepTime: ".o-RecipeInfo__a-Description--Prep",
    cookTime: ".o-RecipeInfo__a-Description--Total",
  },
  "seriouseats.com": {
    title: "h1.heading__title",
    ingredients: ".structured-ingredients__list-item",
    instructions: ".structured-project__steps li p",
    servings: ".recipe-about__item--yield .recipe-about__data",
    prepTime: ".recipe-about__item--prep-time .recipe-about__data",
    cookTime: ".recipe-about__item--cook-time .recipe-about__data",
  },
  "bonappetit.com": {
    title: "h1[data-testid='ContentHeaderHed']",
    ingredients: "[data-testid='IngredientList'] p",
    instructions: "[data-testid='InstructionsWrapper'] li p",
    servings: "[data-testid='RecipePageLabelledText-yield'] p",
    prepTime: "[data-testid='RecipePageLabelledText-prep-time'] p",
    cookTime: "[data-testid='RecipePageLabelledText-total-time'] p",
  },
};

/**
 * Generic selectors for unknown sites
 */
const GENERIC_SELECTORS: SiteSelectors = {
  title: "h1, .recipe-title, .recipe-name, [itemprop='name']",
  ingredients:
    ".ingredients li, .ingredient-list li, [itemprop='recipeIngredient'], .recipe-ingredients li",
  instructions:
    ".instructions li, .directions li, .recipe-directions li, [itemprop='recipeInstructions'] li, .recipe-steps li, .method li",
  servings:
    "[itemprop='recipeYield'], .servings, .yield, .recipe-servings",
  prepTime: "[itemprop='prepTime'], .prep-time, .prepTime",
  cookTime: "[itemprop='cookTime'], .cook-time, .cookTime, .total-time",
};

/**
 * Extract recipe using generic HTML selectors
 *
 * Falls back to common patterns when JSON-LD is unavailable
 */
export function extractGenericRecipe(
  $: CheerioAPI,
  hostname: string
): ExtractionResult {
  const uncertainFields: string[] = [];
  let confidence = 0.6; // Lower confidence for generic extraction

  // Get site-specific selectors or fall back to generic
  const domainKey = Object.keys(SITE_SELECTORS).find((d) =>
    hostname.includes(d)
  );
  const selectors = domainKey ? SITE_SELECTORS[domainKey]! : GENERIC_SELECTORS;

  // Extract title
  const name = extractText($, selectors.title);
  if (!name) {
    uncertainFields.push("name");
    confidence -= 0.15;
  }

  // Extract ingredients
  const ingredients = extractIngredients($, selectors.ingredients);
  if (ingredients.length === 0) {
    uncertainFields.push("ingredients");
    confidence -= 0.25;
  }

  // Extract instructions
  const instructions = extractInstructions($, selectors.instructions);
  if (instructions.length === 0) {
    uncertainFields.push("instructions");
    confidence -= 0.25;
  }

  // Extract serving size
  const servingSize = extractNumber($, selectors.servings) ?? 4;
  if (!extractNumber($, selectors.servings)) {
    uncertainFields.push("servingSize");
    confidence -= 0.05;
  }

  // Extract times
  const prepTimeMinutes = extractTime($, selectors.prepTime);
  const cookTimeMinutes = extractTime($, selectors.cookTime);

  if (!prepTimeMinutes && !cookTimeMinutes) {
    uncertainFields.push("prepTimeMinutes");
    uncertainFields.push("cookTimeMinutes");
    confidence -= 0.05;
  }

  // Determine success
  const hasMinimumData = name && (ingredients.length > 0 || instructions.length > 0);

  if (!hasMinimumData) {
    return {
      success: false,
      confidence: 0,
      error:
        "Could not find recipe content on this page. The page may use a format we don't support yet.",
      uncertainFields: [],
    };
  }

  return {
    success: true,
    confidence: Math.max(0.2, confidence),
    name,
    servingSize,
    prepTimeMinutes,
    cookTimeMinutes,
    ingredients,
    instructions,
    uncertainFields,
  };
}

/**
 * Extract text from first matching element
 */
function extractText($: CheerioAPI, selector?: string): string | undefined {
  if (!selector) return undefined;

  const element = $(selector).first();
  const text = element.text().trim();
  return text || undefined;
}

/**
 * Extract first number from matching element
 */
function extractNumber($: CheerioAPI, selector?: string): number | undefined {
  const text = extractText($, selector);
  if (!text) return undefined;

  const match = text.match(/(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return undefined;
}

/**
 * Extract time in minutes from text
 *
 * Handles:
 * - "30 min" → 30
 * - "1 hr 15 min" → 75
 * - "2 hours" → 120
 */
function extractTime($: CheerioAPI, selector?: string): number | undefined {
  const text = extractText($, selector);
  if (!text) return undefined;

  let totalMinutes = 0;

  // Hours
  const hoursMatch = text.match(/(\d+)\s*(?:hours?|hrs?|h)/i);
  if (hoursMatch && hoursMatch[1]) {
    totalMinutes += parseInt(hoursMatch[1], 10) * 60;
  }

  // Minutes
  const minsMatch = text.match(/(\d+)\s*(?:minutes?|mins?|m(?!\w))/i);
  if (minsMatch && minsMatch[1]) {
    totalMinutes += parseInt(minsMatch[1], 10);
  }

  // Just a number (assume minutes)
  if (totalMinutes === 0) {
    const numMatch = text.match(/(\d+)/);
    if (numMatch && numMatch[1]) {
      totalMinutes = parseInt(numMatch[1], 10);
    }
  }

  return totalMinutes > 0 ? totalMinutes : undefined;
}

/**
 * Extract ingredients from list elements
 */
function extractIngredients(
  $: CheerioAPI,
  selector?: string
): Ingredient[] {
  if (!selector) return [];

  const elements = $(selector).toArray();
  const ingredients: Ingredient[] = [];

  for (const el of elements) {
    const text = $(el).text().trim();
    if (text && text.length > 2) {
      ingredients.push(parseIngredientString(text));
    }
  }

  return ingredients;
}

/**
 * Extract instructions from list elements
 */
function extractInstructions(
  $: CheerioAPI,
  selector?: string
): Instruction[] {
  if (!selector) return [];

  const elements = $(selector).toArray();
  const instructions: Instruction[] = [];
  let stepNumber = 1;

  for (const el of elements) {
    const text = $(el).text().trim();
    if (text && text.length > 5) {
      // Detect oven requirements
      const ovenMatch = text.match(/(\d{3})\s*°?\s*F/i);
      const ovenRequired = ovenMatch !== null;
      const ovenTemp = ovenMatch && ovenMatch[1] ? parseInt(ovenMatch[1], 10) : undefined;

      instructions.push({
        stepNumber: stepNumber++,
        description: text,
        ovenRequired: ovenRequired || undefined,
        ovenTemp,
      });
    }
  }

  return instructions;
}
