import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind CSS conflict resolution.
 * Uses clsx for conditional classes and tailwind-merge to handle
 * conflicting utility classes (e.g., "px-4 px-2" → "px-2").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
