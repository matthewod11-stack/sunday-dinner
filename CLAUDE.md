# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sunday Dinner** — A family meal planning & execution tool for 20+ person gatherings. Upload recipes (photo, URL, PDF, manual), plan scaled meals, generate cooking timelines, create shopping lists, and execute in real-time with offline support.

**Status:** Phase 4 Integration & Polish (28/32 features passing)
**Architecture:** Next.js 14 App Router, TypeScript strict, Tailwind CSS, Supabase, Claude API

## Build & Dev Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run typecheck    # TypeScript strict check
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
npm run format       # Prettier format
npm run format:check # Check formatting

./scripts/dev-init.sh  # Run at session start (shows phase info)
```

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (header/footer shell)
│   ├── page.tsx            # Welcome page
│   └── globals.css         # Design tokens (Warm Heirloom theme)
├── types/                  # TypeScript interfaces + Zod schemas (SHARED)
│   ├── recipe.ts           # Recipe, Ingredient, Instruction, ExtractionResult
│   ├── meal.ts             # Meal, GuestCount, ScalingFactor
│   ├── timeline.ts         # Task, Timeline, TimelineConflict
│   └── shopping.ts         # ShoppingItem, ShoppingList, unit conversions
├── contracts/              # Service interfaces (SHARED)
│   ├── ai-service.ts       # Claude API abstraction
│   ├── recipe-service.ts   # Recipe CRUD + extraction
│   ├── meal-service.ts     # Meal planning + scaling
│   ├── timeline-service.ts # Timeline generation + validation
│   └── shopping-service.ts # List generation + reconciliation
├── lib/
│   ├── supabase/client.ts  # Supabase client
│   ├── services/           # ai/, meal/, timeline/, shopping/, execution/, share/
│   ├── extraction/         # URL scraper, PDF parser, site handlers
│   ├── offline/            # IndexedDB queue, sync service, offline hooks
│   ├── timers/             # Singleton TimerService (Web Audio)
│   ├── validator/          # Deterministic timeline validator
│   └── wake-lock/          # Wake Lock API + iOS fallback
├── components/
│   ├── ui/                 # Button, Card, Input, Label, Modal, Skeleton, Toast, ErrorBoundary
│   ├── recipe/             # PhotoUpload, RecipeCard, RecipeForm, CategorySidebar, editors
│   ├── meals/              # MealForm, RecipePicker, ScalingInput
│   ├── timeline/           # TaskCard, NowNextLater, Gantt, ConflictBanner, edit modals
│   ├── shopping/           # ShoppingList, SectionGroup, PrintView
│   ├── live/               # LiveTaskCard, ProgressBar, timers, offline UI, RunningBehind
│   ├── share/              # ViewerTaskCard, ShareModal, expired/invalid states
│   └── layout/             # Header, PageHeader
└── hooks/                  # useOffline
```

### Key Design Patterns

**Type + Zod Schema Pairing:**
```typescript
// Every type has a corresponding Zod schema for runtime validation
export interface Recipe { ... }
export const RecipeSchema = z.object({ ... })
```

**Timeline Time Representation:**
```typescript
// Times are relative to serve time (negative = before)
startTimeMinutes: -120  // 2 hours before serve time
```

**Nullable vs Optional:**
- `quantity: number | null` — Field exists, value unknown ("to taste")
- `notes?: string` — Field may not exist

### Service Contracts

Services are defined as interfaces in `src/contracts/`. Implementations go in `src/lib/services/`. This separation allows:
- Agent A (recipes, shopping) and Agent B (meals, timeline) to work in parallel
- Easy testing with mock implementations
- Swappable AI providers

## Session Workflow

### Starting a Session
1. Run `./scripts/dev-init.sh`
2. Read `docs/PROGRESS.md` (most recent entry at top)
3. Check `features.json` for status
4. Pick ONE task from `docs/ROADMAP.md`

### Ending a Session
1. Run verification: `npm run typecheck && npm run lint`
2. Add session entry to TOP of `docs/PROGRESS.md`
3. Update `features.json` status
4. Commit with descriptive message

## Configuration

**TypeScript:** Strict mode with `noUncheckedIndexedAccess`, `noUnusedLocals`

**Tailwind:** CSS variables for all colors/spacing (see `globals.css`)
- Primary: Terracotta (#c2410c)
- Secondary: Sage (#3f6212)
- Accent: Amber (#d97706)

**ESLint:** `next/core-web-vitals` + `next/typescript` + `prettier`

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...
```

## Documentation

| File | Purpose |
|------|---------|
| `docs/ROADMAP.md` | Task checklist with week/phase breakdown |
| `docs/PROGRESS.md` | Session log (add entries at TOP) |
| `docs/SESSION_PROTOCOL.md` | Single vs parallel agent workflows |
| `docs/RALPH_LOOP_GUIDE.md` | Autonomous loop setup for parallel agents |
| `docs/KNOWN_ISSUES.md` | Bugs, blockers, coordination needs |
| `features.json` | Feature status tracking |
| `v1_roadmap.md` | Original requirements spec |

## PROJECT_STATE.md Maintenance

A `PROJECT_STATE.md` file exists at the project root. It serves as a cross-surface context sync document shared across Claude Chat, Claude Code (multiple machines), and Cowork.

Rules:
- Update PROJECT_STATE.md at the end of any session where meaningful changes were made
- Keep it under 300 lines — replace stale content, don't append indefinitely
- The "Recent Decisions" section should retain only the last 10 decisions; older ones can be archived or dropped
- The "Current State" section must reflect what actually exists in the codebase, not what was planned
- The "Cross-Surface Notes" section should flag any divergences from plans discussed outside this codebase
- When I say "update project state" or "sync state," regenerate PROJECT_STATE.md by scanning the current codebase
- Treat this file as the single source of truth about the project for external Claude sessions

## Current Phase: Integration & Polish (Phase 4)

**Phase 1 Foundation:** Complete (7/7)
**Phase 2 Core Features:** Complete (11/11)
**Phase 3 Live Mode:** Complete (10/10)
**Phase 3.5 UX Polish:** Complete
**Phase 4 Polish:** In progress (0/4) — iOS Safari testing, performance, final testing, ship
