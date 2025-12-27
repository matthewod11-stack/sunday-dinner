# Parallel Agent Build Strategy

**Project:** Sunday Dinner v1  
**Duration:** 11 weeks  
**Agents:** 1-2 concurrent (scaling up/down by phase)  
**Goal:** Maximize velocity while minimizing coordination overhead

---

## Executive Summary

This document outlines how to parallelize development of Sunday Dinner v1 using multiple AI agents. The strategy balances speed gains from parallel work against coordination costs from merge conflicts and interface mismatches.

**Key insight:** 2 well-coordinated agents with clear boundaries outperform 4 agents stepping on each other.

---

## Phase Overview

| Phase | Weeks | Agents | Focus |
|-------|-------|--------|-------|
| **Foundation** | 1-2 | 1 | Contracts, types, shared infrastructure |
| **Core Features** | 3-6 | 2 | Recipe Ingestion + Planning/Timeline |
| **Live Mode** | 7-9 | 2 | Execution + Sharing |
| **Integration & Polish** | 10-11 | 1 | Testing, iOS Safari, ship |

---

## Phase 1: Foundation (Weeks 1-2)

### Agent Assignment: Single Agent

Foundation must be sequential. This agent establishes all contracts that parallel agents will consume.

### Week 1 Deliverables

**Day 1-2: Project Scaffolding**
- [ ] Next.js 14 project with App Router
- [ ] TypeScript strict mode configuration
- [ ] Tailwind CSS with design tokens
- [ ] Supabase client setup
- [ ] ESLint + Prettier configuration
- [ ] Directory structure (see below)

**Day 3-4: Core Types & Contracts**
- [ ] `types/recipe.ts` — Recipe, Ingredient, Instruction interfaces
- [ ] `types/meal.ts` — Meal, GuestCount, ScalingFactor interfaces
- [ ] `types/timeline.ts` — Timeline, Task, TaskStatus interfaces
- [ ] `types/shopping.ts` — ShoppingList, ShoppingItem interfaces
- [ ] `contracts/recipe-service.ts` — RecipeService interface
- [ ] `contracts/timeline-service.ts` — TimelineService interface
- [ ] `contracts/ai-service.ts` — AIService abstraction interface

**Day 5: Database Schema**
- [ ] Supabase migrations for Recipe, Meal, Timeline, Task tables
- [ ] RLS policies (permissive for solo user, structured for future multi-user)
- [ ] Storage buckets for recipe images

### Week 2 Deliverables

**Day 1-2: Base Components**
- [ ] Design tokens (CSS variables for colors, typography, spacing)
- [ ] Button, Card, Input, Modal components (Radix UI primitives)
- [ ] Toast notification system
- [ ] Loading skeletons
- [ ] Error boundary components

**Day 3-4: Infrastructure**
- [ ] AI abstraction layer (wraps Claude API)
- [ ] Image compression utility (client-side, target <500KB)
- [ ] PWA manifest.json
- [ ] Service Worker shell (basic caching)
- [ ] Offline detection hook

**Day 5: App Shell**
- [ ] Layout component (header, main content, responsive)
- [ ] Navigation structure
- [ ] Empty states for recipes, meals
- [ ] Basic routing structure

### Foundation Outputs (Consumed by Parallel Agents)

```
/types/
├── recipe.ts          # Recipe, Ingredient, Instruction
├── meal.ts            # Meal, ScalingConfig
├── timeline.ts        # Timeline, Task, TaskStatus
├── shopping.ts        # ShoppingList, ShoppingItem
└── index.ts           # Re-exports all

/contracts/
├── recipe-service.ts  # RecipeService interface
├── timeline-service.ts # TimelineService interface
├── ai-service.ts      # AIService interface
└── index.ts           # Re-exports all

/components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
├── modal.tsx
├── toast.tsx
├── skeleton.tsx
└── error-boundary.tsx

/lib/
├── supabase.ts        # Supabase client
├── ai.ts              # AI service implementation
├── image.ts           # Compression utilities
└── offline.ts         # Offline detection
```

### Definition of Done (Phase 1)

- [ ] `npm run dev` shows styled app shell
- [ ] Supabase connected, can read/write to database
- [ ] All type files compile without errors
- [ ] Toast notifications work
- [ ] Offline indicator appears when disconnected
- [ ] Contract interfaces are documented with JSDoc

---

## Phase 2: Core Features (Weeks 3-6)

### Agent Assignment: Two Parallel Agents

| Agent | Owns | Weeks |
|-------|------|-------|
| **Agent A** | Recipe Ingestion (all sources) + Shopping List | 3-6 |
| **Agent B** | Meal Setup + Timeline Generation | 3-6 |

