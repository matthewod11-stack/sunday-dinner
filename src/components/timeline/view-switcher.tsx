"use client";

import { List, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimelineViewMode = "list" | "gantt";

interface ViewSwitcherProps {
  currentView: TimelineViewMode;
  onViewChange: (view: TimelineViewMode) => void;
}

/**
 * ViewSwitcher toggles between Now/Next/Later list view and Gantt chart
 */
export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-1">
      <ViewButton
        icon={List}
        label="List"
        isActive={currentView === "list"}
        onClick={() => onViewChange("list")}
      />
      <ViewButton
        icon={BarChart3}
        label="Gantt"
        isActive={currentView === "gantt"}
        onClick={() => onViewChange("gantt")}
      />
    </div>
  );
}

function ViewButton({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
        isActive
          ? "bg-white text-foreground shadow-sm"
          : "text-neutral-500 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
