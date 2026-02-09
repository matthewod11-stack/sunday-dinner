# PROJECT_STATE.md

> Cross-surface context document. Shared across Claude Chat, Claude Code (multiple machines), and Cowork sessions. Last scanned: 2026-02-08.

---

## Project Overview

Sunday Dinner is a fully functional family meal planning and live cooking execution tool built for 20+ person gatherings. It lets you upload recipes via photo (Claude Vision), URL scraping, PDF, or manual entry, then plan scaled meals, generate AI-powered cooking timelines, create consolidated shopping lists, and execute the cook in real-time with offline support, timers, and shareable view-only links. It is a single-user PWA (no auth) currently in its final polish phase before production deployment. The complete recipe-to-table flow works end-to-end.

## Current Stack

| Layer | Technology | Version/Notes |
|-------|-----------|---------------|
| Framework | Next.js (App Router) | 14.2.35 |
| Language | TypeScript | Strict mode (`noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`) |
| Styling | Tailwind CSS | 3.4.x, CSS variable design tokens ("Warm Heirloom" theme) |
| UI Primitives | Radix UI | Dialog, Label, Slot |
| Component Patterns | CVA + clsx + tailwind-merge | Variant-driven components |
| Database | Supabase (PostgreSQL) | Hosted, with RLS policies (permissive for solo user) |
| Storage | Supabase Storage | `recipe-images` bucket for uploaded photos |
| AI | Claude API (Anthropic SDK) | `claude-sonnet-4-5-20250929` via `@anthropic-ai/sdk` 0.71.x |
| Validation | Zod | v4.2.x, paired with every TypeScript interface |
| PDF Parsing | pdfjs-dist | 5.4.x, renders to canvas for Vision extraction |
| HTML Scraping | Cheerio | 1.1.x, for URL recipe extraction |
| Notifications | Sonner | Toast system |
| Icons | Lucide React | |
| Fonts | Fraunces (Google) | Display/heading font for heritage feel |
| PWA | Custom Service Worker | Cache-first static, network-first HTML, stale-while-revalidate images |
| Offline | IndexedDB | Queue for offline checkoffs with sync + exponential backoff |
| Linting | ESLint 8 + Prettier | `next/core-web-vitals` + `next/typescript` + `prettier` |
| Hosting | Not yet deployed | Target: Vercel (implied by Next.js) |

## Architecture

### Directory Structure

```
src/
├── app/                          # Next.js App Router (pages + API routes)
│   ├── api/                      # REST endpoints
│   │   ├── recipes/              # CRUD, extract (photo), extract-url, upload-image
│   │   ├── meals/[id]/           # CRUD, recipes, shopping, timeline
│   │   ├── timeline/             # Generate, CRUD
│   │   ├── shopping/             # Generate, CRUD
│   │   ├── live/[mealId]/        # Start, task updates, recalculate
│   │   ├── share/                # Generate/validate/revoke share links
│   │   └── health/               # DB connectivity check
│   ├── recipes/                  # Recipe box, detail, new (photo/url/pdf/correct)
│   ├── meals/                    # Meal list, detail, new, edit
│   ├── timeline/[mealId]/        # Timeline planning view
│   ├── shopping/[mealId]/        # Shopping list view
│   ├── live/[mealId]/            # Live cooking execution
│   └── share/[token]/            # Read-only shared timeline viewer
├── types/                        # Interfaces + Zod schemas (recipe, meal, timeline, shopping, share)
├── contracts/                    # Service interfaces (ai, recipe, meal, timeline, shopping)
├── components/
│   ├── ui/                       # Button, Card, Input, Label, Modal, Skeleton, Toast, ErrorBoundary
│   ├── recipe/                   # PhotoUpload, RecipeCard, RecipeForm, editors, CategorySidebar
│   ├── meals/                    # MealForm, RecipePicker, ScalingInput
│   ├── timeline/                 # TaskCard, NowNextLater, Gantt, ConflictBanner, editing modals
│   ├── shopping/                 # ShoppingList, SectionGroup, PrintView
│   ├── live/                     # LiveTaskCard, ProgressBar, RunningBehindModal, timers, offline UI
│   ├── share/                    # ViewerTaskCard, ViewerTimelineView, ShareModal, expired/invalid
│   ├── layout/                   # Header (hamburger nav), PageHeader
│   ├── empty-states/             # RecipeBoxEmpty, MealCalendarEmpty (illustrated)
│   └── pwa/                      # ServiceWorkerRegister, OfflineIndicator
├── lib/
│   ├── services/
│   │   ├── ai/                   # ClaudeAIService (vision, timeline gen, scaling review, recalculation)
│   │   ├── meal/                 # SupabaseMealService
│   │   ├── timeline/             # SupabaseTimelineService
│   │   ├── shopping/             # SupabaseShoppingService + unit reconciliation + section classifier
│   │   ├── execution/            # Live cooking utilities (real-time calc, task grouping, undo)
│   │   └── share/                # SupabaseShareService (token gen/validation/revocation)
│   ├── extraction/               # URL scraper, PDF parser, site handlers (JSON-LD, generic)
│   ├── offline/                  # IndexedDB queue, sync service, offline-aware hooks
│   ├── timers/                   # Singleton TimerService (Web Audio alerts, vibration fallback)
│   ├── wake-lock/                # Wake Lock API + iOS silent video fallback
│   ├── polling/                  # usePolling hook (5s interval, Visibility API)
│   ├── validation/               # Form schemas, fraction parsing
│   ├── validator/                # Deterministic timeline validator (oven conflicts, dependencies)
│   ├── image/                    # Client-side compression (<500KB target)
│   └── supabase/                 # Supabase client singleton
└── hooks/                        # useOffline
```

