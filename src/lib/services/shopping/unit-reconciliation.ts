/**
 * Unit Reconciliation Module
 *
 * Pure functions for converting and combining compatible units.
 * Volume and weight are separate systems that cannot be mixed.
 */

import { UNIT_CONVERSIONS } from "@/types/shopping";

/**
 * Unit group (volume or weight)
 */
export type UnitGroup = "volume" | "weight" | "count" | "unknown";

/**
 * Normalized unit with quantity in base units
 */
export interface NormalizedUnit {
  quantity: number;
  baseUnit: string;
  group: UnitGroup;
}

/**
 * Result of combining multiple quantities
 */
export interface CombinedQuantity {
  quantity: number;
  unit: string;
  displayQuantity: string; // Human-readable format (e.g., "1½ cups")
}

/**
 * Get the unit group for a given unit
 */
export function getUnitGroup(unit: string | null): UnitGroup {
  if (!unit) return "count";

  const normalizedUnit = unit.toLowerCase().trim();
  const conversion = UNIT_CONVERSIONS[normalizedUnit];

  if (!conversion) return "unknown";

  if (conversion.base === "cups") return "volume";
  if (conversion.base === "oz") return "weight";

  return "unknown";
}

/**
 * Check if two units can be reconciled (same group)
 */
export function canReconcile(unitA: string | null, unitB: string | null): boolean {
  const groupA = getUnitGroup(unitA);
  const groupB = getUnitGroup(unitB);

  // Unknown units can't be reconciled
  if (groupA === "unknown" || groupB === "unknown") return false;

  // Same group (including both being count/null)
  return groupA === groupB;
}

/**
 * Normalize a quantity to its base unit
 *
 * @param quantity - The quantity to normalize
 * @param unit - The unit to normalize
 * @returns Normalized unit with quantity in base units
 */
export function normalizeToBase(
  quantity: number | null,
  unit: string | null
): NormalizedUnit | null {
  if (quantity === null) return null;

  if (!unit) {
    return {
      quantity,
      baseUnit: "count",
      group: "count",
    };
  }

  const normalizedUnit = unit.toLowerCase().trim();
  const conversion = UNIT_CONVERSIONS[normalizedUnit];

  if (!conversion) {
    return {
      quantity,
      baseUnit: normalizedUnit,
      group: "unknown",
    };
  }

  return {
    quantity: quantity * conversion.factor,
    baseUnit: conversion.base,
    group: conversion.base === "cups" ? "volume" : "weight",
  };
}

/**
 * Convert from base unit to a more readable unit
 *
 * Chooses the most appropriate unit for display:
 * - 0.0625 cups → 1 tbsp
 * - 3 cups → 3 cups (not 48 tbsp)
 * - 16 oz → 1 lb
 */
export function simplifyUnit(quantity: number, baseUnit: string): CombinedQuantity {
  if (baseUnit === "count") {
    return {
      quantity,
      unit: "",
      displayQuantity: formatQuantity(quantity),
    };
  }

  if (baseUnit === "cups") {
    return simplifyVolume(quantity);
  }

  if (baseUnit === "oz") {
    return simplifyWeight(quantity);
  }

  // Unknown base unit, return as-is
  return {
    quantity,
    unit: baseUnit,
    displayQuantity: `${formatQuantity(quantity)} ${baseUnit}`,
  };
}

/**
 * Simplify a volume quantity (in cups) to the most readable unit
 */
function simplifyVolume(cups: number): CombinedQuantity {
  // For very small quantities, use tsp
  if (cups < 1 / 16) {
    const tsp = cups * 48;
    if (tsp >= 0.25) {
      return {
        quantity: tsp,
        unit: "tsp",
        displayQuantity: `${formatQuantity(tsp)} tsp`,
      };
    }
  }

  // For small quantities, use tbsp
  if (cups < 0.25) {
    const tbsp = cups * 16;
    if (tbsp >= 0.5) {
      return {
        quantity: tbsp,
        unit: "tbsp",
        displayQuantity: `${formatQuantity(tbsp)} tbsp`,
      };
    }
  }

  // For large quantities, consider quarts or gallons
  if (cups >= 16) {
    const gallons = cups / 16;
    if (Number.isInteger(gallons) || gallons >= 2) {
      return {
        quantity: gallons,
        unit: "gallon",
        displayQuantity: `${formatQuantity(gallons)} gallon${gallons !== 1 ? "s" : ""}`,
      };
    }
  }

  if (cups >= 4) {
    const quarts = cups / 4;
    if (Number.isInteger(quarts) || quarts >= 2) {
      return {
        quantity: quarts,
        unit: "quart",
        displayQuantity: `${formatQuantity(quarts)} quart${quarts !== 1 ? "s" : ""}`,
      };
    }
  }

  // Default to cups
  return {
    quantity: cups,
    unit: cups === 1 ? "cup" : "cups",
    displayQuantity: `${formatQuantity(cups)} ${cups === 1 ? "cup" : "cups"}`,
  };
}

