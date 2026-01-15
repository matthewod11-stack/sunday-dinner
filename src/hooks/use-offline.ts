"use client";

import { useState, useEffect, useCallback } from "react";
import { createTimeoutSignal } from "@/lib/utils/abort-timeout";

/**
 * Offline detection state
 */
export interface OfflineState {
  /** Whether the browser reports being offline */
  isOffline: boolean;

  /** Whether we're currently checking connection */
  isChecking: boolean;

  /** Timestamp of last successful connection (ISO string) */
  lastOnline: string | null;

  /** Manually trigger a connection check */
  checkConnection: () => Promise<boolean>;
}

/**
 * Hook for detecting offline/online status.
 *
 * Uses the browser's navigator.onLine API with event listeners
 * for real-time updates. Tracks last known online timestamp
 * for displaying "Last synced X ago" in the UI.
 *
 * @returns OfflineState with current status and utilities
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOffline, lastOnline } = useOffline();
 *
 *   if (isOffline) {
 *     return <OfflineBanner lastOnline={lastOnline} />;
 *   }
 *
 *   return <MainContent />;
 * }
 * ```
 */
export function useOffline(): OfflineState {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastOnline, setLastOnline] = useState<string | null>(null);

  // Initialize state from navigator.onLine
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Set initial state
    const online = navigator.onLine;
    setIsOffline(!online);

    if (online) {
      setLastOnline(new Date().toISOString());
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOffline(false);
      setLastOnline(new Date().toISOString());
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /**
   * Manually check connection by fetching a small resource.
   *
   * Useful when navigator.onLine might be inaccurate (e.g., captive portals).
   * Returns true if online, false if offline.
   */
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return true;

    setIsChecking(true);

    try {
      // Fetch a tiny resource to verify actual connectivity
      // Using the root HTML as it should always be available
      const response = await fetch("/", {
        method: "HEAD",
        cache: "no-store",
        // Short timeout to fail fast (polyfilled for older iOS Safari)
        signal: createTimeoutSignal(5000),
      });

      const online = response.ok;
      setIsOffline(!online);

      if (online) {
        setLastOnline(new Date().toISOString());
      }

      return online;
    } catch {
      setIsOffline(true);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    isOffline,
    isChecking,
    lastOnline,
    checkConnection,
  };
}

/**
 * Format "last online" timestamp as relative time.
 *
 * @param isoString - ISO timestamp string
 * @returns Human-readable relative time (e.g., "2 minutes ago")
 */
export function formatLastOnline(isoString: string | null): string {
  if (!isoString) return "Unknown";

  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default useOffline;
