"use client";

/**
 * Service Worker client utilities
 *
 * Provides methods to communicate with the Service Worker for:
 * - Setting the active meal for targeted caching
 * - Precaching images
 * - Managing cache
 */

/**
 * Check if Service Worker is available and active
 */
export function isServiceWorkerActive(): boolean {
  if (typeof navigator === "undefined") return false;
  return "serviceWorker" in navigator && navigator.serviceWorker.controller !== null;
}

/**
 * Send a message to the Service Worker and wait for response
 */
async function sendMessage<T>(
  type: string,
  payload?: Record<string, unknown>
): Promise<T | null> {
  if (!isServiceWorkerActive()) {
    console.warn("Service Worker not active");
    return null;
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = (event) => {
      resolve(event.data as T);
    };

    // Timeout after 5 seconds
    const timeout = setTimeout(() => {
      resolve(null);
    }, 5000);

    messageChannel.port1.onmessage = (event) => {
      clearTimeout(timeout);
      resolve(event.data as T);
    };

    navigator.serviceWorker.controller!.postMessage(
      { type, payload },
      [messageChannel.port2]
    );
  });
}

/**
 * Set the active meal for Service Worker caching
 *
 * Call this when cooking starts to enable targeted caching.
 *
 * @param mealId - The meal ID to cache
 * @param precacheUrls - Optional URLs to precache (recipe images, etc.)
 */
export async function setActiveMeal(
  mealId: string,
  precacheUrls?: string[]
): Promise<boolean> {
  const result = await sendMessage<{ success: boolean }>("SET_ACTIVE_MEAL", {
    mealId,
    precacheUrls,
  });
  return result?.success ?? false;
}

/**
 * Clear the active meal and its cache
 *
 * Call this when cooking ends.
 */
export async function clearActiveMeal(): Promise<boolean> {
  const result = await sendMessage<{ success: boolean }>("CLEAR_ACTIVE_MEAL");
  return result?.success ?? false;
}

/**
 * Get the currently active meal ID
 */
export async function getActiveMeal(): Promise<string | null> {
  const result = await sendMessage<{ activeMealId: string | null }>(
    "GET_ACTIVE_MEAL"
  );
  return result?.activeMealId ?? null;
}

/**
 * Precache specific images
 *
 * Call this to cache recipe images for offline viewing.
 */
export async function precacheImages(urls: string[]): Promise<boolean> {
  if (urls.length === 0) return true;

  const result = await sendMessage<{ success: boolean }>("PRECACHE_IMAGES", {
    urls,
  });
  return result?.success ?? false;
}

/**
 * Clear all app caches
 */
export async function clearAllCaches(): Promise<boolean> {
  const result = await sendMessage<{ success: boolean }>("CLEAR_CACHE");
  return result?.success ?? false;
}

/**
 * Skip waiting on a new Service Worker version
 */
export async function skipWaiting(): Promise<void> {
  await sendMessage("SKIP_WAITING");
}

/**
 * Listen for messages from the Service Worker
 */
export function listenForServiceWorkerMessages(
  callback: (data: { type: string; [key: string]: unknown }) => void
): () => void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return () => {};
  }

  const handler = (event: MessageEvent) => {
    if (event.data?.type) {
      callback(event.data);
    }
  };

  navigator.serviceWorker.addEventListener("message", handler);

  return () => {
    navigator.serviceWorker.removeEventListener("message", handler);
  };
}

/**
 * Check if a response came from the Service Worker cache
 */
export function isFromCache(response: Response): boolean {
  return response.headers.get("X-SW-Cache") === "true";
}
