"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ShoppingItem as ShoppingItemType, StoreSection } from "@/types/shopping";
import { getSectionDisplayName } from "@/lib/services/shopping/section-classifier";
import { cn } from "@/lib/utils";
import { ShoppingItem } from "./shopping-item";

interface SectionGroupProps {
  section: StoreSection;
  items: ShoppingItemType[];
  onCheck: (itemId: string) => void;
  onUncheck: (itemId: string) => void;
  onToggleStaple: (itemName: string, isStaple: boolean) => void;
  recipeNames?: Map<string, string>;
  defaultOpen?: boolean;
}

export function SectionGroup({
  section,
  items,
  onCheck,
  onUncheck,
  onToggleStaple,
  recipeNames,
  defaultOpen = true,
}: SectionGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const allChecked = checkedCount === totalCount;

  // Section-specific styling
  const sectionColors: Record<StoreSection, string> = {
    produce: "bg-green-100 text-green-800 border-green-200",
    dairy: "bg-blue-100 text-blue-800 border-blue-200",
    meat: "bg-red-100 text-red-800 border-red-200",
    pantry: "bg-amber-100 text-amber-800 border-amber-200",
    frozen: "bg-cyan-100 text-cyan-800 border-cyan-200",
    other: "bg-neutral-100 text-neutral-700 border-neutral-200",
  };

  const sectionIcons: Record<StoreSection, string> = {
    produce: "🥬",
    dairy: "🥛",
    meat: "🥩",
    pantry: "🫙",
    frozen: "🧊",
    other: "📦",
  };

  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2 rounded-lg border transition-colors",
          sectionColors[section],
          allChecked && "opacity-60"
        )}
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span className="text-lg mr-1">{sectionIcons[section]}</span>
          <span className="font-medium">{getSectionDisplayName(section)}</span>
        </div>
        <span className="text-sm opacity-75">
          {checkedCount}/{totalCount}
        </span>
      </button>

      {/* Section Items */}
      {isOpen && (
        <div className="mt-2 space-y-1">
          {items.map((item) => (
            <ShoppingItem
              key={item.id}
              item={item}
              onCheck={onCheck}
              onUncheck={onUncheck}
              onToggleStaple={onToggleStaple}
              recipeNames={recipeNames}
            />
          ))}
        </div>
      )}
    </div>
  );
}
