"use client";

import { useState, useCallback } from "react";
import {
  AlertTriangle,
  Clock,
  Check,
  RefreshCw,
  Edit3,
  X,
  WifiOff,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { Timeline, RecalculationSuggestion, Task } from "@/types";
import { calculateRealTime, formatLiveTime } from "@/lib/services/execution";

interface RunningBehindButtonProps {
  mealId: string;
  timeline: Timeline;
  serveTime: Date;
  onAcceptSuggestion: (
    suggestion: RecalculationSuggestion,
    updatedTasks: Task[]
  ) => void;
  onNavigateToEdit: () => void;
  onOfflineShift: (shiftMinutes: number, updatedTasks: Task[]) => void;
}

type ModalState =
  | { kind: "closed" }
  | { kind: "loading" }
  | { kind: "suggestion"; suggestion: RecalculationSuggestion; attempts: number }
  | { kind: "offline" }
  | { kind: "error"; message: string };

const MAX_ATTEMPTS = 3;

export function RunningBehindButton({
  mealId,
  timeline,
  serveTime,
  onAcceptSuggestion,
  onNavigateToEdit,
  onOfflineShift,
}: RunningBehindButtonProps) {
  const [modalState, setModalState] = useState<ModalState>({ kind: "closed" });

  const requestSuggestion = useCallback(
    async (attemptNumber: number) => {
      setModalState({ kind: "loading" });

      // Check if offline
      if (!navigator.onLine) {
        setModalState({ kind: "offline" });
        return;
      }

      try {
        const response = await fetch(`/api/live/${mealId}/recalculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timeline,
            currentTime: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to get suggestion");
        }

        const suggestion: RecalculationSuggestion = await response.json();
        setModalState({
          kind: "suggestion",
          suggestion,
          attempts: attemptNumber,
        });
      } catch (err) {
        // Network error likely means offline
        if (
          err instanceof TypeError &&
          err.message.includes("fetch")
        ) {
          setModalState({ kind: "offline" });
        } else {
          setModalState({
            kind: "error",
            message: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }
    },
    [mealId, timeline]
  );

  const handleOpenModal = useCallback(() => {
    requestSuggestion(1);
  }, [requestSuggestion]);

  const handleAccept = useCallback(() => {
    if (modalState.kind !== "suggestion") return;

    const { suggestion } = modalState;

    // Calculate updated tasks with new times
    const taskToMove = timeline.tasks.find((t) => t.id === suggestion.taskId);
    if (!taskToMove) return;

    const timeDelta =
      suggestion.newStartTimeMinutes - taskToMove.startTimeMinutes;

    // Update main task and affected tasks
    const affectedIds = new Set([
      suggestion.taskId,
      ...(suggestion.affectedTaskIds || []),
    ]);

    const updatedTasks = timeline.tasks.map((task) => {
      if (task.id === suggestion.taskId) {
        return {
          ...task,
          startTimeMinutes: suggestion.newStartTimeMinutes,
          endTimeMinutes:
            suggestion.newStartTimeMinutes + task.durationMinutes,
        };
      }
      if (affectedIds.has(task.id!)) {
        return {
          ...task,
          startTimeMinutes: task.startTimeMinutes + timeDelta,
          endTimeMinutes: task.endTimeMinutes + timeDelta,
        };
      }
      return task;
    });

    onAcceptSuggestion(suggestion, updatedTasks);
    setModalState({ kind: "closed" });
  }, [modalState, timeline.tasks, onAcceptSuggestion]);

  const handleAdjustDifferently = useCallback(() => {
    if (modalState.kind !== "suggestion") return;

    if (modalState.attempts >= MAX_ATTEMPTS) {
      // Already at max, can't request more
      return;
    }

    requestSuggestion(modalState.attempts + 1);
  }, [modalState, requestSuggestion]);

  const handleFixMyself = useCallback(() => {
    setModalState({ kind: "closed" });
    onNavigateToEdit();
  }, [onNavigateToEdit]);

  const handleOfflineShift = useCallback(() => {
    const shiftMinutes = 15;

    // Shift all pending tasks by 15 minutes
    const updatedTasks = timeline.tasks.map((task) => {
      if (task.status === "pending") {
        return {
          ...task,
          startTimeMinutes: task.startTimeMinutes + shiftMinutes,
          endTimeMinutes: task.endTimeMinutes + shiftMinutes,
        };
      }
      return task;
    });

    onOfflineShift(shiftMinutes, updatedTasks);
    setModalState({ kind: "closed" });
  }, [timeline.tasks, onOfflineShift]);

  const handleClose = useCallback(() => {
    setModalState({ kind: "closed" });
  }, []);

  // Format suggestion for display
  const formatSuggestion = (suggestion: RecalculationSuggestion): string => {
    const task = timeline.tasks.find((t) => t.id === suggestion.taskId);
    if (!task) return suggestion.description;

    const oldTime = calculateRealTime(task.startTimeMinutes, serveTime);
    const newTime = calculateRealTime(
      suggestion.newStartTimeMinutes,
      serveTime
    );

    return `Push "${task.title}" from ${formatLiveTime(oldTime)} → ${formatLiveTime(newTime)}?`;
  };

  return (
    <>
      {/* Floating "I'm Behind" Button */}
      <button
        onClick={handleOpenModal}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-3
                   bg-amber-500 hover:bg-amber-600 text-white
                   rounded-full shadow-lg hover:shadow-xl
                   transition-all duration-200 active:scale-95"
        aria-label="I'm running behind schedule"
      >
        <Clock className="h-5 w-5" />
        <span className="font-medium">I&apos;m Behind</span>
      </button>

      {/* Modal Overlay */}
      {modalState.kind !== "closed" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h2 className="font-display text-lg font-semibold">
                  Running Behind?
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {modalState.kind === "loading" && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                  <p className="mt-4 text-neutral-600">
                    Analyzing your timeline...
                  </p>
                </div>
              )}

              {modalState.kind === "suggestion" && (
                <div className="space-y-4">
                  <p className="text-lg text-foreground">
                    {formatSuggestion(modalState.suggestion)}
                  </p>

                  {modalState.suggestion.tasksShifted > 0 && (
                    <p className="text-sm text-neutral-500">
                      This will shift {modalState.suggestion.tasksShifted} other
                      task{modalState.suggestion.tasksShifted > 1 ? "s" : ""}.
                    </p>
                  )}

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      variant="primary"
                      onClick={handleAccept}
                      className="w-full"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Accept
                    </Button>

                    {modalState.attempts < MAX_ATTEMPTS ? (
                      <Button
                        variant="outline"
                        onClick={handleAdjustDifferently}
                        className="w-full"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Adjust Differently ({MAX_ATTEMPTS - modalState.attempts}{" "}
                        left)
                      </Button>
                    ) : (
                      <p className="text-sm text-neutral-400 text-center">
                        Max adjustments reached
                      </p>
                    )}

                    <Button
                      variant="ghost"
                      onClick={handleFixMyself}
                      className="w-full text-neutral-600"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      I&apos;ll fix it myself
                    </Button>
                  </div>
                </div>
              )}

              {modalState.kind === "offline" && (
                <div className="text-center space-y-4">
                  <div className="bg-neutral-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <WifiOff className="h-8 w-8 text-neutral-500" />
                  </div>
                  <p className="text-neutral-600">
                    You&apos;re offline. Use the quick shift button to push all
                    tasks by 15 minutes.
                  </p>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      variant="primary"
                      onClick={handleOfflineShift}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      +15 Minutes
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={handleFixMyself}
                      className="w-full text-neutral-600"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit manually
                    </Button>
                  </div>
                </div>
              )}

              {modalState.kind === "error" && (
                <div className="text-center space-y-4">
                  <p className="text-red-600">{modalState.message}</p>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => requestSuggestion(1)}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={handleFixMyself}
                      className="w-full text-neutral-600"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit manually
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
