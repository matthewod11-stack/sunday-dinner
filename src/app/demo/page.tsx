"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Label,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
  Skeleton,
  SkeletonCard,
  SkeletonText,
  SkeletonAvatar,
  showToast,
  ErrorBoundary,
  ErrorFallback,
} from "@/components/ui";

// Component that throws an error for demo
function BrokenComponent() {
  throw new Error("This is a demo error to show the ErrorBoundary!");
}

export default function DemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBroken, setShowBroken] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasError, setHasError] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold text-foreground mb-3">
          Component Library Demo
        </h1>
        <p className="text-lg text-neutral-600">
          Sunday Dinner UI components with the Warm Heirloom design system
        </p>
      </div>

      {/* Buttons Section */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
          Buttons
        </h2>
        <Card>
          <CardContent className="pt-6">
            {/* Variants */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-neutral-500 mb-3">
                Variants
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-neutral-500 mb-3">
                Sizes
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-3">
                States
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled</Button>
                <Button loading={isLoading} onClick={handleLoadingDemo}>
                  {isLoading ? "Loading..." : "Click for Loading"}
                </Button>
                <Button asChild variant="outline">
                  <a href="/">As Link</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Form Elements Section */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
          Form Elements
        </h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Basic Input */}
            <div className="grid gap-2 max-w-sm">
              <Label htmlFor="demo-input">Recipe Name</Label>
              <Input
                id="demo-input"
                placeholder="e.g., Grandma's Apple Pie"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>

            {/* Required Input */}
            <div className="grid gap-2 max-w-sm">
              <Label htmlFor="demo-required" required>
                Servings
              </Label>
              <Input
                id="demo-required"
                type="number"
                placeholder="8"
              />
            </div>

            {/* Error Input */}
            <div className="grid gap-2 max-w-sm">
              <Label htmlFor="demo-error" error={hasError}>
                Email
              </Label>
              <Input
                id="demo-error"
                type="email"
                placeholder="you@example.com"
                error={hasError}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={hasError ? "outline" : "destructive"}
                  onClick={() => setHasError(!hasError)}
                >
                  {hasError ? "Clear Error" : "Show Error State"}
                </Button>
              </div>
            </div>

            {/* Disabled Input */}
            <div className="grid gap-2 max-w-sm">
              <Label htmlFor="demo-disabled">Disabled Input</Label>
              <Input
                id="demo-disabled"
                disabled
                value="Cannot edit this"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cards Section */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
          Cards
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Default Card */}
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>
                With border and subtle shadow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                This is the default card style with a light border and shadow.
                Great for recipe cards and content containers.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">View Recipe</Button>
            </CardFooter>
          </Card>

          {/* Elevated Card */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>
                More prominent shadow, no border
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                The elevated variant uses a stronger shadow for emphasis.
                Use for featured content or calls to action.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="secondary">
                Start Cooking
              </Button>
            </CardFooter>
          </Card>

          {/* Interactive Card */}
          <Card variant="outlined" interactive>
            <CardHeader>
              <CardTitle>Interactive Outlined</CardTitle>
              <CardDescription>
                Hover for lift effect
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                Interactive cards respond to hover with elevation and border
                color change. Perfect for clickable list items.
              </p>
            </CardContent>
          </Card>

          {/* Muted Card */}
          <Card variant="muted" padding="lg">
            <CardHeader className="p-0 pb-3">
              <CardTitle>Muted with Padding</CardTitle>
              <CardDescription>
                Subtle background for grouping
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-neutral-600">
                The muted variant has a subtle background. Combined with the
                padding prop for internal spacing.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Skeleton Section */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
          Skeletons
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Base Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle>Base Skeleton</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>

          {/* Skeleton Card */}
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-3">
              SkeletonCard Preset
            </p>
            <SkeletonCard />
          </div>

          {/* Skeleton Text & Avatar */}
          <Card>
            <CardHeader>
              <CardTitle>Text & Avatar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <SkeletonAvatar size="md" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <SkeletonText lines={3} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Modal Section */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
          Modal
        </h2>
        <Card>
          <CardContent className="pt-6">
            <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
              <ModalTrigger asChild>
                <Button>Open Modal</Button>
              </ModalTrigger>
              <ModalContent>
                <ModalHeader>
                  <ModalTitle>Ready to Start Cooking?</ModalTitle>
                  <ModalDescription>
                    This will begin your cooking timer and start tracking your
                    progress through the recipe.
                  </ModalDescription>
                </ModalHeader>
                <div className="py-4">
                  <p className="text-sm text-neutral-600 mb-3">
                    First hour tasks:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      Preheat oven to 375°F
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      Prep vegetables
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      Start the sauce
                    </li>
                  </ul>
                </div>
                <ModalFooter>
                  <ModalClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </ModalClose>
                  <Button onClick={() => {
                    showToast.success("Cooking started! Let's go!");
                    setIsModalOpen(false);
                  }}>
                    Start Cooking
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </CardContent>
        </Card>
      </section>

      {/* Toast Section */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
          Toast Notifications
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => showToast.success("Recipe saved successfully!")}
              >
                Success Toast
              </Button>
              <Button
                variant="destructive"
                onClick={() => showToast.error("Failed to save recipe")}
              >
                Error Toast
              </Button>
              <Button
                variant="outline"
                onClick={() => showToast.warning("Recipe has unsaved changes")}
              >
                Warning Toast
              </Button>
              <Button
                variant="ghost"
                onClick={() => showToast.info("Tip: Double-tap to edit")}
              >
                Info Toast
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const promise = new Promise((resolve) =>
                    setTimeout(resolve, 2000)
                  );
                  showToast.promise(promise, {
                    loading: "Saving recipe...",
                    success: "Recipe saved!",
                    error: "Failed to save",
                  });
                }}
              >
                Promise Toast
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Error Boundary Section */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
          Error Boundary
        </h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-3">
                ErrorFallback Component (Preview)
              </h3>
              {/* Using null error to avoid hydration mismatch from stack traces */}
              <ErrorFallback
                error={null}
                onRetry={() => showToast.info("Retry clicked!")}
              />
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-medium text-neutral-500 mb-3">
                Live ErrorBoundary Demo
              </h3>
              <Button
                variant={showBroken ? "outline" : "destructive"}
                onClick={() => setShowBroken(!showBroken)}
                className="mb-4"
              >
                {showBroken ? "Reset" : "Trigger Error"}
              </Button>
              <ErrorBoundary
                resetKey={showBroken ? "broken" : "fixed"}
                onError={(error) => console.log("Caught:", error.message)}
              >
                {showBroken && <BrokenComponent />}
                {!showBroken && (
                  <Card variant="muted" padding="md">
                    <p className="text-sm text-neutral-600">
                      This content is protected by an ErrorBoundary.
                      Click the button above to see it in action.
                    </p>
                  </Card>
                )}
              </ErrorBoundary>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Typography Preview */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
          Typography (Fraunces Display Font)
        </h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h1 className="font-display text-4xl font-bold">
              Sunday Dinner Heading
            </h1>
            <h2 className="font-display text-3xl font-semibold">
              Recipe Title Example
            </h2>
            <h3 className="font-display text-2xl font-medium">
              Section Heading
            </h3>
            <p className="text-base text-neutral-600">
              Body text uses the system font stack for optimal readability.
              The Fraunces display font is reserved for headings to create
              that warm, heritage feel while keeping body text crisp.
            </p>
            <p className="text-sm text-neutral-500">
              Small text for captions and metadata.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Color Palette */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
          Color Palette
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Primary */}
              <div>
                <p className="text-sm font-medium mb-2">Primary (Terracotta)</p>
                <div className="flex gap-2">
                  <div className="h-12 w-12 rounded-lg bg-primary" title="primary" />
                  <div className="h-12 w-12 rounded-lg bg-primary-hover" title="primary-hover" />
                  <div className="h-12 w-12 rounded-lg bg-primary-light border border-border" title="primary-light" />
                </div>
              </div>
              {/* Secondary */}
              <div>
                <p className="text-sm font-medium mb-2">Secondary (Sage)</p>
                <div className="flex gap-2">
                  <div className="h-12 w-12 rounded-lg bg-secondary" title="secondary" />
                  <div className="h-12 w-12 rounded-lg bg-secondary-hover" title="secondary-hover" />
                  <div className="h-12 w-12 rounded-lg bg-secondary-light border border-border" title="secondary-light" />
                </div>
              </div>
              {/* Accent */}
              <div>
                <p className="text-sm font-medium mb-2">Accent (Amber)</p>
                <div className="flex gap-2">
                  <div className="h-12 w-12 rounded-lg bg-accent" title="accent" />
                  <div className="h-12 w-12 rounded-lg bg-accent-hover" title="accent-hover" />
                  <div className="h-12 w-12 rounded-lg bg-accent-light border border-border" title="accent-light" />
                </div>
              </div>
            </div>
            {/* Semantic */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm font-medium mb-2">Semantic Colors</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-success" />
                  <span className="text-sm">Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-warning" />
                  <span className="text-sm">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-error" />
                  <span className="text-sm">Error</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-info" />
                  <span className="text-sm">Info</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
