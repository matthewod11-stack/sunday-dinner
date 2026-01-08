"use client";

import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { useSyncStatus } from "@/lib/offline/use-sync-status";
import { cn } from "@/lib/utils";

/**
 * Offline banner for live cooking mode
 *
 * Shows when the user loses connection during cooking.
 * Provides reassurance that changes are saved locally and will sync.
 */
export function OfflineBanner() {
  const { isOnline, isSyncing, pendingCount, triggerSync, hasOfflineSupport } =
    useSyncStatus();

  const [wasOffline, setWasOffline] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Track if we were offline (to show success message when back online)
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowSuccess(false);
      setIsAnimatingOut(false);
    } else if (wasOffline && !isSyncing && pendingCount === 0) {
      // Just came back online and synced successfully
      setShowSuccess(true);

      // Hide success message after 3 seconds
      const timer = setTimeout(() => {
        setIsAnimatingOut(true);
        setTimeout(() => {
          setShowSuccess(false);
          setWasOffline(false);
          setIsAnimatingOut(false);
        }, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, isSyncing, pendingCount]);

  // Don't show if offline support isn't available and we're online
  if (!hasOfflineSupport && isOnline) {
    return null;
  }

  // Nothing to show if online and never was offline
  if (isOnline && !wasOffline && !showSuccess) {
    return null;
  }

  // Show success message
  if (isOnline && showSuccess) {
    return (
      <div
        className={cn(
          "fixed top-16 left-0 right-0 z-40 transition-all duration-300",
          isAnimatingOut ? "opacity-0 -translate-y-2" : "opacity-100"
        )}
      >
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm">
            <div className="bg-green-100 rounded-full p-1.5">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Back online — all changes synced!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show offline state
  if (!isOnline) {
    return (
      <div className="fixed top-16 left-0 right-0 z-40 animate-fadeIn">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 rounded-full p-1.5">
                <WifiOff className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  You&apos;re offline
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {hasOfflineSupport
                    ? "Keep cooking — changes save locally and sync when you reconnect."
                    : "Some features may not work until you reconnect."}
                </p>
              </div>
            </div>

            {hasOfflineSupport && pendingCount > 0 && (
              <div className="mt-2 pt-2 border-t border-amber-200 flex items-center gap-2 text-xs text-amber-700">
                <span className="bg-amber-100 px-2 py-0.5 rounded-full">
                  {pendingCount} change{pendingCount === 1 ? "" : "s"} queued
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show syncing state
  if (wasOffline && isSyncing) {
    return (
      <div className="fixed top-16 left-0 right-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm">
            <div className="bg-blue-100 rounded-full p-1.5">
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                Syncing your changes...
              </p>
              {pendingCount > 0 && (
                <p className="text-xs text-blue-600 mt-0.5">
                  {pendingCount} change{pendingCount === 1 ? "" : "s"} remaining
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show "sync needed" state (back online but still has pending)
  if (wasOffline && isOnline && pendingCount > 0) {
    return (
      <div className="fixed top-16 left-0 right-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 rounded-full p-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  {pendingCount} change{pendingCount === 1 ? "" : "s"} need to
                  sync
                </p>
              </div>
              <button
                onClick={() => triggerSync()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 rounded-md text-sm font-medium text-amber-800 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Sync Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Compact offline indicator for the header
 */
export function OfflineIndicatorCompact() {
  const { isOnline, pendingCount, hasOfflineSupport } = useSyncStatus();

  if (isOnline || !hasOfflineSupport) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 rounded-full text-xs font-medium text-amber-700">
      <WifiOff className="h-3 w-3" />
      <span>Offline</span>
      {pendingCount > 0 && (
        <span className="bg-amber-200 px-1.5 py-0.5 rounded-full">
          {pendingCount}
        </span>
      )}
    </div>
  );
}
