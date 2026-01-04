"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Play, ListOrdered } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import {
  ConflictBanner,
  NowNextLaterView,
  GanttView,
  ViewSwitcher,
  TaskEditModal,
  TaskReorderModal,
  type TimelineViewMode,
} from "@/components/timeline";
import { Skeleton } from "@/components/ui/skeleton";
import type { Timeline, Meal, Task } from "@/types";

interface TimelinePageProps {
  params: Promise<{ mealId: string }>;
}

export default function TimelinePage({ params }: TimelinePageProps) {
  const { mealId } = use(params);
  const router = useRouter();

  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [meal, setMeal] = useState<Meal | null>(null);
  const [viewMode, setViewMode] = useState<TimelineViewMode>("list");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [reorderModalOpen, setReorderModalOpen] = useState(false);

  // Fetch meal and timeline
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch meal
        const mealRes = await fetch(`/api/meals/${mealId}`);
        if (!mealRes.ok) {
          throw new Error("Meal not found");
        }
        const mealData = await mealRes.json();
        setMeal(mealData);

        // Fetch timeline
        const timelineRes = await fetch(`/api/meals/${mealId}/timeline`);
        if (timelineRes.ok) {
          const timelineData = await timelineRes.json();
          setTimeline(timelineData);
        } else if (timelineRes.status !== 404) {
          throw new Error("Failed to fetch timeline");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [mealId]);

  // Generate timeline
  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);

      const res = await fetch("/api/timeline/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to generate timeline");
      }

      const data = await res.json();
      setTimeline(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  // Handle task checkoff (for live mode, Week 7)
  const handleCheckoff = async (taskId: string) => {
    if (!timeline?.id) return;

    try {
      const res = await fetch(`/api/timeline/${timeline.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateTask", taskId, updates: { status: "completed" } }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTimeline(updated);
      }
    } catch (err) {
      console.error("Failed to checkoff:", err);
    }
  };

  // Handle task edit - open modal
  const handleEditTask = (taskId: string) => {
    const task = timeline?.tasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setEditModalOpen(true);
    }
  };

  // Save task updates
  const handleSaveTask = async (taskId: string, updates: Partial<Task>) => {
    if (!timeline?.id) return;

    const res = await fetch(`/api/timeline/${timeline.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateTask", taskId, updates }),
    });

    if (!res.ok) {
      throw new Error("Failed to update task");
    }

    const updated = await res.json();
    setTimeline(updated);
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!timeline?.id) return;

    const res = await fetch(`/api/timeline/${timeline.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteTask", taskId }),
    });

    if (!res.ok) {
      throw new Error("Failed to delete task");
    }

    const updated = await res.json();
    setTimeline(updated);
  };

  // Reorder tasks
  const handleReorderTasks = async (taskOrder: string[]) => {
    if (!timeline?.id) return;

    const res = await fetch(`/api/timeline/${timeline.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorderTasks", taskOrder }),
    });

    if (!res.ok) {
      throw new Error("Failed to reorder tasks");
    }

    const updated = await res.json();
    setTimeline(updated);
  };

  // Build recipe name map for display
  const recipeNames = meal
    ? new Map(meal.recipes.map((r) => [r.recipe.id!, r.recipe.name]))
    : undefined;

  // Parse serve time
  const serveTime = meal ? new Date(meal.serveTime) : undefined;

  if (loading) {
    return <TimelinePageSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/meals/${mealId}`)}
          >
            Back to Meal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/meals/${mealId}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meal
        </Link>
        <PageHeader
          title={meal?.name ?? "Timeline"}
          description={
            serveTime
              ? `Serve at ${serveTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
              : undefined
          }
        />
      </div>

      {/* No timeline yet - show generate button */}
      {!timeline && (
        <div className="rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center">
          <h2 className="font-display text-xl font-semibold text-foreground">
            No Timeline Yet
          </h2>
          <p className="mt-2 text-neutral-600">
            Generate a cooking timeline based on your recipes.
          </p>
          <Button
            onClick={handleGenerate}
            loading={generating}
            className="mt-4"
          >
            <Play className="mr-2 h-4 w-4" />
            Generate Timeline
          </Button>
        </div>
      )}

      {/* Timeline exists */}
      {timeline && (
        <div className="space-y-6">
          {/* Conflict banner */}
          {timeline.hasConflicts && (
            <ConflictBanner
              conflicts={timeline.conflicts}
              onResolve={(index) => {
                // TODO: Scroll to/highlight the conflicting task
                console.log("Resolve conflict:", index);
              }}
            />
          )}

          {/* Toolbar - stacks on mobile */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReorderModalOpen(true)}
                className="flex-1 sm:flex-none"
              >
                <ListOrdered className="mr-2 h-4 w-4" />
                Reorder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                loading={generating}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </div>

          {/* Timeline view */}
          {viewMode === "list" ? (
            <NowNextLaterView
              timeline={timeline}
              recipeNames={recipeNames}
              serveTime={serveTime}
              onCheckoff={handleCheckoff}
              onEditTask={handleEditTask}
            />
          ) : (
            <GanttView
              timeline={timeline}
              recipeNames={recipeNames}
              serveTime={serveTime}
              onTaskClick={handleEditTask}
            />
          )}
        </div>
      )}

      {/* Task edit modal */}
      <TaskEditModal
        task={editingTask}
        serveTime={serveTime}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* Task reorder modal */}
      {timeline && (
        <TaskReorderModal
          tasks={timeline.tasks}
          recipeNames={recipeNames}
          open={reorderModalOpen}
          onOpenChange={setReorderModalOpen}
          onSave={handleReorderTasks}
        />
      )}
    </div>
  );
}

/**
 * Loading skeleton
 */
function TimelinePageSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Skeleton className="mb-4 h-4 w-24" />
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-8 h-4 w-32" />

      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
