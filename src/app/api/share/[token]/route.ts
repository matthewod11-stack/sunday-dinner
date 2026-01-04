import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { createShareService } from "@/lib/services/share";

interface RouteParams {
  params: Promise<{
    token: string;
  }>;
}

/**
 * GET /api/share/[token] - Validate token and return meal data for viewers
 *
 * Response (valid): ShareMealData object
 * Response (invalid): { error: string, message: string }
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { token } = await params;

    // Validate UUID format
    const uuidResult = z.string().uuid().safeParse(token);
    if (!uuidResult.success) {
      return NextResponse.json(
        { error: "invalid", message: "Invalid share link format" },
        { status: 400 }
      );
    }

    // Create service and validate token
    const shareService = createShareService(supabase);
    const validation = await shareService.validateToken(token);

    if (!validation.valid) {
      const status = validation.error === "expired" ? 410 : 404;
      return NextResponse.json(
        {
          error: validation.error ?? "invalid",
          message: validation.message ?? "Invalid share link",
        },
        { status }
      );
    }

    // Get full share data
    const shareData = await shareService.getShareData(token);

    if (!shareData) {
      return NextResponse.json(
        { error: "not_found", message: "Meal data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(shareData);
  } catch (error) {
    console.error("Failed to get share data:", error);
    return NextResponse.json(
      { error: "server_error", message: "Failed to retrieve share data" },
      { status: 500 }
    );
  }
}
