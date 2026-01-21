import { z } from "zod";

/**
 * Ingredient in a recipe
 *
 * Quantities are separated from units to enable consolidation:
 * "2 cups milk" + "1 cup milk" = "3 cups milk"
 */
export interface Ingredient {
  /** Unique identifier (UUID from database) */
  id?: string;
  /** Ingredient name, e.g., "All-purpose flour" */
  name: string;
  /** Quantity as number, null if ambiguous ("to taste", "a handful") */
  quantity: number | null;
  /** Unit of measurement, null if unitless (e.g., "3 eggs") */
  unit: string | null;
  /** Optional prep notes: "sifted", "room temperature", "diced" */
  notes?: string | null;
}

/**
 * Single instruction step in a recipe
 */
export interface Instruction {
  /** Unique identifier (UUID from database) */
  id?: string;
  /** Step number (1, 2, 3...) */
  stepNumber: number;
  /** Step description, e.g., "Preheat oven to 350°F" */
  description: string;
  /** Estimated duration in minutes (for timeline generation) */
  durationMinutes?: number | null;
  /** Whether this step requires the oven (for conflict detection) */
  ovenRequired?: boolean | null;
  /** Oven temperature if required */
  ovenTemp?: number | null;
  /** Additional notes for this step */
  notes?: string | null;
}

/**
 * Recipe source type - how the recipe was ingested
 */
export type RecipeSourceType = "photo" | "url" | "pdf" | "manual";

/**
 * Recipe category for organization/filtering
 */
export type RecipeCategory =
  | "main-dish"
  | "side-dish"
  | "appetizer"
  | "dessert"
  | "bread"
  | "salad"
  | "soup"
  | "beverage"
  | "other";

/**
 * Main recipe data model
 *
 * Supports all ingestion methods: photo upload, URL scraping,
 * PDF parsing, and manual entry.
 */
export interface Recipe {
  /** Unique identifier (UUID from Supabase) */
  id?: string;
  /** Recipe name */
  name: string;
  /** Optional description */
  description?: string;

  /** How this recipe was added */
  sourceType?: RecipeSourceType;
  /** Recipe category for organization */
  category?: RecipeCategory;
  /** Original source: URL, "Handwritten card", site name, etc. */
  source?: string;
  /** Storage URL for uploaded photo/PDF (Supabase Storage) */
  sourceImageUrl?: string;

  /** Number of servings this recipe makes */
  servingSize: number;
  /** Prep time in minutes */
  prepTimeMinutes: number | null;
  /** Cook time in minutes */
  cookTimeMinutes: number | null;

  /** List of ingredients */
  ingredients: Ingredient[];
  /** List of instructions */
  instructions: Instruction[];
  /** General recipe notes */
  notes?: string;

  /** Fields that were uncertain during extraction (need user review) */
  uncertainFields?: string[];
  /** Per-field confidence scores from extraction (0-1) */
  extractionConfidence?: Record<string, number>;

  /** Database timestamps */
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Result from Claude Vision or URL/PDF extraction
 *
 * Used in the side-by-side correction UI where uncertain
 * fields are highlighted for user review.
 */
export interface ExtractionResult {
  /** Extracted recipe name */
  name?: string | null;
  /** AI-generated description of the recipe */
  description?: string | null;
  /** AI-suggested category based on recipe content */
  suggestedCategory?: RecipeCategory | null;
  /** Extracted serving size */
  servingSize?: number | null;
  /** Extracted prep time in minutes */
  prepTimeMinutes?: number | null;
  /** Extracted cook time in minutes */
  cookTimeMinutes?: number | null;
  /** Extracted ingredients */
  ingredients?: Ingredient[] | null;
  /** Extracted instructions */
  instructions?: Instruction[] | null;
  /** Overall extraction confidence (0-1) */
  confidence: number;
  /** Fields that need user review (empty, unusual values, low confidence) */
  uncertainFields?: string[] | null;
  /** Error message if extraction failed completely */
  error?: string | null;
  /** Whether extraction succeeded */
  success: boolean;
  /** Original language if translated (ISO 639-1: "it" for Italian, etc.) */
  originalLanguage?: string | null;
}

// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================

export const IngredientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  quantity: z.number().positive().nullable(),
  unit: z.string().nullable(),
  notes: z.string().nullish(), // Claude may return null instead of omitting
});

export const InstructionSchema = z.object({
  id: z.string().uuid().optional(),
  stepNumber: z.number().int().positive(),
  description: z.string().min(1),
  durationMinutes: z.number().int().positive().nullish(), // Claude may return null
  ovenRequired: z.boolean().nullish(), // Claude may return null
  ovenTemp: z.number().int().positive().nullish(), // Claude may return null
  notes: z.string().nullish(), // Claude may return null
});

export const RecipeSourceTypeSchema = z.enum(["photo", "url", "pdf", "manual"]);

export const RecipeCategorySchema = z.enum([
  "main-dish",
  "side-dish",
  "appetizer",
  "dessert",
  "bread",
  "salad",
  "soup",
  "beverage",
  "other",
]);

export const RecipeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  sourceType: RecipeSourceTypeSchema.optional(),
  category: RecipeCategorySchema.optional(),
  source: z.string().optional(),
  sourceImageUrl: z.string().url().optional(),
  servingSize: z.number().int().positive(),
  prepTimeMinutes: z.number().int().nonnegative().nullable(),
  cookTimeMinutes: z.number().int().nonnegative().nullable(),
  ingredients: z.array(IngredientSchema),
  instructions: z.array(InstructionSchema),
  notes: z.string().optional(),
  uncertainFields: z.array(z.string()).optional(),
  extractionConfidence: z.record(z.string(), z.number().min(0).max(1)).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const ExtractionResultSchema = z.object({
  name: z.string().nullish(),
  description: z.string().nullish(), // AI-generated description
  suggestedCategory: RecipeCategorySchema.nullish(), // AI-suggested category
  servingSize: z.number().int().positive().nullish(),
  prepTimeMinutes: z.number().int().nonnegative().nullish(),
  cookTimeMinutes: z.number().int().nonnegative().nullish(),
  ingredients: z.array(IngredientSchema).nullish(),
  instructions: z.array(InstructionSchema).nullish(),
  confidence: z.number().min(0).max(1),
  uncertainFields: z.array(z.string()).nullish(),
  error: z.string().nullish(),
  success: z.boolean(),
  originalLanguage: z.string().length(2).nullish(), // ISO 639-1 code
});

// Type inference from schemas (useful for validation)
export type IngredientInput = z.infer<typeof IngredientSchema>;
export type InstructionInput = z.infer<typeof InstructionSchema>;
export type RecipeInput = z.infer<typeof RecipeSchema>;
export type ExtractionResultInput = z.infer<typeof ExtractionResultSchema>;
