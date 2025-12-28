# Sunday Dinner v1 — Implementation Roadmap

> **Purpose:** Actionable checklist for implementation using parallel + long-running agent workflow.
> **Related Docs:** [SESSION_PROTOCOL.md](./SESSION_PROTOCOL.md) | [PROGRESS.md](./PROGRESS.md) | [features.json](../features.json)

---

## Session Management

This is a **long-running, multi-session implementation** with **parallel agents** in Weeks 3-9. Follow these rules:

### Before Each Session

```bash
./scripts/dev-init.sh
```

### Single-Feature-Per-Session Rule

> **CRITICAL:** Work on ONE checkbox item per session. This prevents scope creep.

### After Each Session

1. Run verification (tests, type-check)
2. Update PROGRESS.md with session entry (include agent identifier in parallel phases)
3. Update features.json status
4. Check off completed tasks
5. Commit with descriptive message

---

## Phase Overview

| Phase | Weeks | Agent(s) | Focus | Pause Point |
|-------|-------|----------|-------|-------------|
| **Foundation** | 1-2 | Single | Contracts, types, shared infrastructure | PAUSE 1 |
| **Core Features** | 3-6 | A + B | Recipe Ingestion + Planning/Timeline | PAUSE 3 |
| **Live Mode** | 7-9 | A + B | Execution + Sharing | PAUSE 4 |
| **Integration & Polish** | 10-11 | Single | Testing, iOS Safari, ship | PAUSE 5 |

---

## PAUSE 0: Post-Infrastructure Setup (30-60 minutes)

**When:** After all tracking documents created, before Week 1

**Activities:**
- [ ] Run `./scripts/dev-init.sh` successfully
- [ ] Review all created documents (ROADMAP, PROGRESS, SESSION_PROTOCOL, features.json)
- [ ] Understand single-agent session protocol
- [ ] Verify git configured for descriptive commits
- [ ] Practice: Mock session (agent reads PROGRESS, picks task, updates docs)

**Deliverables:**
- Document any infrastructure issues in KNOWN_ISSUES.md
- Confirm readiness to start Foundation phase

---

## Phase 1: Foundation (Weeks 1-2) — [Foundation Agent]

**Goal:** Establish all contracts, types, and shared infrastructure that parallel agents will consume.

**Agent Assignment:** Single Agent (sequential)

### Week 1: Project Setup & Core Types

#### Day 1-2: Project Scaffolding [Foundation]
- [x] Initialize Next.js 14 project with App Router
- [x] Configure TypeScript strict mode
- [x] Set up Tailwind CSS with design tokens (CSS variables, "Warm Heirloom" vibe)
- [x] Configure Supabase client
- [x] Set up ESLint + Prettier
- [x] Create directory structure (app/, components/, lib/, types/, contracts/)

#### Day 3-4: Core Types & Contracts [Foundation]
- [x] Create `types/recipe.ts` (Recipe, Ingredient, Instruction interfaces)
- [x] Create `types/meal.ts` (Meal, GuestCount, ScalingFactor interfaces)
- [x] Create `types/timeline.ts` (Timeline, Task, TaskStatus interfaces)
- [x] Create `types/shopping.ts` (ShoppingList, ShoppingItem interfaces)
- [x] Create `contracts/recipe-service.ts` (RecipeService interface with JSDoc)
- [x] Create `contracts/timeline-service.ts` (TimelineService interface with JSDoc)
- [x] Create `contracts/ai-service.ts` (AIService abstraction interface with JSDoc)

#### Day 5: Database Schema [Foundation]
- [x] Create Supabase migration for Recipe table
- [x] Create Supabase migration for Meal table
- [x] Create Supabase migration for Timeline and Task tables
- [x] Set up RLS policies (permissive for solo user)
- [x] Create storage buckets for recipe images
- [x] Verify database connection and migrations

### Week 2: Base Components & Infrastructure

