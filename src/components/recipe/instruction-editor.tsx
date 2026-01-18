"use client";

import * as React from "react";
import { Plus, Trash2, GripVertical, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Instruction } from "@/types";

export interface InstructionEditorProps {
  /** Current list of instructions */
  instructions: Instruction[];
  /** Callback when instructions change */
  onChange: (instructions: Instruction[]) => void;
  /** Disable editing */
  disabled?: boolean;
}

/**
 * InstructionEditor - Editable list of recipe instructions
 *
 * Features:
 * - Add/remove steps
 * - Edit description, duration, oven settings
 * - Auto-numbered steps
 * - Drag handle for future reordering (form-based for now)
 */
export function InstructionEditor({
  instructions,
  onChange,
  disabled = false,
}: InstructionEditorProps) {
  /**
   * Update a single instruction
   */
  const updateInstruction = React.useCallback(
    (index: number, updates: Partial<Instruction>) => {
      const updated = [...instructions];
      const current = updated[index];
      if (current) {
        updated[index] = { ...current, ...updates };
        onChange(updated);
      }
    },
    [instructions, onChange]
  );

  /**
   * Remove an instruction and renumber
   */
  const removeInstruction = React.useCallback(
    (index: number) => {
      const updated = instructions
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, stepNumber: i + 1 }));
      onChange(updated);
    },
    [instructions, onChange]
  );

  /**
   * Add a new blank instruction
   */
  const addInstruction = React.useCallback(() => {
    onChange([
      ...instructions,
      {
        stepNumber: instructions.length + 1,
        description: "",
      },
    ]);
  }, [instructions, onChange]);

  /**
   * Move instruction up or down
   */
  const moveInstruction = React.useCallback(
    (index: number, direction: "up" | "down") => {
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === instructions.length - 1)
      ) {
        return;
      }

      const updated = [...instructions];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      const temp = updated[index];
      const target = updated[targetIndex];

      if (temp && target) {
        updated[index] = target;
        updated[targetIndex] = temp;

        // Renumber all steps
        const renumbered = updated.map((inst, i) => ({
          ...inst,
          stepNumber: i + 1,
        }));
        onChange(renumbered);
      }
    },
    [instructions, onChange]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Instructions</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addInstruction}
          disabled={disabled}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Step
        </Button>
      </div>

      {instructions.length === 0 ? (
        <p className="py-4 text-center text-sm text-neutral-500">
          No instructions yet. Click &quot;Add Step&quot; to add one.
        </p>
      ) : (
        <div className="space-y-4">
          {instructions.map((instruction, index) => (
            <div
              key={instruction.id ?? index}
              className="rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                {/* Step number and drag handle */}
                <div className="flex flex-col items-center gap-1 pt-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light font-display font-semibold text-primary">
                    {instruction.stepNumber}
                  </div>
                  <button
                    type="button"
                    className="cursor-grab text-neutral-300 hover:text-neutral-500"
                    title="Drag to reorder (not yet implemented)"
                    disabled
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  {/* Move buttons for accessibility */}
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveInstruction(index, "up")}
                      disabled={disabled || index === 0}
                      className="rounded p-1 text-xs text-neutral-400 hover:bg-neutral-100 disabled:opacity-30"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveInstruction(index, "down")}
                      disabled={disabled || index === instructions.length - 1}
                      className="rounded p-1 text-xs text-neutral-400 hover:bg-neutral-100 disabled:opacity-30"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>

                {/* Main content */}
                <div className="flex-1 space-y-3">
                  {/* Description */}
                  <div>
                    <Label className="sr-only">Step description</Label>
                    <textarea
                      placeholder="Describe this step..."
                      value={instruction.description}
                      onChange={(e) =>
                        updateInstruction(index, { description: e.target.value })
                      }
                      disabled={disabled}
                      className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      rows={2}
                    />
                  </div>

                  {/* Duration and oven settings */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {/* Duration */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-neutral-400" />
                      <Input
                        type="number"
                        placeholder="min"
                        value={instruction.durationMinutes ?? ""}
                        onChange={(e) =>
                          updateInstruction(index, {
                            durationMinutes: e.target.value
                              ? parseInt(e.target.value, 10)
                              : undefined,
                          })
                        }
                        disabled={disabled}
                        className="w-16 text-center"
                        min="1"
                      />
                      <span className="text-neutral-500">min</span>
                    </div>

                    {/* Oven toggle */}
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={instruction.ovenRequired ?? false}
                        onChange={(e) =>
                          updateInstruction(index, {
                            ovenRequired: e.target.checked,
                            ovenTemp: e.target.checked
                              ? instruction.ovenTemp ?? 350
                              : undefined,
                          })
                        }
                        disabled={disabled}
                        className="h-4 w-4 rounded border-neutral-300 bg-white accent-primary focus:ring-primary"
                      />
                      <Flame className="h-4 w-4 text-neutral-400" />
                      <span className="text-neutral-600">Uses oven</span>
                    </label>

                    {/* Oven temp (if oven required) */}
                    {instruction.ovenRequired && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="350"
                          value={instruction.ovenTemp ?? ""}
                          onChange={(e) =>
                            updateInstruction(index, {
                              ovenTemp: e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined,
                            })
                          }
                          disabled={disabled}
                          className="w-20 text-center"
                          min="100"
                          max="600"
                        />
                        <span className="text-neutral-500">°F</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInstruction(index)}
                  disabled={disabled}
                  className="shrink-0 text-neutral-400 hover:text-error"
                  aria-label="Remove step"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
