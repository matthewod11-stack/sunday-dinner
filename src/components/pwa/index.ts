/**
 * PWA components for Sunday Dinner.
 *
 * Provides service worker registration and offline UI.
 *
 * @module
 */

export {
  ServiceWorkerRegister,
  useServiceWorker,
} from "./service-worker-register";
export type { ServiceWorkerState } from "./service-worker-register";

export { OfflineIndicator } from "./offline-indicator";
