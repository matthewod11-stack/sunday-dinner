import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles - sharp corners, clean transitions, editorial feel
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-ui font-semibold transition-all duration-150 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variant: {
        // Primary - coral accent, uppercase
        primary: [
          "rounded-xs bg-primary text-white",
          "uppercase tracking-wide",
          "hover:bg-primary-hover",
        ],
        // Secondary - outlined, editorial
        secondary: [
          "rounded-xs border border-neutral-900 bg-transparent text-text-primary",
          "uppercase tracking-wide",
          "hover:bg-neutral-900 hover:text-white",
        ],
        // Outline - softer than secondary
        outline: [
          "rounded-xs border border-neutral-300 bg-transparent text-text-secondary",
          "hover:border-neutral-400 hover:text-text-primary",
        ],
        // Ghost - minimal, for inline actions
        ghost: [
          "rounded-xs text-text-secondary",
          "hover:bg-neutral-100 hover:text-text-primary",
        ],
        // Destructive - error state
        destructive: [
          "rounded-xs bg-error text-white",
          "uppercase tracking-wide",
          "hover:bg-error/90",
        ],
        // Link - underlined text
        link: [
          "text-primary underline underline-offset-2",
          "hover:text-primary-hover",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-sm",
        icon: "h-10 w-10 rounded-xs",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child element (for links, custom elements) */
  asChild?: boolean;
  /** Show loading spinner and disable interactions */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // When asChild is true, render children directly through Slot
    // (loading state not supported with asChild)
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    // Regular button with optional loading spinner
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
