# Sunday Dinner Roadmap Feedback

*Structured analysis and recommendations for building a state-of-the-art meal planning app*

---

## 1. Structure & Detail Assessment

### Where the roadmap is too vague

**Timeline generation algorithm** (Phase 1, Phase 2)
- "Simple timeline generation" and "Running behind? Recalculate remaining steps" lack detail
- Missing: dependency resolution (prep before cooking), parallel task detection, buffer time for transitions
- **Recommendation:** Specify the algorithm approach (critical path method, topological sort, or constraint-based scheduling). Define how "recalculate" works—does it compress remaining steps proportionally, or intelligently reorder?

**Conflict detection** (Conversational Planning)
- "Both dishes need the oven at 400° at the same time" is mentioned but not detailed
- Missing: How conflicts are resolved (suggest alternatives? Auto-reschedule? Warn only?)
- **Recommendation:** Define conflict types (equipment, timing, ingredient prep), resolution strategies, and whether the AI proactively suggests fixes

**Push notifications** (Phase 2)
- Listed but implementation details missing
- Missing: Notification timing (5 min before? 1 min?), delivery mechanism (browser push? SMS fallback?), offline handling
- **Recommendation:** Specify notification service (OneSignal, Firebase), timing strategy, and graceful degradation for users who deny permissions

**Recipe extraction accuracy** (Success Metrics)
- "90%+" target is good, but no plan for handling failures
- Missing: Manual correction flow, confidence scores, retry mechanisms, partial extraction handling
- **Recommendation:** Add Phase 1 task: "Recipe extraction review/editing interface" with inline correction tools

**Kitchen display mode** (Phase 2)
- "Large text, minimal UI, tap to advance" is underspecified
- Missing: What "advance" means (next task? next recipe?), gesture controls, auto-advance timers, screen lock behavior
- **Recommendation:** Define interaction model: swipe for next/previous, tap to mark complete, long-press for details

### Where it's over-specified (potential lock-in)

**Technology choices** (Technical Architecture)
- Next.js 14 is fine, but consider Next.js 15 (released late 2024) for React 19 features
- Radix UI + custom styling is good, but ensure you're not over-committing to specific component patterns early
- **Recommendation:** Use "Radix UI primitives OR shadcn/ui" to allow flexibility. Consider React Server Components patterns more explicitly.

**Design system colors** (Design System)
- Specific hex codes are fine, but ensure they're defined as CSS variables/Tailwind tokens, not hardcoded
- **Recommendation:** Already good—just verify implementation uses design tokens, not magic strings

**Phase timing** (Development Phases)
- Week estimates are reasonable but may create pressure to ship incomplete features
- **Recommendation:** Add "Phase 0.5: Technical Spike" before Phase 1 to validate AI extraction accuracy, test Supabase Realtime performance, and prototype timeline algorithm

### What's missing for understanding priorities

**Risk assessment**
- No mention of technical risks (AI accuracy, real-time sync complexity, mobile performance)
- **Recommendation:** Add a "Risks & Mitigations" section identifying top 3 technical risks and mitigation strategies

**Success criteria per phase**
- Milestones are good, but lack "definition of done" criteria
- **Recommendation:** Add acceptance criteria to each milestone (e.g., "Recipe extraction works for 5 different handwriting styles")

**Dependency mapping**
- Dependencies between phases aren't explicit
- **Recommendation:** Add a dependency graph showing Phase 2 requires Phase 1, Phase 4 requires Phase 2, etc.

**Mobile-first considerations**
- "Works on Grandma's iPad" is mentioned, but mobile-specific features aren't prioritized
- **Recommendation:** Add mobile-specific tasks: offline mode (Phase 2), camera integration for recipe photos (Phase 1), haptic feedback for task completion (Phase 2)

---

## 2. Existing Feature Enhancement

### Recipe Ingestion

**Gap between functional and delightful:**
- Functional: Upload photo → extract → done
- Delightful: Show extraction progress with confidence scores, highlight uncertain fields, allow inline editing during extraction, show side-by-side original vs extracted

