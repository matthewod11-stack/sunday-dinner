"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Printer,
  Eye,
  EyeOff,
  RefreshCw,
  ShoppingCart,
  Check,
} from "lucide-react";
import type { ShoppingList as ShoppingListType, StoreSection } from "@/types/shopping";
import { getSectionOrder } from "@/lib/services/shopping/section-classifier";
import { cn } from "@/lib/utils";
import { SectionGroup } from "./section-group";
import { UnreconcilableBanner } from "./unreconcilable-banner";

interface ShoppingListProps {
  list: ShoppingListType;
  onCheck: (itemId: string) => Promise<void>;
  onUncheck: (itemId: string) => Promise<void>;
  onToggleStaple: (itemName: string, isStaple: boolean) => Promise<void>;
  onRegenerate?: () => Promise<void>;
  recipeNames?: Map<string, string>;
  mealName?: string;
}

export function ShoppingList({
  list,
  onCheck,
  onUncheck,
  onToggleStaple,
  onRegenerate,
  recipeNames,
  mealName,
}: ShoppingListProps) {
  const [showStaples, setShowStaples] = useState(false);
  const [showChecked, setShowChecked] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // Group items by section
  const listItems = list.items;
  const itemsBySection = useMemo(() => {
    const groups = new Map<StoreSection, typeof listItems>();

    for (const item of listItems) {
      // Filter by visibility options
      if (item.isStaple && !showStaples) continue;
      if (item.checked && !showChecked) continue;

      const section = item.section;
      if (!groups.has(section)) {
        groups.set(section, []);
      }
      groups.get(section)?.push(item);
    }

    // Sort sections by store order
    return Array.from(groups.entries()).sort(
      ([a], [b]) => getSectionOrder(a) - getSectionOrder(b)
    );
  }, [listItems, showStaples, showChecked]);

  // Progress calculation
  const totalItems = list.items.filter((i) => !i.isStaple || showStaples).length;
  const checkedItems = list.items.filter(
    (i) => i.checked && (!i.isStaple || showStaples)
  ).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  const handleCheck = useCallback(
    async (itemId: string) => {
      await onCheck(itemId);
    },
    [onCheck]
  );

  const handleUncheck = useCallback(
    async (itemId: string) => {
      await onUncheck(itemId);
    },
    [onUncheck]
  );

  const handleToggleStaple = useCallback(
    async (itemName: string, isStaple: boolean) => {
      await onToggleStaple(itemName, isStaple);
    },
    [onToggleStaple]
  );

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Empty state
  if (list.items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
        <h3 className="text-lg font-medium text-neutral-700 mb-2">
          No items in shopping list
        </h3>
        <p className="text-neutral-500">
          Add recipes to your meal to generate a shopping list.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h2 className="text-xl font-serif font-semibold text-neutral-900">
            Shopping List
          </h2>
          {mealName && (
            <p className="text-sm text-neutral-500">for {mealName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="p-2 text-neutral-500 hover:text-terracotta-600 hover:bg-terracotta-50 rounded-lg transition-colors disabled:opacity-50"
              title="Regenerate list"
            >
              <RefreshCw
                className={cn("w-5 h-5", isRegenerating && "animate-spin")}
              />
            </button>
          )}
          <button
            onClick={handlePrint}
            className="p-2 text-neutral-500 hover:text-terracotta-600 hover:bg-terracotta-50 rounded-lg transition-colors"
            title="Print list"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Print header - only visible when printing */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Shopping List</h1>
        {mealName && <p className="text-gray-600">for {mealName}</p>}
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6 print:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-600">
            {checkedItems} of {totalItems} items
          </span>
          {checkedItems === totalItems && totalItems > 0 && (
            <span className="flex items-center gap-1 text-sm text-sage-600">
              <Check className="w-4 h-4" />
              Complete!
            </span>
          )}
        </div>
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-sage-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Filter toggles */}
      <div className="flex items-center gap-4 mb-4 print:hidden">
        <button
          onClick={() => setShowStaples(!showStaples)}
          className={cn(
            "flex items-center gap-2 text-sm px-3 py-1.5 rounded-full transition-colors",
            showStaples
              ? "bg-amber-100 text-amber-800"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          )}
        >
          {showStaples ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
          Staples
        </button>
        <button
          onClick={() => setShowChecked(!showChecked)}
          className={cn(
            "flex items-center gap-2 text-sm px-3 py-1.5 rounded-full transition-colors",
            showChecked
              ? "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              : "bg-sage-100 text-sage-800"
          )}
        >
          {showChecked ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
          Checked
        </button>
      </div>

      {/* Unreconcilable items warning */}
      {list.unreconcilable &&
        list.unreconcilable.length > 0 &&
        !dismissedBanner && (
          <UnreconcilableBanner
            items={list.unreconcilable}
            onDismiss={() => setDismissedBanner(true)}
          />
        )}

      {/* Section groups */}
      <div className="space-y-2">
        {itemsBySection.map(([section, items]) => (
          <SectionGroup
            key={section}
            section={section}
            items={items}
            onCheck={handleCheck}
            onUncheck={handleUncheck}
            onToggleStaple={handleToggleStaple}
            recipeNames={recipeNames}
          />
        ))}
      </div>

      {/* Empty after filtering */}
      {itemsBySection.length === 0 && list.items.length > 0 && (
        <div className="text-center py-8 text-neutral-500">
          <p>All items are hidden by current filters.</p>
          <button
            onClick={() => {
              setShowStaples(true);
              setShowChecked(true);
            }}
            className="text-terracotta-600 hover:underline mt-2"
          >
            Show all items
          </button>
        </div>
      )}
    </div>
  );
}
