import { z } from "zod";

/**
 * Store sections for organizing shopping list
 */
export type StoreSection = "produce" | "dairy" | "meat" | "pantry" | "frozen" | "other";

/**
 * Why an item couldn't be reconciled/consolidated
 */
export type UnreconcilableReason =
  | "ambiguous_quantity" // "to taste", "a handful"
  | "unusual_unit" // unit not in standard list
  | "uncategorized"; // couldn't determine store section

/**
 * Consolidated shopping list item
 *
 * Quantities are reconciled across recipes:
 * "2 cups milk" + "1 cup milk" = "3 cups milk"
 */
export interface ShoppingItem {
  /** Unique identifier */
  id?: string;
  /** Normalized ingredient name (canonical form) */
  name: string;
  /** Consolidated quantity (null if ambiguous) */
  quantity: number | null;
  /** Normalized unit (cups, tbsp, oz, lb, g, etc.) */
  unit: string | null;

  /** Store section for organization */
  section: StoreSection;
  /** Whether this is a staple ("I always have this") */
  isStaple?: boolean;

  /** Which recipes need this ingredient */
  sourceRecipeIds?: string[];
  /** Original ingredients that were consolidated */
  sourceIngredients?: Array<{
    recipeId: string;
    ingredientId: string;
    originalQuantity: number | null;
    originalUnit: string | null;
  }>;

  /** Whether item has been checked off */
  checked?: boolean;
  /** When item was purchased */
  purchasedAt?: string;
  /** Shopping notes: "Buy organic", "from Costco" */
  notes?: string;
}

/**
 * Item that couldn't be reconciled automatically
 */
export interface UnreconcilableItem {
  /** Original ingredient name */
  name: string;
  /** Why reconciliation failed */
  reason: UnreconcilableReason;
  /** Example values that caused the issue */
  examples?: string[];
  /** Source recipe IDs */
  recipeIds?: string[];
}

/**
 * Full shopping list for a meal
 *
 * Generated from meal recipes with quantities consolidated
 * and organized by store section.
 */
export interface ShoppingList {
  /** Unique identifier */
  id?: string;
  /** Reference to parent meal */
  mealId: string;

  /** Consolidated and organized items */
  items: ShoppingItem[];

  /** Items that couldn't be automatically reconciled */
  unreconcilable?: UnreconcilableItem[];

  /** Summary statistics */
  totalItems?: number;
  checkedItems?: number;

  /** Database timestamps */
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Standard units for reconciliation
 *
 * Used to normalize and convert between compatible units:
 * - Volume: cups, tbsp, tsp, fl oz, ml, l
 * - Weight: oz, lb, g, kg
 * - Count: (unitless, e.g., "3 eggs")
 */
export const STANDARD_UNITS = {
  volume: ["cups", "cup", "tbsp", "tsp", "fl oz", "ml", "l", "quart", "pint", "gallon"],
  weight: ["oz", "lb", "g", "kg"],
  count: [null, "piece", "pieces", "whole"],
} as const;

/**
 * Unit conversion factors (to base unit)
 *
 * Volume base: cups
 * Weight base: oz
 */
export const UNIT_CONVERSIONS: Record<string, { base: string; factor: number }> = {
  // Volume (base: cups)
  cup: { base: "cups", factor: 1 },
  cups: { base: "cups", factor: 1 },
  tbsp: { base: "cups", factor: 1 / 16 },
  tsp: { base: "cups", factor: 1 / 48 },
  "fl oz": { base: "cups", factor: 1 / 8 },
  ml: { base: "cups", factor: 1 / 236.588 },
  l: { base: "cups", factor: 4.22675 },
  quart: { base: "cups", factor: 4 },
  pint: { base: "cups", factor: 2 },
  gallon: { base: "cups", factor: 16 },

  // Weight (base: oz)
  oz: { base: "oz", factor: 1 },
  lb: { base: "oz", factor: 16 },
  g: { base: "oz", factor: 1 / 28.3495 },
  kg: { base: "oz", factor: 35.274 },
};

// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================

export const StoreSectionSchema = z.enum([
  "produce",
  "dairy",
  "meat",
  "pantry",
  "frozen",
  "other",
]);

export const UnreconcilableReasonSchema = z.enum([
  "ambiguous_quantity",
  "unusual_unit",
  "uncategorized",
]);

export const ShoppingItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  quantity: z.number().positive().nullable(),
  unit: z.string().nullable(),
  section: StoreSectionSchema,
  isStaple: z.boolean().optional(),
  sourceRecipeIds: z.array(z.string().uuid()).optional(),
  sourceIngredients: z
    .array(
      z.object({
        recipeId: z.string().uuid(),
        ingredientId: z.string().uuid(),
        originalQuantity: z.number().positive().nullable(),
        originalUnit: z.string().nullable(),
      })
    )
    .optional(),
  checked: z.boolean().optional(),
  purchasedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const UnreconcilableItemSchema = z.object({
  name: z.string().min(1),
  reason: UnreconcilableReasonSchema,
  examples: z.array(z.string()).optional(),
  recipeIds: z.array(z.string().uuid()).optional(),
});

export const ShoppingListSchema = z.object({
  id: z.string().uuid().optional(),
  mealId: z.string().uuid(),
  items: z.array(ShoppingItemSchema),
  unreconcilable: z.array(UnreconcilableItemSchema).optional(),
  totalItems: z.number().int().nonnegative().optional(),
  checkedItems: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Type inference from schemas
export type ShoppingItemInput = z.infer<typeof ShoppingItemSchema>;
export type UnreconcilableItemInput = z.infer<typeof UnreconcilableItemSchema>;
export type ShoppingListInput = z.infer<typeof ShoppingListSchema>;
