"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  Clock,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  ChefHat,
  ClipboardList,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { showToast } from "@/components/ui/toast";
import { RecipePicker, ScalingList } from "@/components/meals";
import { ShareModal } from "@/components/share";
import type { Meal, MealStatus } from "@/types";

/**
 * Meal Detail Page
 *
 * Shows meal info, recipes with scaling, and Claude review notes.
 * Allows adding/removing recipes and editing scaling.
 */
export default function MealDetailPage() {
  const router = useRouter();
  const params = useParams();
  const mealId = params.id as string;

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Recipe picker state
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [isAddingRecipes, setIsAddingRecipes] = useState(false);

  // Fetch meal data
  const fetchMeal = useCallback(async () => {
    try {
      const response = await fetch(`/api/meals/${mealId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Meal not found");
        }
        throw new Error("Failed to fetch meal");
      }
      const data = await response.json();
      setMeal(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meal");
    } finally {
      setLoading(false);
    }
  }, [mealId]);

  useEffect(() => {
    fetchMeal();
  }, [fetchMeal]);

  // Format date for display
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Handle adding selected recipes
  const handleAddRecipes = async () => {
    if (selectedRecipeIds.length === 0 || !meal) return;

    setIsAddingRecipes(true);
    const guestCount = meal.guestCount.total;

    try {
      for (const recipeId of selectedRecipeIds) {
        await fetch(`/api/meals/${mealId}/recipes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipeId,
            targetServings: guestCount,
          }),
        });
      }

      showToast.success(
        `Added ${selectedRecipeIds.length} recipe${selectedRecipeIds.length > 1 ? "s" : ""} to meal`
      );
      setShowRecipePicker(false);
      setSelectedRecipeIds([]);
      fetchMeal();
    } catch {
      showToast.error("Failed to add recipes");
    } finally {
      setIsAddingRecipes(false);
    }
  };

  // Handle scaling change
  const handleScalingChange = async (recipeId: string, targetServings: number) => {
    try {
      await fetch(`/api/meals/${mealId}/recipes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, targetServings }),
      });
      fetchMeal();
    } catch {
      showToast.error("Failed to update scaling");
    }
  };

  // Handle remove recipe
  const handleRemoveRecipe = async (recipeId: string) => {
    try {
      await fetch(`/api/meals/${mealId}/recipes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      showToast.success("Recipe removed from meal");
      fetchMeal();
    } catch {
      showToast.error("Failed to remove recipe");
    }
  };

  // Handle delete meal
  const handleDeleteMeal = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete meal");
      }
      showToast.success("Meal deleted");
      router.push("/meals");
    } catch {
      showToast.error("Failed to delete meal");
      setIsDeleting(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: MealStatus) => {
    switch (status) {
      case "planning":
        return "bg-amber-100 text-amber-700";
      case "timeline_generated":
        return "bg-blue-100 text-blue-700";
      case "shopping_ready":
        return "bg-green-100 text-green-700";
      case "cooking":
        return "bg-primary-light text-primary";
      case "complete":
        return "bg-neutral-100 text-neutral-600";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  const getStatusLabel = (status: MealStatus) => {
    switch (status) {
      case "planning":
        return "Planning";
      case "timeline_generated":
        return "Timeline Ready";
      case "shopping_ready":
        return "Shopping Ready";
      case "cooking":
        return "Cooking";
      case "complete":
        return "Complete";
      default:
        return status;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-6 h-6 w-32" />
        <Skeleton className="mb-2 h-10 w-64" />
        <Skeleton className="mb-8 h-5 w-96" />
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !meal) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/meals"
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meals
        </Link>
        <Card variant="muted">
          <CardContent className="p-8 text-center">
            <p className="text-error">{error ?? "Meal not found"}</p>
            <Button variant="ghost" className="mt-4" onClick={() => router.push("/meals")}>
              Return to Meals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get existing recipe IDs
  const existingRecipeIds = meal.recipes.map((r) => r.recipe.id!);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/meals"
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Meals
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {meal.name}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(meal.status)}`}
            >
              {getStatusLabel(meal.status)}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatDate(meal.serveTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatTime(meal.serveTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {meal.guestCount.total} guests
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowShareModal(true)}
            title="Share timeline"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/meals/${mealId}/edit`)}
            title="Edit meal"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete meal"
          >
            <Trash2 className="h-4 w-4 text-error" />
          </Button>
        </div>
      </div>

      {/* Recipes Section */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Recipes ({meal.recipes.length})
          </CardTitle>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowRecipePicker(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Recipe
          </Button>
        </CardHeader>
        <CardContent>
          {meal.recipes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-surface-muted p-6 text-center">
              <ChefHat className="mx-auto mb-3 h-10 w-10 text-neutral-400" />
              <p className="mb-3 text-sm text-neutral-600">
                No recipes added yet. Add recipes to start planning your meal.
              </p>
              <Button variant="secondary" size="sm" onClick={() => setShowRecipePicker(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Your First Recipe
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <ScalingList
                recipes={meal.recipes.map((r) => ({
                  id: r.recipe.id!,
                  name: r.recipe.name,
                  originalServings: r.scaling.originalServingSize,
                  targetServings: r.scaling.targetServingSize,
                  reviewNotes: r.scaling.claudeReviewNotes,
                }))}
                onScalingChange={handleScalingChange}
                suggestedServings={meal.guestCount.total}
              />

              {/* Quick actions per recipe */}
              <div className="space-y-2 pt-2">
                {meal.recipes.map((r) => (
                  <div
                    key={r.recipe.id}
                    className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2"
                  >
                    <span className="text-sm text-neutral-600">{r.recipe.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRecipe(r.recipe.id!)}
                      className="text-error hover:bg-red-50 hover:text-error"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps Section */}
      {meal.recipes.length > 0 && (
        <Card variant="muted">
          <CardContent className="p-6">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
              <ClipboardList className="h-5 w-5 text-secondary" />
              {meal.status === "planning" ? "Next Steps" : "Timeline"}
            </h3>
            <p className="mb-4 text-sm text-neutral-600">
              {meal.status === "planning" ? (
                <>
                  Your meal has {meal.recipes.length} recipe{meal.recipes.length > 1 ? "s" : ""}
                  . When you&apos;re ready, generate a cooking timeline to see exactly when to
                  start each task.
                </>
              ) : (
                <>View and edit your cooking timeline.</>
              )}
            </p>
            <Button
              variant="secondary"
              onClick={() => router.push(`/timeline/${mealId}`)}
            >
              {meal.status === "planning" ? "Generate Timeline" : "View Timeline"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recipe Picker Modal */}
      <Modal open={showRecipePicker} onOpenChange={setShowRecipePicker}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>Add Recipes</ModalTitle>
            <ModalDescription>
              Select recipes to add to your meal. They&apos;ll be scaled to match
              your guest count.
            </ModalDescription>
          </ModalHeader>
          <div className="p-6">
            <RecipePicker
              selectedIds={selectedRecipeIds.filter((id) => !existingRecipeIds.includes(id))}
              onSelectionChange={(ids) =>
                setSelectedRecipeIds(ids.filter((id) => !existingRecipeIds.includes(id)))
              }
              disabled={isAddingRecipes}
            />
          </div>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="ghost">Cancel</Button>
            </ModalClose>
            <Button
              onClick={handleAddRecipes}
              loading={isAddingRecipes}
              disabled={selectedRecipeIds.length === 0}
            >
              Add {selectedRecipeIds.length > 0 ? selectedRecipeIds.length : ""} Recipe
              {selectedRecipeIds.length !== 1 ? "s" : ""}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2 text-error">
              <AlertTriangle className="h-5 w-5" />
              Delete Meal
            </ModalTitle>
            <ModalDescription>
              Are you sure you want to delete &quot;{meal.name}&quot;? This action
              cannot be undone.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="ghost">Cancel</Button>
            </ModalClose>
            <Button
              variant="destructive"
              onClick={handleDeleteMeal}
              loading={isDeleting}
            >
              Delete Meal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Share Modal */}
      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        mealId={mealId}
        mealName={meal.name}
      />
    </div>
  );
}
