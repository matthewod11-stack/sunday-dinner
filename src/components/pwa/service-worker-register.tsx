"use client";

import { useEffect, useState } from "react";

/**
 * Service Worker registration state
 */
export interface ServiceWorkerState {
  /** Registration status */
  status: "idle" | "registering" | "registered" | "error" | "unsupported";

  /** The ServiceWorkerRegistration object if registered */
  registration: ServiceWorkerRegistration | null;

  /** Error message if registration failed */
  error: string | null;

  /** Whether an update is available */
  updateAvailable: boolean;

  /** Apply the waiting update */
  applyUpdate: () => void;
}

/**
 * Hook for service worker registration and update handling.
 */
export function useServiceWorker(): ServiceWorkerState {
  const [status, setStatus] = useState<ServiceWorkerState["status"]>("idle");
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }

    const registerServiceWorker = async () => {
      setStatus("registering");

      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        setRegistration(reg);
        setStatus("registered");

        // Check for updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;

          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New version available
                setUpdateAvailable(true);
              }
            });
          }
        });

        // Check if there's already a waiting worker
        if (reg.waiting && navigator.serviceWorker.controller) {
          setUpdateAvailable(true);
        }
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Registration failed");
      }
    };

    registerServiceWorker();

    // Listen for controller changes (when update is applied)
    const handleControllerChange = () => {
      // Reload to get new version
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
    };
  }, []);

  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };

  return {
    status,
    registration,
    error,
    updateAvailable,
    applyUpdate,
  };
}

/**
 * Component that registers the service worker on mount.
 *
 * Add this to your root layout to enable PWA functionality.
 * Renders nothing visible - just handles registration in the background.
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <ServiceWorkerRegister />
 * ```
 */
export function ServiceWorkerRegister(): null {
  const { status, error } = useServiceWorker();

  // Log registration status in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      if (status === "registered") {
        console.log("[SW] Service worker registered");
      } else if (status === "error") {
        console.error("[SW] Service worker registration failed:", error);
      } else if (status === "unsupported") {
        console.warn("[SW] Service workers not supported in this browser");
      }
    }
  }, [status, error]);

  // This component renders nothing
  return null;
}

export default ServiceWorkerRegister;
