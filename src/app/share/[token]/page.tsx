"use client";

import { use, useCallback } from "react";
import { RefreshCw, Clock, Users, UtensilsCrossed } from "lucide-react";
import type { ShareMealData } from "@/types";
import { usePolling, formatLastUpdated } from "@/lib/polling";
import {
  calculateProgress,
  formatLiveTime,
} from "@/lib/services/execution";
import {
  ViewerTimelineView,
  ExpiredLink,
  InvalidLink,
} from "@/components/share";
import { ProgressBar } from "@/components/live";
import { Skeleton } from "@/components/ui";

interface PageProps {
  params: Promise<{ token: string }>;
}

/**
 * Share link viewer page
 *
 * Displays a read-only view of the cooking timeline for family members.
 * Polls for updates every 5 seconds.
 */
export default function ShareViewerPage({ params }: PageProps) {
  const { token } = use(params);

  const fetcher = useCallback(async () => {
    const res = await fetch(`/api/share/${token}`);
    const data = await res.json();

    if (!res.ok) {
      const error = new Error(data.message || "Failed to load") as Error & {
        status: number;
        errorType: string;
      };
      error.status = res.status;
      error.errorType = data.error;
      throw error;
    }

    return data as ShareMealData;
  }, [token]);

  const { data, isLoading, error, lastUpdated, refresh, isPaused } = usePolling(
    fetcher,
    { interval: 5000 }
  );

  // Handle loading state
  if (isLoading && !data) {
    return <LoadingState />;
  }

  // Handle error states
  if (error) {
    const err = error as Error & { status?: number; errorType?: string };

    if (err.status === 410 || err.errorType === "expired") {
      return <ExpiredLink />;
    }

    if (err.status === 404 || err.status === 400) {
      return <InvalidLink message={error.message} />;
    }

    return <InvalidLink message="Something went wrong. Please try again." />;
  }

  // No data yet
  if (!data) {
    return <InvalidLink />;
  }

  const serveTime = new Date(data.meal.serveTime);
  const progress = calculateProgress(data.tasks);
  const isNotStarted = !data.timeline?.isRunning && progress.completed === 0;
  const isComplete = progress.completed === progress.total && progress.total > 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-4">
          {/* Meal name */}
          <h1 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
            {data.meal.name}
          </h1>

          {/* Meta info */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatLiveTime(serveTime)} serve time
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {data.meal.guestCount} guests
            </span>
          </div>

          {/* Progress bar */}
          {data.timeline && data.tasks.length > 0 && (
            <div className="mt-3">
              <ProgressBar
                tasks={data.tasks}
                serveTime={serveTime}
              />
            </div>
          )}

          {/* Last updated indicator */}
          <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <RefreshCw
                className={`h-3 w-3 ${isPaused ? "" : "animate-spin"}`}
                style={{ animationDuration: "3s" }}
              />
              {isPaused ? "Paused" : `Updated ${formatLastUpdated(lastUpdated)}`}
            </span>
            <button
              onClick={() => refresh()}
              className="text-primary hover:underline"
            >
              Refresh now
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Not started state */}
        {isNotStarted && (
          <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-6 text-center">
            <UtensilsCrossed className="mx-auto h-12 w-12 text-neutral-300" />
            <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
              Cooking hasn&apos;t started yet
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              The host will start cooking soon. This page will update
              automatically when they begin.
            </p>
          </div>
        )}

        {/* Complete state */}
        {isComplete && (
          <div className="mb-6 rounded-lg border border-secondary/20 bg-secondary/5 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <UtensilsCrossed className="h-6 w-6 text-secondary" />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-secondary">
              Dinner is ready!
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              All cooking tasks are complete. Time to eat!
            </p>
          </div>
        )}

        {/* Timeline view */}
        {data.timeline && data.tasks.length > 0 ? (
          <ViewerTimelineView
            timeline={data.timeline}
            tasks={data.tasks}
            recipeNames={data.recipeNames}
            serveTime={serveTime}
          />
        ) : (
          <div className="rounded-lg border-2 border-dashed border-neutral-200 p-8 text-center">
            <p className="text-neutral-500">
              No cooking timeline available yet.
            </p>
          </div>
        )}
      </main>

      {/* Footer with branding */}
      <footer className="border-t border-neutral-200 bg-white py-4 text-center">
        <p className="text-xs text-neutral-400">
          Powered by Sunday Dinner
        </p>
      </footer>
    </div>
  );
}

/**
 * Loading state skeleton
 */
function LoadingState() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <Skeleton className="h-7 w-48" />
          <div className="mt-2 flex gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="mt-3 h-2 w-full rounded-full" />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </main>
    </div>
  );
}
