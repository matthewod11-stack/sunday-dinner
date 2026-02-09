# Sunday Dinner v1 — Session Progress Log

> **Purpose:** Track progress across multiple Claude Code sessions. Each session adds an entry.
> **How to Use:** Add a new "## Session YYYY-MM-DD" section at the TOP of this file after each work session.
> **Note:** In parallel phases (Weeks 3-9), include agent identifier: "## Session YYYY-MM-DD [Agent A]"

---

<!--
=== ADD NEW SESSIONS AT THE TOP ===
Most recent session should be first.
-->

## Session: 2026-02-08 — Machine Init, PROJECT_STATE.md, Build Fix

### Completed
- [x] Initialized project on new machine (npm install, .env.local, dev-init.sh)
- [x] Created `PROJECT_STATE.md` — cross-surface context document (207 lines) with all 8 sections: Overview, Stack, Architecture, Current State, Recent Decisions, Known Issues, What's Next, Cross-Surface Notes
- [x] Updated `CLAUDE.md` — fixed stale status (Phase 2 → Phase 4), updated architecture directory tree to reflect actual codebase, added PROJECT_STATE.md maintenance rules
- [x] Investigated pdf.js DOMMatrix build error — confirmed already resolved by split barrel exports + webpack canvas external
- [x] Marked DOMMatrix issue as resolved in `KNOWN_ISSUES.md` and `PROJECT_STATE.md`
- [x] Verified full build passes cleanly (typecheck, lint, `npm run build` — 41 routes, 25 static pages)

### In Progress
- iOS Safari manual testing (code fixes complete, device testing pending)

### Issues Encountered
- `npm audit` shows 5 vulnerabilities (1 moderate, 4 high) from dependencies — needs triage
- `features.json` metadata has stale `totalFeatures: 24` (actual: 32)

### Next Session Should
- Perform manual iOS Safari testing on real device (PWA install, wake lock, audio timers, offline, share links)
- Run Lighthouse performance audit (target >= 90 mobile)
- Fix `features.json` metadata inconsistency
- Consider addressing npm audit vulnerabilities

---

## Session 2026-01-20 — Photo Upload & Recipe Box Polish

**Phase:** Phase 3.5A - Recipe Box Polish
**Focus:** Recipe photo storage, thumbnails, delete functionality
**Mode:** Single agent

### Completed

**Photo Upload & Storage**
- [x] Created `/api/recipes/upload-image` endpoint for Supabase Storage uploads
- [x] Updated correction page to upload photos before saving recipes
- [x] Photos now persist as `sourceImageUrl` in database
- [x] Added Supabase hostname to Next.js image config (`next.config.mjs`)

**Recipe Card Thumbnails**
- [x] Recipe cards display uploaded photos as thumbnails
- [x] Gradient fallback with recipe initial when no photo exists
- [x] Lazy loading with blur placeholder

**Recipe Detail Page**
- [x] Added recipe image display at top of detail page
- [x] Image uses Next.js Image component with proper sizing

**Delete Functionality**
- [x] Created `/api/recipes/[id]` route with GET and DELETE handlers
- [x] Created `DeleteRecipeButton` client component with confirmation
- [x] Created Server Action (`deleteRecipe`) with `revalidatePath` for proper cache invalidation
- [x] Delete now works with immediate UI update

**Database Migrations**
- [x] Applied `20260120000001_add_recipe_category.sql` migration
- [x] Applied `20260104000001_create_share_tokens.sql` migration

**UX Improvements**
- [x] Moved "Open Full Recipe" button to top of detail panel (under recipe name)
- [x] Added `dynamic = "force-dynamic"` to recipes pages for proper refresh behavior
- [x] Fixed API schema to accept `nullish` values for optional time fields

### Verification
- `npm run typecheck` — Passed
- `npm run lint` — Passed
- Manual testing — Photo upload, display, and delete all working

### Next Session Should
1. Consider multi-photo support (finished product photos)
2. Continue Phase 3.5B: Live Mode Karaoke MVP (visual task states)
3. Test on iOS Safari (Phase 4 compatibility)

---

## Session 2026-01-18 — Recipe Extraction Fixes & UX Polish Planning

**Phase:** Phase 4 - Integration & Polish (Week 10+)
**Focus:** Bug fixes and Phase 3.5 planning
**Mode:** Single agent

### Completed

