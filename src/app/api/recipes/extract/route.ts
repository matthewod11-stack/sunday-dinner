import { NextResponse } from "next/server";
import { z } from "zod";
import { createAIService } from "@/lib/services/ai";
import type { ImageMimeType } from "@/contracts/ai-service";

/**
 * Request body schema for recipe extraction
 */
const ExtractRequestSchema = z.object({
  imageBase64: z.string().min(1, "Image data is required"),
  mimeType: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"], {
    errorMap: () => ({ message: "Invalid image type" }),
  }),
  sourceType: z.enum(["photo", "pdf"]).default("photo"),
});

/**
 * POST /api/recipes/extract
 *
 * Extract recipe data from an image using Claude Vision.
 *
 * Request body:
 * - imageBase64: Base64-encoded image data (without data URL prefix)
 * - mimeType: Image MIME type (image/jpeg, image/png, etc.)
 * - sourceType: "photo" or "pdf" (for tracking)
 *
 * Returns:
 * - ExtractionResult with recipe data and confidence scores
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const parsed = ExtractRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request",
        },
        { status: 400 }
      );
    }

    const { imageBase64, mimeType, sourceType } = parsed.data;

    // Check image size (base64 length ~= 1.33 * byte size)
    const estimatedBytes = Math.ceil((imageBase64.length * 3) / 4);
    const maxBytes = 20 * 1024 * 1024; // 20MB limit for Claude Vision

    if (estimatedBytes > maxBytes) {
      return NextResponse.json(
        {
          success: false,
          error: "Image too large. Maximum size is 20MB.",
        },
        { status: 400 }
      );
    }

    // Create AI service and extract
    const aiService = createAIService();
    const result = await aiService.visionExtractRecipe(
      imageBase64,
      mimeType as ImageMimeType
    );

    // Add source type to result for tracking
    const enrichedResult = {
      ...result,
      sourceType,
    };

    return NextResponse.json(enrichedResult);
  } catch (error) {
    console.error("Recipe extraction failed:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for API key issues
      if (error.message.includes("API key") || error.message.includes("ANTHROPIC_API_KEY")) {
        return NextResponse.json(
          {
            success: false,
            error: "AI service not configured. Please set ANTHROPIC_API_KEY.",
          },
          { status: 503 }
        );
      }

      // Check for rate limiting
      if (error.message.includes("rate") || error.message.includes("429")) {
        return NextResponse.json(
          {
            success: false,
            error: "AI service is busy. Please try again in a few seconds.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during extraction.",
      },
      { status: 500 }
    );
  }
}
