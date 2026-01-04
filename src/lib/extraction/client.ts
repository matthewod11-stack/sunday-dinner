/**
 * Client-only recipe extraction utilities
 *
 * These functions require browser APIs (DOMMatrix, Canvas) and cannot
 * be imported in server-side code. Use in "use client" components only.
 *
 * @example
 * ```tsx
 * "use client";
 * import { parsePdfRecipe, readFileAsArrayBuffer } from "@/lib/extraction/client";
 * ```
 */

export {
  convertPdfToImage,
  parsePdfRecipe,
  readFileAsArrayBuffer,
  type PdfImageResult,
} from "./pdf-parser";
