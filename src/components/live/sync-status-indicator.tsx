"use client";

import { useState, useEffect } from "react";
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from "lucide-react";
import { useSyncStatus } from "@/lib/offline/use-sync-status";
import { cn } from "@/lib/utils";

/**
 * Sync status indicator for live cooking mode
 *
 * Shows:
 * - Online: "Last synced X ago" with cloud icon
 * - Offline: "X changes queued" with offline icon
 * - Syncing: Spinning refresh icon
 * - Error: Warning with retry button
 */
export function SyncStatusIndicator() {
  const {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncedAgo,
    lastError,
    hasOfflineSupport,
    triggerSync,
  } = useSyncStatus();

  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  // Show brief success indicator after sync
  useEffect(() => {
    if (!isSyncing && pendingCount === 0 && isOnline) {
      setShowSyncSuccess(true);
      const timer = setTimeout(() => setShowSyncSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSyncing, pendingCount, isOnline]);

  // Don't show if offline support isn't available
  if (!hasOfflineSupport) {
    return null;
  }

  // Determine display state
  const getStatusDisplay = () => {
    if (isSyncing) {
      return {
        icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        text: "Syncing...",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      };
    }

    if (!isOnline) {
      return {
        icon: <CloudOff className="h-4 w-4" />,
        text:
          pendingCount > 0
            ? `${pendingCount} change${pendingCount === 1 ? "" : "s"} queued`
            : "Offline",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
      };
    }

    if (lastError && pendingCount > 0) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: `${pendingCount} pending`,
        color: "text-red-600",
        bgColor: "bg-red-50",
        showRetry: true,
      };
    }

    if (showSyncSuccess) {
      return {
        icon: <Check className="h-4 w-4" />,
        text: "Synced",
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    }

    return {
      icon: <Cloud className="h-4 w-4" />,
      text: `Synced ${lastSyncedAgo}`,
      color: "text-neutral-500",
      bgColor: "bg-neutral-50",
    };
  };

  const status = getStatusDisplay();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
        status.bgColor,
        status.color
      )}
    >
      {status.icon}
      <span className="live-secondary-info">{status.text}</span>

      {"showRetry" in status && status.showRetry && (
        <button
          onClick={() => triggerSync()}
          className="ml-1 p-0.5 hover:bg-white/50 rounded transition-colors"
          title="Retry sync"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

/**
 * Compact version for tight spaces
 */
export function SyncStatusDot() {
  const { isOnline, isSyncing, pendingCount, hasOfflineSupport } =
    useSyncStatus();

  if (!hasOfflineSupport) return null;

  const getColor = () => {
    if (isSyncing) return "bg-blue-500 animate-pulse";
    if (!isOnline) return "bg-amber-500";
    if (pendingCount > 0) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div
      className={cn("w-2 h-2 rounded-full transition-colors", getColor())}
      title={
        isSyncing
          ? "Syncing..."
          : isOnline
            ? "Connected"
            : `Offline (${pendingCount} queued)`
      }
    />
  );
}
