"use client";

import { Lock, Clock } from "lucide-react";

interface ExpiredLinkProps {
  /** When the link expired (if known) */
  expiredAt?: string;
}

/**
 * UI for expired share links
 *
 * Friendly message explaining the link is no longer valid.
 */
export function ExpiredLink({ expiredAt }: ExpiredLinkProps) {
  const formattedDate = expiredAt
    ? new Date(expiredAt).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Lock className="h-8 w-8 text-amber-600" />
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl font-semibold text-amber-900">
          Link Expired
        </h1>

        {/* Description */}
        <p className="mt-3 text-amber-700">
          This share link is no longer active.
          Share links expire 24 hours after the meal is served.
        </p>

        {/* Expiration time */}
        {formattedDate && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-amber-600">
            <Clock className="h-4 w-4" />
            <span>Expired on {formattedDate}</span>
          </div>
        )}

        {/* CTA */}
        <div className="mt-6 rounded-lg bg-amber-100 p-4">
          <p className="text-sm text-amber-800">
            Ask the host for a new share link to view the cooking progress.
          </p>
        </div>
      </div>
    </div>
  );
}
