"use client";

import { useState } from "react";
import { Check, Star, StarOff, ChevronDown, ChevronUp } from "lucide-react";
import type { ShoppingItem as ShoppingItemType } from "@/types/shopping";
import { cn } from "@/lib/utils";
import { formatQuantity } from "@/lib/services/shopping/unit-reconciliation";

interface ShoppingItemProps {
  item: ShoppingItemType;
  onCheck: (itemId: string) => void;
  onUncheck: (itemId: string) => void;
  onToggleStaple: (itemName: string, isStaple: boolean) => void;
  recipeNames?: Map<string, string>;
}

export function ShoppingItem({
  item,
  onCheck,
  onUncheck,
  onToggleStaple,
  recipeNames,
}: ShoppingItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleCheck = () => {
    if (item.checked) {
      onUncheck(item.id ?? "");
    } else {
      onCheck(item.id ?? "");
    }
  };

  const handleToggleStaple = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStaple(item.name, !item.isStaple);
  };

  const quantityDisplay =
    item.quantity !== null
      ? `${formatQuantity(item.quantity)}${item.unit ? ` ${item.unit}` : ""}`
      : null;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 py-3 px-4 rounded-lg transition-colors",
        item.checked
          ? "bg-neutral-100 opacity-60"
          : "hover:bg-amber-50/50"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={handleCheck}
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors mt-0.5",
          item.checked
            ? "bg-sage-600 border-sage-600 text-white"
            : "border-neutral-300 hover:border-sage-500"
        )}
        aria-label={item.checked ? "Uncheck item" : "Check item"}
      >
        {item.checked && <Check className="w-4 h-4" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          {/* Quantity */}
          {quantityDisplay && (
            <span
              className={cn(
                "font-medium text-terracotta-700 tabular-nums",
                item.checked && "line-through"
              )}
            >
              {quantityDisplay}
            </span>
          )}

          {/* Name */}
          <span
            className={cn(
              "text-neutral-800",
              item.checked && "line-through text-neutral-500"
            )}
          >
            {item.name}
          </span>

          {/* Staple indicator */}
          {item.isStaple && (
            <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
              staple
            </span>
          )}
        </div>

        {/* Notes */}
        {item.notes && (
          <p className="text-sm text-neutral-500 mt-0.5">{item.notes}</p>
        )}

        {/* Recipe sources (expandable) */}
        {item.sourceRecipeIds && item.sourceRecipeIds.length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 mt-1"
          >
            {showDetails ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            from {item.sourceRecipeIds.length} recipe
            {item.sourceRecipeIds.length > 1 ? "s" : ""}
          </button>
        )}

        {showDetails && item.sourceRecipeIds && recipeNames && (
          <ul className="text-xs text-neutral-500 mt-1 ml-4 list-disc">
            {item.sourceRecipeIds.map((id) => (
              <li key={id}>{recipeNames.get(id) ?? "Unknown recipe"}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Staple toggle */}
      <button
        onClick={handleToggleStaple}
        className={cn(
          "flex-shrink-0 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100",
          item.isStaple
            ? "text-amber-500 hover:bg-amber-100"
            : "text-neutral-300 hover:text-amber-500 hover:bg-amber-50"
        )}
        aria-label={
          item.isStaple ? "Remove from staples" : "Mark as staple"
        }
        title={
          item.isStaple
            ? "Remove from staples"
            : "Mark as staple (I always have this)"
        }
      >
        {item.isStaple ? (
          <StarOff className="w-4 h-4" />
        ) : (
          <Star className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