### Boundary Rules

```
Agent A owns:
├── /app/recipes/           # All recipe routes
├── /app/shopping/          # Shopping list routes
├── /lib/services/recipe/   # Recipe service implementation
├── /lib/services/shopping/ # Shopping service implementation
└── /lib/extraction/        # Claude Vision, URL scraping, PDF parsing

Agent B owns:
├── /app/meals/             # Meal routes
├── /app/timeline/          # Timeline routes (planning view)
├── /lib/services/meal/     # Meal service implementation
├── /lib/services/timeline/ # Timeline service implementation
└── /lib/validator/         # Deterministic timeline validator

Shared (read-only for both, Foundation agent owns):
├── /types/                 # All type definitions
├── /contracts/             # Service interfaces
├── /components/ui/         # Base components
└── /lib/supabase.ts        # Database client
```

### Week 3: Recipe Ingestion (Photo + Manual)

**Agent A Focus:**
- [ ] Photo upload component with mobile camera support
- [ ] Image compression before upload
- [ ] Claude Vision extraction call
- [ ] Extraction result parsing (ingredients, steps, yield, times)
- [ ] Side-by-side correction UI (original left, fields right)
- [ ] Uncertain field highlighting (empty, unusual patterns)
- [ ] Manual entry form (fallback)
- [ ] Extraction failure handling ("Couldn't extract" + manual option)
- [ ] Save recipe to database
- [ ] Recipe list view
- [ ] Recipe detail view

**Agent B Focus:**
- [ ] Meal creation form (name, serve time, guest count)
- [ ] Recipe picker (select from library)
- [ ] Scaling factor input per recipe
- [ ] Claude scaling review (flag concerns)
- [ ] Meal detail view
- [ ] Edit/delete meal

### Week 4: Recipe Ingestion (URL + PDF) + Timeline Core

**Agent A Focus:**
- [ ] URL input component
- [ ] URL scraping service (fetch + parse)
- [ ] Common recipe site handlers (AllRecipes, NYT Cooking, etc.)
- [ ] Generic recipe extraction fallback
- [ ] PDF upload component
- [ ] Single-page PDF parsing via Claude Vision
- [ ] Unified extraction → correction flow for all sources

**Agent B Focus:**
- [ ] Timeline generation service (Claude call)
- [ ] Timeline data structure (tasks with times, durations, dependencies)
- [ ] Deterministic validator implementation:
  - No overlapping oven tasks
  - Task dependencies respected
  - No negative durations
  - Serve time after all tasks
- [ ] Conflict detection and warning UI
- [ ] Now/Next/Later view component
- [ ] Gantt view component (secondary)

### Week 5: Timeline Polish + Shopping List

**Agent A Focus:**
- [ ] Shopping list generation from meal recipes
- [ ] Unit reconciliation logic (cups, tbsp, oz, lb, g)
- [ ] Pluralization handling
- [ ] Ambiguous quantity flagging ("to taste", "a handful")
- [ ] Store section grouping (Produce, Dairy, Meat, Pantry, Frozen)
- [ ] Check-off interaction
- [ ] "I always have this" toggle (staples)
- [ ] localStorage persistence for staples
- [ ] Print-friendly view

**Agent B Focus:**
- [ ] Task editing (adjust time, duration)
- [ ] Task reordering (form-based, not drag-drop)
- [ ] Task deletion with dependency handling
- [ ] Timeline regeneration when recipes change
- [ ] View switching (Now/Next/Later ↔ Gantt)
- [ ] Mobile-responsive timeline views

### Week 6: Integration + Buffer

**Both Agents:**
- [ ] Integration testing across recipe → meal → timeline → shopping flow
- [ ] Bug fixes from integration
- [ ] Polish on UI consistency
- [ ] Performance profiling

**Integration Points to Verify:**
1. Recipe saved by Agent A appears in Agent B's recipe picker
2. Meal with scaled recipes generates correct shopping list quantities
3. Timeline tasks reference correct recipe steps
4. Conflict detection works across multiple recipes

### Phase 2 Outputs

```
Agent A delivers:
├── /app/recipes/page.tsx           # Recipe list
├── /app/recipes/new/page.tsx       # Upload/create recipe
├── /app/recipes/[id]/page.tsx      # Recipe detail
├── /app/shopping/[mealId]/page.tsx # Shopping list for meal
├── /lib/services/recipe/           # Full implementation
├── /lib/services/shopping/         # Full implementation
└── /lib/extraction/                # Vision, URL, PDF extractors

Agent B delivers:
├── /app/meals/page.tsx             # Meal list
├── /app/meals/new/page.tsx         # Create meal
├── /app/meals/[id]/page.tsx        # Meal detail
├── /app/timeline/[mealId]/page.tsx # Timeline view
├── /lib/services/meal/             # Full implementation
├── /lib/services/timeline/         # Full implementation
└── /lib/validator/                 # Timeline validator
```