#### Day 1-2: Base Components [Foundation]
- [x] Define design tokens (CSS variables: colors, typography, spacing)
- [x] Create Button component (Radix UI primitive)
- [x] Create Card component
- [x] Create Input component
- [x] Create Modal component (Radix UI Dialog)
- [x] Create Toast notification system
- [x] Create Loading skeletons
- [x] Create Error boundary components

#### Day 3-4: Infrastructure [Foundation]
- [x] Implement AI abstraction layer (wraps Claude API)
- [ ] Create image compression utility (client-side, target <500KB)
- [ ] Create PWA manifest.json
- [ ] Set up Service Worker shell (basic caching)
- [ ] Create offline detection hook
- [ ] Create form validation patterns (Zod schemas)

#### Day 5: App Shell [Foundation]
- [ ] Create Layout component (header, main content, responsive)
- [ ] Set up navigation structure
- [ ] Create empty states for recipes, meals
- [ ] Set up basic routing structure
- [ ] Verify `npm run dev` shows styled app shell
- [ ] Verify Supabase can read/write to database

### Foundation Phase Definition of Done
- [ ] `npm run dev` shows styled app shell
- [ ] Supabase connected, can read/write to database
- [ ] All type files compile without errors
- [ ] Toast notifications work
- [ ] Offline indicator appears when disconnected
- [ ] All contract interfaces documented with JSDoc
- [ ] Establish ReadMe
---

## PAUSE 1: Pre-Parallel Transition (45-90 minutes)

**When:** Foundation phase complete, before starting parallel Core Features

**Activities:**
- [ ] Review Foundation deliverables: all types, contracts, components exist
- [ ] Understand boundary rules for Agent A and Agent B
- [ ] Review coordination mechanisms: morning sync, evening sync, contract change protocol
- [ ] Decide: Run agents in separate Cursor windows or sequentially?
- [ ] Practice: Set up second agent workspace if running simultaneously
- [ ] Review git workflow: how to check other agent's recent commits
- [ ] Test: Run dev-init.sh and confirm it shows Phase 2 boundary rules

**Reflection Questions:**
1. What directories does Agent A own? Agent B?
2. What files are read-only shared?
3. How do you propose a contract change?
4. What does a morning sync entry look like?

**Deliverables:**
- Add "TRANSITION TO PARALLEL" entry in PROGRESS.md
- Confirm both agent prompts ready with boundary rules
- Features.json shows Phase 1 complete

---

## Phase 2: Core Features (Weeks 3-6) — [Agent A + Agent B]

**Goal:** Build recipe ingestion, meal planning, timeline generation, and shopping list in parallel.

**Agent Assignment:** Two Parallel Agents

### Agent Boundary Rules (Phase 2)

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

Shared (read-only for both):
├── /types/                 # All type definitions
├── /contracts/             # Service interfaces
├── /components/ui/         # Base components
└── /lib/supabase.ts        # Database client

