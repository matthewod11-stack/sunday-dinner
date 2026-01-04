import type { CheerioAPI } from "cheerio";
import type { ExtractionResult, Ingredient, Instruction } from "@/types";
import { parseIngredientString } from "../url-scraper";

/**
 * Schema.org Recipe type (partial - fields we care about)
 */
interface SchemaRecipe {
  "@type"?: string | string[];
  name?: string;
  description?: string;
  recipeYield?: string | string[] | number;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeIngredient?: string[];
  recipeInstructions?: SchemaInstruction[] | string[] | string;
  nutrition?: {
    servingSize?: string;
  };
}

interface SchemaInstruction {
  "@type"?: string;
  text?: string;
  name?: string;
  itemListElement?: SchemaInstruction[];
}

/**
 * Extract JSON-LD recipe data from HTML
 *
 * Most modern recipe sites include schema.org Recipe markup
 * in a <script type="application/ld+json"> tag.
 */
export function extractJsonLdRecipe($: CheerioAPI): ExtractionResult {
  const scripts = $('script[type="application/ld+json"]').toArray();

  for (const script of scripts) {
    try {
      const content = $(script).html();
      if (!content) continue;

      const data = JSON.parse(content);
      const recipe = findRecipeInJsonLd(data);

      if (recipe) {
        return parseSchemaRecipe(recipe);
      }
    } catch {
      // Invalid JSON, try next script
      continue;
    }
  }

  return {
    success: false,
    confidence: 0,
    error: "No JSON-LD recipe data found",
    uncertainFields: [],
  };
}

/**
 * Find Recipe object in JSON-LD data
 *
 * Handles:
 * - Direct Recipe object
 * - @graph array with Recipe inside
 * - Array of objects with Recipe inside
 */
function findRecipeInJsonLd(data: unknown): SchemaRecipe | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  // Check if this is a Recipe
  if (isRecipe(data)) {
    return data as SchemaRecipe;
  }

  // Check @graph array
  if ("@graph" in data && Array.isArray((data as { "@graph": unknown[] })["@graph"])) {
    for (const item of (data as { "@graph": unknown[] })["@graph"]) {
      if (isRecipe(item)) {
        return item as SchemaRecipe;
      }
    }
  }

  // Check if it's an array
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findRecipeInJsonLd(item);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Check if an object is a schema.org Recipe
 */
function isRecipe(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") return false;

  const type = (obj as { "@type"?: string | string[] })["@type"];
  if (!type) return false;

  if (typeof type === "string") {
    return type === "Recipe" || type.endsWith("/Recipe");
  }

  if (Array.isArray(type)) {
    return type.some((t) => t === "Recipe" || t.endsWith("/Recipe"));
  }

  return false;
}

/**
 * Parse schema.org Recipe into our ExtractionResult format
 */
function parseSchemaRecipe(recipe: SchemaRecipe): ExtractionResult {
  const uncertainFields: string[] = [];
  let confidence = 0.9; // JSON-LD is usually reliable

  // Parse name
  const name = recipe.name?.trim();
  if (!name) {
    uncertainFields.push("name");
    confidence -= 0.1;
  }

  // Parse serving size
  let servingSize = parseServingSize(recipe.recipeYield);
  if (!servingSize) {
    servingSize = 4; // Default
    uncertainFields.push("servingSize");
    confidence -= 0.05;
  }

  // Parse times
  const prepTimeMinutes = parseIsoDuration(recipe.prepTime);
  const cookTimeMinutes = parseIsoDuration(recipe.cookTime);

  if (!prepTimeMinutes && !cookTimeMinutes) {
    // Try totalTime as fallback
    const totalTime = parseIsoDuration(recipe.totalTime);
    if (!totalTime) {
      uncertainFields.push("prepTimeMinutes");
      uncertainFields.push("cookTimeMinutes");
      confidence -= 0.05;
    }
  }

  // Parse ingredients
  const ingredients = parseSchemaIngredients(recipe.recipeIngredient);
  if (ingredients.length === 0) {
    uncertainFields.push("ingredients");
    confidence -= 0.2;
  }

  // Parse instructions
  const instructions = parseSchemaInstructions(recipe.recipeInstructions);
  if (instructions.length === 0) {
    uncertainFields.push("instructions");
    confidence -= 0.2;
  }

  return {
    success: true,
    confidence: Math.max(0, confidence),
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
 * Parse recipeYield to number
 *
 * Examples:
 * - "4 servings" → 4
 * - "6" → 6
 * - ["4 servings"] → 4
 * - "Makes 12 cupcakes" → 12
 */
function parseServingSize(
  yield_: string | string[] | number | undefined
): number | undefined {
  if (typeof yield_ === "number") {
    return yield_;
  }

  if (Array.isArray(yield_)) {
    return parseServingSize(yield_[0]);
  }

  if (typeof yield_ === "string") {
    // Try to extract first number
    const match = yield_.match(/(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }

  return undefined;
}

/**
 * Parse ISO 8601 duration to minutes
 *
 * Examples:
 * - "PT30M" → 30
 * - "PT1H30M" → 90
 * - "PT2H" → 120
 * - "PT45S" → 1 (rounds up)
 */
function parseIsoDuration(duration: string | undefined): number | undefined {
  if (!duration) return undefined;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return undefined;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  const totalMinutes = hours * 60 + minutes + Math.ceil(seconds / 60);
  return totalMinutes > 0 ? totalMinutes : undefined;
}

/**
 * Parse recipeIngredient array
 */
function parseSchemaIngredients(
  ingredients: string[] | undefined
): Ingredient[] {
  if (!ingredients || !Array.isArray(ingredients)) {
    return [];
  }

  return ingredients
    .map((text) => {
      if (typeof text !== "string") return null;
      const trimmed = text.trim();
      if (!trimmed) return null;
      return parseIngredientString(trimmed);
    })
    .filter((ing): ing is Ingredient => ing !== null);
}

/**
 * Parse recipeInstructions
 *
 * Handles:
 * - Array of strings
 * - Array of HowToStep objects
 * - Single string with newlines
 * - HowToSection with nested steps
 */
function parseSchemaInstructions(
  instructions: SchemaInstruction[] | string[] | string | undefined
): Instruction[] {
  if (!instructions) return [];

  // Single string - split by newlines or periods
  if (typeof instructions === "string") {
    return instructions
      .split(/\n|(?<=\.)\s+/)
      .map((text, index) => ({
        stepNumber: index + 1,
        description: text.trim(),
      }))
      .filter((step) => step.description.length > 0);
  }

  // Array
  if (!Array.isArray(instructions)) return [];

  const result: Instruction[] = [];
  let stepNumber = 1;

  for (const item of instructions) {
    // String item
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (trimmed) {
        result.push({
          stepNumber: stepNumber++,
          description: trimmed,
        });
      }
      continue;
    }

    // HowToStep or similar
    if (item && typeof item === "object") {
      // Check for HowToSection with nested steps
      if (item.itemListElement && Array.isArray(item.itemListElement)) {
        for (const subItem of item.itemListElement) {
          const text = subItem.text?.trim();
          if (text) {
            result.push({
              stepNumber: stepNumber++,
              description: text,
            });
          }
        }
        continue;
      }

      // Regular HowToStep
      const text = item.text?.trim() || item.name?.trim();
      if (text) {
        result.push({
          stepNumber: stepNumber++,
          description: text,
        });
      }
    }
  }

  return result;
}
