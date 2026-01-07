"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UsePollingOptions {
  /** Polling interval in milliseconds (default: 5000) */
  interval?: number;
  /** Whether polling is enabled (default: true) */
  enabled?: boolean;
  /** Pause polling when tab is hidden (default: true) */
  pauseOnHidden?: boolean;
}

interface UsePollingResult<T> {
  /** Current data */
  data: T | null;
  /** Loading state for initial fetch */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Timestamp of last successful update */
  lastUpdated: Date | null;
  /** Manually trigger a refresh */
  refresh: () => Promise<void>;
  /** Whether polling is currently paused */
  isPaused: boolean;
}

/**
 * Hook for polling data at regular intervals
 *
 * Pauses when tab is hidden and resumes when visible.
 * Useful for live updates in share link viewers.
 *
 * @param fetcher - Async function that returns data
 * @param options - Polling configuration
 *
 * @example
 * ```tsx
 * const { data, isLoading, lastUpdated } = usePolling(
 *   () => fetch('/api/share/abc123').then(r => r.json()),
 *   { interval: 5000 }
 * );
 * ```
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  options: UsePollingOptions = {}
): UsePollingResult<T> {
  const {
    interval = 5000,
    enabled = true,
    pauseOnHidden = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetcherRef = useRef(fetcher);
  const mountedRef = useRef(true);

  // Keep fetcher ref up to date
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Fetch function
  const doFetch = useCallback(async (showLoading = false) => {
    if (!mountedRef.current) return;

    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const result = await fetcherRef.current();
      if (mountedRef.current) {
        setData(result);
        setError(null);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error("Failed to fetch"));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Manual refresh
  const refresh = useCallback(async () => {
    await doFetch(true);
  }, [doFetch]);

  // Start/stop polling
  useEffect(() => {
    if (!enabled || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    doFetch(true);

    // Set up interval
    intervalRef.current = setInterval(() => {
      doFetch(false);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isPaused, interval, doFetch]);

  // Handle visibility changes
  useEffect(() => {
    if (!pauseOnHidden) return;

    const handleVisibilityChange = () => {
      const isHidden = document.visibilityState === "hidden";
      setIsPaused(isHidden);

      // Refresh immediately when becoming visible
      if (!isHidden && enabled) {
        doFetch(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pauseOnHidden, enabled, doFetch]);

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
    isPaused,
  };
}

/**
 * Format last updated time for display
 *
 * @param date - Last updated timestamp
 * @returns Human-readable string like "Just now" or "2 min ago"
 */
export function formatLastUpdated(date: Date | null): string {
  if (!date) return "Never";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
