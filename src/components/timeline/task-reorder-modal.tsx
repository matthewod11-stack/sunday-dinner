"use client";

import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import type { Task } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { cn } from "@/lib/utils";

interface TaskReorderModalProps {
  tasks: Task[];
  recipeNames?: Map<string, string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (taskOrder: string[]) => Promise<void>;
}

/**
 * Modal for reordering tasks using up/down buttons
 *
 * Form-based approach (not drag-drop) for simplicity and accessibility.
 * Tasks are displayed with their current order and can be moved up/down.
 */
export function TaskReorderModal({
  tasks,
  recipeNames,
  open,
  onOpenChange,
  onSave,
}: TaskReorderModalProps) {
  const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize with current task order
  useEffect(() => {
    if (open && tasks.length > 0) {
      setOrderedTasks([...tasks]);
      setHasChanges(false);
    }
  }, [open, tasks]);

  // Move task up in the list
  const moveUp = (index: number) => {
    if (index === 0) return;

    const newOrder = [...orderedTasks];
    const current = newOrder[index];
    const previous = newOrder[index - 1];
    if (current && previous) {
      newOrder[index - 1] = current;
      newOrder[index] = previous;
      setOrderedTasks(newOrder);
      setHasChanges(true);
    }
  };

  // Move task down in the list
  const moveDown = (index: number) => {
    if (index === orderedTasks.length - 1) return;

    const newOrder = [...orderedTasks];
    const current = newOrder[index];
    const next = newOrder[index + 1];
    if (current && next) {
      newOrder[index] = next;
      newOrder[index + 1] = current;
      setOrderedTasks(newOrder);
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const taskOrder = orderedTasks.map((t) => t.id!);
      await onSave(taskOrder);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Reorder Tasks</ModalTitle>
          <ModalDescription>
            Use the arrow buttons to change task order. Changes affect the sort
            order in the timeline view.
          </ModalDescription>
        </ModalHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {orderedTasks.map((task, index) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border bg-white p-3",
                  "transition-colors hover:bg-neutral-50"
                )}
              >
                {/* Drag handle icon (visual only) */}
                <GripVertical className="h-4 w-4 flex-shrink-0 text-neutral-300" />

                {/* Position number */}
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>

                {/* Task info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{task.title}</p>
                  <p className="text-xs text-neutral-500">
                    {formatTime(task.startTimeMinutes)} •{" "}
                    {task.durationMinutes} min
                    {recipeNames?.get(task.recipeId) && (
                      <> • {recipeNames.get(task.recipeId)}</>
                    )}
                  </p>
                </div>

                {/* Move buttons */}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className={cn(
                      "rounded p-1.5 transition-colors",
                      index === 0
                        ? "cursor-not-allowed text-neutral-200"
                        : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                    )}
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === orderedTasks.length - 1}
                    className={cn(
                      "rounded p-1.5 transition-colors",
                      index === orderedTasks.length - 1
                        ? "cursor-not-allowed text-neutral-200"
                        : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                    )}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            loading={saving}
          >
            Save Order
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/**
 * Format time as "Xh Ym before" or actual time
 */
function formatTime(minutesRelative: number): string {
  if (minutesRelative === 0) return "At serve time";
  if (minutesRelative > 0) return `${minutesRelative}m after`;

  const abs = Math.abs(minutesRelative);
  if (abs < 60) return `${abs}m before`;

  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  if (mins === 0) return `${hours}h before`;
  return `${hours}h ${mins}m before`;
}
