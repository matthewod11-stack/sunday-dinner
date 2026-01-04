import { NextResponse } from "next/server";
import { z } from "zod";
import { scrapeRecipeUrl, validateUrl } from "@/lib/extraction";

/**
 * Request body schema for URL extraction
 */
const ExtractUrlRequestSchema = z.object({
  url: z.string().min(1, "URL is required"),
});

/**
 * POST /api/recipes/extract-url
 *
 * Extract recipe data from a URL using HTML parsing.
 *
 * Request body:
 * - url: The recipe page URL
 *
 * Returns:
 * - UrlScrapingResult with recipe data and confidence scores
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const parsed = ExtractUrlRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request",
        },
        { status: 400 }
      );
    }

    const { url } = parsed.data;

    // Validate URL format
    const validatedUrl = validateUrl(url);
    if (!validatedUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid URL. Please enter a valid http or https URL.",
        },
        { status: 400 }
      );
    }

    // Scrape the recipe
    const result = await scrapeRecipeUrl(url);

    // Add source type for unified flow
    const enrichedResult = {
      ...result,
      sourceType: "url" as const,
      source: validatedUrl.hostname,
    };

    return NextResponse.json(enrichedResult);
  } catch (error) {
    console.error("URL extraction failed:", error);

    if (error instanceof Error) {
      // Handle timeout
      if (error.message.includes("abort") || error.message.includes("timeout")) {
        return NextResponse.json(
          {
            success: false,
            error: "Request timed out. The site may be slow or unreachable.",
          },
          { status: 504 }
        );
      }

      // Handle network errors
      if (error.message.includes("fetch") || error.message.includes("network")) {
        return NextResponse.json(
          {
            success: false,
            error: "Could not reach the URL. Please check the link and try again.",
          },
          { status: 502 }
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
