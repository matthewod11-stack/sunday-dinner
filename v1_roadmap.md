# V1 Roadmap: Sunday Dinner

**V1 Goal:** Plan a 20-person gathering with 2+ uploaded recipes. Beautiful, responsive, functional.

**User:** Me (single user, no auth/multi-tenant)

**Architecture stance:** Good enough for now. Refactor in v2.

---

## Key Decisions (Locked In)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Timeline Engine | LLM-assisted hybrid | Claude generates plans + handles "running behind"; deterministic validation prevents impossible schedules |
| Live Mode Default | Now/Next/Later cards | Gantt available as secondary view; optimized for 2-second glance |
| Offline Strategy | PWA basics | Service Worker cache, local timers, queue checkoffs; sufficient for solo use |
| Extraction Recovery | Side-by-side correction | Original image + extracted data with uncertain fields highlighted |
| Kitchen Display | Responsive large-text toggle | Not a separate layout; toggle bumps fonts + hides secondary UI |
| Scaling | Math + AI review | Apply multiplier, Claude flags specific concerns |
| Sharing | View-only link | No auth required for viewers; they see timeline read-only |
| State Management | React Query + Context | Simple for solo use, upgrade path to Zustand for multi-user |
| Error Handling | Global + Feature-level boundaries | Graceful degradation, user-friendly error messages |

---

## Foundation (Build First)

What needs to exist before any features work.

- [ ] **Project setup** — Next.js 14 (App Router), TypeScript strict, Tailwind CSS, Supabase client
- [ ] **Design tokens** — CSS variables for colors, typography, spacing (not hardcoded hex). Keep the "Warm Heirloom" vibe.
- [ ] **Base components** — Button, Card, Input, Modal using Radix UI primitives
- [ ] **Core data models** — Recipe, Meal, Timeline, Task schemas in Supabase
- [ ] **AI abstraction layer** — Service interface that wraps Claude API; easy to swap models later
- [ ] **PWA shell** — Service Worker for app shell caching, manifest.json, offline detection
- [ ] **App layout** — Header, main content area, mobile-responsive shell
- [ ] **Error boundaries** — React error boundaries for graceful failures at global and feature level
- [ ] **Loading state patterns** — Skeleton screens, spinners, consistent loading UX
- [ ] **Toast/notification system** — For success/error messages (needed for checkoff feedback, extraction status)
- [ ] **Form validation** — Basic validation patterns (Zod schemas) for meal setup, recipe editing
- [ ] **Image compression** — Client-side compression before upload (target <500KB for recipe cards)

**Definition of Done:** Can run `npm run dev`, see styled app shell, Supabase connected, error boundaries catch failures gracefully, toast notifications work, basic offline indicator works.

---

## Features (Build in Order)

### Feature 1: Recipe Ingestion

**Why it's v1:** Can't plan a meal without recipes. This is the entry point.

**Scope:**
- **Photo upload** (mobile camera or file picker)
- **URL scraping** — Paste a recipe URL, extract structured data (handle common sites + generic parsing)
- **PDF upload** — Single-page PDF parsing via Claude Vision
- **Manual entry** — Empty form to type recipe from memory (fallback for illegible sources)
- **Claude Vision extraction** (ingredients, steps, yield, prep/cook time)
- **Side-by-side correction UI:** original image/source on left, extracted fields on right
- **Uncertain field highlighting:** Flag fields that are empty, contain unusual characters, or differ from expected patterns (yellow border)
- Tap image region to jump to corresponding field (if feasible; demote if threatens timeline)
- Save recipe to database
- View recipe list and detail

**Extraction failure handling:**
- If extraction completely fails: Show "Couldn't extract this recipe" with original displayed
- Offer "Enter manually" button that opens empty form with image still visible
- Retry option with "Try again" button

**Explicitly out:**
- Multi-page recipe handling (recipes spanning 3+ pages)
- Batch upload (multiple at once)
- Per-user abbreviation dictionary