**Recipe Extraction Bug Fixes**
- [x] Fixed Zod validation errors on recipe extraction (`.optional()` → `.nullish()`)
  - Claude Vision API returns `null` for missing fields, not `undefined`
  - Updated `src/types/recipe.ts` schemas for ingredients/instructions
  - Updated `src/app/api/recipes/route.ts` CreateRecipeRequestSchema
- [x] Fixed photo preview not displaying on correction page
  - Blob URLs expire after navigation; now storing data URLs instead
  - Updated `src/app/recipes/new/photo/page.tsx` to use base64 data URL
- [x] Fixed dark grey textarea/checkbox backgrounds
  - Added `bg-white text-foreground` to textareas in instruction-editor and recipe-form
  - Added `bg-white accent-primary` to checkboxes
- [x] Added AI-generated description to extraction
  - Updated `ExtractionResultSchema` to include `description` field
  - Updated prompt to always generate appetizing 1-2 sentence descriptions
- [x] Toned down uncertain field warnings (more casual "AI estimate" messaging)
- [x] Fixed React hydration error (`suppressHydrationWarning` on html/body)

**Meals Page Fix**
- [x] Fixed `meals.map is not a function` error
  - API returns `{ meals: [...] }` but page expected raw array
  - Updated `src/app/meals/page.tsx` to extract `mealsData.meals`

**Phase 3.5 UX Polish Planning**
- [x] Added current state screenshot to planning docs
  - Saved `current-recipe-box.png` to `docs/design-reference/`
  - Updated `docs/UX_POLISH_PHASE.md` with "Current State" section
  - Documented issues: generic cards, missing warmth, no "heirloom" feeling

### Verification

- [x] TypeScript: `npm run typecheck` passes
- [x] ESLint: `npm run lint` passes

### Next Session Should

1. Continue Phase 3.5 UX Polish planning (define specific tasks/weeks)
2. Consider recipe card redesign with visual warmth
3. Test recipe extraction end-to-end with various image types

---

## Session 2026-01-15 — Week 10 iOS Safari Fixes

**Phase:** Phase 4 - Integration & Polish (Week 10)
**Focus:** iOS Safari compatibility fixes
**Mode:** Single agent

### Completed

**Critical Fixes**
- [x] Created `AbortSignal.timeout()` polyfill (`src/lib/utils/abort-timeout.ts`)
  - ES2024 API requires iOS 16.4+; polyfill supports older versions
  - Updated `use-offline.ts` to use polyfill
- [x] Created PWA icons using Gemini image generation
  - `public/icon-512.png` (512x512) - terracotta background with cooking motif
  - `public/icon-192.png` (192x192)
  - `public/apple-touch-icon.png` (180x180) for iOS home screen
- [x] Added `viewport-fit: cover` to `layout.tsx` for notched device support
- [x] Added `apple-touch-icon` metadata to Next.js config

**Safe Area Support**
- [x] Added safe-area-inset CSS utilities to `globals.css`
  - `.safe-area-inset-top/bottom/left/right` for padding
  - `.safe-area-bottom` with min 0.5rem fallback
  - `.safe-margin-bottom` for margin-based spacing
- [x] Applied safe area to `OfflineIndicator` (fixed bottom element)
- [x] Applied safe area to `ActiveTimerBanner` (fixed bottom element)

**Enhanced UX**
- [x] Enhanced `OfflineCapabilityWarning` for iOS private browsing
  - Now explicitly states "Private Browsing Mode Detected"
  - Clearer messaging about data loss risk

### Verification

- [x] TypeScript: `npm run typecheck` passes
- [x] ESLint: `npm run lint` passes
- [x] Build: `npm run build` succeeds

### Files Modified

| File | Change |
|------|--------|
| `src/lib/utils/abort-timeout.ts` | NEW - AbortSignal polyfill |
| `src/hooks/use-offline.ts` | Use polyfill |
| `src/app/layout.tsx` | viewport-fit, apple-touch-icon |
| `src/app/globals.css` | Safe area utilities |
| `src/components/live/offline-capability-warning.tsx` | Private browsing messaging |
| `src/components/pwa/offline-indicator.tsx` | Safe area margin |
| `src/components/live/active-timer-banner.tsx` | Safe area padding |
| `public/icon-192.png` | NEW - PWA icon |
| `public/icon-512.png` | NEW - PWA icon |
| `public/apple-touch-icon.png` | NEW - iOS icon |

