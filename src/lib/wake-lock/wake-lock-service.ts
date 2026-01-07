"use client";

/**
 * Wake Lock Service
 *
 * Keeps the screen on during live cooking mode.
 * Uses native Wake Lock API where available, with iOS Safari fallback
 * using a silent video loop trick.
 */

// Use the native WakeLockSentinel type from DOM types
let wakeLockSentinel: WakeLockSentinel | null = null;
let iosFallbackVideo: HTMLVideoElement | null = null;
let isActive = false;
let releaseCallback: (() => void) | null = null;

/**
 * Check if native Wake Lock API is supported
 */
export function isWakeLockSupported(): boolean {
  return typeof navigator !== "undefined" && "wakeLock" in navigator;
}

/**
 * Check if we're on iOS Safari (needs fallback)
 */
function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
  const isSafari =
    /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);

  return isIOS && isSafari;
}

/**
 * Create a silent video element for iOS Safari fallback
 *
 * iOS Safari keeps the screen on while video is playing.
 * We use a tiny 1x1 transparent WebM video that loops silently.
 */
function createIOSFallbackVideo(): HTMLVideoElement {
  const video = document.createElement("video");

  // Set attributes for silent background playback
  video.setAttribute("playsinline", "true");
  video.setAttribute("muted", "true");
  video.setAttribute("loop", "true");

  // Position off-screen
  video.style.cssText = `
    position: fixed;
    top: -10px;
    left: -10px;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  `;

  // Use a data URI for a minimal silent video
  // This is a 1-frame, 1x1 black pixel WebM video
  const base64Video =
    "data:video/mp4;base64,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";

  // Create blob URL from base64
  const binary = atob(base64Video.split(",")[1] || "");
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([array], { type: "video/mp4" });
  video.src = URL.createObjectURL(blob);

  document.body.appendChild(video);
  return video;
}

/**
 * Request a wake lock (keeps screen on)
 *
 * @param onRelease - Optional callback when wake lock is released
 * @returns true if wake lock was acquired
 */
export async function requestWakeLock(
  onRelease?: () => void
): Promise<boolean> {
  if (isActive) return true;

  releaseCallback = onRelease || null;

  // Try native Wake Lock API first
  if (isWakeLockSupported()) {
    try {
      wakeLockSentinel = await navigator.wakeLock!.request("screen");
      isActive = true;

      wakeLockSentinel.addEventListener("release", () => {
        isActive = false;
        wakeLockSentinel = null;
        releaseCallback?.();
      });

      // Re-acquire on visibility change (tab switch back)
      const handleVisibilityChange = async () => {
        if (document.visibilityState === "visible" && !wakeLockSentinel) {
          try {
            wakeLockSentinel = await navigator.wakeLock!.request("screen");
            isActive = true;
          } catch {
            // Failed to re-acquire, that's okay
          }
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return true;
    } catch (err) {
      console.warn("Wake Lock request failed:", err);
      // Fall through to iOS fallback
    }
  }

  // iOS Safari fallback
  if (isIOSSafari()) {
    try {
      if (!iosFallbackVideo) {
        iosFallbackVideo = createIOSFallbackVideo();
      }

      await iosFallbackVideo.play();
      isActive = true;
      return true;
    } catch (err) {
      console.warn("iOS wake lock fallback failed:", err);
      return false;
    }
  }

  // No wake lock support
  return false;
}

/**
 * Release the wake lock (allows screen to sleep)
 */
export async function releaseWakeLock(): Promise<void> {
  if (!isActive) return;

  // Release native wake lock
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch {
      // Already released
    }
    wakeLockSentinel = null;
  }

  // Stop iOS fallback video
  if (iosFallbackVideo) {
    iosFallbackVideo.pause();
    iosFallbackVideo.remove();
    URL.revokeObjectURL(iosFallbackVideo.src);
    iosFallbackVideo = null;
  }

  isActive = false;
  releaseCallback = null;
}

/**
 * Check if wake lock is currently active
 */
export function isWakeLockActive(): boolean {
  return isActive;
}

/**
 * Get a human-readable status of wake lock support
 */
export function getWakeLockStatus(): string {
  if (isActive) return "Screen will stay on";
  if (isWakeLockSupported()) return "Wake Lock available";
  if (isIOSSafari()) return "Using iOS fallback";
  return "Wake Lock not supported";
}
