"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Timer as TimerIcon,
  Pause,
  Play,
  RotateCcw,
  X,
  ChevronUp,
  ChevronDown,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getTimerService,
  formatTimerDisplay,
  type Timer,
} from "@/lib/timers";

interface ActiveTimerBannerProps {
  className?: string;
}

/**
 * Active Timer Banner
 *
 * Sticky banner at bottom of screen showing active timers.
 * Expandable to show all timers with controls.
 */
export function ActiveTimerBanner({ className }: ActiveTimerBannerProps) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Subscribe to timer updates
  useEffect(() => {
    const service = getTimerService();
    const unsubscribe = service.subscribe(setTimers);

    return () => unsubscribe();
  }, []);

  // Show/hide animation
  useEffect(() => {
    if (timers.length > 0) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setIsExpanded(false);
    }
  }, [timers.length]);

  const handlePause = useCallback((timerId: string) => {
    getTimerService().pauseTimer(timerId);
  }, []);

  const handleResume = useCallback((timerId: string) => {
    getTimerService().resumeTimer(timerId);
  }, []);

  const handleReset = useCallback((timerId: string) => {
    getTimerService().resetTimer(timerId);
  }, []);

  const handleDismiss = useCallback((timerId: string) => {
    getTimerService().dismissTimer(timerId);
  }, []);

  const handleAddTime = useCallback((timerId: string, seconds: number) => {
    getTimerService().addTime(timerId, seconds);
  }, []);

  // Get most urgent timer (least remaining time or completed)
  const urgentTimer =
    timers.find((t) => t.status === "completed") ||
    timers.find((t) => t.status === "running") ||
    timers[0];

  if (!isVisible || !urgentTimer) {
    return null;
  }

  const isCompleted = urgentTimer.status === "completed";

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full",
        className
      )}
    >
      {/* Main banner */}
      <div
        className={cn(
          "bg-neutral-900 text-white shadow-xl safe-area-inset-bottom",
          isCompleted && "bg-primary animate-pulse"
        )}
      >
        {/* Collapsed view - show most urgent timer */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <Bell className="h-6 w-6 animate-bounce" />
            ) : (
              <TimerIcon className="h-6 w-6" />
            )}
            <div className="text-left">
              <span className="font-medium">{urgentTimer.label}</span>
              {timers.length > 1 && (
                <span className="text-sm text-neutral-400 ml-2">
                  +{timers.length - 1} more
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                "font-mono text-2xl font-bold",
                isCompleted && "animate-pulse"
              )}
            >
              {isCompleted
                ? "DONE!"
                : formatTimerDisplay(urgentTimer.remainingSeconds)}
            </span>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </div>
        </button>

        {/* Expanded view - all timers with controls */}
        {isExpanded && (
          <div className="border-t border-white/10 p-4 space-y-4 max-h-[50vh] overflow-y-auto">
            {timers.map((timer) => (
              <TimerRow
                key={timer.id}
                timer={timer}
                onPause={handlePause}
                onResume={handleResume}
                onReset={handleReset}
                onDismiss={handleDismiss}
                onAddTime={handleAddTime}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual timer row in expanded view
 */
function TimerRow({
  timer,
  onPause,
  onResume,
  onReset,
  onDismiss,
  onAddTime,
}: {
  timer: Timer;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onReset: (id: string) => void;
  onDismiss: (id: string) => void;
  onAddTime: (id: string, seconds: number) => void;
}) {
  const isCompleted = timer.status === "completed";
  const isPaused = timer.status === "paused";

  // Progress percentage
  const progress =
    timer.durationSeconds > 0
      ? ((timer.durationSeconds - timer.remainingSeconds) /
          timer.durationSeconds) *
        100
      : 100;

  return (
    <div
      className={cn(
        "rounded-lg p-3",
        isCompleted ? "bg-primary/20" : "bg-white/5"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium truncate flex-1 mr-3">{timer.label}</span>
        <span
          className={cn(
            "font-mono text-xl font-bold",
            isCompleted && "text-primary"
          )}
        >
          {isCompleted
            ? "DONE!"
            : formatTimerDisplay(timer.remainingSeconds)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/10 mb-3 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-linear",
            isCompleted ? "bg-primary" : "bg-white/50"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Play/Pause */}
        {!isCompleted && (
          <button
            type="button"
            onClick={() =>
              isPaused ? onResume(timer.id) : onPause(timer.id)
            }
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
            aria-label={isPaused ? "Resume timer" : "Pause timer"}
          >
            {isPaused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Reset */}
        <button
          type="button"
          onClick={() => onReset(timer.id)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
          aria-label="Reset timer"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Add time buttons */}
        <div className="flex-1 flex justify-center gap-1">
          <button
            type="button"
            onClick={() => onAddTime(timer.id, 60)}
            className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
          >
            +1m
          </button>
          <button
            type="button"
            onClick={() => onAddTime(timer.id, 300)}
            className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
          >
            +5m
          </button>
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={() => onDismiss(timer.id)}
          className="p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors text-neutral-400 hover:text-white"
          aria-label="Dismiss timer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