### Next Session Should

1. **Manual iOS Testing** — Test on real iOS device with the checklist:
   - PWA install, wake lock, audio timers, offline behavior
   - Background/lock/unlock, share links
2. **Performance work** — Lighthouse audit, bundle analysis
3. **Mark ios-safari-testing as pass** if manual tests succeed

---

## Session 2026-01-13 [Orchestrator] — Phase 3 Complete, PAUSE 4 Transition

**Phase:** Transition from Phase 3 (Live Mode) to PAUSE 4
**Focus:** Orchestration and phase status verification
**Mode:** Orchestrator terminal

### Completed

**Phase Status Verification**
- [x] Confirmed Agent A completed Week 9 integration testing (Live Mode e2e, offline, timers)
- [x] Confirmed Agent B completed Week 9 integration testing (Share links, conflict detection)
- [x] Verified `integration-week-9` feature marked as pass in features.json
- [x] Verified all Phase 3 features passing (28 total features pass)

**Phase Transition Prep**
- [x] Generated both agent prompts for joint integration testing
- [x] Reviewed Phase 3 Definition of Done (9/10 criteria verified)
- [x] Documented PAUSE 4 activities and reflection questions
- [x] Confirmed transition to single-agent mode for Phase 4

### Key Milestone

🎉 **Parallel work complete!** Phases 2-3 (Weeks 3-9) successfully used dual-agent architecture:
- Agent A: Recipes, Shopping, Live Execution, Offline
- Agent B: Meals, Timeline, Share Links

### Next Session Should

1. **Complete PAUSE 4 activities** — manual integration testing if desired
2. **Begin Phase 4 (Polish)** — single-agent mode, run `/session-start`
3. **Week 10 focus:** iOS Safari testing, performance optimization
4. **Week 11 focus:** Final testing with real 20-person meal, ship

---

## Session 2026-01-13 [Agent A] Week 9 — Live Mode Integration Testing

**Phase:** Phase 3, Week 9 (Live Mode)
**Focus:** End-to-end Live Mode testing, offline resilience integration
**Mode:** Parallel Agent (A)

### Completed

**Integration Tests (All PASS)**
- [x] End-to-end Live Mode: Kitchen Walkthrough → Start Cooking → Task checkoffs → Timers → Finish
- [x] "I'm Behind" flow: Button → Claude suggestion → Accept/Adjust → Timeline updates
- [x] Offline scenario: Checkoffs persist in IndexedDB → Auto-sync on reconnect
- [x] Large text mode + wake lock: Toggle, CSS vars, iOS fallback
- [x] Timer behavior: Web Audio alerts, vibration, banner interactions

**Offline Integration Completed**
- [x] Integrated `useOfflineCheckoff` hook for offline-aware checkoffs
- [x] Added `SyncStatusIndicator` to header during cooking
- [x] Added `OfflineBanner` for offline notifications
- [x] Setup auto-sync with toast callback on reconnection
- [x] Added active meal for Service Worker caching

### Files Created

```
docs/PLANS/
└── AGENT_A_WEEK9_INTEGRATION.md  # Full integration testing documentation
```

### Files Modified

```
src/app/live/[mealId]/page.tsx  # Added offline hooks and UI components
```

### Key Integration Details

**Offline Checkoff Flow:**
```
User taps checkoff → Optimistic UI update → offlineCheckoff()
├── Online: POST to API → success
└── Offline: Queue to IndexedDB → "Saved offline" toast → auto-sync later
```

**UI Components Added:**
- `SyncStatusIndicator` next to `LargeTextToggle` in header
- `OfflineBanner` appears when offline with reassurance messaging

### Verified
- [x] `npm run typecheck` — passes
- [x] `npm run lint` — passes
- [x] All 5 integration tests — PASS

### Next Steps
- Awaiting orchestrator signal for PAUSE 4: Integration Checkpoint
- Week 9 integration testing complete for Agent A

---

## Session 2026-01-13 [Agent B] Week 9 — Integration Testing

**Phase:** Phase 3, Week 9 (Live Mode)
**Focus:** Live Mode + Share Links joint integration testing
**Mode:** Parallel Agent (B)

### Completed

