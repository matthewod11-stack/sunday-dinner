import type { SupabaseClient } from "@supabase/supabase-js";
import type { ShoppingService } from "@/contracts/shopping-service";
import type {
  ShoppingList,
  ShoppingItem,
  UnreconcilableItem,
  StoreSection,
} from "@/types/shopping";
import type { Meal, Recipe } from "@/types";
import { v4 as uuidv4 } from "uuid";

import {
  combineQuantities,
  isAmbiguousQuantity,
  canReconcile,
} from "./unit-reconciliation";
import {
  normalizeIngredientName,
  displayIngredientName,
  selectCanonicalName,
} from "./ingredient-normalizer";
import { classifySection, sortBySection } from "./section-classifier";

/**
 * Row shape from Supabase shopping_lists table
 */
interface ShoppingListRow {
  id: string;
  meal_id: string;
  items: ShoppingItem[];
  unreconcilable: UnreconcilableItem[] | null;
  total_items: number;
  checked_items: number;
  created_at: string;
  updated_at: string;
}

/**
 * Intermediate structure for grouping ingredients during reconciliation
 */
interface IngredientGroup {
  normalizedName: string;
  displayName: string;
  items: Array<{
    recipeId: string;
    ingredientId: string;
    originalName: string;
    quantity: number | null;
    unit: string | null;
    notes?: string;
    scaledQuantity: number | null;
  }>;
}

const STAPLES_STORAGE_KEY = "sunday-dinner-staples";

/**
 * SupabaseShoppingService: ShoppingService implementation using Supabase
 *
 * Generates shopping lists from meal recipes with:
 * - Unit reconciliation (cups, tbsp, oz, lb)
 * - Ingredient consolidation across recipes
 * - Store section grouping
 * - Staples management via localStorage
 */