/**
 * Simplify a weight quantity (in oz) to the most readable unit
 */
function simplifyWeight(oz: number): CombinedQuantity {
  // For large quantities, use pounds
  if (oz >= 16) {
    const lb = oz / 16;
    return {
      quantity: lb,
      unit: "lb",
      displayQuantity: `${formatQuantity(lb)} lb`,
    };
  }

  // Default to oz
  return {
    quantity: oz,
    unit: "oz",
    displayQuantity: `${formatQuantity(oz)} oz`,
  };
}

/**
 * Format a quantity for display
 *
 * Handles fractions and rounding for cleaner display:
 * - 1.5 → "1½"
 * - 0.333 → "⅓"
 * - 2.25 → "2¼"
 */
export function formatQuantity(quantity: number): string {
  if (Number.isInteger(quantity)) {
    return quantity.toString();
  }

  const wholePart = Math.floor(quantity);
  const fraction = quantity - wholePart;

  // Common fractions
  const fractionMap: Record<string, string> = {
    "0.125": "⅛",
    "0.25": "¼",
    "0.333": "⅓",
    "0.375": "⅜",
    "0.5": "½",
    "0.625": "⅝",
    "0.666": "⅔",
    "0.667": "⅔",
    "0.75": "¾",
    "0.875": "⅞",
  };

  // Round fraction to 3 decimal places for matching
  const roundedFraction = Math.round(fraction * 1000) / 1000;
  const fractionStr = roundedFraction.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  const unicodeFraction = fractionMap[fractionStr];

  if (unicodeFraction) {
    return wholePart > 0 ? `${wholePart}${unicodeFraction}` : unicodeFraction;
  }

  // Fall back to decimal with reasonable precision
  return quantity.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Combine multiple quantities with the same base unit
 *
 * @param items - Array of quantities with units
 * @returns Combined quantity in the most readable unit
 */
export function combineQuantities(
  items: Array<{ quantity: number | null; unit: string | null }>
): CombinedQuantity | null {
  const validItems = items.filter((item) => item.quantity !== null);

  if (validItems.length === 0) return null;

  // Normalize all to base units
  const normalized = validItems
    .map((item) => normalizeToBase(item.quantity, item.unit))
    .filter((n): n is NormalizedUnit => n !== null);

  if (normalized.length === 0) return null;

  // Check all items are in the same group
  const firstGroup = normalized[0]?.group;
  const firstBaseUnit = normalized[0]?.baseUnit;

  if (!firstGroup || !firstBaseUnit) return null;

  const allSameGroup = normalized.every((n) => n.group === firstGroup);
  if (!allSameGroup) {
    // Mixed groups, can't combine
    return null;
  }

  // Sum quantities
  const totalQuantity = normalized.reduce((sum, n) => sum + n.quantity, 0);

  // Simplify to readable unit
  return simplifyUnit(totalQuantity, firstBaseUnit);
}

/**
 * Check if a quantity is ambiguous (non-numeric, "to taste", etc.)
 */
export function isAmbiguousQuantity(quantity: number | null, notes?: string | null): boolean {
  if (quantity === null) return true;

  // Check notes for ambiguous language
  if (notes) {
    const ambiguousPatterns = [
      /to taste/i,
      /a pinch/i,
      /a handful/i,
      /some/i,
      /as needed/i,
      /optional/i,
      /a few/i,
      /a bit/i,
      /a dash/i,
      /a splash/i,
    ];

    return ambiguousPatterns.some((pattern) => pattern.test(notes));
  }

  return false;
}

/**
 * Parse a quantity string that may include fractions
 *
 * "1/2" → 0.5
 * "1 1/2" → 1.5
 * "2" → 2
 */
export function parseQuantityString(str: string): number | null {
  const trimmed = str.trim();
  if (!trimmed) return null;

  // Try parsing as a simple number first
  const simple = parseFloat(trimmed);
  if (!isNaN(simple) && isFinite(simple)) {
    return simple;
  }

  // Handle fractions like "1/2"
  const fractionMatch = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fractionMatch) {
    const [, num, denom] = fractionMatch;
    const numerator = parseInt(num ?? "0", 10);
    const denominator = parseInt(denom ?? "1", 10);
    if (denominator !== 0) {
      return numerator / denominator;
    }
  }

  // Handle mixed fractions like "1 1/2"
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    const [, whole, num, denom] = mixedMatch;
    const wholeNum = parseInt(whole ?? "0", 10);
    const numerator = parseInt(num ?? "0", 10);
    const denominator = parseInt(denom ?? "1", 10);
    if (denominator !== 0) {
      return wholeNum + numerator / denominator;
    }
  }

  return null;
}