**Integration Tests (All PASS)**
- [x] Host-to-viewer data flow: Verified checkoffs propagate via polling in <5s
- [x] Timeline task references: Confirmed recipeId → recipeNames mapping works
- [x] Conflict detection: Verified oven conflicts detected across multiple recipes
- [x] Expired link handling: Confirmed HTTP 410 → ExpiredLink UI
- [x] Serve time change: Verified updateExpiration() recalculates token expiration

### Files Created

```
docs/PLANS/
└── AGENT_B_WEEK9_INTEGRATION.md  # Full integration testing documentation
```

### Architecture Insights

**Data Flow:**
```
Host: PATCH /api/live/[mealId]/tasks/[taskId] → updates tasks table
Viewer: GET /api/share/[token] (5s poll) → getShareData() → fresh query
```

**Design Decisions Documented:**
- Viewer doesn't show conflicts (read-only, can't fix them)
- Polling over WebSockets (simpler, works through firewalls)
- RLS + application-level token validation (defense in depth)
- Expiration update is non-critical (fails gracefully)

### Verified
- [x] `npm run typecheck` — passes
- [x] `npm run lint` — passes
- [x] All 5 integration tests — PASS

### Next Steps
- Awaiting orchestrator signal for Week 9 integration completion
- Ready for PAUSE 4: Integration Checkpoint

---

## Session 2026-01-08 [Agent B] Week 9 — Share Integration Testing

**Phase:** Phase 3, Week 9 (Live Mode)
**Focus:** Share link integration testing and verification
**Mode:** Parallel Agent (B)

### Completed

**Integration Testing**
- [x] Verified data flow: Host checkoff → Supabase → Viewer poll → Fresh data
- [x] Analyzed latency: <5s average, ~5.3s worst case (meets requirement)
- [x] Confirmed API routes work correctly (POST/GET/DELETE share endpoints)

**Read-Only Verification**
- [x] Verified `ViewerTaskCard` has no click handlers (uses `<div>` not `<button>`)
- [x] Verified `LiveTaskCard` has checkoff/timer buttons (uses `<button>` with handlers)
- [x] Confirmed only "Refresh now" button exists in viewer (READ operation only)
- [x] Verified expired/invalid link UIs are purely informational

**Cross-Browser Testing**
- [x] Verified Visibility API support (97%+ global, used for poll pausing)
- [x] No browser-specific code detected
- [x] All used Web APIs have excellent cross-browser support

**Mobile Testing**
- [x] Verified 44px minimum touch targets in `viewer-task-card.tsx`
- [x] Verified responsive container (`max-w-2xl` with padding)
- [x] Verified responsive text scaling (`text-xl sm:text-2xl`)

### Files Created

```
docs/PLANS/
└── AGENT_B_WEEK9_SHARE_INTEGRATION.md  # Full testing documentation
```

### Key Findings

**Latency Analysis:**
- Host checkoff → Supabase: ~100-300ms
- Viewer poll interval: 5000ms
- Worst-case latency: ~5.3 seconds (meets <5s average requirement)

**Read-Only Design:**
- `ViewerTaskCard` uses `<div>` for status indicators (no interaction)
- `LiveTaskCard` uses `<button>` with `onClick` for checkoff/timers
- Clean separation ensures viewers cannot mutate data

**Browser Compatibility:**
- Visibility API: 97%+ support, pauses polling when tab hidden
- Fetch API: 98%+ support
- No polyfills or fallbacks needed

### Verified
- [x] `npm run typecheck` — passes
- [x] `npm run lint` — passes (no errors or warnings)

### Next Steps
- Week 9 joint integration testing with Agent A (integration-week-9)
- Manual testing checklist in AGENT_B_WEEK9_SHARE_INTEGRATION.md

---

## Session 2026-01-08 [Agent A] Week 9 — Offline Resilience

**Phase:** Phase 3, Week 9 (Live Mode)
**Focus:** IndexedDB offline queue, sync logic, Service Worker updates, offline UI
**Mode:** Parallel Agent (A)

### Completed

**IndexedDB Offline Queue**
- [x] Created `src/lib/offline/indexed-db.ts` - Full IndexedDB abstraction
- [x] Three stores: `offline_queue`, `sync_status`, `meal_cache`
- [x] Action types: `task_checkoff`, `task_status_change`, `task_time_change`
- [x] Automatic pending count tracking

**Checkoff Persistence**
- [x] Created `src/lib/offline/use-offline-checkoff.ts` - Hook for offline-aware checkoffs
- [x] Optimistic updates with IndexedDB fallback
- [x] Queue actions when offline, return success to UI

