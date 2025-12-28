/**
 * Sunday Dinner UI Components
 *
 * Base component library following the "Warm Heirloom" design system.
 * Built with Radix UI primitives, Tailwind CSS, and class-variance-authority.
 */

// Button
export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";

// Card
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
} from "./card";
export type { CardProps } from "./card";

// Input
export { Input } from "./input";
export type { InputProps } from "./input";

// Label
export { Label } from "./label";
export type { LabelProps } from "./label";

// Modal (Dialog)
export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
} from "./modal";

// Skeleton
export { Skeleton, SkeletonCard, SkeletonText, SkeletonAvatar } from "./skeleton";

// Toast
export { Toaster, toast, showToast } from "./toast";

// Error Boundary
export { ErrorBoundary, ErrorFallback } from "./error-boundary";
