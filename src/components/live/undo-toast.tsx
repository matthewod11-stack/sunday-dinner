"use client";

import { useEffect, useState } from "react";
import { Undo2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UndoToastProps {
  taskTitle: string;
  onUndo: () => void;
  onDismiss: () => void;
  /** Time in milliseconds until auto-dismiss */
  duration?: number;
}

/**
 * Undo toast for task checkoffs
 *
 * Shows for 30 seconds with countdown progress bar.
 * Allows user to undo accidental checkoffs.
 */
export function UndoToast({
  taskTitle,
  onUndo,
  onDismiss,
  duration = 30000,
}: UndoToastProps) {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Countdown progress
  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      const newProgress = Math.max(0, (remaining / duration) * 100);
      setProgress(newProgress);

      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  const handleUndo = () => {
    setIsVisible(false);
    setTimeout(onUndo, 200);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 200);
  };

  return (
    <div
      className={cn(
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-200",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      )}
    >
      <div className="bg-neutral-900 text-white rounded-lg shadow-xl overflow-hidden min-w-[280px]">
        {/* Content */}
        <div className="flex items-center gap-3 p-4">
          <span className="text-sm flex-1">
            <span className="font-medium">{truncate(taskTitle, 30)}</span>
            <span className="text-neutral-400"> completed</span>
          </span>

          {/* Undo button */}
          <button
            type="button"
            onClick={handleUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors text-sm font-medium"
          >
            <Undo2 className="h-4 w-4" />
            Undo
          </button>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded hover:bg-white/10 active:bg-white/20 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-neutral-400" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-neutral-800">
          <div
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Truncate text with ellipsis
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
