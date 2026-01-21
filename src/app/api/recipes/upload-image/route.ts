import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * POST /api/recipes/upload-image - Upload a recipe image to Supabase Storage
 *
 * Accepts a base64 encoded image and stores it in the recipe-images bucket.
 * Returns the public URL for the uploaded image.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageData, filename } = body as {
      imageData: string; // base64 encoded image (with or without data URI prefix)
      filename?: string;
    };

    if (!imageData) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Parse base64 data - handle both with and without data URI prefix
    let base64Data: string;
    let mimeType = "image/jpeg"; // default

    if (imageData.startsWith("data:")) {
      const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json(
          { error: "Invalid image data format" },
          { status: 400 }
        );
      }
      mimeType = matches[1] ?? "image/jpeg";
      base64Data = matches[2] ?? "";
    } else {
      base64Data = imageData;
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const timestamp = Date.now();
    const extension = mimeType.split("/")[1] ?? "jpg";
    const uniqueFilename = filename
      ? `${timestamp}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      : `${timestamp}-recipe.${extension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(uniqueFilename, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Failed to upload image:", uploadError);

      // Check if bucket doesn't exist
      if (uploadError.message.includes("Bucket not found")) {
        return NextResponse.json(
          {
            error:
              "Storage bucket not configured. Please create a 'recipe-images' bucket in Supabase Storage.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("recipe-images").getPublicUrl(uploadData.path);

    return NextResponse.json(
      {
        url: publicUrl,
        path: uploadData.path,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload image",
      },
      { status: 500 }
    );
  }
}
