"use client";

import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import { ArrowLeft, Play, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import type { Timeline, TaskStatus } from "@/types";
import { Button, showToast } from "@/components/ui";
import {
  ProgressBar,
  LiveTimelineView,
  UndoToast,
  KitchenWalkthrough,
  shouldSkipWalkthrough,
  ActiveTimerBanner,
} from "@/components/live";
import { ExecutionState } from "@/lib/services/execution";
import { getTimerService } from "@/lib/timers";

interface LiveState {
  timeline: Timeline;
  meal: {
    id: string;
    name: string;
    serveTime: string;
    guestCount: number;
  };
  recipeNames: Record<string, string>;
}

interface UndoAction {
  taskId: string;
  taskTitle: string;
  previousStatus: TaskStatus;
  expiresAt: number;
}

export default function LivePage({
  params,
}: {
  params: Promise<{ mealId: string }>;
}) {
  const { mealId } = use(params);

  const [liveState, setLiveState] = useState<LiveState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executionState, setExecutionState] =
    useState<ExecutionState>("not_started");
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Fetch live state
  useEffect(() => {
    async function fetchLiveState() {
      try {
        const response = await fetch(`/api/live/${mealId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load live state");
        }
        const data: LiveState = await response.json();
        setLiveState(data);

        // Determine execution state
        if (data.timeline.isRunning) {
          setExecutionState("cooking");
        } else {
          setExecutionState("not_started");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchLiveState();
  }, [mealId]);

  // Start cooking session (separated for reuse)
  const startCookingSession = useCallback(async () => {
    setIsStarting(true);
    try {
      const response = await fetch(`/api/live/${mealId}/start`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start cooking");
      }

      const data = await response.json();

      // Update local state
      setLiveState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          timeline: {
            ...prev.timeline,
            isRunning: true,
            startedAt: data.startedAt,
            currentTaskId: data.currentTaskId,
            tasks: prev.timeline.tasks.map((t) =>
              t.id === data.currentTaskId
                ? { ...t, status: "in_progress" as const }
                : t
            ),
          },
        };
      });
      setExecutionState("cooking");

      showToast.success("Let's cook! Timer started. Good luck!");
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Failed to start");
    } finally {
      setIsStarting(false);
    }
  }, [mealId]);

  // Handle Start Cooking
  const handleStartCooking = useCallback(async () => {
    // Show walkthrough if not skipped
    if (!shouldSkipWalkthrough()) {
      setShowWalkthrough(true);
      return;
    }

    await startCookingSession();
  }, [startCookingSession]);

  // Handle Walkthrough completion
  const handleWalkthroughReady = () => {
    setShowWalkthrough(false);
    startCookingSession();
  };

  const handleWalkthroughSkip = () => {
    setShowWalkthrough(false);
    startCookingSession();
  };

  // Handle task checkoff
  const handleCheckoff = useCallback(
    async (taskId: string) => {
      if (!liveState) return;

      const task = liveState.timeline.tasks.find((t) => t.id === taskId);
      if (!task || task.status === "completed") return;

      // Optimistic update
      const previousStatus = task.status;
      setLiveState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          timeline: {
            ...prev.timeline,
            tasks: prev.timeline.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    status: "completed" as const,
                    completedAt: new Date().toISOString(),
                  }
                : t
            ),
          },
        };
      });

      // Set up undo action
      setUndoAction({
        taskId,
        taskTitle: task.title,
        previousStatus,
        expiresAt: Date.now() + 30000,
      });

      // Persist to server
      try {
        const response = await fetch(`/api/live/${mealId}/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        });

        if (!response.ok) {
          throw new Error("Failed to save checkoff");
        }
      } catch {
        // Revert on error
        setLiveState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            timeline: {
              ...prev.timeline,
              tasks: prev.timeline.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, status: previousStatus, completedAt: undefined }
                  : t
              ),
            },
          };
        });
        setUndoAction(null);

        showToast.error("Failed to save. Please try again.");
      }
    },
    [liveState, mealId]
  );

  // Handle undo
  const handleUndo = useCallback(async () => {
    if (!undoAction || !liveState) return;

    const { taskId, previousStatus } = undoAction;

    // Optimistic update
    setLiveState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        timeline: {
          ...prev.timeline,
          tasks: prev.timeline.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: previousStatus, completedAt: undefined }
              : t
          ),
        },
      };
    });
    setUndoAction(null);

    // Persist to server
    try {
      await fetch(`/api/live/${mealId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: previousStatus }),
      });

      showToast.info("Task marked as not complete.");
    } catch {
      showToast.error("Failed to undo. Please try again.");
    }
  }, [undoAction, liveState, mealId]);

  // Dismiss undo toast
  const handleDismissUndo = useCallback(() => {
    setUndoAction(null);
  }, []);

  // Handle timer start
  const handleStartTimer = useCallback(
    (taskId: string, durationMinutes: number) => {
      if (!liveState) return;

      const task = liveState.timeline.tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Initialize audio context on first user interaction
      getTimerService().initAudio();

      // Start timer
      getTimerService().startTimer(taskId, task.title, durationMinutes);

      showToast.info(`Timer started: ${task.title} - ${durationMinutes} minutes`);
    },
    [liveState]
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-neutral-500">Loading kitchen...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !liveState) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4">
        <div className="max-w-lg mx-auto mt-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-red-700 mb-2">
              Unable to Load
            </h2>
            <p className="text-sm text-red-600 mb-4">
              {error || "Timeline not found"}
            </p>
            <Link href={`/meals/${mealId}`}>
              <Button variant="outline">Back to Meal</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const serveTime = new Date(liveState.meal.serveTime);
  const recipeNamesMap = new Map(Object.entries(liveState.recipeNames));

  return (
    <div className="min-h-screen bg-neutral-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href={`/meals/${mealId}`}
              className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-500" />
            </Link>
            <div className="flex-1">
              <h1 className="font-display text-lg font-semibold text-foreground">
                {liveState.meal.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Clock className="h-4 w-4" />
                <span>
                  Serve at{" "}
                  {serveTime.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar (only when cooking) */}
          {executionState === "cooking" && (
            <ProgressBar tasks={liveState.timeline.tasks} serveTime={serveTime} />
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {executionState === "not_started" ? (
          // Pre-cooking state
          <div className="text-center py-12">
            <div className="bg-primary/5 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
              <Play className="h-12 w-12 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
              Ready to Cook?
            </h2>
            <p className="text-neutral-600 mb-8 max-w-sm mx-auto">
              Your timeline has {liveState.timeline.tasks.length} tasks ready.
              Starting will anchor the timeline to real time.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartCooking}
              loading={isStarting}
              className="min-w-[200px]"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Cooking
            </Button>

            <p className="text-sm text-neutral-400 mt-6">
              Tip: Make sure you have all ingredients and equipment ready!
            </p>
          </div>
        ) : (
          // Live cooking mode
          <LiveTimelineView
            timeline={liveState.timeline}
            recipeNames={recipeNamesMap}
            serveTime={serveTime}
            onCheckoff={handleCheckoff}
            onStartTimer={handleStartTimer}
          />
        )}
      </main>

      {/* Kitchen Walkthrough Modal */}
      {showWalkthrough && (
        <KitchenWalkthrough
          tasks={liveState.timeline.tasks}
          serveTime={serveTime}
          onReady={handleWalkthroughReady}
          onSkip={handleWalkthroughSkip}
        />
      )}

      {/* Undo Toast */}
      {undoAction && (
        <UndoToast
          taskTitle={undoAction.taskTitle}
          onUndo={handleUndo}
          onDismiss={handleDismissUndo}
        />
      )}

      {/* Active Timer Banner */}
      {executionState === "cooking" && <ActiveTimerBanner />}
    </div>
  );
}
