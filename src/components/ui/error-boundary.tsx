"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Custom fallback UI */
  fallback?: React.ReactNode;
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Reset key - changing this will reset the error state */
  resetKey?: string | number;
}

/**
 * Error boundary component that catches JavaScript errors in child components.
 * Displays a fallback UI instead of crashing the whole app.
 *
 * @example
 * <ErrorBoundary onError={(error) => logError(error)}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * @example
 * // With reset key (resets when route changes)
 * <ErrorBoundary resetKey={pathname}>
 *   <PageContent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state when resetKey changes
    if (
      this.state.hasError &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.resetError();
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback error={this.state.error} onRetry={this.resetError} />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

/**
 * Default error fallback UI.
 * Can be used standalone or as the default for ErrorBoundary.
 */
function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <Card variant="muted" className="p-8 text-center max-w-md mx-auto my-8">
      {/* Icon */}
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-error-light text-error mb-4">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
        Something went wrong
      </h3>

      {/* Error message */}
      <p className="text-sm text-neutral-600 mb-4">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>

      {/* Retry button */}
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Try Again
      </Button>

      {/* Development error details */}
      {process.env.NODE_ENV === "development" && error?.stack && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-xs text-neutral-500 hover:text-neutral-700">
            Error details
          </summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-neutral-100 p-3 text-xs text-neutral-700">
            {error.stack}
          </pre>
        </details>
      )}
    </Card>
  );
}

export { ErrorBoundary, ErrorFallback };
