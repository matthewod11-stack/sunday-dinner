"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, Utensils, Salad, Cookie, Soup, Coffee, Leaf, Sandwich, Wine, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecipeCategory } from "@/types";
import { useState } from "react";

/**
 * Category metadata with icons and display names
 */
const CATEGORY_META: Record<
  RecipeCategory | "all",
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  all: { label: "All Recipes", icon: Grid3X3 },
  "main-dish": { label: "Main Dishes", icon: Utensils },
  "side-dish": { label: "Side Dishes", icon: Leaf },
  appetizer: { label: "Appetizers", icon: Sandwich },
  dessert: { label: "Desserts", icon: Cookie },
  bread: { label: "Breads", icon: Sandwich },
  salad: { label: "Salads", icon: Salad },
  soup: { label: "Soups", icon: Soup },
  beverage: { label: "Beverages", icon: Wine },
  other: { label: "Other", icon: Coffee },
};

/**
 * Get all categories in display order
 */
const CATEGORY_ORDER: (RecipeCategory | "all")[] = [
  "all",
  "main-dish",
  "side-dish",
  "appetizer",
  "salad",
  "soup",
  "dessert",
  "bread",
  "beverage",
  "other",
];

export interface CategoryCount {
  category: RecipeCategory | null;
  count: number;
}

export interface CategorySidebarProps {
  /** Counts per category (null category = "other") */
  categoryCounts: CategoryCount[];
  /** Total recipe count */
  totalCount: number;
}

/**
 * Sidebar filter button
 */
function FilterButton({
  category,
  count,
  isActive,
  onClick,
}: {
  category: RecipeCategory | "all";
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-all",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{meta.label}</span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs",
          isActive
            ? "bg-primary/20 text-primary"
            : "bg-neutral-100 text-neutral-500"
        )}
      >
        {count}
      </span>
    </button>
  );
}

/**
 * Desktop sidebar for category filtering
 */
export function CategorySidebar({
  categoryCounts,
  totalCount,
}: CategorySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = (searchParams.get("category") as RecipeCategory) || "all";

  const handleCategoryChange = (category: RecipeCategory | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  };

  // Build count map
  const countMap = new Map<RecipeCategory | "all", number>();
  countMap.set("all", totalCount);
  for (const { category, count } of categoryCounts) {
    const key = category ?? "other";
    countMap.set(key, count);
  }

  return (
    <aside className="hidden lg:block w-56 flex-shrink-0">
      <nav className="sticky top-24 space-y-1">
        <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Categories
        </h2>
        {CATEGORY_ORDER.map((cat) => (
          <FilterButton
            key={cat}
            category={cat}
            count={countMap.get(cat) ?? 0}
            isActive={activeCategory === cat}
            onClick={() => handleCategoryChange(cat)}
          />
        ))}
      </nav>
    </aside>
  );
}

/**
 * Mobile dropdown for category filtering
 */
export function CategoryDropdown({
  categoryCounts,
  totalCount,
}: CategorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = (searchParams.get("category") as RecipeCategory) || "all";

  const handleCategoryChange = (category: RecipeCategory | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
    setIsOpen(false);
  };

  // Build count map
  const countMap = new Map<RecipeCategory | "all", number>();
  countMap.set("all", totalCount);
  for (const { category, count } of categoryCounts) {
    const key = category ?? "other";
    countMap.set(key, count);
  }

  const activeMeta = CATEGORY_META[activeCategory];
  const ActiveIcon = activeMeta.icon;

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-700"
      >
        <span className="flex items-center gap-2">
          <ActiveIcon className="h-4 w-4" />
          {activeMeta.label}
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
            {countMap.get(activeCategory) ?? 0}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-neutral-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown menu */}
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
            {CATEGORY_ORDER.map((cat) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-left text-sm",
                    isActive
                      ? "bg-primary/5 text-primary"
                      : "text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{meta.label}</span>
                  <span className="text-xs text-neutral-400">
                    {countMap.get(cat) ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