If you need to modify shared files, document in KNOWN_ISSUES.md with "COORDINATION NEEDED"
```

### Week 3: Recipe Ingestion (Photo + Manual) + Meal Setup

#### Agent A Tasks (Week 3)
- [ ] [Agent A] Photo upload component with mobile camera support
- [ ] [Agent A] Image compression before upload
- [ ] [Agent A] Claude Vision extraction call
- [ ] [Agent A] Extraction result parsing (ingredients, steps, yield, times)
- [ ] [Agent A] Side-by-side correction UI (original left, fields right)
- [ ] [Agent A] Uncertain field highlighting (empty, unusual patterns)
- [ ] [Agent A] Manual entry form (fallback)
- [ ] [Agent A] Extraction failure handling ("Couldn't extract" + manual option)
- [ ] [Agent A] Save recipe to database
- [ ] [Agent A] Recipe list view
- [ ] [Agent A] Recipe detail view

#### Agent B Tasks (Week 3)
- [ ] [Agent B] Meal creation form (name, serve time, guest count)
- [ ] [Agent B] Recipe picker (select from library via RecipeService.list())
- [ ] [Agent B] Scaling factor input per recipe
- [ ] [Agent B] Claude scaling review (flag concerns)
- [ ] [Agent B] Meal detail view
- [ ] [Agent B] Edit/delete meal

### Week 3 Integration Point
- [ ] [Both] Verify: Recipe saved by Agent A appears in Agent B's recipe picker

---

## PAUSE 2: Mid-Parallel Checkpoint (30-45 minutes)

**When:** After Week 3 complete

**Activities:**
- [ ] Review Agent A's Week 3 work: recipe photo ingestion implemented?
- [ ] Review Agent B's Week 3 work: meal setup implemented?
- [ ] Check for coordination issues or merge conflicts
- [ ] Evaluate: Is morning/evening sync working? Too much? Too little?
- [ ] Review KNOWN_ISSUES.md for coordination problems
- [ ] Test: Can Agent B's meal picker see Agent A's recipes?

**Reflection Questions:**
1. Did agents step on each other's code? If so, where?
2. Were boundary rules clear enough?
3. Is coordination overhead worth the speed gain?
4. Do you need to adjust sync frequency?

**Deliverables:**
- Add "MID-PARALLEL REFLECTION" entry in PROGRESS.md with learnings
- Update SESSION_PROTOCOL.md if coordination needs adjustment
- Decision: Continue parallel or collapse to single agent if too difficult

---

### Week 4: Recipe Ingestion (URL + PDF) + Timeline Core

#### Agent A Tasks (Week 4)
- [ ] [Agent A] URL input component
- [ ] [Agent A] URL scraping service (fetch + parse)
- [ ] [Agent A] Common recipe site handlers (AllRecipes, NYT Cooking, etc.)
- [ ] [Agent A] Generic recipe extraction fallback
- [ ] [Agent A] PDF upload component
- [ ] [Agent A] Single-page PDF parsing via Claude Vision
- [ ] [Agent A] Unified extraction → correction flow for all sources

#### Agent B Tasks (Week 4)
- [ ] [Agent B] Timeline generation service (Claude call)
- [ ] [Agent B] Timeline data structure (tasks with times, durations, dependencies)
- [ ] [Agent B] Deterministic validator: no overlapping oven tasks
- [ ] [Agent B] Deterministic validator: task dependencies respected
- [ ] [Agent B] Deterministic validator: no negative durations, serve time checks
- [ ] [Agent B] Conflict detection and warning UI
- [ ] [Agent B] Now/Next/Later view component
- [ ] [Agent B] Gantt view component (secondary)

### Week 5: Shopping List + Timeline Polish

#### Agent A Tasks (Week 5)
- [ ] [Agent A] Shopping list generation from meal recipes
- [ ] [Agent A] Unit reconciliation logic (cups, tbsp, oz, lb, g)
- [ ] [Agent A] Pluralization handling
- [ ] [Agent A] Ambiguous quantity flagging ("to taste", "a handful")
- [ ] [Agent A] Store section grouping (Produce, Dairy, Meat, Pantry, Frozen)
- [ ] [Agent A] Check-off interaction
- [ ] [Agent A] "I always have this" toggle (staples)
- [ ] [Agent A] localStorage persistence for staples
- [ ] [Agent A] Print-friendly view

#### Agent B Tasks (Week 5)
- [ ] [Agent B] Task editing (adjust time, duration)
- [ ] [Agent B] Task reordering (form-based, not drag-drop)
- [ ] [Agent B] Task deletion with dependency handling
- [ ] [Agent B] Timeline regeneration when recipes change
- [ ] [Agent B] View switching (Now/Next/Later ↔ Gantt)
- [ ] [Agent B] Mobile-responsive timeline views

### Week 6: Integration + Buffer

#### Both Agents Tasks (Week 6)
- [ ] [Both] Integration testing: Recipe → Meal → Timeline → Shopping flow
- [ ] [Both] Verify: Recipe saved by Agent A appears in Agent B's recipe picker
- [ ] [Both] Verify: Meal with scaled recipes generates correct shopping list quantities
- [ ] [Both] Verify: Timeline tasks reference correct recipe steps
- [ ] [Both] Verify: Conflict detection works across multiple recipes
- [ ] [Both] Bug fixes from integration testing
- [ ] [Both] Polish UI consistency
- [ ] [Both] Performance profiling

### Phase 2 Definition of Done
- [ ] Can upload recipe via photo, URL, PDF, or manual entry
- [ ] Can correct extractions in side-by-side UI
- [ ] Can create meal with 2+ recipes, scaled to 20 servings
- [ ] Can generate timeline anchored to serve time
- [ ] Conflicts are detected and displayed
- [ ] Can switch between Now/Next/Later and Gantt views
- [ ] Can generate shopping list with consolidated quantities
- [ ] Staples persist across meals

---

## PAUSE 3: Core Features Integration (2-4 hours)

**When:** After Week 6, before Live Mode phase

**Activities:**
- [ ] Both agents pause new feature work
- [ ] Full integration test: Recipe → Meal → Timeline → Shopping flow
- [ ] Verify all integration points work end-to-end
- [ ] Bug fixes from integration testing
- [ ] Review coordination effectiveness over Weeks 3-6
- [ ] Clean up any KNOWN_ISSUES with "COORDINATION NEEDED" tags
- [ ] Update boundary rules if needed for Live Mode phase

**Reflection Questions:**
1. What integration issues were found? Root causes?
2. How many contract changes were needed? Were they handled smoothly?
3. What coordination practices worked well? What didn't?
4. Are you comfortable with parallel workflow for Live Mode phase?

**Deliverables:**
- Add "PHASE 2 INTEGRATION COMPLETE" entry in PROGRESS.md
- All Phase 2 features in features.json marked "pass" or issues documented
- Update SESSION_PROTOCOL.md with lessons learned
- Decision: Ready for Phase 3 parallel work or need adjustments?

---

## Phase 3: Live Mode (Weeks 7-9) — [Agent A + Agent B]

**Goal:** Build live execution, running behind flow, offline resilience, and share links in parallel.

**Agent Assignment:** Two Parallel Agents

### Agent Boundary Rules (Phase 3)

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

Shared (coordinate on):
├── /lib/supabase.ts            # May need RLS updates for share links
└── Supabase migrations         # Share token table (Agent B creates, Agent A reviews)
```

