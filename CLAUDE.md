# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sunday Dinner** — A family meal planning & execution tool for 20+ person gatherings. Upload recipes (photo, URL, PDF, manual), plan scaled meals, generate cooking timelines, create shopping lists, and execute in real-time with offline support.

**Status:** Phase 2 Core Features (Week 4 of 11)
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
│   └── services/           # Service implementations (empty, future phases)
└── components/ui/          # Base components (empty, Week 2)
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

## Current Phase: Core Features (Week 4)

**Phase 1 Foundation:** Complete (7/7 features)

**Phase 2 Core (Weeks 3-4) Completed:**
- [x] Recipe photo ingestion + Claude Vision extraction
- [x] Manual entry form + correction UI
- [x] Meal setup + recipe scaling
- [x] URL + PDF recipe ingestion
- [x] Timeline generation + views

**Next (Week 5):**
- Agent A: Shopping list generation
- Agent B: Timeline editing