**Acceptance Criteria:**
1. Upload a photo of a handwritten recipe card → extraction completes in <10 seconds
2. Paste a recipe URL → extraction completes in <15 seconds
3. Upload a single-page PDF → extraction works
4. Use manual entry form to type a recipe from memory
5. Correct errors using side-by-side view
6. If extraction fails, can fall back to manual entry with source still visible
7. Save and see recipe in library; persists after refresh

**Reliability Target:** 85%+ of photos extractable with <5 field corrections needed

---

### Feature 2: Meal Setup

**Why it's v1:** Need to create a meal, add recipes, set parameters before generating timeline.

**Scope:**
- Create new meal (name, serve time, guest count)
- Add recipes from library to meal
- Set scaling factor per recipe (e.g., "scale to 20 servings")
- Claude reviews scaling and flags concerns ("Doubling yeast — consider 1.5x instead")
- Edit meal details
- Delete meal

**Explicitly out:**
- Dietary constraint management
- Guest list with individual restrictions
- Suggested recipes / AI recommendations

**Acceptance Criteria:**
1. Create a meal for 20 people, serving at 5 PM
2. Add 2+ recipes from library
3. Scale each recipe; see AI warnings if applicable
4. Meal persists with all settings

---

### Feature 3: Timeline Generation

**Why it's v1:** The core planning output. Transforms recipes into a minute-by-minute schedule.

**Scope:**
- Generate timeline from meal recipes, anchored to serve time
- Claude generates initial task sequence with durations
- **Deterministic validator** checks for conflicts with explicit rules:
  - No two tasks requiring oven at overlapping times (regardless of temp)
  - Task dependencies respected (prep before cook)
  - No negative durations
  - Serve time is after all tasks complete
  - All tasks have required fields (start time, duration)
- **Conflict UI:** Warning banner at top with specific conflict description ("Turkey and casserole both need oven at 4:30-5:00")
- Two views:
  - **Now/Next/Later** — Default. Single "Now" card, "Next" peeking, "Later" collapsed.
  - **Gantt view** — Secondary. Horizontal timeline, color-coded by recipe.
- Edit tasks (adjust time, reorder, delete)
- Regenerate timeline if recipes change

**Explicitly out:**
- Resource constraint modeling beyond oven (mixer, counter space, attention)
- Drag-and-drop task reordering (use edit form instead)
- Multiple timelines per meal

**Acceptance Criteria:**
1. Generate timeline for 2-recipe meal in <5 seconds
2. Timeline shows tasks in correct order, anchored to serve time
3. Can switch between Now/Next/Later and Gantt views
4. Conflicts are flagged with clear warning banner
5. Can edit a task's time and see timeline update
6. Regenerate works after adding/removing recipe

**Reliability Target:** 100% of generated timelines pass validator (no impossible schedules shipped)

---

### Feature 4: Shopping List

**Why it's v1:** Need to know what to buy before cooking day.

**Scope:**
- Generate consolidated shopping list from meal recipes
- **Unit reconciliation** ("2 cups milk" + "1 cup milk" = "3 cups milk")
  - Handle common units (cups, tbsp, tsp, oz, lb, g, kg)
  - Handle pluralization ("onion" = "onions")
  - Flag ambiguous quantities ("a handful", "to taste") without reconciling
- Group by store section (Produce, Dairy, Meat, Pantry, Frozen)
- Check off items as you shop
- **Persistent staples** — "I always have this" saved in localStorage, inherited across meals
- Print-friendly view

**Explicitly out:**
- Multiple store lists (Costco vs grocery)
- Substitution suggestions
- Full pantry management (just staples toggle)

**Acceptance Criteria:**
1. Generate shopping list for 2-recipe meal
2. Quantities are consolidated correctly (2 cups + 1 cup = 3 cups)
3. Items grouped by section
4. Mark "salt" as "always have" → next meal inherits this
5. Can check off items; state persists
6. Print view fits on one page

**Reliability Target:** 100% of identical ingredients consolidated correctly

---

### Feature 5: Live Execution Mode

**Why it's v1:** The killer feature. This is what makes the app worth using.

**Scope:**

