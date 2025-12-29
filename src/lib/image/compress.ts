import type { ImageMimeType } from "@/contracts/ai-service";
import type {
  ImageInput,
  CompressionOptions,
  CompressionResult,
  CompressionError,
  ImageMetadata,
  SupportedImageType,
} from "./types";
import { DEFAULT_COMPRESSION_OPTIONS } from "./types";

// ============================================================================
// Main Compression Function
// ============================================================================

/**
 * Compress an image for storage and Claude Vision API use.
 *
 * Accepts File, Blob, base64 string, or data URL. Automatically:
 * 1. Resizes if dimensions exceed maxDimension (default 2048px)
 * 2. Converts PNG/GIF to JPEG if no transparency (better compression)
 * 3. Reduces quality iteratively until size < maxSizeBytes (default 500KB)
 *
 * Optimized for recipe photos where text legibility is critical.
 *
 * @param input - Image source: File, Blob, base64 string, or data URL
 * @param options - Optional compression settings
 * @returns Promise resolving to CompressionResult or CompressionError
 *
 * @example
 * ```typescript
 * const result = await compressImage(fileInput.files[0]);
 * if ('base64' in result) {
 *   await aiService.visionExtractRecipe(result.base64, result.mimeType);
 * } else {
 *   console.error(result.message);
 * }
 * ```
 */
export async function compressImage(
  input: ImageInput,
  options?: CompressionOptions
): Promise<CompressionResult | CompressionError> {
  const opts = { ...DEFAULT_COMPRESSION_OPTIONS, ...options };

  try {
    // Phase 1: Input normalization
    const { dataUrl, originalSize, originalMimeType } =
      await normalizeInput(input);

    if (!originalMimeType) {
      return {
        code: "UNSUPPORTED_FORMAT",
        message:
          "Image format not supported. Use JPEG, PNG, GIF, or WebP.",
        originalSize,
      };
    }

    // Phase 2: Load image
    const img = await loadImage(dataUrl);
    const originalWidth = img.width;
    const originalHeight = img.height;

    // Phase 3: Calculate target dimensions
    const { width: targetWidth, height: targetHeight, wasResized } =
      calculateDimensions(originalWidth, originalHeight, opts.maxDimension);

    // Phase 4: Determine output format
    const canvas = createCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return {
        code: "CANVAS_ERROR",
        message: "Failed to get canvas context. Try a different browser.",
        originalSize,
      };
    }

    // Draw image to canvas for transparency detection
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    const imageHasTransparency =
      originalMimeType === "image/png" && hasTransparency(canvas, ctx);

    const { outputMimeType, formatConverted } = determineOutputFormat(
      originalMimeType,
      imageHasTransparency,
      opts.outputFormat,
      opts.preserveTransparency
    );

    // Phase 5: If JPEG output, fill white background (no alpha)
    if (outputMimeType === "image/jpeg") {
      const tempCanvas = createCanvas(targetWidth, targetHeight);
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.fillStyle = "#FFFFFF";
        tempCtx.fillRect(0, 0, targetWidth, targetHeight);
        tempCtx.drawImage(img, 0, 0, targetWidth, targetHeight);
        ctx.drawImage(tempCanvas, 0, 0);
      }
    }

    // Phase 6: Iterative quality reduction
    let quality = opts.initialQuality;
    let base64: string;
    let compressedSize: number;

    while (true) {
      const dataURL = canvasToDataURL(canvas, outputMimeType, quality);
      base64 = dataURL.split(",")[1] ?? "";
      compressedSize = getBase64ByteSize(base64);

      if (compressedSize <= opts.maxSizeBytes) {
        break; // Success!
      }

      if (quality <= opts.minQuality) {
        return {
          code: "SIZE_LIMIT_EXCEEDED",
          message: `Could not compress below ${formatBytes(opts.maxSizeBytes)} even at minimum quality. Original: ${formatBytes(originalSize)}, Best achieved: ${formatBytes(compressedSize)}.`,
          originalSize,
          attemptedQuality: quality,
        };
      }

      quality -= opts.qualityStep;
      quality = Math.max(quality, opts.minQuality);
    }

    // Phase 7: Return result
    return {
      base64,
      mimeType: outputMimeType,
      originalSizeBytes: originalSize,
      compressedSizeBytes: compressedSize,
      originalDimensions: { width: originalWidth, height: originalHeight },
      finalDimensions: { width: targetWidth, height: targetHeight },
      finalQuality: quality,
      wasResized,
      formatConverted,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      code: "LOAD_ERROR",
      message: `Failed to process image: ${message}`,
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if an image needs compression.
 *
 * @param input - Image source
 * @param maxSizeBytes - Target size threshold (default: 500KB)
 * @returns true if compression is needed
 */
export async function needsCompression(
  input: ImageInput,
  maxSizeBytes: number = DEFAULT_COMPRESSION_OPTIONS.maxSizeBytes
): Promise<boolean> {
  try {
    const { originalSize } = await normalizeInput(input);
    return originalSize > maxSizeBytes;
  } catch {
    return true; // Assume compression needed if we can't determine size
  }
}

/**
 * Get image metadata without compressing.
 *
 * @param input - Image source
 * @returns Image dimensions, size, type, and transparency info
 */
export async function getImageMetadata(
  input: ImageInput
): Promise<ImageMetadata> {
  const { dataUrl, originalSize, originalMimeType } =
    await normalizeInput(input);

  const img = await loadImage(dataUrl);

  let imageHasTransparency = false;
  if (originalMimeType === "image/png") {
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      imageHasTransparency = hasTransparency(canvas, ctx);
    }
  }

  return {
    width: img.width,
    height: img.height,
    sizeBytes: originalSize,
    mimeType: originalMimeType,
    hasTransparency: imageHasTransparency,
  };
}

