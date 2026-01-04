"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  ChefHat,
  CheckSquare,
  Square,
  Refrigerator,
  Flame,
} from "lucide-react";
import type { Task } from "@/types";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { extractEquipmentNeeds, calculateRealTime } from "@/lib/services/execution";

interface KitchenWalkthroughProps {
  tasks: Task[];
  serveTime: Date;
  onReady: () => void;
  onSkip: () => void;
}

const SKIP_WALKTHROUGH_KEY = "sunday-dinner-skip-walkthrough";

/**
 * Kitchen Walkthrough modal - Ready Check before cooking
 *
 * Shows checklist of equipment and ingredients needed for first hour.
 * Option to skip with preference memory in localStorage.
 */
export function KitchenWalkthrough({
  tasks,
  serveTime,
  onReady,
  onSkip,
}: KitchenWalkthroughProps) {
  const [checkedEquipment, setCheckedEquipment] = useState<Set<string>>(
    new Set()
  );
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    new Set()
  );
  const [skipInFuture, setSkipInFuture] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Extract equipment needs from first hour
  const equipment = useMemo(
    () => extractEquipmentNeeds(tasks, serveTime),
    [tasks, serveTime]
  );

  // Get ingredients from first hour tasks
  const firstHourIngredients = useMemo(() => {
    const ingredients = new Set<string>();
    const now = Date.now();

    for (const task of tasks) {
      const realTime = calculateRealTime(task.startTimeMinutes, serveTime);
      const minutesFromNow = (realTime.getTime() - now) / 60000;

      if (minutesFromNow <= 60) {
        // For simplicity, just list key tasks that have descriptions
        if (task.description) {
          ingredients.add(task.title);
        }
      }
    }

    return Array.from(ingredients).slice(0, 8); // Limit to 8 items
  }, [tasks, serveTime]);

  const toggleEquipment = (item: string) => {
    const newChecked = new Set(checkedEquipment);
    if (newChecked.has(item)) {
      newChecked.delete(item);
    } else {
      newChecked.add(item);
    }
    setCheckedEquipment(newChecked);
  };

  const toggleIngredient = (item: string) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(item)) {
      newChecked.delete(item);
    } else {
      newChecked.add(item);
    }
    setCheckedIngredients(newChecked);
  };

  const handleReady = () => {
    if (skipInFuture) {
      localStorage.setItem(SKIP_WALKTHROUGH_KEY, "true");
    }
    setIsVisible(false);
    setTimeout(onReady, 200);
  };

  const handleSkip = () => {
    if (skipInFuture) {
      localStorage.setItem(SKIP_WALKTHROUGH_KEY, "true");
    }
    setIsVisible(false);
    setTimeout(onSkip, 200);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl transition-transform duration-200",
          isVisible ? "scale-100" : "scale-95"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <h2 className="font-display text-xl font-semibold">
              Kitchen Ready Check
            </h2>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
          <p className="text-sm text-neutral-600">
            Let&apos;s make sure you have everything ready for the first hour of
            cooking!
          </p>

          {/* Equipment Section */}
          {equipment.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-5 w-5 text-amber-500" />
                <h3 className="font-medium text-foreground">
                  Equipment to Prep
                </h3>
              </div>
              <div className="space-y-2">
                {equipment.map((item) => (
                  <ChecklistItem
                    key={item}
                    label={item}
                    checked={checkedEquipment.has(item)}
                    onToggle={() => toggleEquipment(item)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Ingredients Section */}
          {firstHourIngredients.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Refrigerator className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium text-foreground">
                  First Tasks
                </h3>
              </div>
              <div className="space-y-2">
                {firstHourIngredients.map((item) => (
                  <ChecklistItem
                    key={item}
                    label={item}
                    checked={checkedIngredients.has(item)}
                    onToggle={() => toggleIngredient(item)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {equipment.length === 0 && firstHourIngredients.length === 0 && (
            <div className="text-center py-8">
              <ChefHat className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-500">
                No special equipment needed for the first hour. You&apos;re
                ready to cook!
              </p>
            </div>
          )}

          {/* Skip preference */}
          <label className="flex items-center gap-2 text-sm text-neutral-500 cursor-pointer">
            <input
              type="checkbox"
              checked={skipInFuture}
              onChange={(e) => setSkipInFuture(e.target.checked)}
              className="rounded border-neutral-300 text-primary focus:ring-primary"
            />
            Don&apos;t show this again
          </label>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-neutral-200">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            variant="primary"
            onClick={handleReady}
            className="flex-1"
          >
            I&apos;m Ready!
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual checklist item
 */
function ChecklistItem({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
        checked
          ? "bg-secondary/5 border-secondary"
          : "bg-white border-neutral-200 hover:border-neutral-300"
      )}
    >
      {checked ? (
        <CheckSquare className="h-5 w-5 text-secondary flex-shrink-0" />
      ) : (
        <Square className="h-5 w-5 text-neutral-300 flex-shrink-0" />
      )}
      <span
        className={cn(
          "text-sm text-left",
          checked && "text-secondary"
        )}
      >
        {label}
      </span>
    </button>
  );
}

/**
 * Check if user has opted to skip walkthrough
 */
export function shouldSkipWalkthrough(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SKIP_WALKTHROUGH_KEY) === "true";
}

/**
 * Reset walkthrough skip preference
 */
export function resetWalkthroughPreference(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SKIP_WALKTHROUGH_KEY);
}
