/**
 * IndexedDB Service for Sunday Dinner Offline Support
 *
 * Provides persistent storage for:
 * - Offline action queue (checkoffs, time changes)
 * - Sync status tracking
 * - Current meal cache for offline viewing
 *
 * Database structure:
 * - offline_queue: Pending actions to sync when online
 * - sync_status: Last sync timestamp and status
 * - meal_cache: Current meal data for offline access
 */

const DB_NAME = "sunday-dinner-offline";
const DB_VERSION = 1;

// Store names
export const STORES = {
  OFFLINE_QUEUE: "offline_queue",
  SYNC_STATUS: "sync_status",
  MEAL_CACHE: "meal_cache",
} as const;

/**
 * Action types that can be queued offline
 */
export type OfflineActionType =
  | "task_checkoff"
  | "task_status_change"
  | "task_time_change";

/**
 * Queued offline action
 */
export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  mealId: string;
  taskId: string;
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

/**
 * Sync status record
 */
export interface SyncStatus {
  id: "global";
  lastSyncedAt: string | null;
  pendingCount: number;
  isSyncing: boolean;
  lastError?: string;
}

/**
 * Cached meal data for offline viewing
 */
export interface CachedMeal {
  id: string;
  data: unknown;
  cachedAt: string;
  expiresAt: string;
}

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Open or get the IndexedDB database connection
 */
export function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      dbPromise = null;
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      // Handle connection close
      dbInstance.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };

      // Handle version change (another tab upgraded)
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
        dbPromise = null;
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Offline queue store
      if (!db.objectStoreNames.contains(STORES.OFFLINE_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.OFFLINE_QUEUE, {
          keyPath: "id",
        });
        queueStore.createIndex("mealId", "mealId", { unique: false });
        queueStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      // Sync status store
      if (!db.objectStoreNames.contains(STORES.SYNC_STATUS)) {
        db.createObjectStore(STORES.SYNC_STATUS, { keyPath: "id" });
      }

      // Meal cache store
      if (!db.objectStoreNames.contains(STORES.MEAL_CACHE)) {
        const cacheStore = db.createObjectStore(STORES.MEAL_CACHE, {
          keyPath: "id",
        });
        cacheStore.createIndex("expiresAt", "expiresAt", { unique: false });
      }
    };
  });

  return dbPromise;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    dbPromise = null;
  }
}

/**
 * Generic store operations
 */
async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    const request = callback(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error(`Store operation failed: ${request.error?.message}`));
  });
}

/**
 * Get all items from a store
 */
async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  return withStore(storeName, "readonly", (store) => store.getAll());
}

/**
 * Get item by key
 */
async function getFromStore<T>(
  storeName: string,
  key: IDBValidKey
): Promise<T | undefined> {
  return withStore(storeName, "readonly", (store) => store.get(key));
}

/**
 * Put item in store
 */
async function putInStore<T>(storeName: string, item: T): Promise<IDBValidKey> {
  return withStore(storeName, "readwrite", (store) => store.put(item));
}

/**
 * Delete item from store
 */
async function deleteFromStore(
  storeName: string,
  key: IDBValidKey
): Promise<undefined> {
  return withStore(storeName, "readwrite", (store) => store.delete(key));
}

// =============================================================================
// OFFLINE QUEUE OPERATIONS
// =============================================================================

/**
 * Generate a unique ID for offline actions
 */
function generateActionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Add an action to the offline queue
 */
