import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { RecipeCategorySchema } from "@/types";

/**
 * Recipe creation request schema (subset of full Recipe)
 */
const CreateRecipeRequestSchema = z.object({
  // Required fields
  name: z.string().min(1, "Recipe name is required"),
  servingSize: z.number().int().positive(),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().positive().nullable(),
    unit: z.string().nullable(),
    notes: z.string().nullish(),
  })).min(1, "At least one ingredient is required"),
  instructions: z.array(z.object({
    stepNumber: z.number().int().positive(),
    description: z.string().min(1),
    durationMinutes: z.number().int().positive().nullish(),
    ovenRequired: z.boolean().nullish(),
    ovenTemp: z.number().int().positive().nullish(),
    notes: z.string().nullish(),
  })).min(1, "At least one instruction is required"),

  // Optional fields
  description: z.string().optional(),
  sourceType: z.enum(["photo", "url", "pdf", "manual"]).optional(),
  category: RecipeCategorySchema.optional(),
  source: z.string().optional(),
  sourceImageUrl: z.string().url().optional(),
  prepTimeMinutes: z.number().int().nonnegative().nullish(), // Accept undefined or null
  cookTimeMinutes: z.number().int().nonnegative().nullish(), // Accept undefined or null
  notes: z.string().optional(),
  uncertainFields: z.array(z.string()).optional(),
  extractionConfidence: z.record(z.string(), z.number().min(0).max(1)).optional(),
});

/**
 * POST /api/recipes - Create a new recipe
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const parsed = CreateRecipeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid request",
        },
        { status: 400 }
      );
    }

    const recipeData = parsed.data;

    // Insert recipe into Supabase
    const { data: recipe, error: insertError } = await supabase
      .from("recipes")
      .insert({
        name: recipeData.name,
        description: recipeData.description ?? null,
        source_type: recipeData.sourceType ?? "manual",
        category: recipeData.category ?? "other",
        source: recipeData.source ?? null,
        source_image_url: recipeData.sourceImageUrl ?? null,
        serving_size: recipeData.servingSize,
        prep_time_minutes: recipeData.prepTimeMinutes ?? null,
        cook_time_minutes: recipeData.cookTimeMinutes ?? null,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        notes: recipeData.notes ?? null,
        uncertain_fields: recipeData.uncertainFields ?? [],
        extraction_confidence: recipeData.extractionConfidence ?? null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert recipe:", insertError);
      return NextResponse.json(
        { error: `Failed to save recipe: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Transform database response to match Recipe interface
    const savedRecipe = {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description ?? undefined,
      sourceType: recipe.source_type,
      category: recipe.category ?? undefined,
      source: recipe.source ?? undefined,
      sourceImageUrl: recipe.source_image_url ?? undefined,
      servingSize: recipe.serving_size,
      prepTimeMinutes: recipe.prep_time_minutes,
      cookTimeMinutes: recipe.cook_time_minutes,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      notes: recipe.notes ?? undefined,
      uncertainFields: recipe.uncertain_fields ?? undefined,
      extractionConfidence: recipe.extraction_confidence ?? undefined,
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
    };

    return NextResponse.json(savedRecipe, { status: 201 });
  } catch (error) {
    console.error("Recipe creation failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create recipe" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/recipes - List all recipes
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const search = searchParams.get("search");
    const sourceType = searchParams.get("sourceType");
    const category = searchParams.get("category");

    // Build query
    let query = supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filters
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }
    if (sourceType) {
      query = query.eq("source_type", sourceType);
    }
    if (category) {
      query = query.eq("category", category);
    }
    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }
    if (offset) {
      query = query.range(
        parseInt(offset, 10),
        parseInt(offset, 10) + (parseInt(limit ?? "50", 10) - 1)
      );
    }

    const { data: recipes, error: listError } = await query;

    if (listError) {
      console.error("Failed to list recipes:", listError);
      return NextResponse.json(
        { error: "Failed to fetch recipes" },
        { status: 500 }
      );
    }

    // Transform to match Recipe interface
    const transformedRecipes = recipes.map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      description: recipe.description ?? undefined,
      sourceType: recipe.source_type,
      category: recipe.category ?? undefined,
      source: recipe.source ?? undefined,
      sourceImageUrl: recipe.source_image_url ?? undefined,
      servingSize: recipe.serving_size,
      prepTimeMinutes: recipe.prep_time_minutes,
      cookTimeMinutes: recipe.cook_time_minutes,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      notes: recipe.notes ?? undefined,
      uncertainFields: recipe.uncertain_fields ?? undefined,
      extractionConfidence: recipe.extraction_confidence ?? undefined,
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
    }));

    return NextResponse.json(transformedRecipes);
  } catch (error) {
    console.error("Recipe list failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list recipes" },
      { status: 500 }
    );
  }
}
