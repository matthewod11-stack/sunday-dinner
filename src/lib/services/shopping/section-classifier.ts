/**
 * Section Classifier Module
 *
 * Assigns ingredients to store sections (Produce, Dairy, Meat, Pantry, Frozen, Other).
 * Uses keyword matching with fallback to "other".
 */

import type { StoreSection } from "@/types/shopping";

/**
 * Keywords for each store section
 *
 * Order matters: more specific terms should come before general ones.
 * Matching is done on the normalized ingredient name.
 */
const SECTION_KEYWORDS: Record<StoreSection, string[]> = {
  produce: [
    // Vegetables
    "tomato",
    "onion",
    "garlic",
    "lettuce",
    "spinach",
    "kale",
    "carrot",
    "celery",
    "pepper",
    "bell pepper",
    "jalapeño",
    "jalapeño",
    "cucumber",
    "zucchini",
    "squash",
    "broccoli",
    "cauliflower",
    "cabbage",
    "brussels sprout",
    "asparagus",
    "artichoke",
    "eggplant",
    "mushroom",
    "potato",
    "sweet potato",
    "yam",
    "corn",
    "pea",
    "green bean",
    "bean sprout",
    "avocado",
    "beet",
    "radish",
    "turnip",
    "parsnip",
    "leek",
    "scallion",
    "green onion",
    "shallot",
    "ginger",
    // Herbs
    "basil",
    "cilantro",
    "parsley",
    "mint",
    "rosemary",
    "thyme",
    "sage",
    "oregano",
    "dill",
    "chive",
    // Fruits
    "apple",
    "banana",
    "orange",
    "lemon",
    "lime",
    "grapefruit",
    "grape",
    "strawberry",
    "blueberry",
    "raspberry",
    "blackberry",
    "cherry",
    "peach",
    "plum",
    "pear",
    "mango",
    "pineapple",
    "watermelon",
    "cantaloupe",
    "honeydew",
    "kiwi",
    "papaya",
    "pomegranate",
    "fig",
    "date",
    "coconut",
  ],

  dairy: [
    "milk",
    "cream",
    "half and half",
    "half-and-half",
    "butter",
    "margarine",
    "cheese",
    "cheddar",
    "mozzarella",
    "parmesan",
    "parmigiano",
    "pecorino",
    "feta",
    "ricotta",
    "cottage cheese",
    "cream cheese",
    "goat cheese",
    "brie",
    "gouda",
    "swiss",
    "provolone",
    "monterey jack",
    "colby",
    "gruyere",
    "yogurt",
    "sour cream",
    "crème fraîche",
    "creme fraiche",
    "buttermilk",
    "whipped cream",
    "egg",
    "heavy cream",
    "whipping cream",
  ],

  meat: [
    // Beef
    "beef",
    "steak",
    "ground beef",
    "roast",
    "brisket",
    "rib",
    "sirloin",
    "tenderloin",
    "filet",
    // Poultry
    "chicken",
    "turkey",
    "duck",
    "goose",
    "cornish hen",
    // Pork
    "pork",
    "bacon",
    "ham",
    "sausage",
    "prosciutto",
    "pancetta",
    "chorizo",
    "pork chop",
    "pork loin",
    "pork shoulder",
    "pulled pork",
    // Other meat
    "lamb",
    "veal",
    "venison",
    "bison",
    "ground meat",
    // Seafood
    "salmon",
    "tuna",
    "cod",
    "halibut",
    "tilapia",
    "trout",
    "bass",
    "snapper",
    "mahi",
    "swordfish",
    "shrimp",
    "prawn",
    "crab",
    "lobster",
    "scallop",
    "clam",
    "mussel",
    "oyster",
    "squid",
    "calamari",
    "octopus",
    "fish",
    "seafood",
    "anchovy",
  ],

  pantry: [
    // Baking
    "flour",
    "all-purpose flour",
    "bread flour",
    "cake flour",
    "whole wheat flour",
    "almond flour",
    "sugar",
    "brown sugar",
    "powdered sugar",
    "confectioner",
    "granulated sugar",
    "cane sugar",
    "honey",
    "maple syrup",
    "molasses",
    "agave",
    "corn syrup",
    "baking powder",
    "baking soda",
    "yeast",
    "cornstarch",
    "cornmeal",
    "cocoa",
    "chocolate chip",
    "vanilla",
    "almond extract",
    // Oils and vinegars
    "oil",
    "olive oil",
    "vegetable oil",
    "canola oil",
    "coconut oil",
    "sesame oil",
    "vinegar",
    "balsamic",
    "apple cider vinegar",
    "red wine vinegar",
    "white wine vinegar",
    "rice vinegar",
    // Condiments
    "ketchup",
    "mustard",
    "mayonnaise",
    "soy sauce",
    "worcestershire",
    "hot sauce",
    "sriracha",
    "tabasco",
    "salsa",
    "barbecue sauce",
    "bbq sauce",
    "teriyaki",
    "hoisin",
    "fish sauce",
    "oyster sauce",
    // Grains and pasta
    "rice",
    "pasta",
    "spaghetti",
    "penne",
    "fettuccine",
    "linguine",
    "macaroni",
    "orzo",
    "couscous",
    "quinoa",
    "oat",
    "oatmeal",
    "barley",
    "farro",
    "bulgur",
    "breadcrumb",
    "panko",
    "cracker",
    "noodle",
    // Canned goods
    "canned",
    "diced tomatoes",
    "crushed tomatoes",
    "tomato paste",
    "tomato sauce",
    "broth",
    "stock",
    "coconut milk",
    "evaporated milk",
    "condensed milk",
    "beans",
    "chickpea",
    "black bean",
    "kidney bean",
    "pinto bean",
    "cannellini",
    "lentil",
    // Spices and seasonings
    "salt",
    "pepper",
    "black pepper",
    "white pepper",
    "cayenne",
    "paprika",
    "cumin",
    "coriander",
    "turmeric",
    "cinnamon",
    "nutmeg",
    "clove",
    "allspice",
    "ginger powder",
    "garlic powder",
    "onion powder",
    "chili powder",
    "curry",
    "italian seasoning",
    "herbs de provence",
    "bay leaf",
    "red pepper flake",
    "seasoning",
    "spice",
    // Nuts and dried fruits
    "almond",
    "walnut",
    "pecan",
    "cashew",
    "pistachio",
    "peanut",
    "hazelnut",
    "macadamia",
    "pine nut",
    "raisin",
    "dried cranberry",
    "dried apricot",
    "dried fig",
    // Other
    "peanut butter",
    "almond butter",
    "jam",
    "jelly",
    "preserves",
    "nut",
    "seed",
    "sunflower seed",
    "pumpkin seed",
    "sesame seed",
    "chia seed",
    "flax",
  ],

  frozen: [
    "frozen",
    "ice cream",
    "gelato",
    "sorbet",
    "frozen yogurt",
    "frozen vegetable",
    "frozen fruit",
    "frozen pizza",
    "frozen dinner",
    "popsicle",
    "ice pop",
    "frozen pie",
    "frozen crust",
    "pie crust",
    "puff pastry",
    "phyllo",
    "filo",
  ],

  other: [],
};

