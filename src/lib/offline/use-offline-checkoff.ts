"use client";

import { useCallback, useRef } from "react";
import type { TaskStatus } from "@/types";
import {
  queueOfflineAction,
  getPendingActionsForMeal,
  isIndexedDBAvailable,
  type OfflineAction,
} from "./indexed-db";

/**
 * Result of a checkoff operation
 */
export interface CheckoffResult {
  success: boolean;
  queued: boolean;
  error?: string;
}

/**
 * Options for the useOfflineCheckoff hook
 */
export interface UseOfflineCheckoffOptions {
  mealId: string;
  onSuccess?: (taskId: string) => void;
  onQueued?: (taskId: string) => void;
  onError?: (taskId: string, error: string) => void;
}

/**
 * Hook for offline-aware task checkoffs
 *
 * Provides a checkoff function that:
 * 1. Attempts to send to server
 * 2. Falls back to IndexedDB queue if offline
 * 3. Always succeeds from the caller's perspective
 *
 * @example
 * ```tsx
 * const { checkoff, isOnline, pendingCount } = useOfflineCheckoff({
 *   mealId,
 *   onQueued: (taskId) => showToast.info('Saved offline')
 * });
 *
 * // In your handler
 * await checkoff(taskId, 'completed', { completedAt: new Date().toISOString() });
 * ```
 */
export function useOfflineCheckoff({
  mealId,
  onSuccess,
  onQueued,
  onError,
}: UseOfflineCheckoffOptions) {
  // Track pending checkoffs for this meal
  const pendingRef = useRef<Map<string, OfflineAction>>(new Map());

  /**
   * Update task status with offline fallback
   */
  const checkoff = useCallback(
    async (
      taskId: string,
      status: TaskStatus,
      additionalPayload?: Record<string, unknown>
    ): Promise<CheckoffResult> => {
      const payload = {
        status,
        ...additionalPayload,
      };

      // Check if we're offline first
      if (!navigator.onLine) {
        return await queueCheckoff(taskId, payload);
      }

      // Try the API call
      try {
        const response = await fetch(`/api/live/${mealId}/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          // Server error - queue for retry
          return await queueCheckoff(taskId, payload);
        }

        onSuccess?.(taskId);
        return { success: true, queued: false };
      } catch {
        // Network error - queue for later
        return await queueCheckoff(taskId, payload);
      }
    },
    // Note: queueCheckoff is intentionally omitted to avoid recreation loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mealId, onSuccess]
  );

  /**
   * Queue a checkoff to IndexedDB
   */
  const queueCheckoff = useCallback(
    async (
      taskId: string,
      payload: Record<string, unknown>
    ): Promise<CheckoffResult> => {
      if (!isIndexedDBAvailable()) {
        onError?.(taskId, "Offline storage not available");
        return {
          success: false,
          queued: false,
          error: "Offline storage not available",
        };
      }

      try {
        const action = await queueOfflineAction(
          "task_checkoff",
          mealId,
          taskId,
          payload
        );

        pendingRef.current.set(taskId, action);
        onQueued?.(taskId);

        return { success: true, queued: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to queue offline";
        onError?.(taskId, errorMessage);
        return { success: false, queued: false, error: errorMessage };
      }
    },
    [mealId, onQueued, onError]
  );

  /**
   * Update task time (for timeline shifts)
   */
  const updateTaskTime = useCallback(
    async (
      taskId: string,
      startTimeMinutes: number,
      endTimeMinutes: number
    ): Promise<CheckoffResult> => {
      const payload = { startTimeMinutes, endTimeMinutes };

      if (!navigator.onLine) {
        return await queueTimeChange(taskId, payload);
      }

      try {
        const response = await fetch(`/api/live/${mealId}/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          return await queueTimeChange(taskId, payload);
        }

        onSuccess?.(taskId);
        return { success: true, queued: false };
      } catch {
        return await queueTimeChange(taskId, payload);
      }
    },
    // Note: queueTimeChange is intentionally omitted to avoid recreation loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mealId, onSuccess]
  );

  /**
   * Queue a time change to IndexedDB
   */
  const queueTimeChange = useCallback(
    async (
      taskId: string,
      payload: Record<string, unknown>
    ): Promise<CheckoffResult> => {
      if (!isIndexedDBAvailable()) {
        onError?.(taskId, "Offline storage not available");
        return {
          success: false,
          queued: false,
          error: "Offline storage not available",
        };
      }

      try {
        const action = await queueOfflineAction(
          "task_time_change",
          mealId,
          taskId,
          payload
        );

        pendingRef.current.set(`time-${taskId}`, action);
        onQueued?.(taskId);

        return { success: true, queued: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to queue offline";
        onError?.(taskId, errorMessage);
        return { success: false, queued: false, error: errorMessage };
      }
    },
    [mealId, onQueued, onError]
  );

  /**
   * Get count of pending actions for this meal
   */
  const getPendingCount = useCallback(async (): Promise<number> => {
    if (!isIndexedDBAvailable()) return 0;

    try {
      const actions = await getPendingActionsForMeal(mealId);
      return actions.length;
    } catch {
      return 0;
    }
  }, [mealId]);

  /**
   * Check if a specific task has pending offline changes
   */
  const hasPendingChanges = useCallback((taskId: string): boolean => {
    return (
      pendingRef.current.has(taskId) || pendingRef.current.has(`time-${taskId}`)
    );
  }, []);

  return {
    checkoff,
    updateTaskTime,
    getPendingCount,
    hasPendingChanges,
    isIndexedDBAvailable: isIndexedDBAvailable(),
  };
}
