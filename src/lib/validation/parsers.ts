/**
 * Parsing utilities for form input transformation
 *
 * Handles common form input transformations like fraction parsing,
 * number coercion, and string normalization.
 */

/**
 * Parse a fraction string to a decimal number
 *
 * Supports:
 * - Simple fractions: "1/2" → 0.5
 * - Mixed numbers: "1 1/2" or "1-1/2" → 1.5
 * - Decimals: "1.5" → 1.5
 * - Whole numbers: "2" → 2
 * - Empty/whitespace: "" → null
 *
 * @param input - String potentially containing a fraction
 * @returns Parsed number or null if invalid/empty
 *
 * @example
 * parseFraction("1/2")      // 0.5
 * parseFraction("2 1/4")    // 2.25
 * parseFraction("3")        // 3
 * parseFraction("")         // null
 * parseFraction("to taste") // null
 */
export function parseFraction(input: string | undefined | null): number | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (trimmed === "") {
    return null;
  }

  // Try parsing as decimal first (handles "1.5", "2.75", etc.)
  const decimal = parseFloat(trimmed);
  if (!isNaN(decimal) && !trimmed.includes("/")) {
    return decimal;
  }

  // Match mixed number: "2 1/4" or "2-1/4"
  const mixedMatch = trimmed.match(/^(\d+)[\s-]+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]!, 10);
    const numerator = parseInt(mixedMatch[2]!, 10);
    const denominator = parseInt(mixedMatch[3]!, 10);

    if (denominator === 0) {
      return null; // Division by zero
    }

    return whole + numerator / denominator;
  }

  // Match simple fraction: "3/4"
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1]!, 10);
    const denominator = parseInt(fractionMatch[2]!, 10);

    if (denominator === 0) {
      return null;
    }

    return numerator / denominator;
  }

  // Could not parse
  return null;
}

/**
 * Parse a positive integer from string input
 *
 * Handles empty strings and non-numeric input gracefully.
 *
 * @param input - String potentially containing a number
 * @returns Parsed positive integer or null if invalid/empty
 *
 * @example
 * parsePositiveInt("42")   // 42
 * parsePositiveInt("")     // null
 * parsePositiveInt("-5")   // null (negative not allowed)
 * parsePositiveInt("3.14") // null (not an integer)
 */
export function parsePositiveInt(
  input: string | undefined | null
): number | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (trimmed === "") {
    return null;
  }

  const parsed = parseInt(trimmed, 10);

  // Must be a valid integer, positive, and the string must fully parse
  if (isNaN(parsed) || parsed <= 0 || parsed.toString() !== trimmed) {
    return null;
  }

  return parsed;
}

/**
 * Parse a non-negative integer from string input
 *
 * Similar to parsePositiveInt but allows zero.
 *
 * @param input - String potentially containing a number
 * @returns Parsed non-negative integer or null if invalid/empty
 */
export function parseNonNegativeInt(
  input: string | undefined | null
): number | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (trimmed === "") {
    return null;
  }

  const parsed = parseInt(trimmed, 10);

  if (isNaN(parsed) || parsed < 0 || parsed.toString() !== trimmed) {
    return null;
  }

  return parsed;
}

/**
 * Normalize whitespace in a string
 *
 * Trims leading/trailing whitespace and collapses internal
 * whitespace to single spaces.
 *
 * @param input - String to normalize
 * @returns Normalized string or undefined if empty
 *
 * @example
 * normalizeString("  hello   world  ") // "hello world"
 * normalizeString("")                  // undefined
 */
export function normalizeString(
  input: string | undefined | null
): string | undefined {
  if (!input || typeof input !== "string") {
    return undefined;
  }

  const normalized = input.trim().replace(/\s+/g, " ");
  return normalized === "" ? undefined : normalized;
}

/**
 * Transform empty string to null
 *
 * Used for optional numeric fields where empty input should
 * result in null (not undefined).
 *
 * @param input - String input
 * @returns Original string or null if empty
 */
export function emptyToNull(
  input: string | undefined | null
): string | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  return input.trim() === "" ? null : input;
}

/**
 * Parse a datetime string to ISO 8601 format
 *
 * Handles various input formats and ensures output is valid ISO string.
 *
 * @param input - Date string or Date object
 * @returns ISO 8601 datetime string
 * @throws Error if input is invalid
 */
export function parseDateTime(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  return date.toISOString();
}