/**
 * Classify an ingredient into a store section
 *
 * @param ingredientName - Normalized ingredient name
 * @returns The most likely store section
 */
export function classifySection(ingredientName: string): StoreSection {
  const normalized = ingredientName.toLowerCase().trim();

  // Check each section's keywords
  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS) as [
    StoreSection,
    string[]
  ][]) {
    if (section === "other") continue;

    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        return section;
      }
    }
  }

  // Default to "other" if no match
  return "other";
}

/**
 * Get display name for a store section
 */
export function getSectionDisplayName(section: StoreSection): string {
  const displayNames: Record<StoreSection, string> = {
    produce: "Produce",
    dairy: "Dairy & Eggs",
    meat: "Meat & Seafood",
    pantry: "Pantry",
    frozen: "Frozen",
    other: "Other",
  };

  return displayNames[section];
}

/**
 * Get the order for sorting sections (typical grocery store layout)
 */
export function getSectionOrder(section: StoreSection): number {
  const order: Record<StoreSection, number> = {
    produce: 1,
    dairy: 2,
    meat: 3,
    frozen: 4,
    pantry: 5,
    other: 6,
  };

  return order[section];
}

/**
 * Sort items by section order
 */
export function sortBySection<T extends { section: StoreSection }>(
  items: T[]
): T[] {
  return [...items].sort(
    (a, b) => getSectionOrder(a.section) - getSectionOrder(b.section)
  );
}
