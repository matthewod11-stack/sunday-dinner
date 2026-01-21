"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import { deleteRecipe } from "@/app/recipes/actions";

interface DeleteRecipeButtonProps {
  recipeId: string;
  recipeName: string;
}

/**
 * Delete recipe button with confirmation
 */
export function DeleteRecipeButton({ recipeId, recipeName }: DeleteRecipeButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete "${recipeName}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const result = await deleteRecipe(recipeId);

      if (!result.success) {
        throw new Error(result.error ?? "Failed to delete recipe");
      }

      showToast.success("Recipe deleted");
      router.push("/recipes");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete recipe";
      showToast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-error hover:bg-error/10"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