export class SupabaseShoppingService implements ShoppingService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Generate shopping list from meal recipes
   */
  async generate(meal: Meal): Promise<ShoppingList> {
    if (!meal.id) {
      throw new Error("Meal must have an ID to generate shopping list");
    }

    // Get staples to filter
    const staples = await this.getStaples();
    const stapleSet = new Set(staples.map((s) => s.toLowerCase()));

    // Group ingredients by normalized name
    const groups = this.groupIngredients(meal);

    // Reconcile units and create shopping items
    const items: ShoppingItem[] = [];
    const unreconcilable: UnreconcilableItem[] = [];

    for (const group of groups) {
      const result = this.reconcileGroup(group);

      if (result.item) {
        // Check if this is a staple
        const isStaple = stapleSet.has(result.item.name.toLowerCase());
        result.item.isStaple = isStaple;
        items.push(result.item);
      }

      if (result.unreconcilable) {
        unreconcilable.push(result.unreconcilable);
      }
    }

    // Sort by section
    const sortedItems = sortBySection(items);

    // Create the shopping list
    const shoppingList: ShoppingList = {
      id: uuidv4(),
      mealId: meal.id,
      items: sortedItems,
      unreconcilable: unreconcilable.length > 0 ? unreconcilable : undefined,
      totalItems: sortedItems.length,
      checkedItems: 0,
    };

    // Save to database
    return this.save(shoppingList);
  }

  /**
   * Get a shopping list by ID
   */
  async get(listId: string): Promise<ShoppingList | null> {
    const { data, error } = await this.supabase
      .from("shopping_lists")
      .select("*")
      .eq("id", listId)
      .single<ShoppingListRow>();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch shopping list: ${error.message}`);
    }

    if (!data) return null;

    return this.transformRow(data);
  }

  /**
   * Get shopping list for a meal
   */
  async getByMealId(mealId: string): Promise<ShoppingList | null> {
    const { data, error } = await this.supabase
      .from("shopping_lists")
      .select("*")
      .eq("meal_id", mealId)
      .single<ShoppingListRow>();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch shopping list: ${error.message}`);
    }

    if (!data) return null;

    return this.transformRow(data);
  }

  /**
   * Save shopping list to database
   */
  async save(list: ShoppingList): Promise<ShoppingList> {
    const { data, error } = await this.supabase
      .from("shopping_lists")
      .upsert(
        {
          id: list.id,
          meal_id: list.mealId,
          items: list.items,
          unreconcilable: list.unreconcilable ?? [],
          total_items: list.totalItems ?? list.items.length,
          checked_items:
            list.checkedItems ?? list.items.filter((i) => i.checked).length,
        },
        { onConflict: "meal_id" }
      )
      .select()
      .single<ShoppingListRow>();

    if (error) {
      throw new Error(`Failed to save shopping list: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from shopping list save");
    }

    return this.transformRow(data);
  }

  /**
   * Delete a shopping list
   */
  async delete(listId: string): Promise<void> {
    const { error } = await this.supabase
      .from("shopping_lists")
      .delete()
      .eq("id", listId);

    if (error) {
      throw new Error(`Failed to delete shopping list: ${error.message}`);
    }
  }

  /**
   * Check off an item
   */
  async checkItem(listId: string, itemId: string): Promise<ShoppingList> {
    const list = await this.get(listId);
    if (!list) {
      throw new Error("Shopping list not found");
    }

    const updatedItems = list.items.map((item) =>
      item.id === itemId ? { ...item, checked: true } : item
    );

    return this.save({
      ...list,
      items: updatedItems,
      checkedItems: updatedItems.filter((i) => i.checked).length,
    });
  }

  /**
   * Uncheck an item
   */
  async uncheckItem(listId: string, itemId: string): Promise<ShoppingList> {
    const list = await this.get(listId);
    if (!list) {
      throw new Error("Shopping list not found");
    }

    const updatedItems = list.items.map((item) =>
      item.id === itemId ? { ...item, checked: false } : item
    );

    return this.save({
      ...list,
      items: updatedItems,
      checkedItems: updatedItems.filter((i) => i.checked).length,
    });
  }

  /**
   * Add notes to an item
   */
  async addItemNotes(
    listId: string,
    itemId: string,
    notes: string
  ): Promise<ShoppingList> {
    const list = await this.get(listId);
    if (!list) {
      throw new Error("Shopping list not found");
    }

    const updatedItems = list.items.map((item) =>
      item.id === itemId ? { ...item, notes } : item
    );

    return this.save({
      ...list,
      items: updatedItems,
    });
  }

  // =========================================================================
  // Staples Management (localStorage)
  // =========================================================================

  /**
   * Mark an item as a staple
   */
  async markStaple(itemName: string): Promise<void> {
    const staples = await this.getStaples();
    const normalized = itemName.toLowerCase().trim();

    if (!staples.includes(normalized)) {
      staples.push(normalized);
      this.saveStaples(staples);
    }
  }

  /**
   * Remove staple status from an item
   */
  async unmarkStaple(itemName: string): Promise<void> {
    const staples = await this.getStaples();
    const normalized = itemName.toLowerCase().trim();

    const filtered = staples.filter((s) => s !== normalized);
    this.saveStaples(filtered);
  }

  /**
   * Get all staples from localStorage
   */
  async getStaples(): Promise<string[]> {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = localStorage.getItem(STAPLES_STORAGE_KEY);
      if (!stored) return [];

      const data = JSON.parse(stored) as { items: string[] };
      return data.items ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Check if an item is a staple
   */
  async isStaple(itemName: string): Promise<boolean> {
    const staples = await this.getStaples();
    const normalized = itemName.toLowerCase().trim();
    return staples.includes(normalized);
  }

  /**
   * Save staples to localStorage
   */
  private saveStaples(staples: string[]): void {
    if (typeof window === "undefined") return;

    const data = {
      items: staples,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STAPLES_STORAGE_KEY, JSON.stringify(data));
  }

  // =========================================================================
  // Filtering and Organization
  // =========================================================================

  /**
   * Get items by store section
   */
  async getItemsBySection(
    listId: string,
    section: StoreSection
  ): Promise<ShoppingItem[]> {
    const list = await this.get(listId);
    if (!list) return [];

    return list.items.filter((item) => item.section === section);
  }

  /**
   * Get unchecked items count
   */
  async getUncheckedCount(listId: string): Promise<number> {
    const list = await this.get(listId);
    if (!list) return 0;

    return list.items.filter((item) => !item.checked).length;
  }

  /**
   * Regenerate list when meal changes
   */
  async regenerate(mealId: string): Promise<ShoppingList> {
    // Delete existing list
    const existing = await this.getByMealId(mealId);
    if (existing && existing.id) {
      await this.delete(existing.id);
    }

    // Fetch meal and regenerate
    const { data: mealData, error: mealError } = await this.supabase
      .from("meals")
      .select("*")
      .eq("id", mealId)
      .single();

    if (mealError || !mealData) {
      throw new Error("Meal not found");
    }

    // Fetch recipes for the meal
    const { data: mealRecipes } = await this.supabase
      .from("meal_recipes")
      .select(
        `
        *,
        recipes (*)
      `
      )
      .eq("meal_id", mealId);

    const meal: Meal = {
      id: mealData.id as string,
      name: mealData.name as string,
      serveTime: mealData.serve_time as string,
      guestCount: mealData.guest_count as { total: number },
      status: mealData.status as Meal["status"],
      recipes: (mealRecipes ?? []).map((mr) => ({
        recipe: mr.recipes as Recipe,
        scaling: {
          recipeId: mr.recipe_id as string,
          originalServingSize: mr.original_serving_size as number,
          targetServingSize: mr.target_serving_size as number,
          multiplier: mr.multiplier as number,
        },
      })),
    };

    return this.generate(meal);
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  /**
   * Group ingredients from all meal recipes by normalized name
   */
  private groupIngredients(meal: Meal): IngredientGroup[] {
    const groups = new Map<string, IngredientGroup>();

    for (const { recipe, scaling } of meal.recipes) {
      if (!recipe.id) continue;

      for (const ingredient of recipe.ingredients) {
        const normalizedName = normalizeIngredientName(ingredient.name);
        const scaledQuantity =
          ingredient.quantity !== null
            ? ingredient.quantity * scaling.multiplier
            : null;

        let group = groups.get(normalizedName);
        if (!group) {
          group = {
            normalizedName,
            displayName: normalizedName,
            items: [],
          };
          groups.set(normalizedName, group);
        }

        group.items.push({
          recipeId: recipe.id,
          ingredientId: ingredient.id ?? uuidv4(),
          originalName: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          notes: ingredient.notes,
          scaledQuantity,
        });
      }
    }

    // Update display names to canonical versions
    const groupArray = Array.from(groups.values());
    for (const group of groupArray) {
      group.displayName = displayIngredientName(
        selectCanonicalName(group.items.map((i: IngredientGroup["items"][0]) => i.originalName))
      );
    }

    return groupArray;
  }

  /**
   * Reconcile a group of ingredients into a single shopping item
   */
  private reconcileGroup(group: IngredientGroup): {
    item: ShoppingItem | null;
    unreconcilable: UnreconcilableItem | null;
  } {
    // Check for ambiguous quantities
    const hasAmbiguous = group.items.some((item) =>
      isAmbiguousQuantity(item.scaledQuantity, item.notes)
    );

    if (hasAmbiguous) {
      return {
        item: this.createItemWithoutQuantity(group),
        unreconcilable: {
          name: group.displayName,
          reason: "ambiguous_quantity",
          examples: group.items
            .filter((i) => isAmbiguousQuantity(i.scaledQuantity, i.notes))
            .map((i) => i.notes ?? "no quantity specified")
            .slice(0, 3),
          recipeIds: Array.from(new Set(group.items.map((i) => i.recipeId))),
        },
      };
    }

    // Check if all units are reconcilable
    const units = group.items.map((i) => i.unit);
    const firstUnit = units[0] ?? null;
    const allReconcilable = units.every((u) => canReconcile(firstUnit, u));

    if (!allReconcilable) {
      // Different unit groups, can't combine
      return {
        item: this.createItemWithMixedUnits(group),
        unreconcilable: {
          name: group.displayName,
          reason: "unusual_unit",
          examples: Array.from(new Set(units.filter((u): u is string => Boolean(u)))),
          recipeIds: Array.from(new Set(group.items.map((i) => i.recipeId))),
        },
      };
    }

    // Combine quantities
    const combined = combineQuantities(
      group.items.map((i) => ({
        quantity: i.scaledQuantity,
        unit: i.unit,
      }))
    );

    if (!combined) {
      return {
        item: this.createItemWithoutQuantity(group),
        unreconcilable: null,
      };
    }

    const section = classifySection(group.normalizedName);

    return {
      item: {
        id: uuidv4(),
        name: group.displayName,
        quantity: combined.quantity,
        unit: combined.unit,
        section,
        sourceRecipeIds: Array.from(new Set(group.items.map((i) => i.recipeId))),
        sourceIngredients: group.items.map((i) => ({
          recipeId: i.recipeId,
          ingredientId: i.ingredientId,
          originalQuantity: i.quantity,
          originalUnit: i.unit,
        })),
        checked: false,
      },
      unreconcilable: null,
    };
  }

  /**
   * Create an item without a consolidated quantity
   */
  private createItemWithoutQuantity(group: IngredientGroup): ShoppingItem {
    const section = classifySection(group.normalizedName);
    const recipeIds = Array.from(new Set(group.items.map((i) => i.recipeId)));

    return {
      id: uuidv4(),
      name: group.displayName,
      quantity: null,
      unit: null,
      section,
      sourceRecipeIds: recipeIds,
      sourceIngredients: group.items.map((i) => ({
        recipeId: i.recipeId,
        ingredientId: i.ingredientId,
        originalQuantity: i.quantity,
        originalUnit: i.unit,
      })),
      checked: false,
      notes: "See recipes for quantities",
    };
  }

  /**
   * Create an item with mixed units that couldn't be reconciled
   */
  private createItemWithMixedUnits(group: IngredientGroup): ShoppingItem {
    const section = classifySection(group.normalizedName);
    const recipeIds = Array.from(new Set(group.items.map((i) => i.recipeId)));

    // Create a note listing all the different measurements
    const measurements = group.items
      .map((i) => {
        if (i.scaledQuantity === null) return null;
        return `${i.scaledQuantity}${i.unit ? ` ${i.unit}` : ""}`;
      })
      .filter(Boolean)
      .join(" + ");

    return {
      id: uuidv4(),
      name: group.displayName,
      quantity: null,
      unit: null,
      section,
      sourceRecipeIds: recipeIds,
      sourceIngredients: group.items.map((i) => ({
        recipeId: i.recipeId,
        ingredientId: i.ingredientId,
        originalQuantity: i.quantity,
        originalUnit: i.unit,
      })),
      checked: false,
      notes: `Mixed units: ${measurements}`,
    };
  }

  /**
   * Transform database row to ShoppingList
   */
  private transformRow(row: ShoppingListRow): ShoppingList {
    return {
      id: row.id,
      mealId: row.meal_id,
      items: row.items ?? [],
      unreconcilable: row.unreconcilable ?? undefined,
      totalItems: row.total_items,
      checkedItems: row.checked_items,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

/**
 * Factory function to create a SupabaseShoppingService
 */
export function createShoppingService(
  supabase: SupabaseClient
): ShoppingService {
  return new SupabaseShoppingService(supabase);
}