**Pre-Start: Kitchen Walkthrough (Ready Check)**
- Before "Start Cooking," show 30-second checklist modal
- Auto-generated from first hour's tasks:
  - "Oven preheating to 350°?"
  - "Turkey fully thawed?"
  - "Counter cleared for pie assembly?"
- Can skip ("I'm ready, start cooking")
- Defaults to showing; remembers if user always skips

**Live Execution:**
- "Start Cooking" button anchors timeline to real time
- **Now/Next/Later view** as primary:
  - "Now" card: current task, large text, big "Done" button
  - "Next" card: peeks below, shows time until start
  - "Later": collapsed list, expandable
- Check off tasks; visual progress indicator
- Undo checkoff (within 30 seconds)

**"Running behind" flow:**
- Tap "I'm behind" button
- Claude suggests ONE adjustment with clear description:
  - "Push 'Mash potatoes' from 4:45 → 5:00? This shifts 2 other tasks."
- Options:
  - **Accept** — Apply suggestion, show confirmation toast
  - **"Adjust differently"** — Get alternative suggestion (max 3 attempts)
  - **"I'll fix it myself"** — Jump to timeline edit mode
  - **Undo** — If accepted but regretted, undo within 30 seconds
- Deterministic validation ensures new schedule is possible
- **Offline fallback:** "Push everything +15 min" button (works without Claude, instant)

**Timers & Alerts:**
- Local timers (in-browser, work offline)
- Timer notifications (in-app audio/visual, not push)
- Active timer banner persists at top of screen

**Large text mode toggle:**
- Bumps font sizes (body to 24px+, headings to 40px+)
- Hides secondary UI (Gantt view, edit buttons)
- Keeps screen on (wake lock API)
- **iOS wake lock fallback:** Silent video loop if native API fails

**Offline resilience:**
- **Caching strategy:**
  - Cache current meal (recipes, timeline, tasks)
  - Cache recipe images for current meal (up to 50MB)
  - Cache app shell (HTML, CSS, JS)
  - Don't cache: other meals, full recipe library
- **Offline queue:**
  - Checkoffs stored in IndexedDB (not just memory)
  - Retry failed syncs on reconnect (exponential backoff)
  - Last-write-wins for solo user (no complex conflict resolution)
- "Last synced X ago" indicator
- Timers run locally regardless of network

**Explicitly out:**
- Push notifications
- Voice commands
- Dedicated kitchen display layout (separate route)
- Multi-device sync (solo user)
- Concurrent checkoff conflict resolution

**Acceptance Criteria:**
1. See Kitchen Walkthrough before first start; can skip
2. Start cooking; see Now card with first task
3. Check off task; progress updates, Next becomes Now
4. Undo a checkoff within 30 seconds
5. Tap "I'm behind"; receive one clear suggestion with change description
6. Try "Adjust differently"; get alternative suggestion
7. Use "I'll fix it myself" to edit timeline directly
8. Use offline "+15 min" button; works instantly without network
9. Toggle large text mode; fonts increase, UI simplifies, screen stays on
10. Disconnect network; timers continue, checkoffs queue in IndexedDB
11. Reconnect; queued checkoffs sync

**Reliability Requirements:**
- Zero lost checkoffs per session (IndexedDB persistence)
- Timers accurate to ±1 second
- Recovery from 5-minute offline without data loss
- Wake lock works on iOS Safari (with fallback)

---

### Feature 6: Shareable Timeline Link

**Why it's v1:** Family members can see the plan on their phones during cooking.

**Scope:**
- Generate shareable URL for meal timeline
- **Link security:** Cryptographically random token (UUID v4, 32+ characters, unguessable)
- Link is view-only (no checkoffs, no edits)
- No auth required for viewers
- Shows Now/Next/Later view (same as host sees)
- Auto-refreshes as host checks off tasks (polling every 5 seconds)
- **Link expiration:**
  - Expires after meal serve time + 24 hours
  - Recalculates if serve time is edited
  - "Link expired" UI for viewers who access after expiration

