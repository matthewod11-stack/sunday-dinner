/**
 * Image compression utilities for Sunday Dinner.
 *
 * Provides client-side image compression using Canvas API,
 * optimized for recipe photos where text legibility is critical.
 *
 * @example
 * ```typescript
 * import { compressImage } from "@/lib/image";
 *
 * const result = await compressImage(file);
 * if ("base64" in result) {
 *   // Success - use result.base64 and result.mimeType
 *   await aiService.visionExtractRecipe(result.base64, result.mimeType);
 * } else {
 *   // Error - handle result.code and result.message
 *   console.error(result.message);
 * }
 * ```
 *
 * @module
 */

// Types
export type {
  ImageInput,
  CompressionOptions,
  CompressionResult,
  CompressionError,
  CompressionErrorCode,
  SupportedImageType,
  ImageMetadata,
} from "./types";

// Zod schemas for runtime validation
export {
  CompressionOptionsSchema,
  CompressionResultSchema,
  CompressionErrorSchema,
  ImageMetadataSchema,
  DEFAULT_COMPRESSION_OPTIONS,
} from "./types";

// Core functions
export {
  compressImage,
  needsCompression,
  getImageMetadata,
  detectImageType,
} from "./compress";
