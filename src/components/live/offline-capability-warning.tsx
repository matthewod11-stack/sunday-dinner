"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, Info } from "lucide-react";
import {
  useOfflineCapability,
  shouldWarnAboutOffline,
} from "@/lib/offline/use-offline-capability";
import { cn } from "@/lib/utils";

const DISMISSED_KEY = "sunday-dinner-offline-warning-dismissed";

/**
 * Warning banner for limited offline capability
 *
 * Shows when Service Worker or IndexedDB is unavailable.
 * Can be dismissed and remembers the choice for the session.
 */
export function OfflineCapabilityWarning() {
  const info = useOfflineCapability();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check if previously dismissed this session
  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;

    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  // Show after a brief delay (to avoid flash)
  useEffect(() => {
    if (info.capability !== "none" || isDismissed) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [info.capability, isDismissed]);

  // Don't warn if full capability or already dismissed
  if (!shouldWarnAboutOffline(info) || isDismissed || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(DISMISSED_KEY, "true");
    }
  };

  // Partial capability - show informational banner
  if (info.capability === "partial") {
    return (
      <div className="bg-blue-50 border-b border-blue-100 animate-fadeIn">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-700 flex-1">{info.description}</p>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5 text-blue-500" />
          </button>
        </div>
      </div>
    );
  }

  // No capability - show warning banner
  return (
    <div className="bg-amber-50 border-b border-amber-100 animate-fadeIn">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800">
              Limited offline support
            </p>
            <p className="text-xs text-amber-600 mt-0.5">{info.description}</p>
            {info.recommendations.length > 0 && (
              <ul className="mt-2 space-y-1">
                {info.recommendations.map((rec, index) => (
                  <li key={index} className="text-xs text-amber-700 flex gap-1">
                    <span>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-amber-100 rounded transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-amber-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact inline warning for use in forms/modals
 */
export function OfflineCapabilityInline({
  className,
}: {
  className?: string;
}) {
  const info = useOfflineCapability();

  if (!shouldWarnAboutOffline(info)) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2 p-3 rounded-lg text-xs",
        info.capability === "partial"
          ? "bg-blue-50 text-blue-700"
          : "bg-amber-50 text-amber-700",
        className
      )}
    >
      {info.capability === "partial" ? (
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
      )}
      <div>
        <p className="font-medium">
          {info.capability === "partial"
            ? "Partial offline support"
            : "Limited offline support"}
        </p>
        <p className="mt-0.5 opacity-90">{info.description}</p>
      </div>
    </div>
  );
}
