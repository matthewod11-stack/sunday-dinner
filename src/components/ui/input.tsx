import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Show error styling */
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-sm",
          "placeholder:text-neutral-400",
          // Transition
          "transition-all duration-200 ease-in-out",
          // Default border
          "border-neutral-300",
          // Focus state - warm ring, not harsh outline
          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100",
          // Error state
          error && "border-error focus:border-error focus:ring-error/20",
          className
        )}
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
