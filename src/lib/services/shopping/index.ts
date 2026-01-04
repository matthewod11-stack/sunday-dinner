export {
  SupabaseShoppingService,
  createShoppingService,
} from "./supabase-shopping-service";

export {
  normalizeToBase,
  combineQuantities,
  simplifyUnit,
  formatQuantity,
  canReconcile,
  getUnitGroup,
  isAmbiguousQuantity,
  parseQuantityString,
} from "./unit-reconciliation";

export {
  normalizeIngredientName,
  displayIngredientName,
  isSameIngredient,
  selectCanonicalName,
  pluralizeForDisplay,
} from "./ingredient-normalizer";

export {
  classifySection,
  getSectionDisplayName,
  getSectionOrder,
  sortBySection,
} from "./section-classifier";
