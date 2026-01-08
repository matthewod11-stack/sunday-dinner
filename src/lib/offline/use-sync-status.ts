"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getSyncStatus,
  isIndexedDBAvailable,
  type SyncStatus,
} from "./indexed-db";
import {
  syncOfflineActions,
  isSyncInProgress,
  type SyncResult,
} from "./sync-service";
import { formatLastOnline } from "@/hooks/use-offline";

/**
 * Combined sync status with UI-friendly properties
 */
export interface SyncStatusInfo {
  /** Whether we're currently online */
  isOnline: boolean;

  /** Whether a sync is in progress */
  isSyncing: boolean;

  /** Number of pending offline actions */
  pendingCount: number;

  /** Last successful sync timestamp */
  lastSyncedAt: string | null;

  /** Formatted "X ago" string for last sync */
  lastSyncedAgo: string;

  /** Last sync error message */
  lastError?: string;

  /** Whether IndexedDB is available */
  hasOfflineSupport: boolean;

  /** Trigger a manual sync */
  triggerSync: () => Promise<SyncResult | null>;

  /** Refresh the status from IndexedDB */
  refreshStatus: () => Promise<void>;
}

const DEFAULT_STATUS: SyncStatus = {
  id: "global",
  lastSyncedAt: null,
  pendingCount: 0,
  isSyncing: false,
};

/**
 * Hook for monitoring sync status
 *
 * Provides real-time sync status including:
 * - Online/offline state
 * - Pending action count
 * - Last sync time (formatted)
 * - Manual sync trigger
 *
 * @example
 * ```tsx
 * function SyncIndicator() {
 *   const { isOnline, pendingCount, lastSyncedAgo, triggerSync } = useSyncStatus();
 *
 *   return (
 *     <div>
 *       {isOnline ? (
 *         <span>Last synced {lastSyncedAgo}</span>
 *       ) : (
 *         <span>{pendingCount} changes queued</span>
 *       )}
 *       <button onClick={triggerSync}>Sync Now</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSyncStatus(): SyncStatusInfo {
  const [isOnline, setIsOnline] = useState(true);
  const [status, setStatus] = useState<SyncStatus>(DEFAULT_STATUS);
  const [lastSyncedAgo, setLastSyncedAgo] = useState("Never");

  const hasOfflineSupport = isIndexedDBAvailable();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial status
  const refreshStatus = useCallback(async () => {
    if (!hasOfflineSupport) return;

    try {
      const currentStatus = await getSyncStatus();
      setStatus(currentStatus);

      // Update formatted time
      setLastSyncedAgo(
        currentStatus.lastSyncedAt
          ? formatLastOnline(currentStatus.lastSyncedAt)
          : "Never"
      );
    } catch (error) {
      console.error("Failed to load sync status:", error);
    }
  }, [hasOfflineSupport]);

  // Initialize and set up online/offline listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Set initial online state
    setIsOnline(navigator.onLine);

    // Load initial status
    refreshStatus();

    // Listen for online/offline
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      if (hasOfflineSupport) {
        syncOfflineActions().then(() => refreshStatus());
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Refresh status periodically (every 30 seconds)
    refreshIntervalRef.current = setInterval(refreshStatus, 30000);

    // Also refresh "X ago" text every minute
    const agoInterval = setInterval(() => {
      if (status.lastSyncedAt) {
        setLastSyncedAgo(formatLastOnline(status.lastSyncedAt));
      }
    }, 60000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      clearInterval(agoInterval);
    };
  }, [refreshStatus, hasOfflineSupport, status.lastSyncedAt]);

  // Trigger manual sync
  const triggerSync = useCallback(async (): Promise<SyncResult | null> => {
    if (!hasOfflineSupport || !isOnline || isSyncInProgress()) {
      return null;
    }

    // Update syncing state immediately
    setStatus((prev) => ({ ...prev, isSyncing: true }));

    try {
      const result = await syncOfflineActions();
      await refreshStatus();
      return result;
    } catch (error) {
      console.error("Sync failed:", error);
      await refreshStatus();
      return null;
    }
  }, [hasOfflineSupport, isOnline, refreshStatus]);

  return {
    isOnline,
    isSyncing: status.isSyncing,
    pendingCount: status.pendingCount,
    lastSyncedAt: status.lastSyncedAt,
    lastSyncedAgo,
    lastError: status.lastError,
    hasOfflineSupport,
    triggerSync,
    refreshStatus,
  };
}