### Week 7: Live Mode Core + Share Link Schema

#### Agent A Tasks (Week 7)
- [ ] [Agent A] Kitchen Walkthrough component (Ready Check modal)
- [ ] [Agent A] Auto-generate checklist from first hour's tasks
- [ ] [Agent A] "Skip" option with preference memory
- [ ] [Agent A] "Start Cooking" button (anchors timeline to real time)
- [ ] [Agent A] Now/Next/Later live view
- [ ] [Agent A] Task checkoff with visual feedback
- [ ] [Agent A] Undo checkoff (within 30 seconds)
- [ ] [Agent A] Progress indicator
- [ ] [Agent A] Local timer implementation
- [ ] [Agent A] Timer start/pause/reset
- [ ] [Agent A] Active timer banner

#### Agent B Tasks (Week 7)
- [ ] [Agent B] Share link database schema (meal_share_tokens table migration)
- [ ] [Agent B] Supabase RLS policy for share tokens
- [ ] [Agent B] Share link generation (UUID v4 token)
- [ ] [Agent B] Expiration calculation (serve time + 24 hours)

### Week 8: Running Behind + Share Link Viewer

#### Agent A Tasks (Week 8)
- [ ] [Agent A] "I'm behind" button
- [ ] [Agent A] Claude recalculation call
- [ ] [Agent A] Suggestion display ("Push X from 4:45 → 5:00")
- [ ] [Agent A] Accept suggestion flow
- [ ] [Agent A] "Adjust differently" option (max 3 attempts)
- [ ] [Agent A] "I'll fix it myself" → jump to edit mode
- [ ] [Agent A] Undo accepted suggestion
- [ ] [Agent A] Offline fallback: "+15 min" button (no Claude needed)
- [ ] [Agent A] Large text mode toggle
- [ ] [Agent A] Font size increases, secondary UI hidden
- [ ] [Agent A] Wake lock API integration
- [ ] [Agent A] iOS wake lock fallback (silent video loop)