/**
 * Detect image type from input.
 *
 * @param input - Image source
 * @returns MIME type if valid, null otherwise
 */
export async function detectImageType(
  input: ImageInput
): Promise<ImageMimeType | null> {
  try {
    const { originalMimeType } = await normalizeInput(input);
    return originalMimeType;
  } catch {
    return null;
  }
}

// ============================================================================
// Internal Helpers
// ============================================================================

interface NormalizedInput {
  dataUrl: string;
  originalSize: number;
  originalMimeType: SupportedImageType | null;
}

/**
 * Normalize various input types to a consistent data URL format.
 */
async function normalizeInput(input: ImageInput): Promise<NormalizedInput> {
  if (input instanceof File || input instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const mimeType = extractMimeType(dataUrl);
        resolve({
          dataUrl,
          originalSize: input.size,
          originalMimeType: mimeType,
        });
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(input);
    });
  }

  // String input - could be base64 or data URL
  if (typeof input === "string") {
    if (input.startsWith("data:")) {
      // Data URL
      const mimeType = extractMimeType(input);
      const base64 = input.split(",")[1] ?? "";
      return {
        dataUrl: input,
        originalSize: getBase64ByteSize(base64),
        originalMimeType: mimeType,
      };
    } else {
      // Raw base64 - try to detect format from magic bytes
      const mimeType = detectMimeFromBase64(input);
      const dataUrl = mimeType
        ? `data:${mimeType};base64,${input}`
        : `data:image/jpeg;base64,${input}`;
      return {
        dataUrl,
        originalSize: getBase64ByteSize(input),
        originalMimeType: mimeType,
      };
    }
  }

  throw new Error("Invalid input type");
}

/**
 * Extract MIME type from data URL.
 */
function extractMimeType(dataUrl: string): SupportedImageType | null {
  const match = dataUrl.match(/^data:(image\/\w+);base64,/);
  if (!match?.[1]) return null;

  const mime = match[1];
  if (
    mime === "image/jpeg" ||
    mime === "image/png" ||
    mime === "image/gif" ||
    mime === "image/webp"
  ) {
    return mime;
  }
  return null;
}

/**
 * Detect MIME type from base64 magic bytes.
 */
function detectMimeFromBase64(base64: string): SupportedImageType | null {
  // Decode first few bytes to check magic numbers
  const prefix = base64.substring(0, 16);

  // JPEG: starts with /9j/ (FFD8FF in hex)
  if (prefix.startsWith("/9j/")) return "image/jpeg";

  // PNG: starts with iVBORw (89504E47 in hex)
  if (prefix.startsWith("iVBORw")) return "image/png";

  // GIF: starts with R0lGOD (474946 in hex)
  if (prefix.startsWith("R0lGOD")) return "image/gif";

  // WebP: starts with UklGR (52494646 in hex, RIFF header)
  if (prefix.startsWith("UklGR")) return "image/webp";

  return null;
}

/**
 * Load image from data URL into HTMLImageElement.
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

/**
 * Calculate target dimensions respecting max dimension constraint.
 */
function calculateDimensions(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number; wasResized: boolean } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height, wasResized: false };
  }

  const scale = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.floor(width * scale),
    height: Math.floor(height * scale),
    wasResized: true,
  };
}

/**
 * Create canvas element.
 *
 * Note: We always use HTMLCanvasElement instead of OffscreenCanvas because:
 * 1. We need toDataURL() which isn't on OffscreenCanvas
 * 2. TypeScript typing for OffscreenCanvas contexts is complex
 * 3. For image compression, the main thread is acceptable
 */
function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Convert canvas to data URL.
 */
function canvasToDataURL(
  canvas: HTMLCanvasElement,
  mimeType: SupportedImageType,
  quality: number
): string {
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Check if image has meaningful transparency.
 * Samples pixels to detect if alpha channel is actually used.
 */
function hasTransparency(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): boolean {
  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Sample every 100th pixel for performance
    for (let i = 3; i < data.length; i += 400) {
      const alpha = data[i];
      if (alpha !== undefined && alpha < 255) {
        return true;
      }
    }
    return false;
  } catch {
    // CORS or other error - assume no transparency
    return false;
  }
}

/**
 * Determine output format based on input and options.
 */
function determineOutputFormat(
  originalMimeType: SupportedImageType,
  imageHasTransparency: boolean,
  forcedFormat: "jpeg" | "png" | "webp" | undefined,
  preserveTransparency: boolean
): { outputMimeType: SupportedImageType; formatConverted: boolean } {
  // If format is forced, use it
  if (forcedFormat) {
    const outputMimeType = `image/${forcedFormat}` as SupportedImageType;
    return {
      outputMimeType,
      formatConverted: outputMimeType !== originalMimeType,
    };
  }

  // If has transparency and should preserve, keep PNG
  if (imageHasTransparency && preserveTransparency) {
    return { outputMimeType: "image/png", formatConverted: false };
  }

  // Convert PNG/GIF without transparency to JPEG for better compression
  if (
    (originalMimeType === "image/png" || originalMimeType === "image/gif") &&
    !imageHasTransparency
  ) {
    return { outputMimeType: "image/jpeg", formatConverted: true };
  }

  // Keep original format
  return { outputMimeType: originalMimeType, formatConverted: false };
}

/**
 * Calculate byte size from base64 string.
 * Base64 inflates size by ~33%: 3 bytes -> 4 chars.
 */
function getBase64ByteSize(base64: string): number {
  const padding = (base64.match(/=+$/) ?? [""])[0].length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Format bytes as human-readable string.
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
