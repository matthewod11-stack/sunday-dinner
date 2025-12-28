"use client";

import { Toaster as SonnerToaster, toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

/**
 * Toast provider component.
 * Add this to your root layout to enable toast notifications.
 */
function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className:
          "bg-surface border border-border shadow-lg rounded-xl text-foreground",
        duration: 4000,
        style: {
          fontFamily: "var(--font-sans)",
        },
      }}
      icons={{
        success: <CheckCircle className="h-5 w-5 text-success" />,
        error: <XCircle className="h-5 w-5 text-error" />,
        warning: <AlertCircle className="h-5 w-5 text-warning" />,
        info: <Info className="h-5 w-5 text-info" />,
      }}
    />
  );
}

/**
 * Helper functions for common toast types.
 * Provides a consistent API across the app.
 *
 * @example
 * showToast.success("Recipe saved!");
 * showToast.error("Failed to save recipe");
 * showToast.promise(saveRecipe(), {
 *   loading: "Saving...",
 *   success: "Saved!",
 *   error: "Failed to save"
 * });
 */
const showToast = {
  /** Success toast with green checkmark */
  success: (message: string, options?: Parameters<typeof toast.success>[1]) =>
    toast.success(message, options),

  /** Error toast with red X */
  error: (message: string, options?: Parameters<typeof toast.error>[1]) =>
    toast.error(message, options),

  /** Warning toast with amber alert */
  warning: (message: string, options?: Parameters<typeof toast.warning>[1]) =>
    toast.warning(message, options),

  /** Info toast with blue info icon */
  info: (message: string, options?: Parameters<typeof toast.info>[1]) =>
    toast.info(message, options),

  /** Loading toast that updates on promise resolution */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => toast.promise(promise, messages),

  /** Dismiss a specific toast or all toasts */
  dismiss: (toastId?: string | number) => toast.dismiss(toastId),
};

export { Toaster, toast, showToast };
