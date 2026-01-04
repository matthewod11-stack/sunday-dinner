import type { ExtractionResult } from "@/types";

/**
 * Lazily load pdfjs-dist to avoid Node.js DOMMatrix error during build.
 * pdf.js requires browser APIs that don't exist in Node.js, so we dynamically
 * import it only when actually needed (at runtime in the browser).
 */
async function loadPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");

  // Set the worker source for pdf.js (only needed once)
  if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }

  return pdfjsLib;
}

/**
 * PDF parsing configuration
 */
interface PdfParserConfig {
  /** Scale factor for rendering (higher = better quality, larger file) */
  scale?: number;
  /** Maximum dimension (width or height) in pixels */
  maxDimension?: number;
  /** Target JPEG quality (0-1) */
  quality?: number;
}

const DEFAULT_CONFIG: Required<PdfParserConfig> = {
  scale: 2.0, // 2x scale for better OCR quality
  maxDimension: 2000, // Reasonable limit for Claude Vision
  quality: 0.85,
};

/**
 * Result from PDF to image conversion
 */
export interface PdfImageResult {
  /** Success status */
  success: boolean;
  /** Base64-encoded image data (without data URL prefix) */
  imageBase64?: string;
  /** Image MIME type */
  mimeType?: "image/jpeg" | "image/png";
  /** Image dimensions */
  width?: number;
  height?: number;
  /** Number of pages in PDF */
  pageCount?: number;
  /** Error message if failed */
  error?: string;
}

/**
 * Convert a PDF file to an image for Claude Vision extraction
 *
 * Process:
 * 1. Load PDF using pdf.js
 * 2. Render first page to canvas
 * 3. Convert canvas to JPEG
 * 4. Return base64 for Vision API
 *
 * @param pdfData - PDF file as ArrayBuffer or Uint8Array
 * @param config - Optional rendering configuration
 * @returns Image data ready for Claude Vision
 */
export async function convertPdfToImage(
  pdfData: ArrayBuffer | Uint8Array,
  config: PdfParserConfig = {}
): Promise<PdfImageResult> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    // Dynamically load pdf.js (browser-only)
    const pdfjsLib = await loadPdfJs();

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;

    // Get first page
    const page = await pdf.getPage(1);

    // Calculate scale to fit within maxDimension while maintaining quality
    const viewport = page.getViewport({ scale: 1.0 });
    let scale = mergedConfig.scale;

    // Limit maximum dimension
    const maxDim = Math.max(viewport.width, viewport.height) * scale;
    if (maxDim > mergedConfig.maxDimension) {
      scale = (mergedConfig.maxDimension / Math.max(viewport.width, viewport.height));
    }

    const scaledViewport = page.getViewport({ scale });

    // Create canvas
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return {
        success: false,
        error: "Failed to create canvas context",
      };
    }

    canvas.width = Math.floor(scaledViewport.width);
    canvas.height = Math.floor(scaledViewport.height);

    // Fill with white background (PDFs may have transparent backgrounds)
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;

    // Convert to JPEG
    const dataUrl = canvas.toDataURL("image/jpeg", mergedConfig.quality);
    const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, "");

    return {
      success: true,
      imageBase64: base64,
      mimeType: "image/jpeg",
      width: canvas.width,
      height: canvas.height,
      pageCount: pdf.numPages,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Handle specific pdf.js errors
    if (message.includes("Invalid PDF structure")) {
      return {
        success: false,
        error: "This file doesn't appear to be a valid PDF.",
      };
    }

    if (message.includes("password")) {
      return {
        success: false,
        error: "This PDF is password-protected and cannot be read.",
      };
    }

    return {
      success: false,
      error: `Failed to process PDF: ${message}`,
    };
  }
}

/**
 * Parse a PDF recipe into structured data
 *
 * This is a convenience function that:
 * 1. Converts PDF to image
 * 2. Calls the extract API with the image
 *
 * @param pdfData - PDF file data
 * @param extractApi - API endpoint for extraction (default: /api/recipes/extract)
 * @returns Extraction result
 */
export async function parsePdfRecipe(
  pdfData: ArrayBuffer | Uint8Array,
  extractApi: string = "/api/recipes/extract"
): Promise<ExtractionResult & { pageCount?: number }> {
  // Convert PDF to image
  const imageResult = await convertPdfToImage(pdfData);

  if (!imageResult.success || !imageResult.imageBase64) {
    return {
      success: false,
      confidence: 0,
      error: imageResult.error ?? "Failed to convert PDF to image",
      uncertainFields: [],
    };
  }

  // Warn if multi-page PDF
  if (imageResult.pageCount && imageResult.pageCount > 1) {
    console.warn(
      `PDF has ${imageResult.pageCount} pages. Only the first page will be processed.`
    );
  }

  // Call extraction API
  try {
    const response = await fetch(extractApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: imageResult.imageBase64,
        mimeType: imageResult.mimeType,
        sourceType: "pdf",
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error ?? `Extraction failed (${response.status})`);
    }

    const result = await response.json();

    return {
      ...result,
      pageCount: imageResult.pageCount,
    };
  } catch (error) {
    return {
      success: false,
      confidence: 0,
      error: error instanceof Error ? error.message : "Failed to extract recipe",
      uncertainFields: [],
    };
  }
}

/**
 * Read a File object as ArrayBuffer
 */
export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as ArrayBuffer"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}