### Data Flow

```
Recipe Ingestion:  Photo/URL/PDF → AI Extraction → Correction UI → Supabase
Meal Planning:     Select Recipes → Set Scale/Guests → Claude Scaling Review → Save
Timeline:          Meal Recipes → Claude Generation → Deterministic Validation → Save
Shopping:          Meal Recipes → Normalize/Reconcile Units → Section Grouping → Save
Live Cooking:      Walkthrough → Start (anchor to clock) → Checkoffs → "I'm Behind" → Recalculate
Share:             Generate Token → /share/[token] → Polling (5s) → Read-only View
Offline:           Checkoffs → IndexedDB Queue → Sync on Reconnect (exponential backoff)
```

### Key Patterns

- **Type + Zod pairing**: Every interface has a runtime schema (`Recipe` + `RecipeSchema`)
- **Contract/Implementation split**: Interfaces in `contracts/`, implementations in `lib/services/`
- **Relative time**: Timeline tasks use minutes relative to serve time (negative = before)
- **Nullable vs optional**: `quantity: number | null` (exists but unknown) vs `notes?: string` (may not exist)
- **Optimistic updates**: Live checkoffs update UI immediately, sync to server async
- **Discriminated unions**: Modal states use `kind` field for type-safe narrowing

## Current State

### Working (28 features passing)

**Recipe Ingestion** — Photo upload with Claude Vision extraction, URL scraping (JSON-LD + site-specific handlers for AllRecipes/NYT/etc + generic fallback), PDF upload via pdfjs-dist, manual entry form, side-by-side correction UI with uncertain field highlighting, recipe cards with photo thumbnails, category filtering, three-panel layout on desktop, delete with confirmation.

**Meal Planning** — Create/edit/delete meals with name, serve time, guest count. Recipe picker with search. Per-recipe scaling factor with Claude review flagging non-linear concerns.

**Timeline** — Claude-generated cooking timeline with deterministic validation (oven conflicts, dependency ordering, duration checks, serve time verification). Now/Next/Later and Gantt views. Task editing (time, duration, notes), form-based reorder, delete, regeneration. Mobile-responsive.

**Shopping Lists** — Unit reconciliation (volume/weight systems), ingredient normalization and pluralization, store section grouping (Produce/Dairy/Meat/Pantry/Frozen), ambiguous quantity flagging, staples with localStorage, check-off, print view.

**Live Cooking** — Kitchen walkthrough (equipment checklist from first hour tasks, skip preference), start cooking (anchors to real clock), Now/Next/Later live view with real times, task checkoff with undo (30s), progress indicator, timers (Web Audio + vibration), active timer banner, "I'm Behind" with Claude recalculation (accept/adjust/manual options + offline +15min fallback), large text mode, wake lock (+ iOS silent video fallback).

**Offline** — IndexedDB queue for checkoffs, sync on reconnect with exponential backoff, Service Worker v2 with active meal caching, sync status indicator, offline banner, capability detection with graceful degradation.

**Share Links** — Token generation (UUID v4, expires serve time + 24h), RLS-enforced read-only access, viewer route with 5s polling (pauses on tab hidden), expired/invalid link UIs, mobile-responsive.

**Infrastructure** — PWA manifest + icons (192/512/apple-touch), Service Worker, `@/*` path aliases, health check endpoint, design system (Fraunces font, terracotta/sage/amber tokens), error boundaries.

### In Progress (1)

**iOS Safari Testing** — Code fixes are complete (AbortSignal.timeout polyfill, PWA icons, viewport-fit cover, safe-area-inset CSS, private browsing detection). Manual device testing not yet performed.

### Not Started (3)

- **Performance optimization** — Lighthouse audit (target >= 90 mobile), bundle analysis, image optimization, lazy loading
- **Final real-world testing** — 20-person meal test, family member share link test, 5+ real recipe card extraction
- **Production deployment** — P0 bug fixes, Vercel deployment, smoke test