### Definition of Done (Phase 2)

- [ ] Can upload recipe via photo, URL, PDF, or manual entry
- [ ] Can correct extractions in side-by-side UI
- [ ] Can create meal with 2+ recipes, scaled to 20 servings
- [ ] Can generate timeline anchored to serve time
- [ ] Conflicts are detected and displayed
- [ ] Can switch between Now/Next/Later and Gantt views
- [ ] Can generate shopping list with consolidated quantities
- [ ] Staples persist across meals

---

## Phase 3: Live Mode (Weeks 7-9)

### Agent Assignment: Two Parallel Agents

| Agent | Owns | Weeks |
|-------|------|-------|
| **Agent A** | Live Execution (core + offline) | 7-9 |
| **Agent B** | Share Links + Live Mode Polish | 8-9 |

Note: Agent B starts Week 8 to allow Live Mode core to stabilize first.

### Boundary Rules

```
Agent A owns:
├── /app/live/                  # Live execution routes
├── /lib/services/execution/    # Execution state management
├── /lib/offline/               # IndexedDB queue, sync logic
└── /lib/timers/                # Local timer implementation

Agent B owns:
├── /app/share/                 # Share link viewer routes
├── /lib/services/share/        # Share link generation, validation
└── /lib/polling/               # Viewer polling logic

Shared infrastructure (coordinate on):
├── /lib/supabase.ts            # May need RLS updates for share links
└── Supabase migrations         # Share token table
```

### Week 7: Live Mode Core

**Agent A Focus:**
- [ ] Kitchen Walkthrough component (Ready Check modal)
- [ ] Auto-generate checklist from first hour's tasks
- [ ] "Skip" option with preference memory
- [ ] "Start Cooking" button (anchors timeline to real time)
- [ ] Now/Next/Later live view
- [ ] Task checkoff with visual feedback
- [ ] Undo checkoff (within 30 seconds)
- [ ] Progress indicator
- [ ] Local timer implementation
- [ ] Timer start/pause/reset
- [ ] Active timer banner

**Agent B Focus:** (starts mid-week or helps Agent A)
- [ ] Share link database schema (meal_share_tokens table)
- [ ] Supabase RLS policy for share tokens
- [ ] Share link generation (UUID v4 token)
- [ ] Expiration calculation (serve time + 24 hours)

### Week 8: Running Behind + Share Links

**Agent A Focus:**
- [ ] "I'm behind" button
- [ ] Claude recalculation call
- [ ] Suggestion display ("Push X from 4:45 → 5:00")
- [ ] Accept suggestion flow
- [ ] "Adjust differently" option (max 3 attempts)
- [ ] "I'll fix it myself" → jump to edit mode
- [ ] Undo accepted suggestion
- [ ] Offline fallback: "+15 min" button (no Claude needed)
- [ ] Large text mode toggle
- [ ] Font size increases
- [ ] Secondary UI hidden
- [ ] Wake lock API integration
- [ ] iOS wake lock fallback (silent video loop)

**Agent B Focus:**
- [ ] Share link viewer route (`/share/[token]`)
- [ ] Token validation
- [ ] Now/Next/Later view for viewers (read-only)
- [ ] Polling for updates (every 5 seconds)
- [ ] "Link expired" UI
- [ ] Expiration recalculation when serve time changes
- [ ] Mobile-responsive viewer

### Week 9: Offline Resilience + Integration

**Agent A Focus:**
- [ ] IndexedDB setup for offline queue
- [ ] Checkoff persistence in IndexedDB
- [ ] Sync logic on reconnect
- [ ] Retry with exponential backoff
- [ ] "Last synced X ago" indicator
- [ ] Service Worker caching strategy:
  - Cache current meal (recipes, timeline, tasks)
  - Cache recipe images (up to 50MB)
  - Cache app shell
  - Don't cache other meals
- [ ] Offline detection UI
- [ ] Graceful degradation when Service Worker fails

**Agent B Focus:**
- [ ] Share link integration testing
- [ ] Host checkoff → viewer update latency (<5 seconds)
- [ ] Viewer cannot interact (truly read-only)
- [ ] Cross-browser testing for viewer
- [ ] Mobile viewer testing

**Both Agents:**
- [ ] End-to-end Live Mode testing
- [ ] Kitchen Walkthrough → Start → Checkoffs → Behind → Finish
- [ ] Offline scenario testing

