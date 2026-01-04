"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  RefreshCw,
  ZoomIn,
  X,
  Link as LinkIcon,
  FileText,
  Camera,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { RecipeForm, type RecipeFormData } from "@/components/recipe";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import type { ExtractionResult, RecipeSourceType } from "@/types";

/**
 * Extended extraction result with source metadata
 */
interface ExtractionWithSource extends ExtractionResult {
  sourceType?: RecipeSourceType;
  source?: string;
  sourceUrl?: string;
  siteDomain?: string;
}

/**
 * Recipe Correction Page
 *
 * Unified correction UI for all extraction sources:
 * - Photo: Side-by-side with zoomable image
 * - URL: Shows source URL and site domain
 * - PDF: Shows filename
 */
export default function CorrectionPage() {
  const router = useRouter();

  // State
  const [extraction, setExtraction] = React.useState<ExtractionWithSource | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = React.useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<RecipeFormData | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPhotoExpanded, setIsPhotoExpanded] = React.useState(false);

  // Determine source type
  const sourceType: RecipeSourceType = extraction?.sourceType ?? "photo";

  // Load extraction from sessionStorage on mount
  React.useEffect(() => {
    const storedExtraction = sessionStorage.getItem("extraction_result");
    const storedPhoto = sessionStorage.getItem("photo_preview");
    const storedUrl = sessionStorage.getItem("source_url");
    const storedPdf = sessionStorage.getItem("pdf_filename");

    if (!storedExtraction) {
      // No extraction data - redirect to method selection
      router.replace("/recipes/new");
      return;
    }

    try {
      const parsed = JSON.parse(storedExtraction) as ExtractionWithSource;
      setExtraction(parsed);
      setPhotoPreview(storedPhoto);
      setSourceUrl(storedUrl);
      setPdfFilename(storedPdf);

      // Initialize form data from extraction
      setFormData({
        name: parsed.name ?? "",
        description: "",
        servingSize: parsed.servingSize ?? 4,
        prepTimeMinutes: parsed.prepTimeMinutes ?? null,
        cookTimeMinutes: parsed.cookTimeMinutes ?? null,
        ingredients: parsed.ingredients ?? [],
        instructions: parsed.instructions ?? [],
        notes: "",
      });
    } catch (err) {
      console.error("Failed to parse extraction result:", err);
      router.replace("/recipes/new");
    }
  }, [router]);

  /**
   * Handle form changes
   */
  const handleFormChange = React.useCallback((data: RecipeFormData) => {
    setFormData(data);
  }, []);

  /**
   * Save recipe to database
   */
  const handleSave = React.useCallback(async () => {
    if (!formData) return;

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Recipe name is required");
      return;
    }
    if (formData.ingredients.length === 0) {
      setError("At least one ingredient is required");
      return;
    }
    if (formData.instructions.length === 0) {
      setError("At least one instruction is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Determine source string
      let source: string | undefined;
      if (sourceType === "url") {
        source = extraction?.siteDomain ?? sourceUrl ?? undefined;
      } else if (sourceType === "pdf") {
        source = pdfFilename ?? undefined;
      }

      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          servingSize: formData.servingSize,
          prepTimeMinutes: formData.prepTimeMinutes,
          cookTimeMinutes: formData.cookTimeMinutes,
          ingredients: formData.ingredients,
          instructions: formData.instructions,
          notes: formData.notes || undefined,
          sourceType,
          source,
          uncertainFields: extraction?.uncertainFields ?? [],
          extractionConfidence: { overall: extraction?.confidence ?? 0 },
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `Failed to save (${response.status})`);
      }

      const savedRecipe = await response.json();

      // Clear session storage
      sessionStorage.removeItem("extraction_result");
      sessionStorage.removeItem("photo_preview");
      sessionStorage.removeItem("source_url");
      sessionStorage.removeItem("pdf_filename");

      showToast.success("Recipe saved successfully!");

      // Navigate to recipe detail
      router.push(`/recipes/${savedRecipe.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save recipe";
      setError(message);
      showToast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [formData, extraction, sourceType, sourceUrl, pdfFilename, router]);

  /**
   * Start over - redirect based on source type
   */
  const handleStartOver = React.useCallback(() => {
    sessionStorage.removeItem("extraction_result");
    sessionStorage.removeItem("photo_preview");
    sessionStorage.removeItem("source_url");
    sessionStorage.removeItem("pdf_filename");

    // Redirect to appropriate method
    if (sourceType === "url") {
      router.push("/recipes/new/url");
    } else if (sourceType === "pdf") {
      router.push("/recipes/new/pdf");
    } else {
      router.push("/recipes/new/photo");
    }
  }, [sourceType, router]);

  /**
   * Get back link href based on source type
   */
  const getBackHref = () => {
    if (sourceType === "url") return "/recipes/new/url";
    if (sourceType === "pdf") return "/recipes/new/pdf";
    return "/recipes/new/photo";
  };

  /**
   * Get source icon
   */
  const SourceIcon = () => {
    if (sourceType === "url") return <LinkIcon className="h-5 w-5" />;
    if (sourceType === "pdf") return <FileText className="h-5 w-5" />;
    return <Camera className="h-5 w-5" />;
  };

  /**
   * Get source display label
   */
  const getSourceLabel = () => {
    if (sourceType === "url") return "Source URL";
    if (sourceType === "pdf") return "Source File";
    return "Original Photo";
  };

  // Loading state
  if (!extraction || !formData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Back link */}
      <Link
        href={getBackHref()}
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {sourceType === "url" && "Back to URL input"}
        {sourceType === "pdf" && "Back to PDF upload"}
        {sourceType === "photo" && "Back to photo upload"}
      </Link>

      <PageHeader
        title="Review & Edit"
        description="Review the extracted recipe and make any corrections"
      />

      {/* Confidence indicator */}
      {extraction.confidence < 0.8 && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="font-medium text-warning">Review recommended</p>
            <p className="mt-1 text-sm text-neutral-600">
              Extraction confidence is {Math.round(extraction.confidence * 100)}%.
              Please check highlighted fields carefully.
            </p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-error/30 bg-error/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
          <div>
            <p className="font-medium text-error">Error</p>
            <p className="mt-1 text-sm text-neutral-600">{error}</p>
          </div>
        </div>
      )}

      {/* Side-by-side layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Source Display */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SourceIcon />
                <h3 className="font-medium text-neutral-700">{getSourceLabel()}</h3>
              </div>
              {sourceType === "photo" && photoPreview && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPhotoExpanded(true)}
                    className="h-8 w-8"
                    title="Expand photo"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Photo preview */}
            {sourceType === "photo" && (
              photoPreview ? (
                <div className="overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Original recipe photo"
                    className="h-auto max-h-[500px] w-full cursor-zoom-in object-contain"
                    onClick={() => setIsPhotoExpanded(true)}
                  />
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                  Photo not available
                </div>
              )
            )}

            {/* URL display */}
            {sourceType === "url" && (
              <div className="rounded-lg bg-neutral-50 p-4">
                {extraction.siteDomain && (
                  <p className="mb-1 text-sm font-medium text-neutral-700">
                    {extraction.siteDomain}
                  </p>
                )}
                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm text-secondary hover:underline"
                  >
                    {sourceUrl}
                  </a>
                )}
                <p className="mt-4 text-xs text-neutral-500">
                  Recipe extracted from the URL above. Make any corrections needed below.
                </p>
              </div>
            )}

            {/* PDF display */}
            {sourceType === "pdf" && (
              <div className="rounded-lg bg-neutral-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-info-light p-2">
                    <FileText className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-700">
                      {pdfFilename ?? "Recipe PDF"}
                    </p>
                    <p className="text-sm text-neutral-500">
                      First page extracted
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-neutral-500">
                  Recipe extracted from the PDF. Make any corrections needed below.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Editable Form */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <RecipeForm
            initialData={formData}
            uncertainFields={extraction.uncertainFields ?? []}
            onChange={handleFormChange}
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:justify-between">
        <Button
          variant="ghost"
          onClick={handleStartOver}
          disabled={isSaving}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Start Over
        </Button>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Recipe
            </>
          )}
        </Button>
      </div>

      {/* Photo expand modal */}
      {isPhotoExpanded && photoPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsPhotoExpanded(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPhotoExpanded(false)}
            className="absolute right-4 top-4 h-10 w-10 bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoPreview}
            alt="Original recipe photo (expanded)"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
