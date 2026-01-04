"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  FileText,
  Upload,
  X,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import { readFileAsArrayBuffer, parsePdfRecipe } from "@/lib/extraction/client";

/**
 * Maximum PDF file size (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * PDF-based recipe extraction flow.
 *
 * Steps:
 * 1. User selects a PDF file
 * 2. PDF is validated (type, size, pages)
 * 3. User clicks "Extract Recipe"
 * 4. PDF is converted to image → Claude Vision extracts
 * 5. Navigate to correction UI with results
 */
export default function PdfRecipePage() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [warning, setWarning] = React.useState<string | null>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      setError(null);
      setWarning(null);

      if (!selectedFile) {
        setFile(null);
        return;
      }

      // Validate file type
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file.");
        setFile(null);
        return;
      }

      // Validate file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("PDF is too large. Maximum size is 10MB.");
        setFile(null);
        return;
      }

      setFile(selectedFile);
    },
    []
  );

  /**
   * Handle drag and drop
   */
  const handleDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const droppedFile = event.dataTransfer.files[0];
      if (!droppedFile) return;

      // Create a synthetic event to reuse validation logic
      const syntheticEvent = {
        target: { files: [droppedFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      handleFileSelect(syntheticEvent);
    },
    [handleFileSelect]
  );

  /**
   * Prevent default drag behavior
   */
  const handleDragOver = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    },
    []
  );

  /**
   * Extract recipe from PDF
   */
  const handleExtract = React.useCallback(async () => {
    if (!file) return;

    setIsExtracting(true);
    setError(null);
    setWarning(null);

    try {
      // Read file
      const arrayBuffer = await readFileAsArrayBuffer(file);

      // Parse PDF and extract recipe
      const result = await parsePdfRecipe(arrayBuffer);

      if (!result.success) {
        throw new Error(result.error ?? "Failed to extract recipe from PDF");
      }

      // Warn about multi-page PDFs
      if (result.pageCount && result.pageCount > 1) {
        setWarning(
          `This PDF has ${result.pageCount} pages. Only the first page was processed.`
        );
      }

      // Store extraction result in sessionStorage for correction UI
      sessionStorage.setItem(
        "extraction_result",
        JSON.stringify({
          ...result,
          sourceType: "pdf",
          source: file.name,
        })
      );
      sessionStorage.setItem("pdf_filename", file.name);

      showToast.success("Recipe extracted successfully!");

      // Navigate to correction UI
      router.push("/recipes/new/correct");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to extract recipe";
      setError(message);
      showToast.error(message);
    } finally {
      setIsExtracting(false);
    }
  }, [file, router]);

  /**
   * Clear selected file
   */
  const handleClear = React.useCallback(() => {
    setFile(null);
    setError(null);
    setWarning(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  /**
   * Trigger file picker
   */
  const handleBrowse = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/recipes/new"
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Choose different method
      </Link>

      <PageHeader
        title="Upload PDF"
        description="Upload a recipe saved as a PDF file"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drop zone / file preview */}
      <div className="mb-6">
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-surface-muted p-12 transition-colors hover:border-primary hover:bg-primary-light/10"
            onClick={handleBrowse}
          >
            <div className="mb-4 rounded-full bg-info-light p-4">
              <Upload className="h-8 w-8 text-info" />
            </div>
            <p className="mb-2 text-center font-medium text-neutral-700">
              Drop a PDF here or click to browse
            </p>
            <p className="text-center text-sm text-neutral-500">
              Supports PDF files up to 10MB
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-surface p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-info-light p-3">
                <FileText className="h-6 w-6 text-info" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-neutral-800">
                  {file.name}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={isExtracting}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Warning display */}
      {warning && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="font-medium text-warning">Note</p>
            <p className="mt-1 text-sm text-neutral-600">{warning}</p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-error/30 bg-error/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
          <div>
            <p className="font-medium text-error">Something went wrong</p>
            <p className="mt-1 text-sm text-neutral-600">{error}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {file && (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={isExtracting}
          >
            Choose Different File
          </Button>
          <Button
            onClick={handleExtract}
            disabled={isExtracting}
            className="gap-2"
          >
            {isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Extract Recipe
              </>
            )}
          </Button>
        </div>
      )}

      {/* Info note */}
      <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-surface-muted p-6">
        <h3 className="mb-2 font-medium text-neutral-700">How it works</h3>
        <ol className="list-inside list-decimal space-y-2 text-sm text-neutral-600">
          <li>Upload a PDF containing a recipe (scanned cards, exported recipes)</li>
          <li>We&apos;ll convert it to an image and read the content</li>
          <li>Review and correct any extraction errors</li>
          <li>Save to your recipe collection</li>
        </ol>
        <p className="mt-4 text-xs text-neutral-500">
          Currently supports single-page PDFs. For multi-page PDFs, only the first
          page will be processed.
        </p>
      </div>
    </div>
  );
}