export async function queueOfflineAction(
  type: OfflineActionType,
  mealId: string,
  taskId: string,
  payload: Record<string, unknown>
): Promise<OfflineAction> {
  const action: OfflineAction = {
    id: generateActionId(),
    type,
    mealId,
    taskId,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  await putInStore(STORES.OFFLINE_QUEUE, action);
  await updatePendingCount();

  return action;
}

/**
 * Get all pending offline actions
 */
export async function getPendingActions(): Promise<OfflineAction[]> {
  return getAllFromStore<OfflineAction>(STORES.OFFLINE_QUEUE);
}

/**
 * Get pending actions for a specific meal
 */
export async function getPendingActionsForMeal(
  mealId: string
): Promise<OfflineAction[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.OFFLINE_QUEUE, "readonly");
    const store = transaction.objectStore(STORES.OFFLINE_QUEUE);
    const index = store.index("mealId");
    const request = index.getAll(mealId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Remove an action from the queue (after successful sync)
 */
export async function removeOfflineAction(actionId: string): Promise<void> {
  await deleteFromStore(STORES.OFFLINE_QUEUE, actionId);
  await updatePendingCount();
}

/**
 * Update retry count for a failed action
 */
export async function incrementRetryCount(
  actionId: string,
  error?: string
): Promise<void> {
  const action = await getFromStore<OfflineAction>(
    STORES.OFFLINE_QUEUE,
    actionId
  );
  if (action) {
    action.retryCount += 1;
    action.lastError = error;
    await putInStore(STORES.OFFLINE_QUEUE, action);
  }
}

/**
 * Clear all actions for a meal (e.g., when meal is deleted)
 */
export async function clearActionsForMeal(mealId: string): Promise<void> {
  const actions = await getPendingActionsForMeal(mealId);
  for (const action of actions) {
    await deleteFromStore(STORES.OFFLINE_QUEUE, action.id);
  }
  await updatePendingCount();
}

// =============================================================================
// SYNC STATUS OPERATIONS
// =============================================================================

const DEFAULT_SYNC_STATUS: SyncStatus = {
  id: "global",
  lastSyncedAt: null,
  pendingCount: 0,
  isSyncing: false,
};

/**
 * Get current sync status
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  const status = await getFromStore<SyncStatus>(STORES.SYNC_STATUS, "global");
  return status || DEFAULT_SYNC_STATUS;
}

/**
 * Update sync status
 */
export async function updateSyncStatus(
  updates: Partial<Omit<SyncStatus, "id">>
): Promise<SyncStatus> {
  const current = await getSyncStatus();
  const updated: SyncStatus = { ...current, ...updates };
  await putInStore(STORES.SYNC_STATUS, updated);
  return updated;
}

/**
 * Mark sync as started
 */
export async function markSyncStarted(): Promise<void> {
  await updateSyncStatus({ isSyncing: true });
}

/**
 * Mark sync as completed
 */
export async function markSyncCompleted(): Promise<void> {
  await updateSyncStatus({
    isSyncing: false,
    lastSyncedAt: new Date().toISOString(),
    lastError: undefined,
  });
}

/**
 * Mark sync as failed
 */
export async function markSyncFailed(error: string): Promise<void> {
  await updateSyncStatus({
    isSyncing: false,
    lastError: error,
  });
}

/**
 * Update pending count from queue
 */
async function updatePendingCount(): Promise<void> {
  const actions = await getPendingActions();
  await updateSyncStatus({ pendingCount: actions.length });
}

// =============================================================================
// MEAL CACHE OPERATIONS
// =============================================================================

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Cache meal data for offline access
 */
export async function cacheMeal(mealId: string, data: unknown): Promise<void> {
  const cached: CachedMeal = {
    id: mealId,
    data,
    cachedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + CACHE_DURATION_MS).toISOString(),
  };
  await putInStore(STORES.MEAL_CACHE, cached);
}

/**
 * Get cached meal data
 */
export async function getCachedMeal(mealId: string): Promise<unknown | null> {
  const cached = await getFromStore<CachedMeal>(STORES.MEAL_CACHE, mealId);

  if (!cached) return null;

  // Check if expired
  if (new Date(cached.expiresAt) < new Date()) {
    await deleteCachedMeal(mealId);
    return null;
  }

  return cached.data;
}

/**
 * Delete cached meal
 */
export async function deleteCachedMeal(mealId: string): Promise<void> {
  await deleteFromStore(STORES.MEAL_CACHE, mealId);
}

/**
 * Clean up expired cache entries
 */
export async function cleanupExpiredCache(): Promise<number> {
  const db = await openDatabase();
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MEAL_CACHE, "readwrite");
    const store = transaction.objectStore(STORES.MEAL_CACHE);
    const index = store.index("expiresAt");

    // Get all expired entries
    const range = IDBKeyRange.upperBound(now);
    const request = index.openCursor(range);
    let deletedCount = 0;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        deletedCount++;
        cursor.continue();
      } else {
        resolve(deletedCount);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}
