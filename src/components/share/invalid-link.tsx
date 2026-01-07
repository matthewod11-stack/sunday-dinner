"use client";

import { AlertCircle, HelpCircle } from "lucide-react";

interface InvalidLinkProps {
  /** Custom error message */
  message?: string;
}

/**
 * UI for invalid share links
 *
 * Shown when the token doesn't exist or is malformed.
 */
export function InvalidLink({ message }: InvalidLinkProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <AlertCircle className="h-8 w-8 text-neutral-500" />
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Invalid Link
        </h1>

        {/* Description */}
        <p className="mt-3 text-neutral-600">
          {message || "This share link doesn't exist or is no longer valid."}
        </p>

        {/* Help section */}
        <div className="mt-6 rounded-lg bg-neutral-50 p-4">
          <div className="flex items-start gap-3 text-left">
            <HelpCircle className="h-5 w-5 flex-shrink-0 text-neutral-400 mt-0.5" />
            <div className="text-sm text-neutral-600">
              <p className="font-medium text-neutral-700 mb-1">
                Possible reasons:
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-500">
                <li>The link was copied incorrectly</li>
                <li>The host revoked the share link</li>
                <li>The link never existed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <p className="mt-4 text-sm text-neutral-500">
          Contact the host for a new share link.
        </p>
      </div>
    </div>
  );
}
