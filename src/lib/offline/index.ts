/**
 * Offline support module for Sunday Dinner
 *
 * Provides IndexedDB-backed offline persistence for:
 * - Task checkoffs during cooking
 * - Sync queue for reconnection
 * - Meal data caching
 */

export {
  // Database operations
  openDatabase,
  closeDatabase,
  isIndexedDBAvailable,
  STORES,

  // Offline queue
  queueOfflineAction,
  getPendingActions,
  getPendingActionsForMeal,
  removeOfflineAction,
  incrementRetryCount,
  clearActionsForMeal,

  // Sync status
  getSyncStatus,
  updateSyncStatus,
  markSyncStarted,
  markSyncCompleted,
  markSyncFailed,

  // Meal cache
  cacheMeal,
  getCachedMeal,
  deleteCachedMeal,
  cleanupExpiredCache,

  // Types
  type OfflineAction,
  type OfflineActionType,
  type SyncStatus,
  type CachedMeal,
} from "./indexed-db";

// Hooks
export {
  useOfflineCheckoff,
  type CheckoffResult,
  type UseOfflineCheckoffOptions,
} from "./use-offline-checkoff";

// Sync service
export {
  syncOfflineActions,
  syncWithRetry,
  abortSync,
  isSyncInProgress,
  getCurrentSyncStatus,
  setupAutoSync,
  type SyncResult,
  type SyncCallbacks,
} from "./sync-service";

// Sync status hook
export { useSyncStatus, type SyncStatusInfo } from "./use-sync-status";

// Service Worker client
export {
  isServiceWorkerActive,
  setActiveMeal,
  clearActiveMeal,
  getActiveMeal,
  precacheImages,
  clearAllCaches,
  skipWaiting,
  listenForServiceWorkerMessages,
  isFromCache,
} from "./service-worker-client";

// Offline capability
export {
  useOfflineCapability,
  shouldWarnAboutOffline,
  type OfflineCapability,
  type OfflineCapabilityInfo,
} from "./use-offline-capability";
