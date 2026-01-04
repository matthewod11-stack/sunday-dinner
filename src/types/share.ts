import { z } from "zod";
import type { Timeline, Task } from "./timeline";

/**
 * Share token stored in database
 *
 * Allows read-only access to a meal's timeline for family viewers.
 * Tokens expire 24 hours after the meal's serve time.
 */
export interface ShareToken {
  /** UUID v4 token (also serves as primary key) */
  token: string;
  /** Reference to the shared meal */
  mealId: string;
  /** When the token was created */
  createdAt: string;
  /** Pre-calculated expiration (serve_time + 24 hours) */
  expiresAt: string;
}

/**
 * Result of generating a share link
 */
export interface ShareLinkResult {
  /** The generated token */
  token: string;
  /** Full shareable URL (e.g., https://sundaydinner.app/share/abc123) */
  url: string;
  /** When the link will expire */
  expiresAt: string;
}

/**
 * Data returned to share link viewers
 *
 * Contains everything needed to display a read-only timeline view.
 */
export interface ShareMealData {
  /** Basic meal info (name, serve time, status) */
  meal: {
    id: string;
    name: string;
    serveTime: string;
    guestCount: number;
    status: string;
  };
  /** The cooking timeline */
  timeline: Timeline | null;
  /** All tasks with their current status */
  tasks: Task[];
  /** Recipe names mapped by ID for display */
  recipeNames: Record<string, string>;
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  /** Whether the token is valid and not expired */
  valid: boolean;
  /** The meal ID if valid */
  mealId?: string;
  /** Error type if invalid */
  error?: "not_found" | "expired";
  /** Human-readable message */
  message?: string;
}

// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================

export const ShareTokenSchema = z.object({
  token: z.string().uuid(),
  mealId: z.string().uuid(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});

export const ShareLinkResultSchema = z.object({
  token: z.string().uuid(),
  url: z.string().url(),
  expiresAt: z.string().datetime(),
});

export const ShareMealDataSchema = z.object({
  meal: z.object({
    id: z.string().uuid(),
    name: z.string(),
    serveTime: z.string().datetime(),
    guestCount: z.number().int().positive(),
    status: z.string(),
  }),
  timeline: z.any().nullable(), // Full TimelineSchema validation happens elsewhere
  tasks: z.array(z.any()), // Full TaskSchema validation happens elsewhere
  recipeNames: z.record(z.string(), z.string()),
});

export const TokenValidationResultSchema = z.object({
  valid: z.boolean(),
  mealId: z.string().uuid().optional(),
  error: z.enum(["not_found", "expired"]).optional(),
  message: z.string().optional(),
});

// Type inference from schemas
export type ShareTokenInput = z.infer<typeof ShareTokenSchema>;
export type ShareLinkResultInput = z.infer<typeof ShareLinkResultSchema>;
export type ShareMealDataInput = z.infer<typeof ShareMealDataSchema>;
export type TokenValidationResultInput = z.infer<
  typeof TokenValidationResultSchema
>;
