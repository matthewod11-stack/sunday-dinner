import { z } from "zod";
import type { ImageMimeType } from "@/contracts/ai-service";

// ============================================================================
// Input Types
// ============================================================================

/**
 * Supported image MIME types for compression.
 * Matches ImageMimeType from ai-service contract.
 */
export type SupportedImageType = ImageMimeType;

/**
 * Image input source - accepts multiple formats for flexibility.
 *
 * - File: From <input type="file"> or drag-drop
 * - Blob: From canvas.toBlob() or fetch response
 * - string: Base64 data or data URL (with "data:image/..." prefix)
 */
export type ImageInput = File | Blob | string;

// ============================================================================
// Compression Options
// ============================================================================

/**
 * Options for image compression.
 *
 * All options have sensible defaults optimized for recipe photos
 * where text legibility is critical.
 */
export interface CompressionOptions {
  /** Maximum file size in bytes (default: 512000 = 500KB) */
  maxSizeBytes?: number;

  /** Maximum dimension (width or height) in pixels (default: 2048) */
  maxDimension?: number;

  /** Starting JPEG quality 0-1 (default: 0.85 for text clarity) */
  initialQuality?: number;

  /** Minimum quality to try before failing (default: 0.4) */
  minQuality?: number;

  /** Quality reduction step per iteration (default: 0.1) */
  qualityStep?: number;

  /** Force output format (default: auto-detect, prefer JPEG) */
  outputFormat?: "jpeg" | "png" | "webp";

  /** Preserve transparency if present (prevents JPEG conversion) */
  preserveTransparency?: boolean;
}

/** Zod schema for CompressionOptions with defaults */
export const CompressionOptionsSchema = z.object({
  maxSizeBytes: z.number().positive().optional().default(512000),
  maxDimension: z.number().int().positive().optional().default(2048),
  initialQuality: z.number().min(0).max(1).optional().default(0.85),
  minQuality: z.number().min(0).max(1).optional().default(0.4),
  qualityStep: z.number().min(0.01).max(0.5).optional().default(0.1),
  outputFormat: z.enum(["jpeg", "png", "webp"]).optional(),
  preserveTransparency: z.boolean().optional().default(false),
});

// ============================================================================
// Compression Result
// ============================================================================

/**
 * Successful compression result with metadata.
 */
export interface CompressionResult {
  /** Base64-encoded image data (without "data:..." prefix) */
  base64: string;

  /** MIME type of the compressed image */
  mimeType: SupportedImageType;

  /** Original file size in bytes */
  originalSizeBytes: number;

  /** Compressed file size in bytes */
  compressedSizeBytes: number;

  /** Original dimensions */
  originalDimensions: { width: number; height: number };

  /** Final dimensions after resize */
  finalDimensions: { width: number; height: number };

  /** Final quality setting used (0-1) */
  finalQuality: number;

  /** Whether the image was resized */
  wasResized: boolean;

  /** Whether format was converted (e.g., PNG to JPEG) */
  formatConverted: boolean;
}

/** Zod schema for CompressionResult */
export const CompressionResultSchema = z.object({
  base64: z.string().min(1),
  mimeType: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
  originalSizeBytes: z.number().nonnegative(),
  compressedSizeBytes: z.number().nonnegative(),
  originalDimensions: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  finalDimensions: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  finalQuality: z.number().min(0).max(1),
  wasResized: z.boolean(),
  formatConverted: z.boolean(),
});

// ============================================================================
// Compression Errors
// ============================================================================

/**
 * Error codes for compression failures.
 */
export type CompressionErrorCode =
  | "INVALID_INPUT" // Input is not a valid image
  | "UNSUPPORTED_FORMAT" // Format not in supported list
  | "CANVAS_ERROR" // Browser Canvas API failure
  | "SIZE_LIMIT_EXCEEDED" // Could not compress below target size
  | "LOAD_ERROR"; // Failed to load image

/**
 * Structured compression error.
 *
 * Returned instead of throwing to enable explicit error handling.
 * Caller checks `'code' in result` to distinguish from success.
 */
export interface CompressionError {
  /** Error type code */
  code: CompressionErrorCode;

  /** Human-readable error message */
  message: string;

  /** Original file size if known */
  originalSize?: number;

  /** Last attempted quality if applicable */
  attemptedQuality?: number;
}

/** Zod schema for CompressionError */
export const CompressionErrorSchema = z.object({
  code: z.enum([
    "INVALID_INPUT",
    "UNSUPPORTED_FORMAT",
    "CANVAS_ERROR",
    "SIZE_LIMIT_EXCEEDED",
    "LOAD_ERROR",
  ]),
  message: z.string(),
  originalSize: z.number().optional(),
  attemptedQuality: z.number().optional(),
});

// ============================================================================
// Image Metadata
// ============================================================================

/**
 * Image metadata without compression.
 */
export interface ImageMetadata {
  /** Image width in pixels */
  width: number;

  /** Image height in pixels */
  height: number;

  /** File size in bytes */
  sizeBytes: number;

  /** Detected MIME type (null if unrecognized) */
  mimeType: SupportedImageType | null;

  /** Whether the image has meaningful transparency */
  hasTransparency: boolean;
}

/** Zod schema for ImageMetadata */
export const ImageMetadataSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sizeBytes: z.number().nonnegative(),
  mimeType: z
    .enum(["image/jpeg", "image/png", "image/gif", "image/webp"])
    .nullable(),
  hasTransparency: z.boolean(),
});

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default compression options.
 * Optimized for recipe photos with text that must remain legible.
 */
export const DEFAULT_COMPRESSION_OPTIONS: Required<
  Omit<CompressionOptions, "outputFormat">
> & { outputFormat: CompressionOptions["outputFormat"] } = {
  maxSizeBytes: 512000, // 500KB
  maxDimension: 2048, // Good for Claude Vision and mobile displays
  initialQuality: 0.85, // Preserve text legibility
  minQuality: 0.4, // Below this, text becomes unreadable
  qualityStep: 0.1, // Balance iterations vs precision
  outputFormat: undefined, // Auto-detect
  preserveTransparency: false,
};
