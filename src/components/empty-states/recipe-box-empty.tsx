import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Empty state for the recipes page.
 *
 * Visual concept: A vintage recipe card box, slightly open,
 * inviting the user to add their first card. Warm, nostalgic,
 * not sterile.
 */
export function RecipeBoxEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Illustration - Recipe box with floating cards */}
      <div className="relative mb-8">
        {/* Background glow */}
        <div
          className="absolute inset-0 -z-10 scale-150 rounded-full bg-primary-light/40 blur-3xl"
          aria-hidden="true"
        />

        {/* Recipe box illustration */}
        <svg
          width="200"
          height="160"
          viewBox="0 0 200 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-float"
          aria-hidden="true"
        >
          {/* Box body */}
          <rect
            x="30"
            y="60"
            width="140"
            height="90"
            rx="8"
            fill="#fef3c7"
            stroke="#d97706"
            strokeWidth="2"
          />
          {/* Box lid - slightly open */}
          <path
            d="M25 60 L100 20 L175 60"
            fill="#fef3c7"
            stroke="#d97706"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <rect
            x="25"
            y="50"
            width="150"
            height="12"
            rx="2"
            fill="#fef3c7"
            stroke="#d97706"
            strokeWidth="2"
          />
          {/* Decorative label on box */}
          <rect
            x="70"
            y="90"
            width="60"
            height="30"
            rx="4"
            fill="white"
            stroke="#d6d3d1"
            strokeWidth="1"
          />
          <text
            x="100"
            y="110"
            textAnchor="middle"
            fontSize="10"
            fontFamily="serif"
            fill="#78716c"
          >
            Recipes
          </text>
          {/* Floating recipe card 1 - left */}
          <g className="animate-floatSlow" style={{ animationDelay: "0.2s" }}>
            <rect
              x="10"
              y="25"
              width="45"
              height="60"
              rx="4"
              fill="white"
              stroke="#e7e5e4"
              strokeWidth="1.5"
              transform="rotate(-12 32 55)"
            />
            <line
              x1="20"
              y1="40"
              x2="45"
              y2="40"
              stroke="#d6d3d1"
              strokeWidth="1"
              transform="rotate(-12 32 55)"
            />
            <line
              x1="20"
              y1="50"
              x2="40"
              y2="50"
              stroke="#d6d3d1"
              strokeWidth="1"
              transform="rotate(-12 32 55)"
            />
          </g>
          {/* Floating recipe card 2 - right */}
          <g className="animate-floatSlow" style={{ animationDelay: "0.5s" }}>
            <rect
              x="145"
              y="20"
              width="45"
              height="60"
              rx="4"
              fill="white"
              stroke="#e7e5e4"
              strokeWidth="1.5"
              transform="rotate(8 167 50)"
            />
            <line
              x1="155"
              y1="35"
              x2="180"
              y2="35"
              stroke="#d6d3d1"
              strokeWidth="1"
              transform="rotate(8 167 50)"
            />
            <line
              x1="155"
              y1="45"
              x2="175"
              y2="45"
              stroke="#d6d3d1"
              strokeWidth="1"
              transform="rotate(8 167 50)"
            />
          </g>
          {/* Dashed outline - "drop zone" feel */}
          <rect
            x="50"
            y="75"
            width="100"
            height="60"
            rx="6"
            fill="none"
            stroke="#d97706"
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* Text content */}
      <h2 className="mb-2 font-display text-2xl font-semibold text-foreground">
        Your Recipe Box is Empty
      </h2>
      <p className="mb-8 max-w-md text-neutral-600">
        Start your collection by adding your first family recipe.
        <br />
        <span className="text-sm">
          Upload a photo, paste a URL, or type it in.
        </span>
      </p>

      {/* CTA */}
      <Button asChild size="lg">
        <Link href="/recipes/new">
          <Plus className="mr-2 h-5 w-5" />
          Add Your First Recipe
        </Link>
      </Button>

      {/* Decorative dots */}
      <div
        className="mt-12 flex items-center gap-2 text-neutral-300"
        aria-hidden="true"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      </div>
    </div>
  );
}
