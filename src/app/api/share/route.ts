import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { createShareService } from "@/lib/services/share";

/**
 * Request body schema for generating a share link
 */
const GenerateShareLinkSchema = z.object({
  mealId: z.string().uuid("Invalid meal ID format"),
});

/**
 * POST /api/share - Generate a share link for a meal
 *
 * Request body: { mealId: string }
 * Response: { token: string, url: string, expiresAt: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = GenerateShareLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    // Get base URL from request headers
    const host = request.headers.get("host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // Create service and generate link
    const shareService = createShareService(supabase);
    const result = await shareService.generateLink(parsed.data.mealId, baseUrl);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to generate share link:", error);

    // Handle specific errors
    if (error instanceof Error && error.message.includes("Meal not found")) {
      return NextResponse.json(
        { message: "Meal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to generate share link" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/share - Revoke all share links for a meal
 *
 * Query param: mealId
 * Response: { message: "Share links revoked" }
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mealId = searchParams.get("mealId");

    if (!mealId) {
      return NextResponse.json(
        { message: "mealId query parameter is required" },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidResult = z.string().uuid().safeParse(mealId);
    if (!uuidResult.success) {
      return NextResponse.json(
        { message: "Invalid meal ID format" },
        { status: 400 }
      );
    }

    // Create service and revoke links
    const shareService = createShareService(supabase);
    await shareService.revokeLinks(mealId);

    return NextResponse.json({ message: "Share links revoked" });
  } catch (error) {
    console.error("Failed to revoke share links:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to revoke share links" },
      { status: 500 }
    );
  }
}
