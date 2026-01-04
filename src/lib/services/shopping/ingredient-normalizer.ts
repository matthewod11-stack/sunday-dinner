/**
 * Ingredient Normalizer Module
 *
 * Pure functions for normalizing ingredient names to enable consolidation.
 * Handles pluralization, common prefixes, and preparation notes.
 */

/**
 * Common prefixes that should be removed for matching
 * (but preserved in display)
 */
const REMOVABLE_PREFIXES = [
  "fresh",
  "freshly",
  "organic",
  "large",
  "medium",
  "small",
  "extra",
  "extra-large",
  "xl",
  "jumbo",
  "whole",
  "ground",
  "minced",
  "diced",
  "sliced",
  "chopped",
  "crushed",
  "grated",
  "shredded",
  "melted",
  "softened",
  "cold",
  "hot",
  "warm",
  "room temperature",
  "ripe",
  "unripe",
  "dried",
  "canned",
  "frozen",
  "thawed",
  "cooked",
  "raw",
  "boneless",
  "skinless",
  "bone-in",
  "skin-on",
  "unsalted",
  "salted",
  "reduced sodium",
  "low sodium",
  "low fat",
  "fat free",
  "nonfat",
  "skim",
  "2%",
  "1%",
  "whole",
];

/**
 * Irregular plurals that need special handling
 */
const IRREGULAR_PLURALS: Record<string, string> = {
  tomatoes: "tomato",
  potatoes: "potato",
  leaves: "leaf",
  loaves: "loaf",
  halves: "half",
  knives: "knife",
  shelves: "shelf",
  cherries: "cherry",
  berries: "berry",
  strawberries: "strawberry",
  blueberries: "blueberry",
  raspberries: "raspberry",
  blackberries: "blackberry",
  cranberries: "cranberry",
  anchovies: "anchovy",
};

/**
 * Normalize an ingredient name for matching
 *
 * "Fresh Organic Tomatoes, diced" → "tomato"
 * "2% Milk" → "milk"
 * "All-Purpose Flour" → "all-purpose flour"
 */
export function normalizeIngredientName(name: string): string {
  let normalized = name.toLowerCase().trim();

  // Remove text in parentheses (optional info)
  normalized = normalized.replace(/\([^)]*\)/g, "").trim();

  // Remove text after comma (usually prep notes)
  normalized = normalized.split(",")[0]?.trim() ?? normalized;

  // Remove removable prefixes
  for (const prefix of REMOVABLE_PREFIXES) {
    const prefixPattern = new RegExp(`^${prefix}\\s+`, "i");
    normalized = normalized.replace(prefixPattern, "");
  }

  // Handle irregular plurals
  for (const [plural, singular] of Object.entries(IRREGULAR_PLURALS)) {
    if (normalized === plural) {
      normalized = singular;
      break;
    }
  }

  // Handle regular plurals (ending in 's' or 'es')
  normalized = depluralize(normalized);

  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

/**
 * Depluralize a word (simple English rules)
 */
function depluralize(word: string): string {
  // Don't depluralize short words
  if (word.length <= 3) return word;

  // Words ending in 'ies' → 'y' (e.g., "berries" → "berry")
  // Already handled by IRREGULAR_PLURALS, but for others:
  if (word.endsWith("ies") && word.length > 4) {
    return word.slice(0, -3) + "y";
  }

  // Words ending in 'es' where base ends in s, x, z, ch, sh
  if (word.endsWith("es") && word.length > 3) {
    const base = word.slice(0, -2);
    const baseEnd = base.slice(-1);
    const baseTwoEnd = base.slice(-2);

    if (
      baseEnd === "s" ||
      baseEnd === "x" ||
      baseEnd === "z" ||
      baseTwoEnd === "ch" ||
      baseTwoEnd === "sh"
    ) {
      return base;
    }
  }

  // Words ending in 's' (regular plural)
  if (word.endsWith("s") && !word.endsWith("ss")) {
    // Check it's not a word that naturally ends in 's'
    const exceptions = ["hummus", "couscous", "asparagus", "citrus"];
    if (!exceptions.includes(word)) {
      return word.slice(0, -1);
    }
  }

  return word;
}

/**
 * Get a display-friendly version of the ingredient name
 *
 * Preserves capitalization for proper nouns, etc.
 */
export function displayIngredientName(normalizedName: string): string {
  // Title case, but preserve some words as lowercase
  const lowercaseWords = ["a", "an", "the", "and", "or", "of", "for", "with"];

  return normalizedName
    .split(" ")
    .map((word, index) => {
      if (index > 0 && lowercaseWords.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Check if two ingredient names likely refer to the same ingredient
 *
 * Uses normalized matching with some fuzzy tolerance
 */
export function isSameIngredient(nameA: string, nameB: string): boolean {
  const normalizedA = normalizeIngredientName(nameA);
  const normalizedB = normalizeIngredientName(nameB);

  // Exact match after normalization
  if (normalizedA === normalizedB) return true;

  // Check if one contains the other (for compound ingredients)
  // e.g., "tomato" matches "roma tomato"
  if (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA)) {
    return true;
  }

  return false;
}

/**
 * Extract the canonical name from multiple variations
 *
 * Given ["Fresh Tomatoes", "tomatoes, diced", "Roma Tomatoes"],
 * returns the most complete/specific version.
 */
export function selectCanonicalName(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0] ?? "";

  // Prefer names without prep notes (comma)
  const withoutPrep = names.filter((n) => !n.includes(","));
  if (withoutPrep.length > 0) {
    // Return the longest one (usually most specific)
    return withoutPrep.sort((a, b) => b.length - a.length)[0] ?? names[0] ?? "";
  }

  // Return the first one before the comma
  const first = names[0];
  if (first) {
    return first.split(",")[0]?.trim() ?? first;
  }

  return "";
}

/**
 * Pluralize a word for display when quantity > 1
 */
export function pluralizeForDisplay(word: string, quantity: number): string {
  if (quantity <= 1) return word;

  // Check reverse irregular plurals
  for (const [plural, singular] of Object.entries(IRREGULAR_PLURALS)) {
    if (word.toLowerCase() === singular) {
      // Preserve original capitalization
      if (word[0] === word[0]?.toUpperCase()) {
        return plural.charAt(0).toUpperCase() + plural.slice(1);
      }
      return plural;
    }
  }

  // Regular pluralization rules
  const lower = word.toLowerCase();

  if (
    lower.endsWith("s") ||
    lower.endsWith("x") ||
    lower.endsWith("z") ||
    lower.endsWith("ch") ||
    lower.endsWith("sh")
  ) {
    return word + "es";
  }

  if (lower.endsWith("y") && !/[aeiou]y$/.test(lower)) {
    return word.slice(0, -1) + "ies";
  }

  return word + "s";
}
