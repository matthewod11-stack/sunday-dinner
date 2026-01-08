"use client";

import {
  getPendingActions,
  removeOfflineAction,
  incrementRetryCount,
  markSyncStarted,
  markSyncCompleted,
  markSyncFailed,
  getSyncStatus,
  isIndexedDBAvailable,
  type OfflineAction,
} from "./indexed-db";

/**
 * Maximum retry attempts before giving up on an action
 */
const MAX_RETRIES = 5;

/**
 * Base delay for exponential backoff (ms)
 */
const BASE_DELAY_MS = 1000;

/**
 * Maximum delay between retries (ms)
 */
const MAX_DELAY_MS = 30000;

/**
 * Sync result for a single action
 */
interface SyncActionResult {
  actionId: string;
  success: boolean;
  error?: string;
  retryable: boolean;
}

/**
 * Overall sync result
 */
export interface SyncResult {
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

/**
 * Callbacks for sync progress
 */
export interface SyncCallbacks {
  onStart?: () => void;
  onProgress?: (processed: number, total: number) => void;
  onActionSuccess?: (action: OfflineAction) => void;
  onActionFailed?: (action: OfflineAction, error: string) => void;
  onComplete?: (result: SyncResult) => void;
}

let isSyncing = false;
let syncAborted = false;

/**
 * Calculate delay for exponential backoff
 */
function calculateBackoffDelay(retryCount: number): number {
  const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
  return Math.min(delay, MAX_DELAY_MS);
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Process a single offline action
 */
async function processAction(action: OfflineAction): Promise<SyncActionResult> {
  const { id, type, mealId, taskId, payload } = action;

  // Build the API endpoint based on action type
  let endpoint: string;
  const method: string = "PATCH";
  let body: Record<string, unknown>;

  switch (type) {
    case "task_checkoff":
    case "task_status_change":
    case "task_time_change":
      endpoint = `/api/live/${mealId}/tasks/${taskId}`;
      body = payload;
      break;
    default:
      return {
        actionId: id,
        success: false,
        error: `Unknown action type: ${type}`,
        retryable: false,
      };
  }

  try {
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return { actionId: id, success: true, retryable: false };
    }

    // Handle different error codes
    const statusCode = response.status;

    // 4xx errors (except 429) are not retryable - bad request, not found, etc.
    if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
      const errorData = await response.json().catch(() => ({}));
      return {
        actionId: id,
        success: false,
        error: errorData.error || `HTTP ${statusCode}`,
        retryable: false,
      };
    }

    // 429 (rate limit) and 5xx errors are retryable
    return {
      actionId: id,
      success: false,
      error: `HTTP ${statusCode}`,
      retryable: true,
    };
  } catch (error) {
    // Network errors are retryable
    return {
      actionId: id,
      success: false,
      error: error instanceof Error ? error.message : "Network error",
      retryable: true,
    };
  }
}

/**
 * Sync all pending offline actions
 *
 * Processes actions in order (oldest first) with exponential backoff
 * for failures. Non-retryable errors are logged and the action is removed.
 */
export async function syncOfflineActions(
  callbacks?: SyncCallbacks
): Promise<SyncResult> {
  // Prevent concurrent syncs
  if (isSyncing) {
    return {
      success: false,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: ["Sync already in progress"],
    };
  }

  if (!isIndexedDBAvailable()) {
    return {
      success: false,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: ["IndexedDB not available"],
    };
  }

  // Check if online
  if (!navigator.onLine) {
    return {
      success: false,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: ["Device is offline"],
    };
  }

  isSyncing = true;
  syncAborted = false;

  try {
    await markSyncStarted();
    callbacks?.onStart?.();

    const actions = await getPendingActions();

    // Sort by creation time (oldest first)
    actions.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const result: SyncResult = {
      success: true,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [],
    };

    for (const action of actions) {
      // Check if sync was aborted
      if (syncAborted) {
        result.success = false;
        result.errors.push("Sync aborted");
        break;
      }

      // Check if we're still online
      if (!navigator.onLine) {
        result.success = false;
        result.errors.push("Lost connection during sync");
        break;
      }

      // Skip if max retries exceeded
      if (action.retryCount >= MAX_RETRIES) {
        await removeOfflineAction(action.id);
        result.processed++;
        result.failed++;
        result.errors.push(
          `Action ${action.id} exceeded max retries: ${action.lastError}`
        );
        callbacks?.onActionFailed?.(action, "Max retries exceeded");
        continue;
      }

      // Calculate backoff delay if this is a retry
      if (action.retryCount > 0) {
        const delay = calculateBackoffDelay(action.retryCount);
        await sleep(delay);
      }

      // Process the action
      const actionResult = await processAction(action);
      result.processed++;

      if (actionResult.success) {
        await removeOfflineAction(action.id);
        result.succeeded++;
        callbacks?.onActionSuccess?.(action);
      } else if (actionResult.retryable) {
        // Increment retry count for next sync attempt
        await incrementRetryCount(action.id, actionResult.error);
        // Don't count as failed yet - will retry
      } else {
        // Non-retryable error - remove and log
        await removeOfflineAction(action.id);
        result.failed++;
        result.errors.push(
          `Action ${action.id} failed permanently: ${actionResult.error}`
        );
        callbacks?.onActionFailed?.(action, actionResult.error || "Unknown");
      }

      callbacks?.onProgress?.(result.processed, actions.length);
    }

    if (result.failed === 0 && !syncAborted) {
      await markSyncCompleted();
    } else {
      await markSyncFailed(result.errors.join("; "));
    }

    callbacks?.onComplete?.(result);
    return result;
  } finally {
    isSyncing = false;
  }
}

/**
 * Abort an in-progress sync
 */
export function abortSync(): void {
  syncAborted = true;
}

/**
 * Check if a sync is currently in progress
 */
export function isSyncInProgress(): boolean {
  return isSyncing;
}

/**
 * Get the current sync status
 */
export async function getCurrentSyncStatus() {
  return getSyncStatus();
}

/**
 * Hook to listen for online status and trigger sync
 */
export function setupAutoSync(callbacks?: SyncCallbacks): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleOnline = async () => {
    // Small delay to ensure connection is stable
    await sleep(1000);

    if (navigator.onLine && !isSyncing) {
      await syncOfflineActions(callbacks);
    }
  };

  window.addEventListener("online", handleOnline);

  // Also sync on page visibility change (returning to tab)
  const handleVisibilityChange = async () => {
    if (
      document.visibilityState === "visible" &&
      navigator.onLine &&
      !isSyncing
    ) {
      // Check if there are pending actions before syncing
      const status = await getSyncStatus();
      if (status.pendingCount > 0) {
        await syncOfflineActions(callbacks);
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    window.removeEventListener("online", handleOnline);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

/**
 * Manually trigger a sync with retry
 *
 * Will retry with exponential backoff if sync fails
 */
export async function syncWithRetry(
  maxAttempts: number = 3,
  callbacks?: SyncCallbacks
): Promise<SyncResult> {
  let lastResult: SyncResult | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await sleep(calculateBackoffDelay(attempt));
    }

    lastResult = await syncOfflineActions(callbacks);

    // Success or permanent failure - stop retrying
    if (lastResult.success || lastResult.processed === lastResult.failed) {
      return lastResult;
    }

    // Some succeeded - partial success, continue for remaining
    if (lastResult.succeeded > 0) {
      continue;
    }

    // All failed with retryable errors - try again
    if (!navigator.onLine) {
      break; // Don't retry if offline
    }
  }

  return (
    lastResult || {
      success: false,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: ["Sync failed after all retries"],
    }
  );
}