**Supabase RLS considerations:**
- Share token in URL grants read access to that meal's tasks only
- Viewers cannot read other meals, recipes, or user data
- RLS policy: `meal_share_tokens` table with `token`, `meal_id`, `expires_at`

**Explicitly out:**
- Viewer can check off tasks
- Viewer can edit anything
- Multiple permission levels
- Revocable links (just let them expire)
- Link analytics

**Acceptance Criteria:**
1. Generate share link from meal; link contains random token
2. Open link in incognito; see timeline without login
3. Host checks off task; viewer sees update within 5 seconds
4. Viewer cannot interact with tasks (read-only, no buttons)
5. Link works on mobile
6. Access expired link; see "Link expired" message
7. Edit serve time; link expiration updates accordingly

---

## Out of Scope for V1

Explicit list of things we're not building. Refer to this when tempted to scope creep.

| Feature | Why Deferred |
|---------|--------------|
| Multi-user auth/accounts | Only me using it for v1 |
| Family management | Multi-user is v2 |
| Role-based permissions | Multi-user is v2 |
| Recipe versioning | Nice-to-have, not needed for first meal |
| Audio memories / transcription | Preservation is v2 |
| Post-meal notes | Preservation is v2 |
| Voice commands | Polish feature, not core |
| Push notifications | Local timers + in-app alerts sufficient |
| Potluck / guest portal | Multi-user is v2 |
| Calendar integration | Nice-to-have |
| Atmosphere / music | Way out of scope |
| "Last time we made this" | Needs history, which is v2 |
| Substitution engine | Can eyeball for v1 |
| Chemistry warnings (deep) | AI review flags basics |
| Dedicated kitchen display layout | Responsive toggle is enough |
| Helper task assignments | Solo user for v1 |
| Drag-and-drop timeline editing | Too fiddly for v1 |
| Multi-page recipes | Edge case for v1 |
| Batch recipe upload | Nice-to-have |

---

## Open Risks / Watch Items

Technical debt and potential issues I'm knowingly taking on.

### Risk 1: LLM Latency on Recalculation

**What:** If "I'm behind" takes 5+ seconds for Claude to respond, trust erodes.

**Mitigation:** 
- Show immediate "Thinking..." state with spinner
- Cache common recalculation patterns
- If >8 seconds, offer "Skip suggestion, I'll adjust manually"
- **Offline fallback:** "Push everything +15 min" button works instantly without Claude

### Risk 2: Claude Vision Accuracy on Handwritten Cards

**What:** Family recipes have personal abbreviations, faded ink, unusual layouts.

**Mitigation:**
- Side-by-side correction UI (already in scope)
- Uncertain fields highlighted (empty, unusual characters, unexpected patterns)
- Explicit "Couldn't extract" state with manual entry fallback
- Manual entry form always available as alternative

### Risk 3: Claude API Failures

**What:** Claude might return malformed JSON, hallucinate ingredients, or suggest impossible recalculations.

**Mitigation:**
- **Extraction failure:** Show "Couldn't extract—enter manually" with source displayed
- **Recalculation failure:** Show "Suggestion unavailable—adjust manually" with timeline editable
- Zod validation on all Claude outputs; reject malformed responses
- Log failures for debugging

### Risk 4: Service Worker Complexity

**What:** PWA offline behavior is finicky, especially on iOS Safari.

**Mitigation:**
- Test extensively on iOS Safari (add to Week 10 specifically)
- Graceful degradation: if Service Worker fails, app still works online
- Clear "You're offline" messaging
- iOS wake lock fallback (silent video loop)

### Risk 5: Supabase Realtime for Share Links

**What:** View-only links need to update when host checks off tasks. Realtime subscriptions add complexity.

**Mitigation:**
- Start with polling (every 5 seconds) for viewers
- Upgrade to Realtime only if polling feels laggy
- Viewers are read-only, so no conflict resolution needed
- Spike RLS rules in Week 9 before building full feature

### Risk 6: Timeline Validation Edge Cases

**What:** Deterministic validator might miss complex conflicts or create impossible schedules.