## Recent Decisions

1. **Decision:** Use polling (5s) for share link viewer instead of WebSockets — **Reason:** Simpler implementation, works through firewalls, adequate latency for kitchen use case (<5.3s worst case)

2. **Decision:** Singleton TimerService with Web Audio API — **Reason:** Persists across component unmounts, Web Audio works in background tabs where `setTimeout` doesn't

3. **Decision:** IndexedDB with exponential backoff for offline sync — **Reason:** More robust than localStorage for structured queue data; backoff prevents server hammering on reconnect

4. **Decision:** iOS wake lock uses silent video loop fallback — **Reason:** Wake Lock API not supported on iOS Safari; silent `<video>` loop is the standard workaround

5. **Decision:** Added Phase 3.5 UX Polish (Mela-inspired) before Phase 4 — **Reason:** Recipe cards felt generic/enterprise; added thumbnails, category filtering, karaoke-style live task states for visual warmth

6. **Decision:** Share token as UUID primary key — **Reason:** Clean URLs (`/share/{token}`) and avoids compound key lookup

7. **Decision:** Deterministic validator separate from AI timeline generation — **Reason:** Pure functions with no side effects can catch impossible schedules without AI cost; AI generates, validator verifies

8. **Decision:** Claude Sonnet 4.5 for all AI calls — **Reason:** Balance of speed, cost, and capability; single model simplifies prompt engineering

9. **Decision:** JSONB columns for recipe ingredients/instructions — **Reason:** Avoids complex joins for nested array data; recipes are read-heavy and rarely queried by ingredient

10. **Decision:** Permissive RLS policies (no user_id filtering) — **Reason:** V1 is single-user; proper multi-tenant auth deferred to V2

## Known Issues & Debt

| Issue | Severity | Notes |
|-------|----------|-------|
| ~~pdf.js DOMMatrix error in production build~~ | ~~High~~ | Resolved. Split barrel exports + webpack canvas external fixed it. Build passes. |
| No automated tests | Medium | Zero test coverage. All verification has been manual + typecheck + lint. |
| CLAUDE.md status is stale | Low | Says "Phase 2 Core Features (Week 4 of 11)" but project is in Phase 4 Polish. |
| features.json metadata inconsistent | Low | `totalFeatures: 24` but actual count is 32 (28 pass + 1 in-progress + 3 not-started). |
| Some Week 6 integration checklist items unchecked | Low | ROADMAP shows unchecked items for Agent B Week 6 verification, but feature was marked pass. |
| No E2E integration tests for full flow | Medium | Live Mode + Share Links never jointly tested on real devices. |
| `npm audit` shows 5 vulnerabilities (1 moderate, 4 high) | Medium | Inherited from dependencies; needs triage. |

## What's Next

**Immediate (next 1-2 sessions):**
1. Manual iOS Safari testing on real device (PWA install, wake lock, audio timers, offline, share links)
2. Fix pdf.js production build error (DOMMatrix polyfill or dynamic import restructuring)
3. Update CLAUDE.md status to reflect Phase 4

**Short-term (next 3-5 sessions):**
4. Lighthouse performance audit (target >= 90 mobile), bundle analysis
5. Lazy loading for non-critical routes
6. Real 20-person meal test with actual family recipe cards (5+)
7. Family member share link test

**Ship:**
8. P0 bug fixes from testing
9. Production deployment (Vercel)
10. Post-deploy smoke test

## Cross-Surface Notes

- **Phase 3.5 was not in the original plan.** The `v1_roadmap.md` goes Foundation -> Core -> Live -> Polish. Phase 3.5 (UX Polish with Mela-inspired design) was added mid-project to address visual warmth issues. It's complete and the code reflects it (category sidebar, recipe thumbnails, karaoke task states).

- **CLAUDE.md is stale.** It still says "Phase 2 Core Features (Week 4 of 11)" and describes `lib/services/` as "empty, future phases" — both are long outdated. The directory structure section doesn't reflect the full component tree that exists now.

- **`features.json` counts are wrong.** Metadata says `totalFeatures: 24` but the file contains 32 tracked features across 4 phases. The passing count (28) is correct.

- **No React Query/Context state management.** The `v1_roadmap.md` lists "React Query + Context" as the state management choice, but the codebase uses direct `fetch` calls with `useState`/`useEffect` patterns and Server Components. This is simpler and adequate for single-user.

- **"Tap image region to jump to field" was dropped.** Listed in `v1_roadmap.md` as demotable; was never implemented. Correction UI works fine without it.

- **No error boundary per-feature.** The `v1_roadmap.md` specifies "Global + Feature-level boundaries" but only a global `ErrorBoundary` component exists. Feature-level boundaries were not needed in practice.

---

*This file is the single source of truth for external Claude sessions. Update it at the end of any session where meaningful changes were made.*
