import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /** Show required indicator (*) */
  required?: boolean;
  /** Show error styling */
  error?: boolean;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, required, error, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-neutral-700",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      error && "text-error",
      className
    )}
    {...props}
  >
    {children}
    {required && (
      <span className="ml-1 text-error" aria-hidden="true">
        *
      </span>
    )}
  </LabelPrimitive.Root>
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