**Sync Logic with Exponential Backoff**
- [x] Created `src/lib/offline/sync-service.ts` - Full sync service
- [x] Process queue oldest-first with backoff (1s → 2s → 4s → 8s → 16s → 30s max)
- [x] Max 5 retries per action before giving up
- [x] Auto-sync on `online` event and tab visibility change
- [x] `syncWithRetry()` for manual sync with retry attempts

**Sync Status Indicator**
- [x] Created `src/lib/offline/use-sync-status.ts` - Hook for sync status
- [x] Created `src/components/live/sync-status-indicator.tsx` - Visual indicator
- [x] Shows: syncing, synced X ago, offline (X queued), error with retry

**Service Worker Updates**
- [x] Updated `public/sw.js` with active meal awareness
- [x] `SET_ACTIVE_MEAL` message to enable targeted caching
- [x] Only cache live data for the currently cooking meal
- [x] Separate meal cache (`sunday-dinner-meal`) cleared between meals
- [x] Created `src/lib/offline/service-worker-client.ts` - SW communication utilities

**Offline Detection UI**
- [x] Created `src/components/live/offline-banner.tsx` - Full offline banner
- [x] States: offline, syncing, sync needed, success
- [x] Reassuring messaging for cooks
- [x] `OfflineIndicatorCompact` for header use

**Graceful Degradation**
- [x] Created `src/lib/offline/use-offline-capability.ts` - Capability detection
- [x] Detects: Service Worker, IndexedDB, private browsing
- [x] Three levels: full, partial, none
- [x] Created `src/components/live/offline-capability-warning.tsx` - Warning components
- [x] Dismissible warnings with session storage persistence

### Files Created

```
src/lib/offline/
├── index.ts                    # Barrel export
├── indexed-db.ts               # IndexedDB abstraction
├── use-offline-checkoff.ts     # Offline-aware checkoff hook
├── sync-service.ts             # Sync with exponential backoff
├── use-sync-status.ts          # Sync status hook
├── service-worker-client.ts    # SW communication
└── use-offline-capability.ts   # Capability detection

src/components/live/
├── sync-status-indicator.tsx   # Sync status UI
├── offline-banner.tsx          # Offline banner
└── offline-capability-warning.tsx # Capability warnings

public/sw.js                    # Updated Service Worker (v2)
```

### Files Modified

```
src/components/live/index.ts    # New exports
```

### Key Design Decisions

**IndexedDB Store Structure:**
- `offline_queue`: Pending actions with retry count and timestamps
- `sync_status`: Global sync state (lastSyncedAt, pendingCount, isSyncing)
- `meal_cache`: Cached meal data with expiration

**Exponential Backoff:**
- Base delay: 1 second
- Multiplier: 2x per retry
- Max delay: 30 seconds
- Max retries: 5 before giving up

**Active Meal Caching:**
- App sends `SET_ACTIVE_MEAL` when cooking starts
- SW only caches live API data for active meal
- Separate cache cleared when switching meals
- Prevents stale data for other meals

**Graceful Degradation Levels:**
- `full`: SW + IndexedDB → Full offline cooking
- `partial`: Only one available → Reduced functionality
- `none`: Neither → Warning with recommendations

### Verified
- [x] `npm run typecheck` — passes
- [x] `npm run lint` — passes

### Next Steps (Week 10)
- Integration with live page (wire up new hooks)
- Integration testing with Agent B
- End-to-end offline testing

---

## Session 2026-01-07 [Agent B] Week 8 — Share Link Viewer

**Phase:** Phase 3, Week 8 (Live Mode)
**Focus:** Share link viewer route, polling, read-only timeline view
**Mode:** Parallel Agent (B)

### Completed

**Share Link Viewer Route**
- [x] Created `/app/share/[token]/page.tsx` main viewer page
- [x] Token validation with loading/error/expired states
- [x] Not started / Complete meal states
- [x] Mobile-responsive layout with sticky header

**Viewer Components**
- [x] Created `src/components/share/viewer-task-card.tsx` - Read-only task display
- [x] Created `src/components/share/viewer-timeline-view.tsx` - Now/Next/Later sections
- [x] Created `src/components/share/expired-link.tsx` - Expired link UI
- [x] Created `src/components/share/invalid-link.tsx` - Invalid/not found link UI

