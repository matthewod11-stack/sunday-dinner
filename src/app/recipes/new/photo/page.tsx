"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { PhotoUpload, type PhotoData } from "@/components/recipe";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";

/**
 * Photo-based recipe extraction flow.
 *
 * Steps:
 * 1. User takes/selects photo (PhotoUpload component)
 * 2. Photo is compressed automatically
 * 3. User clicks "Extract Recipe"
 * 4. Claude Vision extracts recipe data
 * 5. Navigate to correction UI with results
 */
export default function PhotoRecipePage() {
  const router = useRouter();

  const [photo, setPhoto] = React.useState<PhotoData | null>(null);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Handle successful photo selection
   */
  const handlePhotoSelected = React.useCallback((data: PhotoData) => {
    setPhoto(data);
    setError(null);

    // Show compression stats in toast
    const savedPercent = Math.round(
      (1 - data.metadata.compressedSizeBytes / data.metadata.originalSizeBytes) * 100
    );
    if (savedPercent > 10) {
      showToast.success(`Photo optimized - reduced by ${savedPercent}%`);
    }
  }, []);

  /**
   * Handle photo selection error
   */
  const handleError = React.useCallback((message: string) => {
    setError(message);
    showToast.error(message);
  }, []);

  /**
   * Extract recipe from photo using Claude Vision
   */
  const handleExtract = React.useCallback(async () => {
    if (!photo) return;

    setIsExtracting(true);
    setError(null);

    try {
      // Call extraction API endpoint
      const response = await fetch("/api/recipes/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: photo.compressed.base64,
          mimeType: photo.compressed.mimeType,
          sourceType: "photo",
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `Extraction failed (${response.status})`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error ?? "Extraction returned no data");
      }

      // Store extraction result in sessionStorage for correction UI
      sessionStorage.setItem("extraction_result", JSON.stringify(result));
      sessionStorage.setItem("photo_preview", photo.preview);

      // Navigate to correction UI
      router.push("/recipes/new/correct");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to extract recipe";
      setError(message);
      showToast.error(message);
    } finally {
      setIsExtracting(false);
    }
  }, [photo, router]);

  /**
   * Clear current photo and start over
   */
  const handleStartOver = React.useCallback(() => {
    if (photo?.preview) {
      URL.revokeObjectURL(photo.preview);
    }
    setPhoto(null);
    setError(null);
  }, [photo]);

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
        title="Photo Upload"
        description="Take a photo of your recipe card and we'll extract the details"
      />

      {/* Photo upload area */}
      <div className="mb-6">
        <PhotoUpload
          onPhotoSelected={handlePhotoSelected}
          onError={handleError}
          disabled={isExtracting}
        />
      </div>

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
      {photo && (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={handleStartOver}
            disabled={isExtracting}
          >
            Start Over
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

      {/* Extraction info */}
      <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-surface-muted p-6">
        <h3 className="mb-2 font-medium text-neutral-700">How it works</h3>
        <ol className="list-inside list-decimal space-y-2 text-sm text-neutral-600">
          <li>Take a clear photo of your recipe card or printed recipe</li>
          <li>We&apos;ll use AI to read and extract the ingredients and steps</li>
          <li>Review and correct any extraction errors</li>
          <li>Save to your recipe collection</li>
        </ol>
        <p className="mt-4 text-xs text-neutral-500">
          Works best with clear, well-lit photos. Handwritten and printed recipes both supported.
        </p>
      </div>
    </div>
  );
}
