"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Loader2, AlertCircle, Link as LinkIcon, Globe } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToast } from "@/components/ui/toast";

/**
 * URL-based recipe extraction flow.
 *
 * Steps:
 * 1. User pastes a recipe URL
 * 2. URL is validated
 * 3. User clicks "Extract Recipe"
 * 4. We scrape the page (JSON-LD or HTML parsing)
 * 5. Navigate to correction UI with results
 */
export default function UrlRecipePage() {
  const router = useRouter();

  const [url, setUrl] = React.useState("");
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Validate URL format
   */
  const isValidUrl = React.useMemo(() => {
    if (!url.trim()) return false;
    try {
      const parsed = new URL(url.trim());
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, [url]);

  /**
   * Extract recipe from URL
   */
  const handleExtract = React.useCallback(async () => {
    if (!isValidUrl) return;

    setIsExtracting(true);
    setError(null);

    try {
      const response = await fetch("/api/recipes/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `Extraction failed (${response.status})`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error ?? "Could not extract recipe from this URL");
      }

      // Store extraction result in sessionStorage for correction UI
      sessionStorage.setItem("extraction_result", JSON.stringify({
        ...result,
        sourceType: "url",
        source: result.siteDomain || new URL(url.trim()).hostname,
      }));
      sessionStorage.setItem("source_url", url.trim());

      showToast.success("Recipe extracted successfully!");

      // Navigate to correction UI
      router.push("/recipes/new/correct");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to extract recipe";
      setError(message);
      showToast.error(message);
    } finally {
      setIsExtracting(false);
    }
  }, [url, isValidUrl, router]);

  /**
   * Handle form submission
   */
  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleExtract();
    },
    [handleExtract]
  );

  /**
   * Handle paste from clipboard
   */
  const handlePaste = React.useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError(null);
      }
    } catch {
      // Clipboard access denied - user can type manually
    }
  }, []);

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
        title="Paste a URL"
        description="Enter a link to a recipe page and we'll extract the details"
      />

      {/* URL input form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Recipe URL</Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <LinkIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://example.com/recipe..."
              className="pl-10"
              disabled={isExtracting}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Paste a link from any recipe website
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePaste}
              disabled={isExtracting}
              className="text-xs"
            >
              Paste from clipboard
            </Button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-error/30 bg-error/5 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
            <div>
              <p className="font-medium text-error">Extraction failed</p>
              <p className="mt-1 text-sm text-neutral-600">{error}</p>
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isValidUrl || isExtracting}
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
      </form>

      {/* Supported sites info */}
      <div className="rounded-xl border border-dashed border-neutral-300 bg-surface-muted p-6">
        <h3 className="mb-3 flex items-center gap-2 font-medium text-neutral-700">
          <Globe className="h-4 w-4" />
          Supported Sites
        </h3>
        <div className="grid gap-2 text-sm text-neutral-600 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            AllRecipes
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            NYT Cooking
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            Food Network
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            Serious Eats
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            Bon Appétit
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Most other sites
          </div>
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          Most recipe sites use standard formats we can read. If extraction fails,
          try taking a screenshot and uploading it as a photo instead.
        </p>
      </div>
    </div>
  );
}