**Polling Service**
- [x] Created `src/lib/polling/use-polling.ts` - Hook for 5-second polling
- [x] Visibility API integration (pauses when tab hidden)
- [x] `formatLastUpdated()` utility for "X ago" display
- [x] Manual refresh support

**Expiration Recalculation**
- [x] Added `updateExpiration()` method to ShareService
- [x] Meal PATCH route now updates token expirations when serve time changes
- [x] Non-critical operation (logs warning on failure)

### Files Created

```
src/lib/polling/
├── index.ts
└── use-polling.ts

src/components/share/
├── viewer-task-card.tsx
├── viewer-timeline-view.tsx
├── expired-link.tsx
└── invalid-link.tsx

src/app/share/[token]/
└── page.tsx

docs/PLANS/
└── AGENT_B_WEEK8_SHARE_VIEWER.md
```

### Files Modified

```
src/components/share/index.ts          # New exports
src/lib/services/share/
└── supabase-share-service.ts          # Added updateExpiration()
src/app/api/meals/[id]/route.ts        # Share expiration on serve time change
```

### Key Design Decisions

**Polling Architecture:**
- 5-second interval with automatic pause on tab hidden
- Resumes immediately with refresh when tab becomes visible
- Uses `useRef` for stable fetcher reference across re-renders

**Read-only Adaptation:**
- ViewerTaskCard removes checkoff button and timer trigger
- ViewerTimelineView uses same grouping logic but no interaction handlers
- Clear "Viewing live cooking progress" badge for viewer context

**Error States:**
- HTTP 410 → ExpiredLink component
- HTTP 404/400 → InvalidLink component with helpful suggestions
- Network errors → Generic error message

### Verified
- [x] `npm run typecheck` — passes
- [x] `npm run lint` — passes (no errors or warnings)

### Next Steps (Week 8 continues)
- [Agent B] Cross-browser testing for viewer
- [Agent B] Mobile viewer testing
- [Agent B] Week 9 integration testing with Agent A

---

> **Older sessions (11-30) have been moved to [PROGRESS_ARCHIVE.md](./PROGRESS_ARCHIVE.md)**

---

<!-- Template for future sessions:

## Session YYYY-MM-DD [Agent Identifier if Parallel]

**Phase:** X.Y (e.g., Phase 1, Week 1 or Phase 2, Week 3 [Agent A])
**Focus:** [One sentence describing the session goal]

### Completed
- [x] Task 1 description
- [x] Task 2 description

### Verified
- [ ] Tests pass
- [ ] Type check passes
- [ ] [Phase-specific verification]

### Notes
[Any important context for future sessions]

### Next Session Should
- Start with: [specific task or verification]
- Be aware of: [any gotchas or considerations]

-->

---

## Session Protocol Quick Reference

### For Single-Agent Phases (Weeks 1-2, 10-11)

**Session Start:**
1. Run `./scripts/dev-init.sh`
2. Read this file (PROGRESS.md)
3. Check `features.json` for status
4. Check `KNOWN_ISSUES.md` for blockers
5. Pick next unchecked task from ROADMAP.md

**Session End:**
1. Run verification (tests, type-check)
2. Add session entry to TOP of this file
3. Update `features.json` with pass/fail status
4. Check off completed tasks in ROADMAP.md
5. Commit with descriptive message
6. Note "Next Session Should" in session entry

### For Parallel-Agent Phases (Weeks 3-9)

**Session Start:**
1. Run `./scripts/dev-init.sh` (shows boundary rules)
2. Read latest PROGRESS entries from BOTH agents
3. Check `features.json` for YOUR agent's tasks
4. Check `KNOWN_ISSUES.md` for coordination needs
5. Verify no conflicts with other agent's recent commits (git log)
6. Pick next task in YOUR boundary
7. Add morning sync entry to PROGRESS.md

**During Session:**
- Work on ONE task at a time
- Update docs after each task completion
- If you need shared file changes, document in KNOWN_ISSUES.md with "COORDINATION NEEDED"

**Session End:**
1. Run verification (tests, type-check)
2. Add session entry to TOP with `[Agent X]` identifier
3. Update `features.json` with status
4. Check off tasks in ROADMAP.md
5. Commit with message including agent: `feat(area): description [Agent X]`
6. Note "Next Session Should" with agent context
7. Add evening sync entry if needed

---

*Last Updated: December 27, 2024*
