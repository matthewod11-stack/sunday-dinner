import type { ShoppingList, ShoppingItem, Meal, StoreSection } from "@/types";

/**
 * Options for listing shopping items
 */
export interface ListItemsOptions {
  /** Filter by store section */
  section?: StoreSection;
  /** Include checked items */
  includeChecked?: boolean;
  /** Include staples */
  includeStaples?: boolean;
}

/**
 * ShoppingService: Generates and manages shopping lists
 *
 * Owned by Agent A (Week 5).
 * Depends on: Supabase, localStorage (for staples)
 *
 * Responsibilities:
 * - Generate shopping lists from meal recipes
 * - Consolidate and reconcile ingredient units
 * - Group items by store section
 * - Manage staples (persistent across meals)
 * - Track checked items
 *
 * Unit Reconciliation:
 * - "2 cups milk" + "1 cup milk" = "3 cups milk"
 * - Handles: cups, tbsp, tsp, oz, lb, g, kg
 * - Flags ambiguous quantities: "to taste", "a handful"
 *
 * @example
 * ```typescript
 * const shoppingService: ShoppingService = new ShoppingService(supabase);
 *
 * // Generate list
 * const list = await shoppingService.generate(meal);
 * console.log(list.items.length); // Consolidated items
 * console.log(list.unreconcilable); // Items that couldn't be consolidated
 *
 * // While shopping
 * await shoppingService.checkItem(list.id, itemId);
 * ```
 */
export interface ShoppingService {
  /**
   * Generate shopping list from meal recipes
   *
   * Consolidates ingredients across all recipes,
   * reconciles units, and groups by store section.
   *
   * @param meal - Meal with recipes and scaling
   * @returns Generated shopping list
   */
  generate(meal: Meal): Promise<ShoppingList>;

  /**
   * Get a shopping list by ID
   *
   * @param listId - Shopping list UUID
   * @returns Shopping list or null if not found
   */
  get(listId: string): Promise<ShoppingList | null>;

  /**
   * Get shopping list for a meal
   *
   * @param mealId - Meal UUID
   * @returns Shopping list or null if not generated yet
   */
  getByMealId(mealId: string): Promise<ShoppingList | null>;

  /**
   * Save shopping list to database
   *
   * @param list - Shopping list to save
   * @returns Saved list with ID
   */
  save(list: ShoppingList): Promise<ShoppingList>;

  /**
   * Delete a shopping list
   *
   * @param listId - Shopping list UUID
   */
  delete(listId: string): Promise<void>;

  /**
   * Check off an item
   *
   * @param listId - Shopping list UUID
   * @param itemId - Item UUID
   * @returns Updated shopping list
   */
  checkItem(listId: string, itemId: string): Promise<ShoppingList>;

  /**
   * Uncheck an item
   *
   * @param listId - Shopping list UUID
   * @param itemId - Item UUID
   * @returns Updated shopping list
   */
  uncheckItem(listId: string, itemId: string): Promise<ShoppingList>;

  /**
   * Add notes to an item
   *
   * @param listId - Shopping list UUID
   * @param itemId - Item UUID
   * @param notes - Notes to add ("Buy organic", "from Costco")
   * @returns Updated shopping list
   */
  addItemNotes(listId: string, itemId: string, notes: string): Promise<ShoppingList>;

  // =========================================================================
  // Staples Management (localStorage)
  // =========================================================================

  /**
   * Mark an item as a staple
   *
   * Staples persist in localStorage and are inherited by future meals.
   * "I always have salt" means salt won't appear on future lists.
   *
   * @param itemName - Normalized ingredient name
   */
  markStaple(itemName: string): Promise<void>;

  /**
   * Remove staple status from an item
   *
   * @param itemName - Normalized ingredient name
   */
  unmarkStaple(itemName: string): Promise<void>;

  /**
   * Get all staples from localStorage
   *
   * @returns Array of staple item names
   */
  getStaples(): Promise<string[]>;

  /**
   * Check if an item is a staple
   *
   * @param itemName - Normalized ingredient name
   * @returns True if item is marked as staple
   */
  isStaple(itemName: string): Promise<boolean>;

  // =========================================================================
  // Filtering and Organization
  // =========================================================================

  /**
   * Get items by store section
   *
   * @param listId - Shopping list UUID
   * @param section - Store section to filter
   * @returns Items in that section
   */
  getItemsBySection(listId: string, section: StoreSection): Promise<ShoppingItem[]>;

  /**
   * Get unchecked items count
   *
   * @param listId - Shopping list UUID
   * @returns Number of items not yet checked off
   */
  getUncheckedCount(listId: string): Promise<number>;

  /**
   * Regenerate list when meal changes
   *
   * Called when recipes are added/removed from meal.
   *
   * @param mealId - Meal UUID
   * @returns New shopping list
   */
  regenerate(mealId: string): Promise<ShoppingList>;
}