**Edge cases not addressed:**
- Poor photo quality (blurry, low light, angle distortion)
- Multi-page recipes (PDFs with 3+ pages)
- Recipes in languages other than English
- Handwritten notes in margins that aren't part of recipe
- **Recommendation:** Add Phase 1 tasks: "Photo quality validation with retry suggestions", "Multi-page PDF handling", "Language detection and optional translation"

**UX improvements:**
- Drag-and-drop for multiple recipes at once
- Batch extraction with progress indicator
- "Extract similar recipes" smart grouping

### Conversational Planning

**Gap between functional and delightful:**
- Functional: Chat → add recipes → done
- Delightful: Chat remembers context ("the green bean casserole we made last Christmas"), suggests based on past meals, learns family preferences over time

**Edge cases:**
- Ambiguous requests ("add that thing mom makes")
- Conflicting dietary constraints ("vegetarian but also gluten-free")
- Scaling failures (trying to scale a soufflé recipe)
- **Recommendation:** Add "Context memory" to chat (store past meal references), "Constraint conflict resolution" UI, "Scaling warnings" with chemistry explanations

**UX improvements:**
- Voice input for chat (hands-free in kitchen)
- Quick actions (buttons for common requests: "Scale to 20", "Mark vegetarian")
- Recipe preview cards in chat before adding

### Live Execution Mode (Killer Feature)

**Gap between functional and delightful:**
- Functional: Start → check tasks → done
- Delightful: Anticipates what you need next, shows contextual tips ("Preheat oven now for casserole in 15 min"), celebrates milestones ("Halfway there!"), learns your pacing

**Edge cases:**
- Multiple people checking off same task simultaneously (race condition)
- Device goes offline mid-meal
- Timeline recalculation creates impossible schedule
- **Recommendation:** Add "Optimistic updates with conflict resolution", "Offline mode with sync queue", "Recalculation validation" (warn if new schedule is impossible)