#### Agent B Tasks (Week 8)
- [ ] [Agent B] Share link viewer route (`/share/[token]`)
- [ ] [Agent B] Token validation
- [ ] [Agent B] Now/Next/Later view for viewers (read-only)
- [ ] [Agent B] Polling for updates (every 5 seconds)
- [ ] [Agent B] "Link expired" UI
- [ ] [Agent B] Expiration recalculation when serve time changes
- [ ] [Agent B] Mobile-responsive viewer

### Week 9: Offline Resilience + Share Integration

#### Agent A Tasks (Week 9)
- [ ] [Agent A] IndexedDB setup for offline queue
- [ ] [Agent A] Checkoff persistence in IndexedDB
- [ ] [Agent A] Sync logic on reconnect
- [ ] [Agent A] Retry with exponential backoff
- [ ] [Agent A] "Last synced X ago" indicator
- [ ] [Agent A] Service Worker caching: current meal, recipe images, app shell
- [ ] [Agent A] Service Worker: don't cache other meals
- [ ] [Agent A] Offline detection UI
- [ ] [Agent A] Graceful degradation when Service Worker fails

#### Agent B Tasks (Week 9)
- [ ] [Agent B] Share link integration testing
- [ ] [Agent B] Host checkoff → viewer update latency (<5 seconds)
- [ ] [Agent B] Verify viewer cannot interact (truly read-only)
- [ ] [Agent B] Cross-browser testing for viewer
- [ ] [Agent B] Mobile viewer testing

#### Both Agents Tasks (Week 9)
- [ ] [Both] End-to-end Live Mode testing
- [ ] [Both] Kitchen Walkthrough → Start → Checkoffs → Behind → Finish
- [ ] [Both] Offline scenario testing

### Phase 3 Definition of Done
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

## PAUSE 4: Live Mode Integration (2-3 hours)

**When:** After Week 9, before final Polish phase

**Activities:**
- [ ] Live Mode + Share Links full integration test
- [ ] Verify host checkoff → viewer update flow (< 5 seconds)
- [ ] Offline scenario testing (airplane mode 5 min, reconnect)
- [ ] Review all parallel coordination from Weeks 7-9
- [ ] Close out remaining "COORDINATION NEEDED" issues
- [ ] Celebrate: Parallel work complete!

**Reflection Questions:**
1. How did second parallel phase compare to first?
2. What's the state of code quality after parallel work?
3. What needs polish attention in Weeks 10-11?
4. Overall: Was parallel approach worth it vs sequential?

**Deliverables:**
- Add "PHASE 3 INTEGRATION COMPLETE" entry in PROGRESS.md
- All Phase 3 features in features.json marked "pass" or issues documented
- Create polish priority list for Weeks 10-11
- Document multi-agent workflow learnings for future projects

---

## Phase 4: Integration & Polish (Weeks 10-11) — [Single Agent]

**Goal:** iOS Safari testing, performance optimization, final testing, ship.

**Agent Assignment:** Single Agent (back to sequential)

### Week 10: iOS Safari + Polish

#### iOS Safari Testing Matrix [Foundation]
- [ ] PWA installed on iOS Safari
- [ ] Background/lock/unlock behavior
- [ ] Wake lock functionality (with fallback)
- [ ] Audio timer alerts
- [ ] Offline behavior on iOS
- [ ] Service Worker registration on iOS
- [ ] Share link opening on iOS

