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
  notes?: string;
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
  durationMinutes?: number;
  /** Whether this step requires the oven (for conflict detection) */
  ovenRequired?: boolean;
  /** Oven temperature if required */
  ovenTemp?: number;
  /** Additional notes for this step */
  notes?: string;
}

/**
 * Recipe source type - how the recipe was ingested
 */
export type RecipeSourceType = "photo" | "url" | "pdf" | "manual";

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
  name?: string;
  /** Extracted serving size */
  servingSize?: number;
  /** Extracted prep time in minutes */
  prepTimeMinutes?: number;
  /** Extracted cook time in minutes */
  cookTimeMinutes?: number;
  /** Extracted ingredients */
  ingredients?: Ingredient[];
  /** Extracted instructions */
  instructions?: Instruction[];
  /** Overall extraction confidence (0-1) */
  confidence: number;
  /** Fields that need user review (empty, unusual values, low confidence) */
  uncertainFields?: string[];
  /** Error message if extraction failed completely */
  error?: string;
  /** Whether extraction succeeded */
  success: boolean;
}

// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================

export const IngredientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  quantity: z.number().positive().nullable(),
  unit: z.string().nullable(),
  notes: z.string().optional(),
});

export const InstructionSchema = z.object({
  id: z.string().uuid().optional(),
  stepNumber: z.number().int().positive(),
  description: z.string().min(1),
  durationMinutes: z.number().int().positive().optional(),
  ovenRequired: z.boolean().optional(),
  ovenTemp: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const RecipeSourceTypeSchema = z.enum(["photo", "url", "pdf", "manual"]);

export const RecipeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  sourceType: RecipeSourceTypeSchema.optional(),
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
  name: z.string().optional(),
  servingSize: z.number().int().positive().optional(),
  prepTimeMinutes: z.number().int().nonnegative().optional(),
  cookTimeMinutes: z.number().int().nonnegative().optional(),
  ingredients: z.array(IngredientSchema).optional(),
  instructions: z.array(InstructionSchema).optional(),
  confidence: z.number().min(0).max(1),
  uncertainFields: z.array(z.string()).optional(),
  error: z.string().optional(),
  success: z.boolean(),
});

// Type inference from schemas (useful for validation)
export type IngredientInput = z.infer<typeof IngredientSchema>;
export type InstructionInput = z.infer<typeof InstructionSchema>;
export type RecipeInput = z.infer<typeof RecipeSchema>;
export type ExtractionResultInput = z.infer<typeof ExtractionResultSchema>;
