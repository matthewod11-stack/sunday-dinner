import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { createShoppingService } from "@/lib/services/shopping";
import { z } from "zod";

// Note: z is used for PatchRequestSchema validation

interface RouteParams {
  params: Promise<{ id: string }>;
}

const PatchRequestSchema = z.object({
  action: z.enum(["check", "uncheck", "addNotes"]),
  itemId: z.string().uuid(),
  notes: z.string().optional(),
});

/**
 * GET /api/shopping/[id]
 * Get a shopping list by ID
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const shoppingService = createShoppingService(supabase);

    const list = await shoppingService.get(id);
    if (!list) {
      return NextResponse.json(
        { error: "Shopping list not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error fetching shopping list:", error);
    return NextResponse.json(
      { error: "Failed to fetch shopping list" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/shopping/[id]
 * Update a shopping list item (check, uncheck, add notes)
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parseResult = PatchRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.format() },
        { status: 400 }
      );
    }
    const { action, itemId, notes } = parseResult.data;

    const shoppingService = createShoppingService(supabase);

    let updatedList;
    switch (action) {
      case "check":
        updatedList = await shoppingService.checkItem(id, itemId);
        break;
      case "uncheck":
        updatedList = await shoppingService.uncheckItem(id, itemId);
        break;
      case "addNotes":
        if (!notes) {
          return NextResponse.json(
            { error: "Notes required for addNotes action" },
            { status: 400 }
          );
        }
        updatedList = await shoppingService.addItemNotes(id, itemId, notes);
        break;
    }

    return NextResponse.json(updatedList);
  } catch (error) {
    console.error("Error updating shopping list:", error);
    return NextResponse.json(
      { error: "Failed to update shopping list" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/shopping/[id]
 * Delete a shopping list
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const shoppingService = createShoppingService(supabase);

    await shoppingService.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shopping list:", error);
    return NextResponse.json(
      { error: "Failed to delete shopping list" },
      { status: 500 }
    );
  }
}