**Mitigation:**
- Start simple: only validate oven conflicts and task ordering
- Log any "impossible schedule" errors to understand edge cases
- Allow manual override if user disagrees with conflict detection
- Explicit validator rules documented (see Feature 3)

### Risk 7: Image Storage & Bandwidth

**What:** High-res phone photos (5MB+) slow down the app on kitchen WiFi.

**Mitigation:**
- Client-side compression before upload (target <500KB)
- Only need OCR-quality resolution, not print quality
- Lazy load images in recipe list

---

## Success Criteria for V1

Before calling v1 "done," these must be true:

- [ ] Can upload recipe via photo, URL, PDF, or manual entry
- [ ] Can correct extractions using side-by-side UI
- [ ] Can create a 20-person meal with 2+ recipes
- [ ] Can generate and view timeline in Now/Next/Later format
- [ ] Can generate shopping list with consolidated quantities and persistent staples
- [ ] Kitchen Walkthrough appears before first cook
- [ ] Can run Live Mode start-to-finish, checking off all tasks
- [ ] Can undo an accidental checkoff
- [ ] Can use "I'm behind" and get a useful recalculation
- [ ] Can use offline "+15 min" fallback when network is down
- [ ] Large text mode works for kitchen use (wake lock on iOS)
- [ ] Offline: timers run, checkoffs persist in IndexedDB, sync on reconnect
- [ ] Share link works for a family member to view timeline
- [ ] App feels beautiful and responsive on phone and desktop

---

## V1 Ship Checklist

Final gate before calling it done:

- [ ] All success criteria above pass
- [ ] No P0 bugs (data loss, crashes, broken core flows)
- [ ] Lighthouse mobile score ≥90
- [ ] Full meal test on iOS Safari (my primary device)
- [ ] Offline test: airplane mode for 5 min mid-cook, then reconnect
- [ ] 1 family member tested share link and saw live updates
- [ ] Recipe extraction tested on 5+ real family recipe cards

---

## Build Sequence Summary

```
Weeks 1-2: Foundation
├── Project setup, design tokens, base components
├── Core data models
├── AI abstraction layer
├── PWA shell
├── Error boundaries, loading states, toast system
└── Image compression utility

Week 3: Recipe Ingestion (Photo + Manual)
├── Photo upload with compression
├── Claude Vision extraction
├── Side-by-side correction UI
├── Manual entry form
└── Extraction failure handling

Week 4: Recipe Ingestion (URL + PDF)
├── URL scraping (common sites + generic)
├── Single-page PDF parsing
└── Unified extraction → correction flow

Week 5: Meal Setup + Timeline Generation
├── Create meal, add recipes, scale
├── Timeline generation with Claude
├── Deterministic validator
├── Conflict warning UI
└── Now/Next/Later + Gantt views

Week 6: Shopping List
├── Shopping list generation
├── Unit reconciliation
├── Store section grouping
├── Persistent staples (localStorage)
└── Print view

Week 7: Live Mode (Part 1)
├── Kitchen Walkthrough (Ready Check)
├── Start cooking, Now/Next/Later view
├── Task checkoff with undo
├── Local timers
└── Large text mode + wake lock

Week 8: Live Mode (Part 2)
├── "Running behind" flow with Claude
├── Alternative suggestions (max 3)
├── Manual override path
├── Offline "+15 min" fallback
└── Timer notifications (in-app audio)

Week 9: Offline Resilience + Share Links
├── IndexedDB queue for checkoffs
├── Service Worker caching strategy
├── Offline sync with retry
├── Share link generation (RLS spike first)
├── Viewer polling for updates
└── Link expiration logic

Week 10: iOS Safari + Polish
├── iOS Safari testing matrix
│   └── PWA installed, background/lock/unlock, wake lock, audio
├── Bug fixes from testing
├── Performance optimization
└── Lighthouse audit

Week 11: Final Testing + Ship
├── End-to-end meal test (real 20-person meal)
├── Family member share link test
├── Recipe extraction test on 5+ family cards
├── P0 bug fixes
└── Deploy to production
```

---

*Last Updated: December 2025*
