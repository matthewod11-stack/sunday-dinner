"use client";

import { useState, useEffect, useCallback } from "react";
import { Type } from "lucide-react";

const STORAGE_KEY = "sunday-dinner-large-text";

/**
 * Check if large text mode is enabled (from localStorage)
 */
export function isLargeTextEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

/**
 * Toggle for large text mode in live cooking view.
 *
 * When enabled:
 * - Task titles increase from 1.125rem to 1.5rem
 * - Times increase from 0.875rem to 1.125rem
 * - Secondary info (descriptions) is hidden
 * - Touch targets increase to 56px minimum
 */
export function LargeTextToggle() {
  const [enabled, setEnabled] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    setEnabled(isLargeTextEnabled());
  }, []);

  // Apply data attribute to root when enabled changes
  useEffect(() => {
    if (enabled) {
      document.documentElement.setAttribute("data-large-text", "true");
    } else {
      document.documentElement.removeAttribute("data-large-text");
    }
  }, [enabled]);

  const toggle = useCallback(() => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem(STORAGE_KEY, String(newValue));
  }, [enabled]);

  return (
    <button
      onClick={toggle}
      className={`
        p-2 rounded-lg transition-colors
        ${enabled
          ? "bg-primary/10 text-primary"
          : "text-neutral-500 hover:bg-neutral-100"
        }
      `}
      aria-label={enabled ? "Disable large text mode" : "Enable large text mode"}
      aria-pressed={enabled}
    >
      <Type className="h-5 w-5" />
    </button>
  );
}

/**
 * Hook to use large text mode state with automatic cleanup
 */
export function useLargeTextMode() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isLargeTextEnabled());

    // Listen for storage changes (in case toggle happens in another tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setEnabled(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return enabled;
}
