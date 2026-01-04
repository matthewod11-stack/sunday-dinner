"use client";

import { useState, useEffect } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import type { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";

interface TaskEditModalProps {
  task: Task | null;
  serveTime?: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

/**
 * Modal for editing a task's time, duration, and notes
 *
 * Uses relative time input (minutes before serve time) for easier scheduling.
 * Includes delete functionality with confirmation.
 */
export function TaskEditModal({
  task,
  serveTime,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: TaskEditModalProps) {
  const [title, setTitle] = useState("");
  const [minutesBefore, setMinutesBefore] = useState(0);
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      // Convert startTimeMinutes (negative) to positive minutes before serve
      setMinutesBefore(Math.abs(task.startTimeMinutes));
      setDuration(task.durationMinutes);
      setNotes(task.notes ?? "");
      setShowDeleteConfirm(false);
    }
  }, [task]);

  // Calculate actual start time for display
  const getActualStartTime = (): string => {
    if (!serveTime) return `${minutesBefore} min before serve`;

    const startTime = new Date(serveTime.getTime() - minutesBefore * 60 * 1000);
    return startTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Calculate actual end time for display
  const getActualEndTime = (): string => {
    if (!serveTime) return `${minutesBefore - duration} min before serve`;

    const endTime = new Date(
      serveTime.getTime() - (minutesBefore - duration) * 60 * 1000
    );
    return endTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleSave = async () => {
    if (!task?.id) return;

    setSaving(true);
    try {
      await onSave(task.id, {
        title,
        // Store as negative (before serve time)
        startTimeMinutes: -minutesBefore,
        durationMinutes: duration,
        notes: notes || undefined,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task?.id) return;

    setDeleting(true);
    try {
      await onDelete(task.id);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  // Input validation
  const isValid =
    title.trim().length > 0 &&
    minutesBefore >= 0 &&
    duration > 0 &&
    minutesBefore >= duration; // Task must end at or before serve time

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Edit Task</ModalTitle>
          <ModalDescription>
            Adjust timing or add notes to this cooking step.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="minutes-before">Minutes Before Serve Time</Label>
            <div className="flex items-center gap-2">
              <Input
                id="minutes-before"
                type="number"
                min={0}
                value={minutesBefore}
                onChange={(e) => setMinutesBefore(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-neutral-500">
                = Start at {getActualStartTime()}
              </span>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="duration"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-neutral-500">
                = End at {getActualEndTime()}
              </span>
            </div>
          </div>

          {/* Validation warning */}
          {minutesBefore < duration && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Task would end after serve time</span>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="task-notes">Notes (optional)</Label>
            <textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for this step..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              rows={3}
            />
          </div>

          {/* Delete section */}
          <div className="border-t pt-4">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete this task
              </button>
            ) : (
              <div className="rounded-lg bg-red-50 p-3">
                <p className="mb-3 text-sm text-red-700">
                  Are you sure? This task will be removed from the timeline.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    loading={deleting}
                  >
                    Yes, Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid} loading={saving}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