#### Bug Fixes [Foundation]
- [ ] Fix issues discovered in iOS testing
- [ ] Fix cross-browser inconsistencies
- [ ] Fix mobile layout issues

#### Performance [Foundation]
- [ ] Lighthouse audit (target ≥90 mobile)
- [ ] Bundle size analysis
- [ ] Image loading optimization
- [ ] Lazy loading for non-critical routes

---

## PAUSE 5: Pre-Ship Validation (1-2 hours)

**When:** After Week 10, before final testing week

**Activities:**
- [ ] Review all v1 success criteria from v1_roadmap.md
- [ ] Lighthouse audit (≥90 mobile score)
- [ ] iOS Safari full testing matrix complete
- [ ] No P0 bugs remaining
- [ ] All features.json entries reviewed

**Deliverables:**
- Add "PRE-SHIP VALIDATION" entry in PROGRESS.md
- Go/no-go decision for Week 11 final testing

---

### Week 11: Final Testing + Ship

#### Day 1-2: End-to-End Meal Test [Foundation]
- [ ] Real 20-person meal planning (not simulated)
- [ ] Use 2+ actual family recipe cards
- [ ] Full flow: upload → plan → shop → cook
- [ ] Note any friction points

#### Day 3: Family Member Test [Foundation]
- [ ] Share link with actual family member
- [ ] Observe their experience viewing timeline
- [ ] Collect feedback

#### Day 4: Recipe Extraction Test [Foundation]
- [ ] Test extraction on 5+ real family recipe cards
- [ ] Include handwritten, printed, and mixed
- [ ] Verify correction UI works for failures

#### Day 5: Ship [Foundation]
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

## Linear Checklist (Quick Reference)

Copy this to external tracking if needed:

```
PAUSE 0: Infrastructure Setup (30-60 min)
[ ] Review all docs, practice session protocol

PHASE 1 - FOUNDATION (Weeks 1-2) [Single Agent]
[x] Project scaffolding (Day 1-2)
[x] Core types & contracts (Day 3-4)
[x] Database schema (Day 5)
[x] Base components (Week 2, Day 1-2)
[ ] Infrastructure (Week 2, Day 3-4)
[ ] App shell (Week 2, Day 5)

PAUSE 1: Pre-Parallel Transition (45-90 min)
[ ] Review boundary rules, prepare for parallel work

PHASE 2 - CORE FEATURES (Weeks 3-6) [Agent A + Agent B]
Week 3:
[ ] [A] Recipe photo ingestion + manual entry
[ ] [B] Meal setup + scaling

PAUSE 2: Mid-Parallel Checkpoint (30-45 min)
[ ] Review coordination, adjust if needed

Week 4:
[ ] [A] Recipe URL + PDF ingestion
[ ] [B] Timeline generation + views

Week 5:
[ ] [A] Shopping list
[ ] [B] Timeline editing

Week 6:
[ ] [Both] Integration testing

PAUSE 3: Core Integration (2-4 hours)
[ ] Full integration test, review coordination

PHASE 3 - LIVE MODE (Weeks 7-9) [Agent A + Agent B]
Week 7:
[ ] [A] Live execution core + Kitchen Walkthrough
[ ] [B] Share link schema

Week 8:
[ ] [A] Running behind + large text mode
[ ] [B] Share link viewer

Week 9:
[ ] [A] Offline resilience
[ ] [B] Share integration
[ ] [Both] Integration testing

PAUSE 4: Live Integration (2-3 hours)
[ ] Full integration test, celebrate parallel complete

PHASE 4 - POLISH (Weeks 10-11) [Single Agent]
Week 10:
[ ] iOS Safari testing
[ ] Performance optimization

PAUSE 5: Pre-Ship Validation (1-2 hours)
[ ] Review all criteria, go/no-go decision

Week 11:
[ ] Final testing + Ship
```

---

*Last Updated: December 27, 2024*