### Phase 3 Outputs

```
Agent A delivers:
├── /app/live/[mealId]/page.tsx     # Live execution view
├── /lib/services/execution/        # Execution state
├── /lib/offline/                   # IndexedDB queue
├── /lib/timers/                    # Timer logic
└── Service Worker updates          # Caching strategy

Agent B delivers:
├── /app/share/[token]/page.tsx     # Share link viewer
├── /lib/services/share/            # Share link service
├── /lib/polling/                   # Viewer polling
└── Supabase migrations             # Share token table + RLS
```

### Definition of Done (Phase 3)

- [ ] Kitchen Walkthrough appears before first start
- [ ] Can run Live Mode start-to-finish
- [ ] Can checkoff tasks with undo
- [ ] "I'm behind" returns useful suggestion
- [ ] Offline "+15 min" works without network
- [ ] Large text mode works with wake lock
- [ ] Offline: timers run, checkoffs persist, sync on reconnect
- [ ] Share link works for viewer
- [ ] Viewer sees updates within 5 seconds
- [ ] Expired links show appropriate message

---

## Phase 4: Integration & Polish (Weeks 10-11)

### Agent Assignment: Single Agent

Final phase is sequential to avoid conflicts during polish and ensure cohesive quality.

### Week 10: iOS Safari + Polish

**Focus: iOS Safari Testing Matrix**
- [ ] PWA installed on iOS Safari
- [ ] Background/lock/unlock behavior
- [ ] Wake lock functionality (with fallback)
- [ ] Audio timer alerts
- [ ] Offline behavior on iOS
- [ ] Service Worker registration on iOS
- [ ] Share link opening on iOS

**Focus: Bug Fixes**
- [ ] Fix issues discovered in iOS testing
- [ ] Fix any cross-browser inconsistencies
- [ ] Fix mobile layout issues

**Focus: Performance**
- [ ] Lighthouse audit (target ≥90 mobile)
- [ ] Bundle size analysis
- [ ] Image loading optimization
- [ ] Lazy loading for non-critical routes

### Week 11: Final Testing + Ship

**Day 1-2: End-to-End Meal Test**
- [ ] Real 20-person meal planning (not simulated)
- [ ] Use 2+ actual family recipe cards
- [ ] Full flow: upload → plan → shop → cook
- [ ] Note any friction points

**Day 3: Family Member Test**
- [ ] Share link with actual family member
- [ ] Observe their experience viewing timeline
- [ ] Collect feedback

**Day 4: Recipe Extraction Test**
- [ ] Test extraction on 5+ real family recipe cards
- [ ] Include handwritten, printed, and mixed
- [ ] Verify correction UI works for failures

**Day 5: Ship**
- [ ] Final P0 bug fixes
- [ ] Production deployment
- [ ] Smoke test production

### V1 Ship Checklist

Before deploying:

- [ ] All success criteria from v1_roadmap.md pass
- [ ] No P0 bugs (data loss, crashes, broken core flows)
- [ ] Lighthouse mobile score ≥90
- [ ] Full meal test completed on iOS Safari
- [ ] Offline test: airplane mode 5 min mid-cook, then reconnect
- [ ] Family member tested share link and saw live updates
- [ ] Recipe extraction tested on 5+ real family recipe cards

---

## Coordination Mechanisms

### Daily Sync Points

For phases with parallel agents:

**Morning (5 min):**
- What I'm building today
- Any shared files I need to touch
- Any interface questions

**Evening (5 min):**
- What I shipped
- Any contract changes needed
- Blockers for tomorrow

### Contract Change Protocol

If an agent needs to modify a shared type or interface:

