"use client";

import { useState } from "react";
import { Check, Copy, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
} from "@/components/ui/modal";
import { showToast } from "@/components/ui/toast";
import type { ShareLinkResult } from "@/types";

interface ShareModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** The meal ID to share */
  mealId: string;
  /** The meal name for display */
  mealName: string;
}

/**
 * ShareModal: Modal for generating and copying share links
 *
 * Generates a unique share link that expires 24 hours after
 * the meal's serve time. Viewers can see the cooking timeline
 * but cannot make changes.
 */
export function ShareModal({
  open,
  onOpenChange,
  mealId,
  mealName,
}: ShareModalProps) {
  const [shareResult, setShareResult] = useState<ShareLinkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate share link when modal opens
  const handleGenerateLink = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? "Failed to generate share link");
      }

      const result: ShareLinkResult = await response.json();
      setShareResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate share link");
    } finally {
      setLoading(false);
    }
  };

  // Copy link to clipboard
  const handleCopy = async () => {
    if (!shareResult) return;

    try {
      await navigator.clipboard.writeText(shareResult.url);
      setCopied(true);
      showToast.success("Link copied to clipboard!");

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast.error("Failed to copy link");
    }
  };

  // Format expiration date
  const formatExpiration = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Reset state when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setShareResult(null);
      setError(null);
      setCopied(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-secondary" />
            Share Timeline
          </ModalTitle>
          <ModalDescription>
            Create a link to share the cooking timeline for &quot;{mealName}&quot; with family
            members. They&apos;ll be able to view progress but not make changes.
          </ModalDescription>
        </ModalHeader>

        <div className="p-6">
          {!shareResult && !loading && !error && (
            <div className="text-center">
              <p className="mb-4 text-sm text-neutral-600">
                Share links expire 24 hours after the meal&apos;s serve time.
              </p>
              <Button onClick={handleGenerateLink}>
                <Link2 className="mr-2 h-4 w-4" />
                Generate Share Link
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-neutral-600">Generating link...</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
              <p className="text-sm text-error">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={handleGenerateLink}
              >
                Try Again
              </Button>
            </div>
          )}

          {shareResult && (
            <div className="space-y-4">
              {/* Share URL */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareResult.url}
                    readOnly
                    className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 focus:outline-none"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleCopy}
                    title={copied ? "Copied!" : "Copy link"}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Expiration info */}
              <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm">
                <p className="font-medium text-amber-800">Link expires:</p>
                <p className="text-amber-700">{formatExpiration(shareResult.expiresAt)}</p>
              </div>

              {/* Usage info */}
              <div className="text-xs text-neutral-500">
                <p>Anyone with this link can view the cooking timeline.</p>
                <p>Generate a new link anytime to replace the current one.</p>
              </div>
            </div>
          )}
        </div>

        <ModalFooter>
          <ModalClose asChild>
            <Button variant="ghost">Close</Button>
          </ModalClose>
          {shareResult && (
            <Button onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
