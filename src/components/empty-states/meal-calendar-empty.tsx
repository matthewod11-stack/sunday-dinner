import Link from "next/link";
import { CalendarPlus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MealCalendarEmptyProps {
  /** Whether the user has any recipes yet */
  hasRecipes?: boolean;
}

/**
 * Empty state for the meals page.
 *
 * Visual concept: An open calendar/planner with Sunday highlighted,
 * waiting for the user to plan their first gathering.
 *
 * If user has no recipes yet, shows a softer message encouraging
 * them to add recipes first.
 */
export function MealCalendarEmpty({ hasRecipes = false }: MealCalendarEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Illustration - Calendar with Sunday highlighted */}
      <div className="relative mb-8">
        {/* Background glow */}
        <div
          className="absolute inset-0 -z-10 scale-150 rounded-full bg-secondary-light/40 blur-3xl"
          aria-hidden="true"
        />

        <svg
          width="200"
          height="160"
          viewBox="0 0 200 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-float"
          aria-hidden="true"
        >
          {/* Calendar base */}
          <rect
            x="30"
            y="30"
            width="140"
            height="110"
            rx="8"
            fill="white"
            stroke="#3f6212"
            strokeWidth="2"
          />
          {/* Calendar header */}
          <rect
            x="30"
            y="30"
            width="140"
            height="28"
            rx="8"
            fill="#3f6212"
          />
          <rect
            x="30"
            y="45"
            width="140"
            height="15"
            fill="#3f6212"
          />
          {/* Binding rings */}
          <circle cx="55" cy="30" r="6" fill="white" stroke="#3f6212" strokeWidth="2" />
          <circle cx="100" cy="30" r="6" fill="white" stroke="#3f6212" strokeWidth="2" />
          <circle cx="145" cy="30" r="6" fill="white" stroke="#3f6212" strokeWidth="2" />
          {/* Day headers */}
          <text x="42" y="52" fontSize="8" fill="white" fontWeight="500">S</text>
          <text x="59" y="52" fontSize="8" fill="white" fontWeight="500">M</text>
          <text x="76" y="52" fontSize="8" fill="white" fontWeight="500">T</text>
          <text x="93" y="52" fontSize="8" fill="white" fontWeight="500">W</text>
          <text x="110" y="52" fontSize="8" fill="white" fontWeight="500">T</text>
          <text x="127" y="52" fontSize="8" fill="white" fontWeight="500">F</text>
          <text x="144" y="52" fontSize="8" fill="white" fontWeight="500">S</text>
          {/* Calendar grid - simplified */}
          {/* Row 1 */}
          <text x="42" y="75" fontSize="10" fill="#a8a29e">1</text>
          <text x="59" y="75" fontSize="10" fill="#a8a29e">2</text>
          <text x="76" y="75" fontSize="10" fill="#a8a29e">3</text>
          <text x="93" y="75" fontSize="10" fill="#a8a29e">4</text>
          <text x="110" y="75" fontSize="10" fill="#a8a29e">5</text>
          <text x="127" y="75" fontSize="10" fill="#a8a29e">6</text>
          <text x="144" y="75" fontSize="10" fill="#a8a29e">7</text>
          {/* Row 2 - Sunday highlighted! */}
          <circle cx="45" cy="92" r="11" fill="#d9f99d" />
          <text x="42" y="96" fontSize="10" fill="#3f6212" fontWeight="600">8</text>
          <text x="59" y="96" fontSize="10" fill="#a8a29e">9</text>
          <text x="73" y="96" fontSize="10" fill="#a8a29e">10</text>
          <text x="90" y="96" fontSize="10" fill="#a8a29e">11</text>
          <text x="107" y="96" fontSize="10" fill="#a8a29e">12</text>
          <text x="124" y="96" fontSize="10" fill="#a8a29e">13</text>
          <text x="141" y="96" fontSize="10" fill="#a8a29e">14</text>
          {/* Row 3 */}
          <text x="39" y="117" fontSize="10" fill="#a8a29e">15</text>
          <text x="56" y="117" fontSize="10" fill="#a8a29e">16</text>
          <text x="73" y="117" fontSize="10" fill="#a8a29e">17</text>
          <text x="90" y="117" fontSize="10" fill="#a8a29e">18</text>
          <text x="107" y="117" fontSize="10" fill="#a8a29e">19</text>
          <text x="124" y="117" fontSize="10" fill="#a8a29e">20</text>
          <text x="141" y="117" fontSize="10" fill="#a8a29e">21</text>
          {/* Decorative pencil */}
          <g className="animate-floatSlow" style={{ animationDelay: "0.3s" }}>
            <rect
              x="155"
              y="75"
              width="8"
              height="45"
              rx="2"
              fill="#fef3c7"
              stroke="#d97706"
              strokeWidth="1"
              transform="rotate(20 159 97)"
            />
            <polygon
              points="159,120 155,128 163,128"
              fill="#d97706"
              transform="rotate(20 159 124)"
            />
          </g>
        </svg>
      </div>

      {/* Text content */}
      <h2 className="mb-2 font-display text-2xl font-semibold text-foreground">
        {hasRecipes ? "No Meals Planned Yet" : "Ready to Plan a Gathering?"}
      </h2>

      {hasRecipes ? (
        <>
          <p className="mb-8 max-w-md text-neutral-600">
            Pick a Sunday, add some recipes, and let us help you
            <br />
            coordinate the cooking timeline.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/meals/new">
              <CalendarPlus className="mr-2 h-5 w-5" />
              Plan Your First Gathering
            </Link>
          </Button>
        </>
      ) : (
        <>
          <p className="mb-8 max-w-md text-neutral-600">
            Before planning a meal, you&apos;ll need some recipes in your box.
            <br />
            <span className="text-sm">
              Add a few family favorites first, then come back here.
            </span>
          </p>
          <Button asChild size="lg">
            <Link href="/recipes/new">
              <BookOpen className="mr-2 h-5 w-5" />
              Add Recipes First
            </Link>
          </Button>
        </>
      )}

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