1. **Propose** the change (don't just make it)
2. **Review** impact on other agent's work
3. **Coordinate** timing (both agents update their code)
4. **Merge** contract change first, then implementations

### File Ownership Enforcement

Each agent prompt should include:

```
BOUNDARY RULES:
- You own: [list of directories]
- You may read: [list of shared directories]
- You must NOT modify: [list of other agent's directories]
- If you need a shared change, describe it but don't implement it
```

### Integration Points

These require both agents to coordinate:

| Integration Point | Agent A Provides | Agent B Consumes |
|-------------------|------------------|------------------|
| Recipe → Meal | `RecipeService.list()` | Recipe picker in Meal creation |
| Meal → Shopping | `Meal` with scaled recipes | Shopping list generation |
| Timeline → Live | `Timeline` with tasks | Live execution view |
| Checkoff → Share | Task status updates | Viewer polling |

---

## Risk Mitigation

### Risk: Agents Modify Same File

**Prevention:**
- Clear directory ownership
- Boundary rules in every prompt
- Shared files are read-only

**Recovery:**
- Git diff to identify conflicts
- Manual merge or coordinator agent resolves

### Risk: Interface Mismatch

**Prevention:**
- Contracts defined before parallel work
- JSDoc on all interfaces
- Type checking catches mismatches

**Recovery:**
- Integration week (Week 6) catches issues
- Contract change protocol for fixes

### Risk: Quality Drift

**Prevention:**
- Same design tokens for all agents
- Shared component library
- ESLint enforces consistency

**Recovery:**
- Week 10 polish pass with single agent
- Visual review of all screens together

### Risk: Parallel Agents Slower Than Sequential

**Prevention:**
- Only 2 agents max (coordination overhead grows O(n²))
- Clear, large boundaries (not fine-grained)
- Integration buffer weeks

**Monitoring:**
- If agents are blocking each other often, collapse to 1
- If integration takes more than a week, reduce parallelism next phase

---

## Directory Structure (Final)

```
sunday-dinner/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Home/dashboard
│   ├── recipes/
│   │   ├── page.tsx                # Recipe list
│   │   ├── new/page.tsx            # Create recipe
│   │   └── [id]/page.tsx           # Recipe detail
│   ├── meals/
│   │   ├── page.tsx                # Meal list
│   │   ├── new/page.tsx            # Create meal
│   │   └── [id]/page.tsx           # Meal detail
│   ├── timeline/
│   │   └── [mealId]/page.tsx       # Timeline planning view
│   ├── shopping/
│   │   └── [mealId]/page.tsx       # Shopping list
│   ├── live/
│   │   └── [mealId]/page.tsx       # Live execution
│   └── share/
│       └── [token]/page.tsx        # Share link viewer
├── components/
│   ├── ui/                         # Base components (Foundation)
│   ├── recipes/                    # Recipe-specific components (Agent A)
│   ├── meals/                      # Meal-specific components (Agent B)
│   ├── timeline/                   # Timeline components (Agent B)
│   ├── shopping/                   # Shopping components (Agent A)
│   ├── live/                       # Live mode components (Agent A)
│   └── share/                      # Share viewer components (Agent B)
├── lib/
│   ├── supabase.ts                 # Database client (Foundation)
│   ├── ai.ts                       # AI service (Foundation)
│   ├── image.ts                    # Image compression (Foundation)
│   ├── offline.ts                  # Offline detection (Foundation)
│   ├── services/
│   │   ├── recipe/                 # Recipe service (Agent A)
│   │   ├── meal/                   # Meal service (Agent B)
│   │   ├── timeline/               # Timeline service (Agent B)
│   │   ├── shopping/               # Shopping service (Agent A)
│   │   ├── execution/              # Execution service (Agent A)
│   │   └── share/                  # Share service (Agent B)
│   ├── extraction/                 # Claude Vision, URL, PDF (Agent A)
│   ├── validator/                  # Timeline validator (Agent B)
│   ├── timers/                     # Local timers (Agent A)
│   └── polling/                    # Viewer polling (Agent B)
├── types/
│   ├── recipe.ts
│   ├── meal.ts
│   ├── timeline.ts
│   ├── shopping.ts
│   └── index.ts
├── contracts/
│   ├── recipe-service.ts
│   ├── timeline-service.ts
│   ├── ai-service.ts
│   └── index.ts
├── public/
│   ├── manifest.json
│   └── sw.js                       # Service Worker
└── supabase/
    └── migrations/                 # Database migrations
```

---

## Summary

| Week | Agent(s) | Deliverables |
|------|----------|--------------|
| 1 | 1 | Project setup, types, contracts, database schema |
| 2 | 1 | Base components, AI layer, PWA shell, app layout |
| 3 | 2 | Photo/manual ingestion + Meal setup |
| 4 | 2 | URL/PDF ingestion + Timeline generation |
| 5 | 2 | Shopping list + Timeline polish |
| 6 | 2 | Integration testing, bug fixes |
| 7 | 1-2 | Live Mode core, share link schema |
| 8 | 2 | Running behind flow + Share link viewer |
| 9 | 2 | Offline resilience, integration testing |
| 10 | 1 | iOS Safari testing, performance, polish |
| 11 | 1 | Final testing, family test, ship |

**Total parallel weeks:** 6 (Weeks 3-6, 8-9)  
**Total sequential weeks:** 5 (Weeks 1-2, 7, 10-11)  
**Estimated speedup:** ~30% faster than pure sequential (accounting for coordination overhead)

---

*Last Updated: December 2025*
