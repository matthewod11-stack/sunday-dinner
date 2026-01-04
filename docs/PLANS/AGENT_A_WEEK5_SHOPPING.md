# Week 5: Shopping List Generation — Agent A Plan

**Date:** 2026-01-03
**Phase:** Phase 2, Week 5 (Core Features)
**Agent:** A (Shopping list, Recipes)

---

## Overview

Implement shopping list generation from meal recipes with:
- Unit reconciliation (cups + tbsp → combined volume)
- Ingredient consolidation across multiple recipes
- Store section grouping (Produce, Dairy, Meat, Pantry, Frozen)
- Staples management (persistent "I always have this" items)
- Print-friendly view

## Architecture

### Files to Create

```
src/lib/services/shopping/
├── index.ts                    # Barrel export
├── supabase-shopping-service.ts # ShoppingService implementation
├── unit-reconciliation.ts      # Pure functions for unit conversion
├── ingredient-normalizer.ts    # Name normalization, pluralization
└── section-classifier.ts       # Store section assignment

src/components/shopping/
├── index.ts                    # Barrel export
├── shopping-list.tsx           # Main list component
├── shopping-item.tsx           # Individual item with checkbox
├── section-group.tsx           # Collapsible store section
├── staple-toggle.tsx           # "I always have this" toggle
├── unreconcilable-banner.tsx   # Warning for ambiguous items
└── print-view.tsx              # Print-optimized layout

src/app/shopping/
├── page.tsx                    # Shopping list selection/navigation
└── [mealId]/
    └── page.tsx                # Shopping list for specific meal

src/app/api/shopping/
├── route.ts                    # POST to generate, GET to list
└── [id]/
    └── route.ts                # GET/PATCH/DELETE specific list
```

### Database

Shopping lists will be stored in Supabase as JSONB (similar to recipes):

```sql
-- Already exists in schema, just need to implement
-- shopping_lists table with items as JSONB array
```

---

## Implementation Order

### 1. Unit Reconciliation Logic (Core)

**Purpose:** Convert and combine compatible units.

**Strategy:**
- Define unit groups: VOLUME (cups, tbsp, tsp, fl oz, ml) and WEIGHT (oz, lb, g, kg)
- Convert to base unit within group (cups for volume, oz for weight)
- Cannot mix volume and weight (flour: weight varies by measuring method)

**Key Functions:**
```typescript
function normalizeUnit(quantity: number, unit: string): { quantity: number; baseUnit: string }
function canReconcile(unitA: string, unitB: string): boolean
function combineQuantities(items: { quantity: number; unit: string }[]): { quantity: number; unit: string }
```

### 2. Ingredient Normalizer

**Purpose:** Match "2 cups Milk" with "1 cup milk" and "milk, whole".

**Strategy:**
- Lowercase, trim whitespace
- Remove common prefixes: "fresh", "organic", "large", etc.
- Handle pluralization: "tomatoes" → "tomato"
- Fuzzy match for variations (future enhancement)

### 3. Section Classifier

**Purpose:** Assign each ingredient to a store section.

**Strategy:**
- Keyword-based classification with fallback to "other"
- Configurable mappings for common ingredients

```typescript
const SECTION_KEYWORDS: Record<StoreSection, string[]> = {
  produce: ["tomato", "onion", "garlic", "lettuce", "carrot", ...],
  dairy: ["milk", "butter", "cheese", "cream", "yogurt", ...],
  meat: ["chicken", "beef", "pork", "turkey", "bacon", ...],
  pantry: ["flour", "sugar", "salt", "oil", "rice", ...],
  frozen: ["ice cream", "frozen", ...],
};
```

### 4. ShoppingService Implementation

Implements `ShoppingService` contract:
- `generate(meal)`: Main entry point
  1. Fetch meal with all recipes
  2. Scale ingredients by multiplier
  3. Normalize ingredient names
  4. Group by normalized name
  5. Reconcile units within groups
  6. Flag unreconcilable items
  7. Assign store sections
  8. Filter out staples
  9. Save to database

### 5. UI Components

**shopping-list.tsx:**
- Sections as collapsible accordions
- Progress indicator (X of Y checked)
- "Show staples" toggle

**shopping-item.tsx:**
- Checkbox with strike-through on check
- Quantity + unit display
- Recipe source indicator (which recipes need this)
- "I always have this" toggle

**print-view.tsx:**
- No interactive elements
- Compact layout
- Section headers
- Checkbox squares (empty) for manual check-off

### 6. Staples Management

**localStorage Schema:**
```typescript
interface StaplesStore {
  items: string[];  // Normalized ingredient names
  updatedAt: string;
}
```

**Key:** `sunday-dinner-staples`

---

## Edge Cases

1. **Ambiguous quantities:** "to taste", "a handful", "some"
   - Mark as `UnreconcilableItem` with `reason: "ambiguous_quantity"`
   - Display separately with explanation

2. **Mixed units that can't combine:** "2 cups flour" + "8 oz flour"
   - Keep separate in list OR show both representations
   - Weight is more accurate for baking

3. **Same ingredient, different preparations:** "diced tomatoes" vs "whole tomatoes"
   - Currently: treat as same ingredient (remove prep notes from matching)
   - Future: let user decide in UI

4. **Recipe with 0 ingredients:** Edge case, skip in generation

---

## Testing Strategy

1. Unit tests for reconciliation logic
2. Integration test: Meal with 3 recipes → single consolidated list
3. Edge case: Conflicting units within same ingredient
4. Staples persist after page refresh

---

## Success Criteria

- [ ] Can generate shopping list from meal with 2+ recipes
- [ ] Quantities consolidated correctly (3 cups + 0.5 cups = 3.5 cups)
- [ ] Items grouped by store section
- [ ] Staples persist in localStorage
- [ ] Print view renders without interactive elements
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
