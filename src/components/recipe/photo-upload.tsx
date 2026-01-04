"use client";

import * as React from "react";
import { Camera, Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/image/compress";
import type { ImageMimeType } from "@/contracts/ai-service";

/**
 * Compressed photo data ready for Claude Vision extraction
 */
export interface PhotoData {
  /** Original file reference */
  file: File;
  /** Object URL for preview display */
  preview: string;
  /** Compressed image data for API */
  compressed: {
    base64: string;
    mimeType: ImageMimeType;
  };
  /** Compression metadata */
  metadata: {
    originalSizeBytes: number;
    compressedSizeBytes: number;
    wasResized: boolean;
  };
}

export interface PhotoUploadProps {
  /** Called when photo is successfully selected and compressed */
  onPhotoSelected: (photo: PhotoData) => void;
  /** Called when an error occurs */
  onError: (error: string) => void;
  /** Disable the component during processing */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PhotoUpload - Mobile-friendly photo capture/selection component
 *
 * Supports:
 * - Camera capture on mobile (back camera via capture="environment")
 * - File selection on desktop with drag-and-drop
 * - Automatic image compression to <500KB
 * - Preview thumbnail display
 *
 * @example
 * ```tsx
 * <PhotoUpload
 *   onPhotoSelected={(photo) => extractRecipe(photo.compressed)}
 *   onError={(msg) => toast.error(msg)}
 * />
 * ```
 */
export function PhotoUpload({
  onPhotoSelected,
  onError,
  disabled = false,
  className,
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [isCompressing, setIsCompressing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /**
   * Process selected file: validate, compress, and notify parent
   */
  const handleFile = React.useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        onError("Please select an image file (JPEG, PNG, GIF, or WebP)");
        return;
      }

      setIsCompressing(true);

      try {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        // Compress image for Claude Vision
        const result = await compressImage(file);

        if ("code" in result) {
          // Compression error
          onError(result.message);
          URL.revokeObjectURL(previewUrl);
          setPreview(null);
          return;
        }

        // Success - build PhotoData
        const photoData: PhotoData = {
          file,
          preview: previewUrl,
          compressed: {
            base64: result.base64,
            mimeType: result.mimeType,
          },
          metadata: {
            originalSizeBytes: result.originalSizeBytes,
            compressedSizeBytes: result.compressedSizeBytes,
            wasResized: result.wasResized,
          },
        };

        onPhotoSelected(photoData);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to process image";
        onError(message);
        if (preview) {
          URL.revokeObjectURL(preview);
          setPreview(null);
        }
      } finally {
        setIsCompressing(false);
      }
    },
    [onPhotoSelected, onError, preview]
  );

  /**
   * Handle file input change
   */
  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFile]
  );

  /**
   * Handle drag over
   */
  const handleDragOver = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isCompressing) {
        setIsDragging(true);
      }
    },
    [disabled, isCompressing]
  );

  /**
   * Handle drag leave
   */
  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  /**
   * Handle drop
   */
  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isCompressing) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, isCompressing, handleFile]
  );

  /**
   * Trigger file input click
   */
  const openFileDialog = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Clear current selection
   */
  const clearSelection = React.useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
  }, [preview]);

  const isDisabled = disabled || isCompressing;

  return (
    <div className={cn("w-full", className)}>
      {/* Hidden file input with mobile camera support */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        disabled={isDisabled}
        className="sr-only"
        aria-label="Upload recipe photo"
      />

      {/* Preview state */}
      {preview && !isCompressing ? (
        <div className="relative rounded-xl border-2 border-primary bg-surface-muted p-4">
          <div className="relative mx-auto max-w-md overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Selected recipe photo"
              className="h-auto w-full object-contain"
              style={{ maxHeight: "400px" }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSelection}
              className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/90 shadow-md hover:bg-white"
              aria-label="Remove photo"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-3 text-center text-sm text-neutral-600">
            Photo ready for extraction
          </p>
        </div>
      ) : (
        /* Upload/capture zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative rounded-xl border-2 border-dashed p-8 text-center transition-all",
            isDragging
              ? "border-primary bg-primary-light"
              : "border-neutral-300 bg-surface-muted hover:border-primary hover:bg-primary-light/50",
            isDisabled && "pointer-events-none opacity-50"
          )}
        >
          {isCompressing ? (
            /* Compressing state */
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="font-medium text-neutral-700">Processing image...</p>
              <p className="text-sm text-neutral-500">
                Optimizing for extraction
              </p>
            </div>
          ) : (
            /* Ready to upload state */
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-primary-light p-4">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>

              {/* Desktop drag hint */}
              <div className="hidden sm:block">
                <p className="font-medium text-neutral-700">
                  Drag and drop your recipe photo here
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  or click a button below
                </p>
              </div>

              {/* Mobile hint */}
              <div className="sm:hidden">
                <p className="font-medium text-neutral-700">
                  Take or choose a photo
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                {/* Mobile: Camera button (primary action) */}
                <Button
                  onClick={openFileDialog}
                  disabled={isDisabled}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  <span className="sm:hidden">Take Photo</span>
                  <span className="hidden sm:inline">Choose Photo</span>
                </Button>

                {/* Desktop secondary button */}
                <Button
                  variant="outline"
                  onClick={openFileDialog}
                  disabled={isDisabled}
                  className="hidden gap-2 sm:inline-flex"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
              </div>

              {/* Format hint */}
              <p className="text-xs text-neutral-500">
                JPEG, PNG, GIF, or WebP (will be optimized automatically)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
