"use client";

import { useOffline, formatLastOnline } from "@/hooks";

/**
 * Offline indicator banner.
 *
 * Shows a subtle banner when the app is offline, with last sync time.
 * Automatically appears/disappears based on connection status.
 *
 * @example
 * ```tsx
 * // In layout.tsx or a page
 * <OfflineIndicator />
 * ```
 */
export function OfflineIndicator() {
  const { isOffline, lastOnline, isChecking, checkConnection } = useOffline();

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md safe-margin-bottom">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              You&apos;re offline
            </p>
            <p className="text-xs text-amber-600">
              Last synced: {formatLastOnline(lastOnline)}
            </p>
          </div>
        </div>
        <button
          onClick={() => checkConnection()}
          disabled={isChecking}
          className="rounded-md bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200 disabled:opacity-50"
        >
          {isChecking ? "Checking..." : "Retry"}
        </button>
      </div>
    </div>
  );
}

export default OfflineIndicator;