**UX improvements:**
- Haptic feedback on task completion (satisfying vibration)
- Voice announcements ("5 minutes until green beans")
- Smart notifications (only notify if you're not actively using app)
- "Pause" button for unexpected interruptions

### Recipe Preservation

**Gap between functional and delightful:**
- Functional: Record audio → transcribe → store
- Delightful: Audio becomes searchable, linked to specific steps ("Grandma's tip at step 3"), auto-tagged by technique mentioned, creates a "family cooking knowledge graph"

**Edge cases:**
- Poor audio quality (background noise, multiple speakers)
- Long recordings (10+ minutes)
- Transcription errors in cooking terms ("roux" vs "rue")
- **Recommendation:** Add "Audio enhancement" (noise reduction), "Multi-speaker detection", "Cooking term dictionary" for transcription accuracy

**UX improvements:**
- Timestamp links in transcript (jump to audio moment)
- Search across all family audio memories
- "Story mode" playback (just the stories, skip the instructions)

### Family & Collaboration

**Gap between functional and delightful:**
- Functional: Invite → assign tasks → done
- Delightful: Suggests task assignments based on skills ("Sarah always makes great salads"), shows who's available, celebrates team wins together

**Edge cases:**
- Family member doesn't have app installed
- Conflicting task assignments
- Helper accidentally deletes something
- **Recommendation:** Add "Skill tags" for family members, "Read-only helper mode" by default, "Undo" for accidental changes

**UX improvements:**
- In-app messaging ("Can you start the potatoes?")
- Activity feed ("Sarah completed green beans")
- "Who's here?" status (who's actively helping)

---

## 3. New Ideas (High-Leverage Features)

### Idea 1: Smart Ingredient Substitution Engine

**Problem it solves:**
- "I'm at the store and they're out of heavy cream—what can I substitute?"
- Reduces last-minute panic and failed recipes

**Why high-leverage:**
- Relatively simple to implement (database of substitutions + AI for context)
- Compounds with existing features: works with shopping lists, recipe scaling, dietary constraints
- High user value: prevents meal disasters

**How it compounds:**
- Integrates with shopping lists (show substitutions in-store)
- Works with dietary constraints (suggest vegan alternatives)
- Enhances recipe preservation (learns family's preferred substitutions)

**Implementation:**
- Database of common substitutions (cream → milk + butter, etc.)
- AI context awareness ("Don't substitute in custards")
- In-app quick access during shopping or cooking

### Idea 2: "Last Time We Made This" Intelligence

**Problem it solves:**
- "Did we make enough last time? What went wrong? What did everyone love?"
- Turns past meals into learning data

**Why high-leverage:**
- Uses existing data (cooking session logs, post-meal notes)
- Low implementation cost (aggregate and display)
- High emotional value (preserves family memories)

**How it compounds:**
- Informs scaling decisions ("Last time we made 18 servings and had leftovers")
- Suggests improvements ("You noted 'more garlic' last time")
- Creates meal traditions ("We always make this for Christmas")

**Implementation:**
- Auto-link current meal to past meals with same recipes
- Show "Last time" card with notes, photos, guest count, what worked/didn't
- "Copy adjustments from last time" button

### Idea 3: Offline-First Architecture with Smart Sync

**Problem it solves:**
- Kitchen Wi-Fi is unreliable, or you're cooking at a cabin
- App becomes useless when offline

**Why high-leverage:**
- Critical for "operational first" principle
- Modern web tech makes this feasible (Service Workers, IndexedDB, background sync)
- Differentiates from competitors (most recipe apps require internet)

**How it compounds:**
- Works with live execution mode (timeline works offline)
- Enhances recipe preservation (record audio offline, sync later)
- Improves mobile experience (faster, more reliable)

**Implementation:**
- Service Worker for offline caching
- IndexedDB for local storage
- Background sync API for queued updates
- Conflict resolution for offline edits

---

## 4. Jobs Innovation Lens

### How can I make the complex appear simple?

**Hidden complexity leaking into UX:**

1. **Timeline generation complexity**
   - **Current:** User sees a timeline, but doesn't understand why tasks are ordered this way
   - **Abstraction:** Show "why" hints: "Green beans start now because they need 30 min to cool before serving"
   - **Implementation:** Add tooltips/explanations for timeline decisions, "Show reasoning" toggle

2. **Recipe scaling math**
   - **Current:** "Scale to 20" hides the complexity of non-linear scaling (spices, pan sizes)
   - **Abstraction:** Show scaling breakdown: "Ingredients scale linearly, but you'll need 2 pans instead of 1"
   - **Implementation:** Visual scaling preview with warnings for non-linear items

3. **Conflict resolution**
   - **Current:** "Both dishes need oven" is a problem statement, not a solution
   - **Abstraction:** Auto-suggest fixes: "Start casserole 15 min early, or use toaster oven for rolls"
   - **Implementation:** Conflict detection with AI-powered resolution suggestions

**Recommendation:** Add "Explain" buttons throughout the app that reveal the reasoning behind AI decisions. Make complexity optional but accessible.

### What would this be like if it just worked magically?

**Zero-friction ideal:**

1. **Recipe ingestion:** Take photo → AI extracts perfectly → done. No review needed.
   - **What must be true:** 99%+ extraction accuracy, confidence scores, auto-correction for common errors

2. **Menu building:** "Make Christmas dinner for 20" → AI suggests full menu based on past meals, dietary needs, and preferences → one-click approval.
   - **What must be true:** Rich family meal history, preference learning, dietary constraint understanding

3. **Execution:** Open app → timeline auto-starts when you begin first task → app anticipates needs → zero cognitive load.
   - **What must be true:** Smart task detection (maybe via phone sensors?), predictive notifications, contextual help

4. **Collaboration:** Family members automatically see updates, tasks auto-assign based on who's available, no coordination needed.
   - **What must be true:** Presence detection, skill matching, seamless real-time sync

**Recommendation:** Add "Magic Mode" as a Phase 6 feature that learns from usage and reduces manual input over time.

### What's the one thing this absolutely must do perfectly?

**The Live Timeline Execution**

This is your killer feature. Everything else supports this. The roadmap is well-organized around this, but consider:

**What "perfect" means:**
- **Accuracy:** Timeline is always correct, accounting for all dependencies
- **Reliability:** Works offline, syncs flawlessly, never loses progress
- **Clarity:** Anyone can understand what to do next, even under stress
- **Resilience:** Handles delays gracefully, recalculates intelligently, never creates impossible schedules

**Is the roadmap protecting this?**
- ✅ Phase 2 is dedicated to it
- ⚠️ But Phase 1 timeline is "static" — consider making it interactive earlier
- ⚠️ Recalculation algorithm is vague — needs more detail
- ⚠️ Offline mode isn't mentioned until Idea 3 — should be Phase 2

**Recommendation:** Make Phase 2 timeline the absolute priority. Consider splitting Phase 2 into "Timeline Core" (weeks 4-5) and "Timeline Polish" (week 6) to ensure the core works perfectly before adding features.

### How would I make this insanely great instead of just good?

**The difference between "use" and "recommend":**

1. **Emotional connection**
   - **Current:** Functional tool for meal planning
   - **Insanely great:** Becomes part of family tradition, evokes nostalgia, creates joy
   - **Gap:** Audio memories help, but need more emotional hooks (celebration animations, "family cooking stats", meal memories timeline)

2. **Delightful surprises**
   - **Current:** Predictable features
   - **Insanely great:** "You've made this 10 times—here's your improvement timeline" or "Sarah's favorite dish is ready!"
   - **Gap:** No "delight" features that surprise users positively

3. **Social proof and sharing**
   - **Current:** Shareable links exist
   - **Insanely great:** Beautiful meal summaries auto-generated, easy sharing to social, "Sunday Dinner Stories"
   - **Gap:** No emphasis on making meals shareable/celebratable

4. **Learning and growth**
   - **Current:** Preserves recipes
   - **Insanely great:** Helps family become better cooks over time, tracks skill development, suggests new techniques
   - **Gap:** No learning/growth features

**Recommendation:** Add "Delight Features" to Phase 5:
- Celebration animations on meal completion
- Auto-generated "Meal Story" with photos, timeline, notes
- "Cooking Stats" dashboard (most-made recipes, improvement over time)
- "Try Something New" suggestions based on family preferences

---

## 5. Technical Considerations

### Architectural choices that might age poorly

**Next.js 14 vs Next.js 15**
- **Current:** Next.js 14 (App Router)
- **Risk:** Next.js 15 with React 19 offers better Server Components, improved caching, and new hooks
- **Recommendation:** Start with Next.js 15 if stable, or plan migration path. Document why you chose 14 if sticking with it.

**Supabase Realtime for task sync**
- **Current:** Supabase Realtime for task checkoff
- **Risk:** Realtime can be expensive at scale, may have latency issues
- **Recommendation:** Add Phase 2 technical spike: "Load test Supabase Realtime with 10 concurrent users, measure latency, evaluate alternatives (Socket.io, Pusher) if needed"

**AI API costs**
- **Current:** Claude API for chat + Vision for OCR
- **Risk:** Costs scale with usage, may become expensive
- **Recommendation:** Add cost monitoring from Phase 1, implement caching for repeated extractions, consider local OCR alternatives for common recipes

**Monolithic chat approach**
- **Current:** "Natural language chat" for everything
- **Risk:** Chat can be slow, requires internet, may frustrate users who want quick actions
- **Recommendation:** Add "Quick Actions" UI alongside chat (buttons for common tasks) to reduce chat dependency

### Mobile/tablet responsiveness concerns

**Timeline horizontal scroll**
- **Current:** "Horizontal scroll" for timeline
- **Mobile concern:** Horizontal scroll is awkward on mobile, especially one-handed
- **Recommendation:** Add mobile-specific timeline view: vertical list with time indicators, or pinch-to-zoom Gantt chart

**Chat interface**
- **Current:** "Conversational bubbles"
- **Mobile concern:** Long chat threads are hard to navigate on small screens
- **Recommendation:** Add "Chat summary" view for mobile, collapsible threads, voice input prominent

**Kitchen display mode**
- **Current:** "Large text, minimal UI"
- **Mobile concern:** Need to prevent screen lock, handle interruptions (calls, notifications)
- **Recommendation:** Add "Keep screen on" option, "Do Not Disturb" integration, landscape lock

**Photo upload**
- **Current:** "Photo upload" with file picker
- **Mobile concern:** Should use native camera, not file picker
- **Recommendation:** Add Phase 1 task: "Native camera integration for mobile recipe photos"

### State-of-the-art check

**React Server Components**
- **Current:** Next.js App Router supports RSC, but not explicitly mentioned
- **Recommendation:** Leverage RSC for recipe data fetching, reduce client-side JavaScript. Add to Phase 1: "Implement RSC patterns for recipe list/display"

**View Transitions API**
- **Current:** Framer Motion for animations
- **Recommendation:** Consider View Transitions API (Chrome 111+) for page transitions, reduces animation complexity. Add to Phase 5: "Evaluate View Transitions API for route animations"

**Web Push API**
- **Current:** "Push notifications" mentioned but not specified
- **Recommendation:** Use Web Push API (supported in modern browsers) instead of third-party services for Phase 2. More control, lower cost.

**IndexedDB for offline**
- **Current:** Not mentioned
- **Recommendation:** Add IndexedDB for offline recipe storage, use Dexie.js or similar for easier API. Critical for mobile reliability.

**WebAssembly for performance**
- **Current:** Not mentioned
- **Recommendation:** Consider WASM for timeline calculation if it becomes a bottleneck (likely not needed initially, but good to know it's an option)

### Performance and scalability concerns

**Timeline generation performance**
- **Current:** "<5 seconds" target
- **Concern:** Complex meals with 10+ recipes, many dependencies may exceed this
- **Recommendation:** Add performance profiling from Phase 1, consider Web Workers for timeline calculation to avoid blocking UI

**Real-time sync at scale**
- **Current:** "<500ms" task sync latency
- **Concern:** With 10+ family members, Supabase Realtime may struggle
- **Recommendation:** Add load testing in Phase 2, implement optimistic updates to mask latency

**Image storage costs**
- **Current:** Supabase Storage for recipe photos
- **Concern:** High-resolution photos, many recipes = high storage costs
- **Recommendation:** Implement image optimization (WebP, responsive images) from Phase 1, consider CDN (Cloudflare Images, ImageKit)

**AI API rate limits**
- **Current:** Claude API for chat + Vision
- **Concern:** Rate limits may block users during peak times (holiday cooking)
- **Recommendation:** Implement request queuing, retry logic, user-friendly error messages. Consider Claude API caching for common requests.

**Database query performance**
- **Current:** PostgreSQL via Supabase
- **Concern:** Complex queries (timeline generation, recipe search) may be slow
- **Recommendation:** Add database indexes from Phase 1, consider full-text search (PostgreSQL FTS or Algolia) for recipe search in Phase 3

**Mobile bundle size**
- **Current:** Many dependencies (Framer Motion, Tiptap, RecordRTC, etc.)
- **Concern:** Large bundle = slow mobile load times
- **Recommendation:** Code splitting, lazy loading, tree shaking. Add bundle size monitoring from Phase 1, target <200KB initial load.

---

## Summary Recommendations

### Immediate Actions (Before Phase 1)

1. **Add Phase 0.5: Technical Spike** (1 week)
   - Validate Claude Vision extraction accuracy on 20 diverse recipe photos
   - Test Supabase Realtime with 5 concurrent users
   - Prototype timeline algorithm with 10 recipes
   - Document findings and adjust roadmap

2. **Clarify Phase 2 timeline algorithm**
   - Specify algorithm approach (critical path method recommended)
   - Define recalculation strategy
   - Add conflict resolution details

3. **Add mobile-specific tasks to Phase 1**
   - Native camera integration
   - Mobile-optimized timeline view
   - Touch gesture definitions

### High-Priority Enhancements

1. **Offline mode** → Move from "Idea 3" to Phase 2 core feature
2. **Recipe extraction review UI** → Add to Phase 1 (don't assume 90% accuracy from day 1)
3. **Quick Actions UI** → Add to Phase 1 alongside chat (reduce chat dependency)
4. **"Last Time We Made This"** → Add to Phase 3 (high value, low effort)

### Architecture Updates

1. **Consider Next.js 15** → Evaluate React 19 features
2. **Add IndexedDB/offline architecture** → From Phase 1
3. **Implement image optimization** → From Phase 1
4. **Add performance monitoring** → From Phase 1

### Missing Sections to Add

1. **Risks & Mitigations** section
2. **Mobile-first feature list**
3. **Cost monitoring strategy**
4. **Accessibility checklist** (beyond WCAG AA audit)

---

*Feedback generated: December 2025*
*Roadmap version reviewed: December 2025*
