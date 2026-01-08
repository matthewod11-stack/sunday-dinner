"use client";

import { useState, useEffect } from "react";
import { isServiceWorkerActive } from "./service-worker-client";
import { isIndexedDBAvailable } from "./indexed-db";

/**
 * Offline capability levels
 */
export type OfflineCapability = "full" | "partial" | "none";

/**
 * Offline capability details
 */
export interface OfflineCapabilityInfo {
  /** Overall capability level */
  capability: OfflineCapability;

  /** Whether Service Worker is active */
  hasServiceWorker: boolean;

  /** Whether IndexedDB is available */
  hasIndexedDB: boolean;

  /** Whether the browser is in private/incognito mode (likely) */
  isPrivateBrowsing: boolean;

  /** Human-readable description of capability */
  description: string;

  /** Recommendations for the user */
  recommendations: string[];
}

/**
 * Check if browser is likely in private/incognito mode
 *
 * This is a heuristic - some browsers make it hard to detect.
 */
async function detectPrivateBrowsing(): Promise<boolean> {
  // Check storage estimate - private mode often has limited/no storage
  if ("storage" in navigator && "estimate" in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      // Less than 100MB quota is suspicious
      if (estimate.quota && estimate.quota < 100 * 1024 * 1024) {
        return true;
      }
    } catch {
      // Can't estimate - might be private
      return true;
    }
  }

  // Try IndexedDB - often restricted in private mode
  if (!isIndexedDBAvailable()) {
    return true;
  }

  return false;
}

/**
 * Hook to check offline capabilities
 *
 * Returns the current capability level and details about what's available.
 *
 * @example
 * ```tsx
 * function OfflineSetup() {
 *   const { capability, hasServiceWorker, description } = useOfflineCapability();
 *
 *   if (capability === 'none') {
 *     return <WarningBanner>{description}</WarningBanner>;
 *   }
 *
 *   return <NormalContent />;
 * }
 * ```
 */
export function useOfflineCapability(): OfflineCapabilityInfo {
  const [info, setInfo] = useState<OfflineCapabilityInfo>({
    capability: "none",
    hasServiceWorker: false,
    hasIndexedDB: false,
    isPrivateBrowsing: false,
    description: "Checking offline capabilities...",
    recommendations: [],
  });

  useEffect(() => {
    async function checkCapabilities() {
      // Check each capability
      const hasIndexedDB = isIndexedDBAvailable();
      const hasServiceWorker = isServiceWorkerActive();
      const isPrivateBrowsing = await detectPrivateBrowsing();

      // Determine capability level
      let capability: OfflineCapability;
      let description: string;
      const recommendations: string[] = [];

      if (hasServiceWorker && hasIndexedDB) {
        capability = "full";
        description =
          "Full offline support available. Your cooking progress will be saved even without internet.";
      } else if (hasIndexedDB && !hasServiceWorker) {
        capability = "partial";
        description =
          "Partial offline support. Your checkoffs will be saved locally, but the app won't work fully offline.";
        recommendations.push("Reload the page to activate the service worker");
      } else if (hasServiceWorker && !hasIndexedDB) {
        capability = "partial";
        description =
          "Partial offline support. The app can work offline, but checkoffs may not persist.";
        if (isPrivateBrowsing) {
          recommendations.push("Exit private/incognito mode for full support");
        }
      } else {
        capability = "none";
        description =
          "Limited offline support. Your cooking progress may not be saved if you lose connection.";
        if (isPrivateBrowsing) {
          recommendations.push(
            "Exit private/incognito mode for offline support"
          );
        } else {
          recommendations.push(
            "Use a modern browser like Chrome, Firefox, or Safari for offline support"
          );
        }
      }

      setInfo({
        capability,
        hasServiceWorker,
        hasIndexedDB,
        isPrivateBrowsing,
        description,
        recommendations,
      });
    }

    checkCapabilities();
  }, []);

  return info;
}

/**
 * Check if the app should warn about limited offline capability
 */
export function shouldWarnAboutOffline(
  info: OfflineCapabilityInfo
): boolean {
  return info.capability !== "full";
}
