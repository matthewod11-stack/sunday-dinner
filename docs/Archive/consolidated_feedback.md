# Consolidated Roadmap Feedback

**Sources reviewed:**
- `claudefeedback.md` — Claude (Anthropic)
- `composer1.md` — Codex (Cursor Composer)
- `geminifeedback.md` — Gemini (Google)
- `gpt52.md` — GPT (OpenAI)
- `grokfeedback.md` — Grok (xAI)

**Date consolidated:** December 26, 2025

---

## Consensus Summary

Before diving into sections, these are all items that received the 🔺 CONSENSUS tag (2+ tools raised the same concern). **This is the "if you read nothing else" list.**

### Section 1: Structure & Detail Assessment

| Consensus Item | Tools |
|---------------|-------|
| **Recalculation/Timeline algorithm is dangerously underspecified** | Claude, Codex, Gemini, GPT, Grok (all 5) |
| **Offline/Local-First strategy is completely missing** | Claude, Codex, Gemini, GPT, Grok (all 5) |
| **Dependencies between phases/features are unclear** | Claude, Codex, Gemini, GPT, Grok (all 5) |
| **Design system (hex codes, fonts) is premature for a roadmap** | Claude, Codex, Gemini, GPT, Grok (all 5) |
| **Library/technology choices create unnecessary lock-in** | Claude, Codex, Gemini, GPT, Grok (all 5) |
| **Push notifications underspecified (especially iOS/PWA)** | Claude, Codex, Gemini, GPT |
| **Recipe extraction failure handling not defined** | Claude, Codex, GPT, Grok |
| **No risk register or failure mode analysis** | Claude, Codex, Grok |
| **No "Definition of Done" for key features** | Claude, Codex, GPT, Grok |
| **Chemistry warnings is a research project, not a feature** | Claude, Gemini, Codex |
| **Conflict detection resolution strategy not specified** | Codex, Gemini, GPT |

### Section 2: Existing Feature Enhancement

| Consensus Item | Tools |
|---------------|-------|
| **Live Mode needs "Now/Next" view, not Gantt by default** | Claude, Codex, Gemini, GPT, Grok (all 5) |
| **Offline/network failure during live cooking is catastrophic** | Claude, Codex, Gemini, GPT, Grok (all 5) |
| **Concurrent task checkoff needs conflict resolution** | Claude, Codex, GPT, Grok |
| **Chat should produce structured artifacts, not just prose** | Claude, Codex, GPT |
| **Multi-page/multi-photo recipe handling needed** | Claude, Codex, GPT, Grok |
| **Helper view should be aggressively simple** | Claude, GPT |
| **Pantry/staples management for shopping lists** | Claude, Gemini |

### Section 3: New Ideas

| Consensus Item | Tools |
|---------------|-------|
| **Offline-First / "Quiet Kitchen" Mode** | Claude, Codex, Gemini, GPT |
| **Prep-Ahead / Pre-Cook Walkthrough** | Claude, Gemini |
| **Voice/Hands-Free Mode** | Codex, Gemini, GPT |

### Section 4: Jobs Innovation Lens

| Consensus Item | Tools |
|---------------|-------|
| **Live Execution is the one thing that must be perfect** | Claude, Codex, Gemini, GPT, Grok (all 5) |
| **The roadmap doesn't sufficiently protect the killer feature** | Claude, GPT, Grok |
| **Progressive disclosure needed—hide complexity by default** | Claude, Codex, GPT |
| **Emotional/ritual design is missing** | Claude, Codex, GPT, Grok |

### Section 5: Technical Considerations

| Consensus Item | Tools |
|---------------|-------|
| **Gantt chart on mobile is a terrible UX** | Claude, Codex, Gemini, GPT, Grok (all 5) |
| **Use deterministic algorithms for core scheduling, LLM for suggestions** | Claude, Codex, Gemini, GPT |
| **Abstract AI providers for easy swapping** | Claude, Gemini, GPT, Grok |
| **Supabase Realtime may hit limits at scale** | Claude, Codex, GPT, Grok |
| **Image storage costs will grow fast—needs optimization** | Claude, Codex, Gemini |
| **AI API costs need monitoring and guardrails** | Claude, Codex, Grok |
| **Vercel serverless timeouts will break AI orchestration** | Claude, Gemini |

---

## 1. Structure & Detail Assessment

### Gaps / Too Vague

#### Timeline Generation & Recalculation

- **The timeline generation algorithm has no specification.** What are the inputs (per-step durations, oven occupancy, parallelizable tasks)? What's the output (task vs step vs timer)? What makes a timeline "good enough"? — [Claude, Codex, Gemini, GPT, Grok] 🔺 CONSENSUS

- **"Running behind? Recalculate remaining steps" is 10 words describing the hardest problem in the app.** What's compressible (chop faster) vs fixed (meat rests 20 min)? What happens to critical-path items? Does it shift serve time or compress remaining steps? — [Claude, Codex, Gemini, GPT] 🔺 CONSENSUS

- **No latency budget for recalculation.** If the user taps "I'm behind" and waits 8 seconds for Claude to respond, trust is destroyed. — [Claude]

- **Recalculation needs explicit rules:** What is movable vs fixed? Can it propose technique changes (temp/time) or only reorder? How does it handle partial reality (late starts, skipped steps, out-of-order completion)? — [GPT]

- **No constraint model:** Shared resources (oven zones, burners, mixer, counter space) and human constraints ("only one person can carve") are not defined. — [GPT]

- **Algorithm approach not specified:** Should use critical path method, topological sort, or constraint-based scheduling? — [Codex]

**Recommendation:** Write a 1-page "Recalculation Spec" defining inputs, constraints, output contract, and which operations are deterministic vs LLM-powered. — [Claude]

#### Chemistry Warnings / Scaling

- **"Smart scaling with chemistry warnings" is a research project disguised as a feature.** Baking soda doesn't scale linearly. Yeast behaves differently at volume. Caramelization timing changes with pan surface area. Unless you have a specific API, this is massive scope. — [Claude, Gemini] 🔺 CONSENSUS

- **Scaling breakdown not shown:** "Scale to 20" hides non-linear scaling (spices, pan sizes). Need visual preview with warnings. — [Codex]

**Recommendation:** Scope down for v1. Either warn for known categories ("baking = scaling may affect results") or surface Claude's uncertainty ("not sure this scales safely—consider testing"). — [Claude]

#### Push Notifications

- **Push notifications listed but implementation missing.** No timing strategy (5 min before? 1 min?), delivery mechanism (browser push? SMS fallback?), or offline handling. — [Codex, GPT] 🔺 CONSENSUS

- **Web push has platform constraints.** Notably iOS/Safari behavior requires PWA install flow and workarounds. No fallback defined for "notifications unavailable." — [Claude, GPT]

- **"Notifications denied" fallback not defined.** Need kitchen mode timers, audible cues, on-screen banners. — [GPT]

**Recommendation:** Specify notification service, timing strategy, PWA install UX, and graceful degradation. — [Codex]

#### Conflict Detection

- **Conflict detection mentioned but not detailed.** "Both dishes need oven at 400°" is a problem statement, not a solution. How are conflicts resolved—suggest alternatives? Auto-reschedule? Warn only? — [Codex, Gemini, GPT] 🔺 CONSENSUS

- **Conflict types need definition:** Resource conflicts (oven, burners, mixer), temperature conflicts, attention conflicts ("two must-watch steps"), critical-path risks. — [GPT]

- **Resource contention should be flagged before shopping, not during cooking.** — [Gemini]

**Recommendation:** Define conflict types for v1, resolution strategies, and whether AI proactively suggests fixes. — [Codex]

#### Recipe Extraction

- **No plan for handling extraction failures.** 90% accuracy target means 10% fail—what's the fallback? — [Claude, Codex, GPT, Grok] 🔺 CONSENSUS

- **Missing:** Manual correction flow, confidence scores, retry mechanisms, partial extraction handling. — [Codex]

- **AI extraction error handling undefined.** What happens when extraction fails (~30% of the time based on 90% target on hard cases)? — [Grok]

- **OCR confidence scoring and human correction loop not specified.** — [GPT]

- **"AI extracts" is a black box.** Need to specify: confidence heatmap, uncertain field highlighting, inline correction on original image. — [Claude]

**Recommendation:** Add Phase 1 task: "Recipe extraction review/editing interface" with inline correction tools. — [Codex]

#### Kitchen Display Mode

- **"Large text, minimal UI, tap to advance" is underspecified.** What does "advance" mean (next task? next recipe?)? Gesture controls? Auto-advance timers? Screen lock behavior? — [Codex]

- **Needs to be its own design exercise.** Assume: wet hands, 4-foot viewing distance, cognitive overload. — [Claude]

**Recommendation:** Define interaction model: swipe for next/previous, tap to mark complete, long-press for details. Separate from responsive design—treat as dedicated layout. — [Codex, Claude]

#### URL Scraping / PDF Parsing

- **Both are edge-case heavy.** Roadmap lacks a "supported sources/formats" list for v1 and graceful degradation path. — [GPT]

- **URLs that require JavaScript rendering not addressed.** — [Grok]

#### Other Vague Items

- **"Phase breakdown lacks specificity."** Each phase lists high-level checkboxes but no detailed tasks, acceptance criteria, or effort estimates. "Interactive timeline with 'Start' anchor" could mean 10-100 hours. — [Grok]

- **Success metrics missing baselines.** No current benchmarks. How do you know if 90% extraction accuracy is achievable on handwritten cards? — [Grok]

- **Technical debt prevention absent.** No mention of testing strategy, code review processes, or architectural decision records. — [Grok]

- **Recipe normalization not defined.** Unit system (metric/imperial), ingredient canonicalization, ambiguity handling ("1 onion" vs grams). — [GPT]

- **Onboarding/empty state undefined.** How does the app feel with zero recipes? Is there a starter pack? — [Gemini]

---

### Over-Specified / Premature Decisions

#### Design System Details

- **Specific hex codes in the roadmap risk premature lock-in.** Commits to design before validating flows with real users. Creates distraction from harder interaction design questions. — [Claude, Codex, Gemini, GPT, Grok] 🔺 CONSENSUS

- **Reads like a near-final brand spec.** May slow iteration if early UX requires different density/contrast choices. — [GPT]

- **Roadmap should define the *vibe* (Warm/Heirloom), not the hex.** — [Gemini]

**Recommendation:** Keep the mood in the roadmap. Move specific palette to `DESIGN_SYSTEM.md` that can evolve independently. Use design tokens, not hardcoded values. — [Claude, Codex]

#### Library/Technology Choices

- **RecordRTC, Tiptap, Framer Motion—naming them makes them feel load-bearing. They're not.** Express requirements as capabilities, not libraries. — [Claude, Codex, Gemini, GPT, Grok] 🔺 CONSENSUS

- **"Sonnet 4" locks you into a future model.** Structure backend to swap models easily as SOTA changes monthly. — [Gemini, GPT, Grok]

- **Waveform visualization is polish, not core value.** Can be deferred until flows are validated. — [GPT]

- **Consider Next.js 15** for React 19 features (better Server Components, improved caching). — [Codex]

**Recommendation:** Express requirements as capabilities. Use abstraction layers (Vercel AI SDK, LangChain) to swap models per-task. — [Claude, Gemini]

#### Phase Timing

- **Week estimates may create pressure to ship incomplete features.** — [Codex]

**Recommendation:** Add "Phase 0.5: Technical Spike" (1 week) before Phase 1 to validate AI extraction accuracy, test Supabase Realtime performance, and prototype timeline algorithm. — [Codex, Grok]

#### Gantt-Style Timeline

- **Committing to "Gantt-style timeline" as the default may be premature.** Great for planning on desktop, fiddly on mobile. Consider describing as an interaction goal ("always know what's next") rather than fixed visualization. — [GPT]

---

### Missing Context or Clarity

#### Non-Goals / Scope Boundaries

- **No "What We're NOT Building" section.** Without explicit non-goals, scope creep is inevitable. — [Claude, GPT] 🔺 CONSENSUS

- **Examples of non-goals:** NOT a recipe discovery/social platform, NOT a nutrition/macro tracker, NOT a meal planning subscription service, NOT supporting commercial kitchen scale (>50 servings). — [Claude]

- **v1 scope boundaries not explicit.** — [GPT]

**Recommendation:** Add a "Non-Goals" section. This protects scope and helps future-you make faster decisions. — [Claude]

#### Risk Assessment

- **No Risk Register.** What if Claude API has outage during Thanksgiving? What if recipe extraction is only 70% accurate on handwritten cards? What if Supabase Realtime can't handle 8 family members syncing? — [Claude, Codex, Grok] 🔺 CONSENSUS

- **No discussion of failure points.** — [Grok]

- **No technical risks identified** (AI accuracy, real-time sync complexity, mobile performance). — [Codex]

**Recommendation:** Add "Risks & Mitigations" section identifying top 3 technical risks and mitigation strategies. — [Codex]

#### Definition of Done

- **No acceptance criteria for the killer feature.** What would make you confident Live Mode is ready? — [Claude, Codex, GPT, Grok] 🔺 CONSENSUS

- **Milestones lack "definition of done" criteria.** — [Codex]

**Recommendation:** Write 3-5 concrete scenarios that must work flawlessly: (1) Solo cook, 4 dishes, 3-hour timeline, one "running behind" event; (2) Two cooks, 6 dishes, real-time sync of checkoffs; (3) Offline for 5 minutes mid-cook, reconnects and recovers state. — [Claude]

#### Offline/Local-First Strategy

- **This is the biggest gap identified by all reviewers.** Kitchens have spotty WiFi, dead zones, devices in low-power mode. If Live Execution fails due to connectivity blip, trust is destroyed forever. — [Claude, Codex, Gemini, GPT, Grok] 🔺 CONSENSUS

- **The killer feature cannot depend on perfect connectivity.** — [Claude]

- **Critical for "operational first" principle.** Modern web tech (Service Workers, IndexedDB, background sync) makes this feasible. — [Codex]

**Recommendation:** Add "Offline Mode" to Phase 1 or Phase 2 as a core feature, not a nice-to-have. Consider Replicache or ElectricSQL for true local-first. — [Claude, Codex, Gemini, GPT]

#### Reliability Requirements

- **"Never lose state" invariants not defined.** Checkoffs, timers, assignments must survive offline, refresh, backgrounding. — [GPT]

- **Success metrics focus on latency and frame rate, not reliability.** Missing: % of sessions with zero dropped checkoffs, % with successful notification delivery. — [Claude]

**Recommendation:** Add reliability metrics: "Zero lost checkoffs per session," "Notification delivery rate >95%," "Recovery from 5-min offline without data loss." — [Claude]

#### Other Missing Items

- **Cost/rate-limit budget:** Claude + Whisper per-meal cost expectations and guardrails to prevent runaway. — [GPT]

- **Instrumentation:** What you measure to improve (OCR correction rate, recalculation frequency, missed tasks, user edits to plan). — [GPT]

- **Accessibility acceptance criteria:** Beyond WCAG AA audit—dynamic type, contrast targets, reduced motion, keyboard support, screen reader paths. — [GPT, Codex]

- **Deployment & operations:** No CI/CD, monitoring, backup strategies, or data retention policies. — [Grok]

- **User research methodology:** How will assumptions about family cooking workflows be validated? — [Grok]

- **Competitive analysis:** What differentiates from Paprika, Plan to Eat, etc.? — [Grok]

- **Mobile-first feature list:** Not prioritized despite "Works on Grandma's iPad" principle. — [Codex]

---

### Dependency Issues

- **The phase breakdown implies linear ordering but hides critical dependencies.** — [Claude, Codex, Gemini, GPT, Grok] 🔺 CONSENSUS

| Feature | Hidden Dependency |
|---------|-------------------|
| Delegation (Phase 2) | Requires user identity + minimal permissions (Phase 4) — [Claude, GPT] |
| Push notifications (Phase 2) | Requires PWA install flow + iOS Safari workarounds (not mentioned) — [Claude] |
| Recipe versioning (Phase 3) | Requires diff algorithm + storage model decisions — [Claude] |
| Shareable links (Phase 4) | Requires guest auth + RLS rules from day one — [Claude, GPT] |
| "Running behind" | Depends on step-duration fidelity—if extracted recipes don't have durations, recalculation is guessy — [GPT] |
| Smart Scaling/Conflict Detection | Depends on AI extracting structured data perfectly—if OCR is 90%, conflict detection might be 50% accurate — [Gemini] |

- **Phase 2 depends on Phase 4 primitives.** Delegation + helper view implies at least minimal multi-user and permissions sooner. — [GPT]

- **Realtime depends on hardened authorization.** Supabase Realtime is easy to start, but correct RLS becomes critical once invites/share links exist. — [GPT]

- **Hidden dependencies:** Real-time features require robust error handling and offline capability, not called out. Multi-user collaboration introduces complex state management affecting core timeline. — [Grok]

**Recommendation:** Create a dependency graph. Doesn't need to be fancy—just "X requires Y" statements that surface hidden work. Pull a thin slice of permissions + share links earlier so Phase 2 delegation is real. — [Claude, GPT]

---

## 2. Existing Feature Enhancement

### Recipe Ingestion

#### Gaps: Functional → Delightful

- **Show extraction progress with confidence scores.** Highlight uncertain fields, allow inline editing during extraction, show side-by-side original vs extracted. — [Codex, GPT]

- **Confidence heatmap overlay on original image.** Green = high confidence, yellow = uncertain, red = couldn't parse. Tapping a region jumps to that field in structured data. — [Claude]

- **Interactive overlay:** When reviewing extraction, overlay text boxes directly on original image (like iOS Live Text) for rapid verification. — [Gemini]

- **Make correction feel like reviewing a draft, not data entry.** One universal "This is wrong" affordance that jumps to exact field/line. — [GPT]

- **Auto-crop/de-skew/contrast enhancement** tuned for handwriting. — [GPT]

- **Smart preprocessing:** Rotate crooked photos, enhance faded text. — [Grok]

#### Edge Cases / Failure Modes

- **Multi-page recipes** (PDFs with 3+ pages, scanned out of order). — [Claude, Codex, GPT, Grok] 🔺 CONSENSUS

- **Handwritten notes with personal abbreviations** ("T" vs "t" for tablespoon vs teaspoon, "2c milk" vs "2 cups milk"). Need per-user abbreviation dictionary. — [Claude, Gemini, Grok] 🔺 CONSENSUS

- **Poor photo quality** (blurry, low light, angle distortion, glare). — [Codex, GPT, Grok]

- **Ingredients inline with instructions** ("add 2 eggs, then fold in flour"). — [Claude]

- **Recipes in different languages.** — [Codex, Grok]

- **Handwritten notes in margins that aren't part of recipe.** — [Codex]

- **Implicit knowledge** ("Cook until done"). — [Gemini]

- **Ambiguous quantities** ("one can", "a handful"), missing times, implied times. — [GPT]

- **Duplicates** (same recipe uploaded twice, slightly edited variants). — [GPT]

- **URLs that require JavaScript rendering.** — [Grok]

#### UX Improvements

- **Drag-and-drop for multiple recipes at once.** Batch extraction with progress indicator. — [Codex]

- **Progress indicators during extraction**, preview of extracted data with inline editing, "this looks wrong" feedback loop. — [Grok]

- **Ingredient canonicalization with gentle prompts only when it matters** ("salted or unsalted?"). — [GPT]

---

### Conversational Planning

#### Gaps: Functional → Delightful

- **Chat should produce structured artifacts, not just prose.** Every Claude action creates a visible, editable artifact. "Add green bean casserole" → recipe card appears in sidebar, not just "Got it!" — [Claude, Codex, GPT] 🔺 CONSENSUS

- **Chat remembers context** ("the green bean casserole we made last Christmas"), suggests based on past meals, learns family preferences over time. — [Codex]

- **Actions show provenance** ("added because you said X"). Include "Explain this plan" and "What's risky?" summaries. — [GPT]

- **Remember family preferences** ("Mom always wants extra garlic"). — [Grok]

#### Edge Cases / Failure Modes

- **Conflicting instructions over time** ("serve at 6" then later "actually 5:30"). — [Claude, GPT] 🔺 CONSENSUS

- **Requests requiring knowledge you don't have** ("pair with a wine under $20"). — [Claude]

- **Requests that break physics** ("scale this 45-minute roast to serve 40"). — [Claude]

- **Ambiguous requests** ("add that thing mom makes"). — [Codex]

- **Conflicting dietary constraints** ("vegetarian but also gluten-free", veg/meat cross-contamination). — [Codex, GPT]

- **Scaling failures** (trying to scale a soufflé). — [Codex]

- **Dietary constraints affecting shared tools** (shared oven). — [GPT]

- **Scaling that breaks physics** (pan sizes, oven capacity, chilling/resting). — [GPT]

- **Seasonal ingredient availability.** — [Grok]

- **Equipment limitations** (no stand mixer). — [Grok]

- **Time zone differences for distributed family.** — [Grok]

#### UX Improvements

- **Voice input for chat** (hands-free in kitchen). — [Codex, GPT]

- **Quick actions** (buttons for common requests: "Scale to 20", "Mark vegetarian") alongside chat to reduce chat dependency. — [Codex, GPT] 🔺 CONSENSUS

- **Recipe preview cards in chat before adding.** — [Codex]

- **Chat should not be the only way to modify the plan.** Every artifact Claude creates should be directly editable. Users should be able to ignore chat and drag-drop in visual interface. — [Claude, GPT] 🔺 CONSENSUS

- **Suggested prompts only when user stalls; keep default UI calm.** — [GPT]

- **Chat should feel like texting with family** — emojis, quick replies. — [Grok]

---

### Live Execution Mode ⭐ (Killer Feature)

#### Gaps: Functional → Delightful

- **Design around "the 2-second glance."** If someone looks at phone while stirring, they should know what's next in under 2 seconds. Default is NOT a timeline—it's a single "Now" card with "Next" peeking below. — [Claude, Codex, Gemini, GPT] 🔺 CONSENSUS

- **"Now / Next / Later" triad** that always answers: what should I do right now? One-tap timers from steps; persistent banner for active timers. — [Codex, GPT]

- **"Focus Mode":** Don't show Gantt while chopping. Show JUST "Chop Onions" with a big button. — [Gemini]

- **The current spec describes a Gantt chart with checkboxes. That's functional.** Delightful = you glance at phone and immediately know what to do, without scrolling, parsing, or thinking. — [Claude]

- **Anticipates what you need next**, shows contextual tips ("Preheat oven now for casserole in 15 min"), celebrates milestones ("Halfway there!"), learns your pacing. — [Codex]

- **"We're behind" mode** that proposes one clear adjustment at a time (swap/reorder/retime). Don't show 12 cascading changes—show one: "Push mashed potatoes back 15 minutes? (Yes / Adjust differently)" — [Claude, GPT]

- **Haptic feedback on task completion** (satisfying vibration). — [Codex, Grok]

- **Voice announcements** ("5 minutes until green beans"). — [Codex, GPT]

- **Smart notifications** (only notify if not actively using app). — [Codex]

- **"Pause" button** for unexpected interruptions. — [Codex]

#### Edge Cases / Failure Modes

- **Device sleeps and misses notification.** — [Claude, Codex]

- **Two people check off the same task** (race condition / concurrent edits). — [Claude, Codex, GPT, Grok] 🔺 CONSENSUS

- **Network drops during live cooking** (for 3+ minutes). — [Claude, Codex, Gemini, GPT, Grok] 🔺 CONSENSUS

- **User checks off task that hasn't started yet.** — [Claude]

- **User wants to "un-check" something marked done by accident.** — [Claude, GPT]

- **Timeline recalculation creates impossible schedule.** — [Codex]

- **Running way behind (2+ hours)** — when to abandon recalculation? — [Grok]

- **Device battery dying mid-meal.** — [Grok]

- **Family members joining/leaving mid-execution.** — [Grok]

- **Screen lock/backgrounding; refresh; denied notification permissions.** — [GPT]

- **Clock drift across devices; server-time anchoring + reconciliation.** — [GPT]

#### UX Improvements

- **Kitchen Display Mode needs separate design exercise.** Assume: wet hands, 4-10 foot viewing distance, cognitive overload. Default = one task, one timer, one button. Landscape lock, "Keep screen on," "Do Not Disturb" integration. — [Claude, Codex, GPT]

- **Optimistic updates with conflict resolution.** — [Codex]

- **"Offline mode with sync queue."** — [Codex]

- **Recalculation validation** (warn if new schedule is impossible). — [Codex]

- **Big touch targets, undo for checkoffs, confirm only for destructive actions.** — [GPT]

- **Kitchen mode should prioritize readability + wake lock + low interaction cost.** — [GPT]

- **Voice commands** ("done with salad") — zero cognitive load, works with greasy hands. — [Grok]

---

### Operational Output (Shopping Lists, Quick Cards, Delegation)

#### Gaps: Functional → Delightful

- **Consolidated shopping list with unit reconciliation** ("2 cups milk" + "1 cup milk" = "3 cups milk"). — [Claude, GPT]

- **Grouping by store section** (produce → dairy → meat → frozen). — [Claude]

- **"I already have this" toggles.** — [Claude]

- **"Pantry Check" before finalizing:** Ask "Do you need Salt, Olive Oil, Flour, or do you have these staples?" Let users mark staples at family level. — [Claude, Gemini] 🔺 CONSENSUS

- **Printing a list that fits on a half-sheet you can carry.** — [Claude]

- **Show "for: Green Bean Casserole, Mashed Potatoes" on each item** so you remember why you're buying it. — [Claude]

- **Track what you skipped** ("Couldn't find X—substitute?"). — [Claude]

- **Quick cards designed for the counter, not the screen.** One recipe per page, large type, critical timings bold, no wasted space on metadata. — [Claude, GPT]

- **"Store split" varies by user** — needs customization and defaults. — [GPT]

- **Make export/print a first-class "kitchen artifact," not an afterthought.** — [GPT]

#### Edge Cases / Failure Modes

- **Substitution handling** ("or use Greek yogurt instead of sour cream"). — [Claude]

- **Same ingredient in different forms** (onion vs diced onion; butter vs melted butter). — [GPT]

---

### Recipe Preservation (Audio, Versioning, Notes)

#### Gaps: Functional → Delightful

- **Recording works. Delight = prompting at the right moment** ("Want to record why you made that substitution?"), surfacing recordings at the right moment ("Last time, Mom said…"), making archive feel alive, not dusty. — [Claude]

- **After every cooking session, prompt for a 30-second voice note:** "Anything you'd change next time?" Easier than typing, captures moment of learning. — [Claude, GPT] 🔺 CONSENSUS

- **Audio becomes searchable**, linked to specific steps ("Grandma's tip at step 3"), auto-tagged by technique mentioned, creates "family cooking knowledge graph." — [Codex]

- **Versioning UI should emphasize *what changed*, not *that a version exists*.** Show diff: "Matt's 2024: doubled garlic, reduced salt by half, added lemon zest." — [Claude, GPT] 🔺 CONSENSUS

- **"Story behind this dish" prompts with optional structure** (who/when/why). — [GPT]

- **AI-powered search** ("find Grandma's pie crust recipe") and automatic relationship mapping. — [Grok]

#### Edge Cases / Failure Modes

- **Audio quality in kitchens** (exhaust fans, sizzling, crosstalk). — [Claude, Codex, Grok]

- **Long recordings** (Grandma talks for 20 minutes, 10+ minutes). — [Claude, Codex]

- **Transcription errors for proper nouns, family terms, foreign words, cooking terms** ("roux" vs "rue"). — [Claude, Codex]

- **Poor audio quality** (background noise, multiple speakers). — [Codex]

- **Consent/privacy for recordings; sharing rules; deletion.** — [GPT]

- **Storage costs** (audio/photos/originals) and lifecycle policies. — [GPT]

- **Cross-device audio recording sync.** — [Grok]

#### UX Improvements

- **Timestamp links in transcript** (jump to audio moment). — [Codex]

- **Search across all family audio memories.** — [Codex]

- **"Story mode" playback** (just the stories, skip the instructions). — [Codex]

- **Audio enhancement** (noise reduction), **multi-speaker detection**, **cooking term dictionary** for transcription accuracy. — [Codex]

- **Searchable transcripts, highlight key moments, shareable clips.** — [Grok]

---

### Family & Collaboration

#### Gaps: Functional → Delightful

- **Helper opens link on phone and immediately sees only their tasks**, in large type, with no login required. They feel useful, not confused. — [Claude, GPT] 🔺 CONSENSUS

- **Helpers join via link that "just works" with near-zero onboarding; optional account later.** — [GPT]

- **Suggests task assignments based on skills** ("Sarah always makes great salads"), shows who's available, celebrates team wins together. — [Codex]

- **Clear roles:** Helper can't break plan; contributor can edit; admin can invite. — [GPT]

- **Let host send helper link via iMessage/WhatsApp with preview card:** "Sarah invited you to help with Thanksgiving. Your first task is Salad Prep at 4:30 PM." — [Claude]

- **Automatic role suggestion** based on family dynamics and cooking history. — [Grok]

#### Edge Cases / Failure Modes

- **Link security** (expires? revocable?). — [Claude, GPT] 🔺 CONSENSUS

- **Helpers with no smartphone.** — [Claude]

- **Family members who "help" by rearranging your plan.** — [Claude]

- **Family member doesn't have app installed.** — [Codex]

- **Conflicting task assignments.** — [Codex]

- **Helper accidentally deletes something.** — [Codex]

- **Helper offline/spotty connectivity; durable sync.** — [GPT]

- **Family politics around task assignment.** — [Grok]

- **Guests with complex dietary needs.** — [Grok]

- **International family with different measurement systems.** — [Grok]

- **Privacy concerns with recipe sharing.** — [Grok]

#### UX Improvements

- **Helper view is aggressively simple.** No timeline. No other people's tasks. Just: "Your next task is X at Y time. Tap when done." — [Claude, GPT] 🔺 CONSENSUS

- **"Skill tags" for family members.** — [Codex]

- **"Read-only helper mode" by default.** — [Codex]

- **"Undo" for accidental changes.** — [Codex]

- **In-app messaging** ("Can you start the potatoes?"). — [Codex]

- **Activity feed** ("Sarah completed green beans"). — [Codex]

- **"Who's here?" status** (who's actively helping). — [Codex]

---

## 3. New Ideas

Every new feature/idea proposed, grouped by theme with duplicates combined.

---

### Offline-First / "Quiet Kitchen" Mode — [Claude, Codex, Gemini, GPT] 🔺 CONSENSUS

**Problem it solves:**
- Kitchen Wi-Fi is unreliable. Devices go into low-power mode. Network blips destroy trust during live cooking.
- When connectivity fails during the killer feature, the whole product fails.

**Why high-leverage:**
- This isn't a feature—it's insurance for your core value prop. A small investment (2-3 days of PWA hardening) protects against catastrophic trust loss.
- Users will forgive a rough edge; they won't forgive a ruined dinner.
- Modern web tech makes this feasible (Service Workers, IndexedDB, background sync).
- Differentiates from competitors (most recipe apps require internet).

**Compounds with:**
- Live Mode, Kitchen Display, Helper View all become more robust.
- Turns "works on Grandma's iPad" from aspiration to guarantee.
- Works with recipe preservation (record audio offline, sync later).

**Implementation notes:**
- Local-first state (IndexedDB + service worker)
- On-screen timers that don't require push notifications
- Periodic sync rather than real-time when connectivity is poor
- Clear indicator: "Last synced 2 min ago" vs "Live"
- Conflict resolution for offline edits
- Consider Replicache, ElectricSQL, or robust PouchDB/RxDB syncing — [Gemini]

---

### Shopping Trip Mode — [Claude]

**Problem it solves:**
- The shopping list is generated, but the shopping *experience* isn't designed.
- You're manually checking off items on a static list while navigating a store.

**Why high-leverage:**
- Shopping is high-friction that happens *before* the app's core value (live cooking). A delightful shopping experience primes users to trust the cooking experience.
- Natural "first touch" for helpers who might not cook but can shop.

**Compounds with:**
- Same UI patterns (large touch targets, swipe-to-complete, progress tracking) translate to Live Execution. You're building muscle memory.

**Implementation:**
- Reorders items by typical store layout
- Swipe-to-check with large touch targets (cart-friendly)
- Shows "for: Green Bean Casserole" on each item
- Tracks what you skipped ("Couldn't find X—substitute?")

---

### Kitchen Walkthrough / Pre-Cook Prep Check — [Claude, Gemini] 🔺 CONSENSUS

**Problem it solves:**
- Live Execution assumes everything is ready when you hit "Start."
- In reality, people forget to preheat, haven't defrosted the turkey, or don't have clean counter space.
- The first 10 minutes become chaos.

**Why high-leverage:**
- Catches 90% of the "oh no" moments that derail meals.
- Cheap to build (just a checklist generated from existing data).
- Creates a ritual that makes users feel prepared and calm.

**Compounds with:**
- Walkthrough surfaces dependencies the planner might have missed ("wait, both dishes need the stand mixer at the same time?"), which feeds back into better planning.

**Claude version ("Kitchen Walkthrough"):**
- Before "Start," offer a 2-minute walkthrough
- "Confirm oven is preheating to 350°"
- "Confirm turkey is fully thawed"
- "Confirm counter space is clear for pie assembly"

**Gemini version ("Prep-Ahead Protocol"):**
- Tags every step as "Doable 2 days before," "Doable 1 day before," or "Must do live"
- Generates a "Saturday Prep List" automatically
- Flattens the stress curve

---

### Smart Ingredient Substitution Engine — [Codex]

**Problem it solves:**
- "I'm at the store and they're out of heavy cream—what can I substitute?"
- Reduces last-minute panic and failed recipes.

**Why high-leverage:**
- Relatively simple (database of substitutions + AI for context).
- Compounds with shopping lists, recipe scaling, dietary constraints.
- High user value: prevents meal disasters.

**Compounds with:**
- Shopping lists (show substitutions in-store)
- Dietary constraints (suggest vegan alternatives)
- Recipe preservation (learns family's preferred substitutions)

**Implementation:**
- Database of common substitutions (cream → milk + butter, etc.)
- AI context awareness ("Don't substitute in custards")
- In-app quick access during shopping or cooking

---

### "Last Time We Made This" Intelligence — [Codex]

**Problem it solves:**
- "Did we make enough last time? What went wrong? What did everyone love?"
- Turns past meals into learning data.

**Why high-leverage:**
- Uses existing data (cooking session logs, post-meal notes).
- Low implementation cost (aggregate and display).
- High emotional value (preserves family memories).

**Compounds with:**
- Informs scaling decisions ("Last time we made 18 servings and had leftovers")
- Suggests improvements ("You noted 'more garlic' last time")
- Creates meal traditions ("We always make this for Christmas")

**Implementation:**
- Auto-link current meal to past meals with same recipes
- Show "Last time" card with notes, photos, guest count, what worked/didn't
- "Copy adjustments from last time" button

---

### Post-Game Analysis — [Gemini]

**Problem it solves:**
- You forget what went wrong last year.

**Why high-leverage:**
- Turns the app into a learning tool, not just a static record.

**Compounds with:**
- Warnings pop up *next time* you add that recipe.

**Implementation:**
- Automatic prompt 2 hours after "Serve Time": "Did the turkey dry out? Was the gravy salty?"
- Save as "Warnings" for future use.

---

### Potluck / Guest Portal — [Gemini]

**Problem it solves:**
- The host does everything.
- Guests ask "What can I bring?"

**Why high-leverage:**
- Spreads brand awareness to guests without friction.
- Solves coordination dance.

**Compounds with:**
- Viral growth mechanism.

**Implementation:**
- "Magic Link" for guests—no app download required.
- They see the menu, can claim a "To-Bring" item (wine, dessert), or enter dietary restrictions directly.

---

### Hands-Free / Voice Mode — [Codex, Gemini, GPT] 🔺 CONSENSUS

**Problem it solves:**
- Hands are wet/floured; touching screens is annoying; voice is natural mid-cook.
- In a messy kitchen, "Hey Sunday, what's next?" is better than touching a screen.

**Why high-leverage:**
- A narrow command set ("next step", "start 10 min timer", "mark done", "what's next") delivers huge perceived magic.
- Reduces phone distraction.

**Compounds with:**
- Live Execution and Kitchen Display.
- Reduces missed tasks and helper confusion.

**State-of-art note:** Consider OpenAI Realtime API or Deepgram for low-latency voice. Whisper is fine for async transcription. — [Claude, Gemini]

---

### Calendar Integration + Prep Scheduling — [GPT]

**Problem it solves:**
- The real failure mode is days-before prep (thaw, brine, shop), not just the last hour.

**Why high-leverage:**
- Turning the plan into scheduled reminders ("shop Friday", "start brine Saturday") increases success dramatically.

**Compounds with:**
- Reuses planning engine + shopping list.
- Makes "planning → execution" continuous.

---

### Smart Kitchen Integration — [Grok]

**Problem it solves:**
- Families use multiple devices/apps during cooking—timers on phones, recipes on tablets, shopping lists on paper. This creates coordination friction.

**Why high-leverage:**
- Single integration point with popular kitchen apps (Google Keep, AnyList, native iOS timers) using webhooks/shortcuts.
- Low effort (webhook APIs exist), high value (eliminates context switching).

**Compounds with:**
- Live timeline could auto-sync with phone timers.
- Shopping list apps could receive real-time updates.
- Audio recordings could be sent to voice memo apps.

---

### Recipe Skill Progression — [Grok]

**Problem it solves:**
- Intimidated cooks avoid complex recipes. New cooks need ramp-up challenges.

**Why high-leverage:**
- AI analyzes recipe complexity, suggests modifications for skill levels, tracks successful completions.
- Uses existing Claude integration with minimal new UI.

**Compounds with:**
- Preservation features (past successes inform recommendations).
- Planning (chat can suggest "easier version for Sarah").

---

### Ambient Coordination — [Grok]

**Problem it solves:**
- During live execution, family members need awareness without constant phone checking.

**Why high-leverage:**
- Smart displays/speakers show timeline status, announce upcoming tasks, celebrate completions.
- Uses existing push notification infrastructure.

**Compounds with:**
- Makes live mode more social (everyone hears celebrations).
- Reduces phone distraction.
- Works with helper views.

---

### Atmosphere Integration — [Gemini]

**Problem it solves:**
- "Good" manages the food. "Insanely Great" manages the atmosphere.

**Implementation:**
- Integration with Spotify/Sonos.
- Playlist starts "Chill" during prep, switches to "Dinner Party" when you hit "Serve."

*Note: This is the only idea with some ⚠️ potential scope creep risk—may be Phase 6+ polish.*

---

## 4. Jobs Innovation Lens

### How can I make the complex appear simple?

**Where complexity is leaking into UX:**

1. **Extraction uncertainty** — Users see AI output and don't know what to trust. Is "1 T butter" tablespoon or teaspoon? — [Claude, Grok]

2. **Timeline generation** — The Gantt chart exposes the scheduling problem's complexity. Users think "too many lines, where do I look?" — [Claude, Codex]

3. **Recalculation** — When you're behind, the last thing you want is an algorithm explaining 12 cascading changes. — [Claude, GPT]

4. **Scaling calculations** with chemistry warnings feel like "work." — [Grok]

5. **Multi-device sync** feels fragile. — [Grok]

**How to abstract it away:**

1. **Don't show confidence—show action.** Instead of "85% confident this is 1 Tbsp," ask: "Is this Tablespoon or teaspoon?" Only surface uncertainty as a decision. — [Claude, GPT] 🔺 CONSENSUS

2. **Hide the timeline until they need it.** Default to "Now / Next / Soon" cards. The Gantt is an expert view for hosts who want the whole picture. — [Claude, Codex, GPT] 🔺 CONSENSUS

3. **One adjustment at a time.** When recalculating, don't show new timeline—show one change: "Push mashed potatoes back 15 minutes? (Yes / Adjust differently)" — [Claude, GPT]

4. **"The 15-minute Buffer."** Don't ask user to pad times. System silently injects "changeover" time so schedule never feels impossible. — [Gemini]

5. **Separate "what" from "how."** User chooses menu + serve time; system handles constraints invisibly. — [GPT]

6. **Confidence surfaces.** Show uncertainty only when it affects decisions ("This step duration is unknown—estimate?"). — [GPT]

7. **Show "why" hints:** "Green beans start now because they need 30 min to cool before serving." Add tooltips/explanations for timeline decisions, "Show reasoning" toggle. — [Codex]

8. **Auto-resolve timing conflicts with smart suggestions** ("move green beans to oven when turkey comes out"). — [Grok]

9. **"Magic undo"** for failed extractions—one-click retry with different AI parameters. — [Grok]

10. **"Family brain"** that remembers and anticipates ("we always run 15min late on desserts"). — [Grok]

**The principle:** Complexity should be *available*, not *default*. Progressive disclosure is your friend. — [Claude, Codex, GPT] 🔺 CONSENSUS

**Recommendation:** Add "Explain" buttons throughout the app that reveal reasoning behind AI decisions. Make complexity optional but accessible. — [Codex]

---

### What would this be like if it just worked magically?

**The zero-friction ideal (aggregated from all tools):**

I take three photos of handwritten recipe cards. I say "Thanksgiving, 20 people, serve at 5." The app responds: "Got it. Start cooking at 11:30. Shop by Wednesday. Here's who should do what."

My sister opens a link and sees only her tasks. During cooking, I glance at my phone and see exactly one thing: what to do now. When I fall behind, the app says "delay serving 20 minutes?" and I say yes. After dinner, it asks "anything to remember?" and I mumble a voice note.

The app anticipates needs before I know I have them. Walking into the kitchen, devices automatically sync. Timeline adjusts based on who's actually there and what ingredients I really have. Voice commands work even with cooking noise. Failed recipes get better suggestions next time. Family members get notified only when they need to act.

**What must be true for this to happen:**

| Requirement | Source |
|-------------|--------|
| Recipe extraction works on 95%+ of handwritten cards | Claude |
| 99%+ extraction accuracy, auto-correction for common errors | Codex |
| Timeline generation is instant and trustworthy (deterministic, not LLM for core algorithm) | Claude, Codex, GPT |
| State sync is invisible (Supabase Realtime works, or robust local-first fallback) | Claude, GPT |
| Notifications actually fire (PWA install, permissions, iOS workarounds solved) | Claude |
| Voice capture just works (Whisper fast enough for no perceived delay) | Claude |
| Rich family meal history, preference learning, dietary constraint understanding | Codex |
| Smart task detection, predictive notifications, contextual help | Codex |
| Presence detection, skill matching, seamless real-time sync | Codex |
| Seamless device integration (iCloud/Google ecosystem) | Grok |
| Robust AI context awareness (remembers everything about your kitchen) | Grok |
| Predictive modeling of cooking delays based on family patterns | Grok |
| Zero-latency real-time sync across all devices | Grok |
| Voice recognition that works in noisy kitchens | Grok |

**The hardest part:** It's not any one of these—it's that *all of them* must work, every time. Architecture should optimize for "never break during live cooking" above all else. — [Claude]

---

### What's the one thing this absolutely must do perfectly?

**All 5 tools agree: Real-time execution reliability / Live Timeline Execution.** 🔺 CONSENSUS

Not recipe extraction (human fallback possible). Not conversational planning (users can edit directly). Not audio memories (nice-to-have).

The one thing is: **When you tap "Start" and begin cooking, the app must never lose state, never show the wrong task, never miss a timer, and never leave you wondering what's next.** — [Claude]

**What "perfect" means:**
- **Accuracy:** Timeline is always correct, accounting for all dependencies — [Codex]
- **Reliability:** Works offline, syncs flawlessly, never loses progress — [Codex]
- **Clarity:** Anyone can understand what to do next, even under stress — [Codex]
- **Resilience:** Handles delays gracefully, recalculates intelligently, never creates impossible schedules — [Codex]
- **Sync:** If my phone says "Put in oven" and partner's phone is lagging and says "Prep Salad," trust is destroyed. State sync must be sub-second and conflict-free. — [Gemini]

**Is the roadmap organized around protecting this?**

- ✅ Live Mode correctly called "killer feature" — [Claude, Codex, GPT]
- ✅ Phase 2 is dedicated to it — [Codex]
- ⚠️ It's in Phase 2, not Phase 1—foundational architectural decisions might be made without Live Mode constraints in mind — [Claude]
- ⚠️ Phase 1 timeline is "static"—consider making it interactive earlier — [Codex]
- ⚠️ Recalculation algorithm is vague—needs more detail — [Codex]
- ⚠️ Offline mode isn't mentioned—should be Phase 2 — [Codex]
- ⚠️ No explicit "reliability work" in any phase—no mention of offline, conflict resolution, state recovery — [Claude]
- ⚠️ Success metrics focus on latency/frame rate, not reliability (% sessions with zero dropped checkoffs, notification delivery rate) — [Claude]
- ❌ **Not sufficiently protected.** Treated as equal to other features. Needs dedicated risk mitigation, extensive testing before other features, fallback mechanisms from day one, success metrics focused on execution reliability. — [Grok]

**Recommendation:** Add "Live Mode Reliability" as a cross-cutting concern from Phase 1. Every architectural decision should be evaluated: "Does this make Live Mode more or less trustworthy?" Consider splitting Phase 2 into "Timeline Core" (weeks 4-5) and "Timeline Polish" (week 6). — [Claude, Codex]

---

### How would I make this insanely great instead of just good?

**The difference between "use" and "recommend":**

A *useful* app helps you cook a meal. An *insanely great* app makes you feel like a better host, strengthens family bonds, and creates traditions that outlast the technology. — [Claude]

| Good | Insanely Great | Source |
|------|----------------|--------|
| Stores recipes | Surfaces "remember when Mom taught you this?" at the right moment | Claude |
| Generates a timeline | Makes you feel calm and in control, even when behind | Claude, GPT |
| Supports collaboration | Makes helpers feel genuinely useful, not like they're following orders | Claude, GPT |
| Preserves audio | Captures the story in a way that makes you cry 20 years later | Claude |
| Functional tool | Becomes part of family tradition, evokes nostalgia, creates joy | Codex |
| Predictable features | "You've made this 10 times—here's your improvement timeline" or "Sarah's favorite dish is ready!" | Codex |
| Shareable links | Beautiful meal summaries auto-generated, easy sharing, "Sunday Dinner Stories" | Codex |
| Preserves recipes | Helps family become better cooks, tracks skill development, suggests new techniques | Codex |

**Gaps to close:**

1. **Emotional texture.** The roadmap is feature-focused, not feeling-focused. What's the emotional arc of using this app? (Anticipation → Confidence → Flow → Pride → Nostalgia) — [Claude, Codex, GPT, Grok] 🔺 CONSENSUS

2. **Ritual design.** Great products become rituals. What's the ritual here? "Start the meal" moment that feels significant? "Meal complete" celebration? "Year in review" for December? — [Claude]

3. **Compounding value.** Each use should make the next use better. Does the app learn you always run 15 minutes late on desserts? Remember your oven runs hot? Know Aunt Carol always brings too much wine? — [Claude, Grok]

4. **Shareability.** People recommend products that make them look good. What does someone *share* from Sunday Dinner? Beautiful photo of meal? "We cooked 23 hours of food together this year" stat? Recipe card to text to a friend? — [Claude, Codex]

5. **Delight features.** Celebration animations on meal completion. Auto-generated "Meal Story" with photos/timeline/notes. "Cooking Stats" dashboard. "Try Something New" suggestions. — [Codex]

6. **Family legacy building.** Automatic photo stories, recipe evolution trees, "this dish connects to family history." — [Grok]

7. **Long-term engagement.** Features that get better the more you use them (learning preferences, predicting needs). — [Grok]

**The gap in one sentence:** The roadmap describes a tool. To be insanely great, it needs to describe a *relationship*—with your family, your traditions, and your past. — [Claude]

**The roadmap is competent but conservative.** To be insanely great, it needs features that make families say "We couldn't have done this without Sunday Dinner" rather than "This app was helpful." — [Grok]

**Recommendation:** Add "Delight Features" to Phase 5: celebration animations, auto-generated Meal Story, Cooking Stats dashboard, "Try Something New" suggestions. — [Codex]

---

## 5. Technical Considerations

### Architectural Concerns

#### Supabase as Sole Backend

- **Risk:** Realtime has scalability limits; vendor lock-in for auth, storage, and DB. — [Claude, Codex, GPT, Grok] 🔺 CONSENSUS
- **Mitigation:** Abstract Supabase behind service interfaces from day one. If you can swap to Firebase or self-hosted Postgres + LiveKit in 1 sprint, you're fine. — [Claude]
- **Specific concern:** Realtime can be expensive at scale, may have latency issues. With 10+ family members + 3 devices each + chatty sync, you could hit message limits. — [Claude, Codex]
- **Recommendation:** Add Phase 2 technical spike: load test Supabase Realtime with 10 concurrent users, measure latency, evaluate alternatives (Socket.io, Pusher, Liveblocks, PartyKit) if needed. Smart subscriptions: helpers only subscribe to their tasks, not full timeline. — [Claude, Codex]

#### LLM for Core Logic

- **Risk:** Using LLM for timeline generation means latency, cost, and non-determinism make testing hard. — [Claude, Codex, Gemini, GPT] 🔺 CONSENSUS
- **Recommendation:** Use LLM for *understanding intent* and *generating suggestions*, but use **deterministic algorithms** for core scheduling. The scheduler should be pure functions with 100% unit test coverage. Build core scheduler as pure TypeScript function that runs in <100ms. Only use LLM for explaining changes or handling edge cases. — [Claude, GPT]

#### AI Provider Lock-in

- **Risk:** Claude + Whisper creates vendor risk. What if pricing/terms change? — [Claude, Gemini, GPT, Grok] 🔺 CONSENSUS
- **Recommendation:** Use abstraction layer (LangChain, Vercel AI SDK) that lets you swap models per-task. Vision might be better on GPT-4o; chat might be better on Claude. Don't lock to "Sonnet 4" in the roadmap. — [Claude, Gemini, Grok]

#### Vercel Serverless Timeouts

- **Risk:** Function timeouts (10-60s) will break AI orchestration. Parsing 5 recipes and generating a schedule is heavy. — [Claude, Gemini] 🔺 CONSENSUS
- **Recommendation:** Move heavy AI work (batch extraction, long planning conversations) to queue-based worker (Inngest, Trigger.dev, or Vercel's background functions). — [Claude, Gemini]

#### Client State Management

- **Risk:** React Query is fine for server state, but Live Mode is complex client+server state. — [Claude, Grok]
- **Recommendation:** Consider colocating Live Mode state in dedicated store (Zustand or Jotai) with explicit sync to Supabase. This makes offline mode easier. — [Claude]
- **Additional concern:** Client-heavy state without clear source of truth. Live Mode needs strong invariants (server-time anchor, durable checkoffs, conflict resolution). — [GPT]

#### Timeline Artifacts

- **Risk:** Persisting "generated timeline" without lineage. — [GPT]
- **Recommendation:** Version plan artifacts ("v3 plan") with diffs and rollback. — [GPT]

#### Other Architectural Notes

- **Next.js version:** Consider Next.js 15 for React 19 features (better Server Components, improved caching). Document why if sticking with 14. — [Codex]
- **Radix UI flexibility:** Use "Radix UI primitives OR shadcn/ui" to allow flexibility. Consider React Server Components patterns more explicitly. — [Codex]
- **Schema validation:** Zod (or similar) at boundaries (AI outputs, DB writes, realtime payloads) to prevent "AI-shaped data" corruption. — [GPT]
- **No testing strategy mentioned.** No code review processes or architectural decision records. — [Grok]

---

### Mobile/Tablet Responsiveness

#### Gantt Timeline on Mobile

- **Problem:** Horizontal scroll on vertical screens is awkward. Gantt charts are notoriously terrible on mobile. — [Claude, Codex, Gemini, GPT, Grok] 🔺 CONSENSUS
- **Recommendation:** Build "Now/Next/Later" stack view as primary mobile interface. Gantt is desktop/landscape only. Or vertical list with time indicators, or pinch-to-zoom. — [Claude, Codex, Gemini]

#### Chat + Plan Split View

- **Problem:** Can't show both on a phone. — [Claude, Codex, GPT]
- **Recommendation:** Use bottom sheet or full-screen modal for chat. Don't try to split. Add "Chat summary" view for mobile, collapsible threads, voice input prominent. Plan for tabs/bottom sheets and fast context switching on small screens. — [Claude, Codex, GPT]

#### Kitchen Display Mode

- **Problem:** Tablets in landscape, potentially mounted. 10+ feet viewing distance. — [Claude, Codex]
- **Recommendation:** Design as separate layout, not responsive version. Assume large viewing distance. Add "Keep screen on" option, "Do Not Disturb" integration, landscape lock. Prevent screen lock, handle interruptions (calls, notifications). — [Claude, Codex]

#### Audio Recording on iOS

- **Problem:** iOS Safari is finicky with MediaRecorder. — [Claude]
- **Recommendation:** Test extensively on iOS Safari. Consider "record to cloud" fallback if client-side fails. — [Claude]

#### Drag-and-Drop Timeline Editing

- **Problem:** Touch drag is imprecise. — [Claude, GPT]
- **Recommendation:** Use tap-to-select + action buttons instead of drag. Or accept timeline editing is desktop-only. Dense controls and drag interactions fail in kitchens; default to tap-first, big targets. — [Claude, GPT]

#### Photo Upload

- **Problem:** Mobile should use native camera, not file picker. — [Codex]
- **Recommendation:** Add Phase 1 task: "Native camera integration for mobile recipe photos." — [Codex]

#### Timeline Visualization Touch

- **Problem:** Horizontal scroll needs pinch-to-zoom, landscape optimization. — [Grok]
- **Recommendation:** Multi-touch gestures (pinch, swipe) need design. — [Grok]

---

### State-of-the-Art Recommendations

#### AI Models

- **Don't lock to a specific model.** Use abstraction (LangChain, Vercel AI SDK) to swap per-task. — [Claude, Gemini, Grok]
- **Consider GPT-4V for vision** (potentially better OCR) and Claude 3.5 Sonnet (newer model). — [Grok]

#### Real-time / Offline

- **Biggest gap: Offline not mentioned.** Add PWA + Service Worker + IndexedDB from Phase 1. Consider Replicache or ElectricSQL for true local-first. — [Claude, Codex, Gemini, GPT] 🔺 CONSENSUS
- **Supabase Realtime is fine for now,** but evaluate Liveblocks or PartyKit if you need sophisticated conflict resolution or presence. — [Claude]
- **Consider Socket.io or WebSockets** over Supabase Realtime for more control. — [Grok]

#### Voice

- **For real-time voice commands during cooking,** consider OpenAI Realtime API or Deepgram for lower latency. Whisper is fine for async transcription. SOTA is now low-latency voice-to-voice. — [Claude, Gemini]

#### Animation

- **Framer Motion is good choice,** but ensure you're using `layout` animations and not triggering reflows. Test on low-end tablets. — [Claude]
- **Consider View Transitions API** (Chrome 111+) for page transitions, reduces animation complexity. Add to Phase 5: evaluate for route animations. — [Codex]

#### React Patterns

- **Leverage RSC for recipe data fetching,** reduce client-side JavaScript. Add Phase 1: "Implement RSC patterns for recipe list/display." Lean into RSC/server actions for read-heavy screens; reserve client state for Live Mode + realtime. — [Codex, GPT]
- **Consider tRPC** for type-safe APIs instead of REST. — [Grok]

#### Push Notifications

- **Use Web Push API** (supported in modern browsers) instead of third-party services. More control, lower cost. — [Codex]

#### Storage

- **Consider IndexedDB** for offline recipe storage. Use Dexie.js or similar for easier API. Critical for mobile reliability. — [Codex]

#### Performance Tools

- **Playwright is good** but consider Visual Regression Testing for design system consistency. — [Grok]

---

### Performance / Scalability

#### Image Storage Costs

- **Problem:** High-res photos of recipes + originals + finished dish photos adds up fast. Will burn through storage limits and bandwidth. — [Claude, Codex, Gemini] 🔺 CONSENSUS
- **Recommendations:**
  - Client-side compression before upload (target <500KB for recipe cards) — [Claude]
  - Progressive JPEG for fast preview loads — [Claude]
  - Lifecycle policy to move old images to cold storage — [Claude]
  - WebP, responsive images from Phase 1 — [Codex]
  - Consider CDN (Cloudflare Images, ImageKit) — [Codex]
  - Optimize on upload (Cloudinary/Uploadcare or sharp on lambda) — [Gemini]

#### AI API Costs

- **Problem:** Vision + chat + transcription per meal could easily hit $2-5. At scale, becomes expensive. — [Claude, Codex, Grok] 🔺 CONSENSUS
- **Recommendations:**
  - Caching of extraction results (don't re-extract unchanged images) — [Claude]
  - Rate limiting on chat (cap tokens per meal) — [Claude]
  - Cost tracking per user (for future monetization) — [Claude]
  - Cost monitoring from Phase 1 — [Codex]
  - Consider local OCR alternatives for common recipes — [Codex]
  - Implement request queuing, retry logic, user-friendly error messages — [Grok]
  - Claude API caching for common requests — [Codex]

#### Real-time Fanout

- **Problem:** 8 family members × 3 devices + chatty sync protocol could hit Supabase message limits. — [Claude, Codex, GPT]
- **Recommendations:**
  - Smart subscriptions: helpers only subscribe to their tasks — [Claude]
  - Use presence sparingly — [Claude]
  - Load testing in Phase 2 — [Codex]
  - Optimistic updates to mask latency — [Codex]
  - Correct RLS + filtered subscriptions — [GPT]

#### Timeline Recalculation

- **Problem:** If LLM-powered and takes 5+ seconds, users will hate it. — [Claude, Codex, Grok]
- **Recommendation:** Build core scheduler as pure TypeScript function that runs in <100ms. Only use LLM for explaining changes or edge cases. Add performance profiling from Phase 1, consider Web Workers for timeline calculation. — [Claude, Codex]

#### Database Performance

- **Problem:** Complex queries (timeline generation, recipe search) may be slow. — [Codex]
- **Recommendation:** Add database indexes from Phase 1. Consider full-text search (PostgreSQL FTS or Algolia) for recipe search in Phase 3. — [Codex]

#### Mobile Bundle Size

- **Problem:** Many dependencies (Framer Motion, Tiptap, RecordRTC, etc.) = large bundle = slow mobile load. — [Codex]
- **Recommendation:** Code splitting, lazy loading, tree shaking. Add bundle size monitoring from Phase 1, target <200KB initial load. — [Codex]

#### Audio Processing

- **Problem:** Client-side recording + server-side transcription needs efficient pipelines. — [Grok]

#### Timeline Rendering

- **Recommendation:** Virtualization + minimal animation during active cooking; prioritize smooth scrolling and readability. — [GPT]

---

## Appendix: Tool-by-Tool Raw Notes

Any feedback that didn't fit cleanly above, captured so nothing is lost.

### Claude

- **Naming alternatives considered section is good** — shows thoughtful product positioning.
- **Recipe quick cards should be printer-friendly, one page per dish.**

### Codex (Composer)

- **Consider "Magic Mode" as Phase 6 feature** that learns from usage and reduces manual input over time.
- **"Try Something New" suggestions** based on family preferences.
- **Consider WASM for timeline calculation** if it becomes a bottleneck (likely not needed initially).
- **Database query performance:** Consider PostgreSQL FTS or Algolia for recipe search in Phase 3.

### Gemini

- **Good:** Data model approach with Meal → Recipes → Timeline structure.
- **The abbreviation dictionary concept:** Learn that "T" means Tablespoon for *this* user but Teaspoon for *that* user — per-user customization.
- **Resource contention flagging should happen before shopping**, not during cooking.

### GPT (gpt52.md)

- **Version plan artifacts** with diffs and rollback — don't persist generated timeline without lineage.
- **Pull thin slice of permissions + share links earlier** so Phase 2 delegation is real.
- **Add Resilience track alongside Phase 2** (offline/PWA, wake lock, durable progress).
- **Phase 2 acceptance criteria should focus on trust:** No lost progress, clear next action, graceful degradation.
- **"Use original only" mode** for when AI extraction can't be trusted.
- **Consent/privacy concerns for audio recordings** — sharing rules, deletion policies.
- **Collapse complexity:** "Show me only what matters in the next hour."

### Grok

- **Monetization considerations unclear** — even for personal use, unclear if scales to multi-family without revenue model.
- **Competitive analysis missing** — what differentiates from Paprika, Plan to Eat, etc.?
- **User research methodology** — how will assumptions about family workflows be validated?
- **Recipe preservation features (audio, versioning) could be developed in parallel with live mode** — sequencing isn't explicit.
- **Data model assumptions may not hold up** under real family collaboration scenarios.
- **Consider CQRS pattern** for live execution if Supabase hits limits.
- **Prototype live execution first** (dedicated 2-week spike) before committing to full architecture.
- **Add feature flags** for gradual rollout of complex features.
- **Add usage analytics from day one** to understand real performance bottlenecks.

---

## Summary: Highest-Priority Actions

Based on the consensus across all 5 tools:

### Before Phase 1

1. **Write a "Recalculation Spec"** — inputs, constraints, output contract, deterministic vs LLM-powered operations. This is the hardest problem and currently lives in 6 words.

2. **Add "Non-Goals" section** — what you're explicitly NOT building. Protects scope.

3. **Add "Risks & Mitigations" section** — top 3 technical risks and fallbacks.

4. **Move design system details to separate `DESIGN_SYSTEM.md`** — keep mood/vibe in roadmap, not hex codes.

5. **Create dependency graph** — "X requires Y" statements that surface hidden work.

### Phase 1 Changes

6. **Add Offline/Local-First architecture** — Service Worker + IndexedDB from day one. Your killer feature cannot depend on perfect connectivity.

7. **Add recipe extraction review/correction UI** — don't assume 90% accuracy out of the gate.

8. **Add Quick Actions UI alongside chat** — buttons for common actions to reduce chat dependency.

9. **Abstract AI providers** — don't lock to "Sonnet 4"; use layer that allows model swapping.

### Phase 2 Changes

10. **Design the "2-second glance" view** — default is "Now/Next," not Gantt. Answer "what now?" without scrolling.

11. **Add reliability metrics** — "Zero lost checkoffs," "Notification delivery >95%," "5-min offline recovery."

12. **Split Phase 2** — "Timeline Core" (weeks 4-5) and "Timeline Polish" (week 6) to ensure core works perfectly first.

13. **Pull minimal permissions/share links earlier** — so delegation actually works.

---

*This consolidation preserves all feedback from all 5 tools. Consensus items are the highest-signal opportunities. The roadmap has a clear vision and identifies the right killer feature—the gap is in protecting it with reliability, resilience, and realistic specifications.*



FEEDBACK PART 2
Composer:
Assessment of the updated roadmap:
What's excellent
1. Focused scope
Single-user focus removes multi-user complexity
"Good enough for now" stance is pragmatic
Clear "Out of Scope" section prevents creep
2. Key decisions table
Locks in architectural choices early
LLM-assisted hybrid approach balances flexibility and validation
Now/Next/Later as default is a strong mobile-first choice
3. Risk mitigation
Identifies risks with concrete mitigations
Polling-first for share links is pragmatic
Manual override for validation conflicts is smart
4. V2 parking lot organization
Well-categorized and easy to reference
Prioritization suggestions are helpful
Open questions section shows forward thinking
Areas to strengthen
1. Foundation phase — missing critical pieces
Issue: Foundation doesn't include error handling or loading states.
Recommendation: Add to Foundation:
[ ] Error boundaries — React error boundaries for graceful failures
[ ] Loading state patterns — Skeleton screens, spinners, consistent loading UX
[ ] Toast/notification system — For success/error messages (needed for checkoff feedback)
[ ] Form validation — Basic validation patterns for meal setup, recipe editing
Rationale: These are needed across features. Building them later causes rework.
2. Feature 1: Recipe Ingestion — confidence scores unclear
Issue: "Highlight uncertain fields (yellow border) based on Claude confidence" — but Claude Vision doesn't return confidence scores.
Recommendation: Clarify implementation:
Option A: Use Claude's structured output and flag fields that differ from expected patterns
Option B: Add a second pass where Claude reviews its own extraction ("Rate confidence 1-10")
Option C: Flag fields that are empty or contain unusual characters
Also add: What happens if extraction completely fails? Fallback to manual entry flow?
3. Feature 3: Timeline Generation — validator scope
Issue: "Deterministic validator checks for conflicts" but validator logic isn't specified.
Recommendation: Add to Feature 3 scope:
[ ] Validator rules:
No two tasks requiring same equipment (oven, mixer) at overlapping times
Task dependencies respected (prep before cook)
No negative durations
Serve time is after all tasks complete
[ ] Conflict resolution UI: How conflicts are displayed (red highlight? warning banner?)
4. Feature 5: Live Execution — "Running behind" flow needs detail
Issue: "Claude suggests ONE adjustment" — what if the suggestion is wrong or insufficient?
Recommendation: Expand the flow:
[ ] Suggestion display: Show what changes ("Move 'Mash potatoes' from 4:45 to 5:00?")
[ ] "Adjust differently" button: Request alternative suggestions (max 3 attempts?)
[ ] Manual override: "I'll fix it myself" → jump to timeline edit mode
[ ] Undo: If user accepts suggestion but regrets it
5. Feature 6: Share Links — expiration logic
Issue: "Link expires after meal serve time + 24 hours" — what if serve time changes?
Recommendation: Clarify:
Expiration recalculates if serve time is edited
Or: Expiration is fixed at link creation time (simpler)
Add: "Link expired" UI for viewers
6. Build sequence — timeline concerns
Issue: Week 4 combines Meal Setup + Timeline Generation. Timeline is complex.
Recommendation: Consider splitting:
Week 4: Meal Setup only (create meal, add recipes, scale)
Week 5: Timeline Generation + Shopping List
Week 6: Live Mode (Part 1) — basics only
Week 7: Live Mode (Part 2) + Share Links + Polish
Rationale: Timeline generation is the core feature. Rushing it risks quality.
7. Missing: Data migration strategy
Issue: No plan for moving from v1 to v2 when adding multi-user.
Recommendation: Add to V2 Parking Lot:
Data migration: How to convert solo user's data to family account
Backward compatibility: Can v1 users upgrade without losing data?
Technical concerns
1. Service Worker caching strategy
Current: "Service Worker caches current meal state"
Concern: What exactly gets cached? Full meal data? Recipe images? Timeline?
Recommendation: Specify:
Cache current meal (recipes, timeline, tasks)
Cache recipe images (up to 50MB?)
Cache app shell (HTML, CSS, JS)
Don't cache: other meals, recipe library (too large)
2. Offline sync queue implementation
Current: "Checkoffs queued if offline, sync when back"
Concern: What if user closes browser before sync? What if sync fails?
Recommendation: Add to Feature 5:
[ ] Persistent queue: Store in IndexedDB, not just memory
[ ] Retry logic: Retry failed syncs on reconnect (exponential backoff)
[ ] Conflict detection: What if timeline changed while offline? (v1: last-write-wins is fine)
3. Share link security
Current: "No auth required for viewers"
Concern: How do you prevent link guessing? Random tokens?
Recommendation: Specify:
Links use cryptographically random tokens (32+ characters)
Tokens are unguessable (UUID v4 or crypto.randomBytes)
Add to Risk section: "Link guessing" → mitigated by long random tokens
V2 parking lot feedback
Excellent organization
Categories are logical
Notes are helpful
Prioritization suggestions are sound
Missing from parking lot
Recipe search/filtering — Not mentioned, but needed for v2 when recipe library grows
Bulk operations — "Delete 10 old meals", "Export all recipes"
Recipe import/export — JSON/PDF export for backup
Prioritization suggestion
Consider adding to "High value, lower effort":
Recipe search (simple text search, no need for Algolia initially)
Basic recipe editing (v1 has correction UI, but what about editing saved recipes?)
Overall assessment
Score: 9/10
Strengths:
Focused, achievable scope
Clear decisions and risks
Realistic timeline
Strong mobile-first UX choices
Minor gaps:
Some implementation details need clarification
Foundation could include more cross-cutting concerns
Timeline generation week might be tight
Final recommendations
Before starting development
Add error boundaries and loading states to Foundation
Clarify Claude Vision confidence score implementation
Specify validator rules for timeline generation
Add data migration strategy to V2 parking lot
During development
Week 4 might be tight — consider splitting Meal Setup and Timeline Generation
Test Service Worker on iOS Safari early (Week 2)
Build "Running behind" flow incrementally (start with manual override, add AI suggestions)
V2 planning
Multi-user is the right first priority
Consider recipe search earlier (needed before audio memories)
Data export should be higher priority (users will want backups)
This roadmap is strong and ready to execute. The focused scope and clear decisions should prevent major scope creep. The main risk is underestimating timeline generation complexity — consider adding a buffer week or splitting it.

GPT52
V1 roadmap — updated assessment
What’s materially better (vs the original roadmap)
Actionability: You now have explicit scope, “explicitly out,” acceptance criteria, and a build order per feature. That’s the biggest improvement—future-you can actually execute this.
Killer-feature protection: You made Live Mode concrete (Now/Next/Later default, offline timers, queued checkoffs, wake lock, “one suggestion” behind flow). That’s exactly the right direction.
Mobile/tablet reality: “Now/Next/Later as default” + “large text mode toggle” is a strong mobile-first anchor.
AI-risk containment: “LLM-assisted hybrid + deterministic validation” and “side-by-side correction UI” are the right guardrails.
Where it’s still too vague (highest-risk ambiguity remaining)
Deterministic validator spec (core trust surface): you say “oven overlap, impossible timing,” but you need to define the validator’s contract:
What inputs must exist per task (start time? duration? resource tags like oven temp?).
What constitutes a conflict in v1 (same oven at different temps? same oven at all? preheat as a task?).
What happens when invalid (block start? allow override? auto-fix suggestions?).
Task/time semantics: you reference “tasks in correct order” and “edit a task’s time and see timeline update,” but not:
Whether tasks have hard dependencies, whether overlap is allowed, and how “Now” is computed.
How edits affect downstream tasks (shift-all-after vs local-only).
“I’m behind” algorithm shape: the UX is well-scoped (“ONE adjustment”), but you still need a crisp rule for what Claude is allowed to change:
reorder vs retime vs compress durations vs change technique.
how you prevent “helpful but dangerous” adjustments.
Recipe normalization minimums: shopping list reconciliation implies a baseline of ingredient parsing/canonicalization that isn’t spelled out (units, pluralization, “to taste”, etc.). If you don’t define v1 rules, this will sprawl mid-build.
Where it’s over-specified (and could box you in)
“Key Decisions (Locked In)” is great, but a few “locked” items should be treated as defaults until proven:
PWA basics can still be surprisingly finicky on iOS; keep the UX resilient even if service worker behavior is inconsistent.
“Tap image region to jump to corresponding field” is potentially expensive complexity for v1; if it threatens timeline/live mode, demote it.
V1 “refactor in v2” stance: fine philosophically, but the risk is you accidentally bake in irreversible shapes. The minimum safeguard is to keep:
a stable domain model (Recipe/Meal/Task/Timeline) and
strict boundaries around AI I/O (schemas + versioning).
Dependencies & sequencing (are they clear and sane?)
Overall: yes, the order is logical and the build sequence matches dependencies well.
Two dependency watch-outs:
Shareable timeline link “auto-refreshes” depends on an update mechanism. You already noted a good mitigation: polling first. Keep that as the default until Live Mode is stable.
Offline + editing + live execution is a subtle combo. Your Live Mode scope includes queued checkoffs offline, but timeline edits offline can get gnarly—good that v1 is solo-user; just ensure you don’t accidentally enable offline edits that create reconciliation headaches.
Biggest remaining gaps to make V1 “state-of-the-art” (without expanding scope)
Quality gates: you have acceptance criteria, but you should also define a few “non-negotiable invariants” (beyond Live Mode):
data durability (no silent loss on refresh),
idempotent checkoffs,
deterministic “what’s next” behavior.
Security/privacy for share links: you have expiry, but no revocation in v1 (explicitly out). Consider whether “unguessable token + expiry” is sufficient for your use; just be aware it’s a common footgun if you later broaden audience.
iOS testing matrix: you mention iOS Safari testing (great). The critical matrix is: iOS Safari + installed PWA + background/lock/unlock + audio alerts + wake lock behavior.
V2 parking lot — updated assessment
What’s strong
Good categorization: it’s organized by capability area (multi-user, ingestion, planning, live execution, preservation, infra), which makes scoping v2 much easier.
Correct “v2 themes”: preservation, multi-user collaboration, and deeper planning are cleanly separated from v1.
What I’d adjust (still as guidance, not edits)
Promote a few “infra” items earlier than v2 if you plan to ship to anyone else:
Error monitoring (Sentry) and cost monitoring tend to be “wish we had this” the first time something breaks or API spend spikes.
Even for solo use, basic cost visibility can prevent unpleasant surprises from OCR/recalc loops.
Clarify the “prep-ahead protocol”: this is a high-leverage feature that compounds with planning/live mode; it may deserve to be top-tier in v2 (or a v1.5) because it addresses the biggest real-world failure mode (thaw/brine/shop).
Net: is the new plan more “pick-up-able” and priority-clear?
Yes. v1_roadmap.md is now the kind of document someone can implement from without constant re-deciding. The remaining risk isn’t lack of detail—it’s that the hard logic surfaces (validator/task semantics/recalc allowances) still need a small written spec so you don’t discover the rules accidentally while coding.
If you want, I can outline a one-page “Timeline/Task Semantics + Validator v1 Spec” (inputs, invariants, conflict rules, allowed edits, recalculation constraints) that matches your current scope and keeps the LLM safely boxed in.

GROK:
Updated Assessment: V1 Roadmap & V2 Parking Lot
This is a dramatic improvement from the original roadmap. You've transformed a conceptual document into an actionable execution plan. Let me break down what's working beautifully and suggest refinements.
✅ Major Strengths
1. Clarity & Actionability
Before: Vague phases with checkboxes and high-level goals
Now: Specific features with detailed scope, explicit exclusions, and measurable acceptance criteria
Impact: Someone (including future-you) can pick this up and know exactly what to build
2. Focused V1 Scope
Single user, complete experience: Photo → Plan → Execute → Share workflow
Killer feature protection: Live execution mode is properly scoped and sequenced
Realistic constraints: No multi-user complexity diluting the core experience
3. Smart Architectural Decisions
Hybrid timeline engine: LLM for generation + deterministic validation = best of both worlds
PWA basics over complex offline: Service Worker caching sufficient for solo use
AI abstraction layer: Future-proofs against model/vendor changes
Responsive toggle over dedicated layout: Simpler, more maintainable
4. Risk-Aware Development
Identified 5 specific risks with concrete mitigation strategies
Latency handling: "Thinking..." states and manual override options
Offline degradation: Clear fallback behavior
Validation edge cases: Logging and manual override capabilities
5. Organized V2 Parking Lot
Categorized by value/effort: Clear prioritization framework
Open questions addressed: Monetization, privacy, differentiation
Implementation notes: Specific details for when features get built
🔧 Suggested Refinements
Timeline Realism
Current: 7 weeks for solo developer
Suggestion: Consider 10-12 weeks total
Week 7 "Polish + Testing" might be optimistic for comprehensive iOS Safari + offline testing
Add buffer for unexpected AI integration complexity
Consider alternating deep work weeks with lighter integration weeks
Testing Strategy Enhancement
Add to Foundation phase:
Playwright setup for E2E tests
Visual regression testing for design system
Mock Claude API for development/testing
Success Criteria Addition:
[ ] 90%+ test coverage on critical paths (recipe extraction, timeline generation, live mode)
[ ] Offline functionality tested on actual iOS Safari (not just simulator)
Technical Debt Prevention
Add to Key Decisions table:
Decision	Choice	Rationale
State Management	React Query + Context	Simple for solo use, upgrade path to Zustand/Redux for multi-user
Error Boundaries	Global + Feature-level	Graceful degradation, user-friendly error messages
Logging	Console + Future analytics	Track user flows without privacy concerns
Live Mode Reliability
Add to Risk 5 (Timeline Validation):
Additional mitigation: A/B test Claude suggestions against deterministic fallbacks
Edge case handling: "Timeline corrupted - regenerate from recipes?" recovery flow
V2 Prioritization Refinement
High-impact additions to consider:
Recipe search/filtering (simple text search over recipes)
Basic recipe editing (modify extracted recipes inline)
Timeline export (share timeline as text/calendar format)
🎯 Assessment Summary
What This Achieves
Functional solo app: Complete photo-to-table workflow
Protected killer feature: Live execution mode with offline resilience
State-of-the-art foundation: Modern stack, AI integration, PWA capabilities
Mobile-first design: Responsive, accessible, kitchen-ready
Future-proof architecture: Clear upgrade paths, abstracted dependencies
Risk Level: LOW-MEDIUM
Technical risks are identified and mitigated
Scope is appropriately constrained
Dependencies are clear and sequenced
Success criteria are measurable
Recommended Next Steps
Spike the AI integration (1-2 days): Test Claude Vision accuracy on handwritten cards, measure latency
Prototype the Now/Next/Later UI (2-3 days): Validate the mobile kitchen experience
Create development environment (1 week): Get the foundation running with basic CRUD
Weekly check-ins: Reassess timeline after first 2 weeks of actual development
This roadmap now has the focus, clarity, and realism needed to successfully build Sunday Dinner. The transformation from the original document to this executable plan is impressive — you've taken comprehensive feedback and created something genuinely actionable.
Confidence level: High that this delivers a valuable, differentiated product in the timeframe specified. 🚀

GEMINI:
Assessment of v1_roadmap.md and v2_parking_lot.md
This is an exceptionally strong, disciplined, and actionable roadmap. You have successfully cut the scope down to the "vital few" features that deliver value to you (the primary user) while parking the complex "platform" features for later.
Here is my specific feedback:
1. What You Got Right (The "Smart Cuts")
Deferring Auth/Multi-User: This is the single biggest time-saver. By trusting yourself as the single admin, you save weeks of work on permissions, invites, and race conditions.
"Now/Next/Later" vs. Gantt: Real cooking isn't a Gantt chart; it's a queue. Focusing on the immediate "what do I do now" reduces cognitive load.
PWA over Native: For a solo/family app, a PWA is the perfect distribution channel. No App Store review wait times.
The "I'm Behind" Feature: Naming this explicitly and scoping it to "suggest ONE adjustment" is brilliant. It prevents analysis paralysis during a stressful moment.
2. Technical Watch-Outs for V1
While the feature set is right, here are three specific technical cliffs you might walk into:
iOS Wake Lock is Finicky: You mention "Large text mode... keeps screen on (wake lock)."
Reality: The Screen Wake Lock API on iOS Safari is relatively new and can break if the user switches tabs or minimizes.
Mitigation: Add a "No-Sleep.js" style fallback (playing a tiny, silent video loop) if the native API fails, or just explicitly test this on your iPad early in Week 5.
The "Shift" Fallback: You rely on Claude for the "I'm Behind" recalculation.
Risk: If the internet is spotty or Claude API is down, you are stuck.
Suggestion: Add a "dumb" fallback button: "Push Schedule +15 min". This requires zero AI—it just adds 15 minutes to every remaining timestamp. It’s crude but instant and works offline.
Image Storage vs. Bandwidth:
Risk: High-res photos from modern phones are huge (5MB+). If you just upload them raw to Supabase Storage and serve them back, your app will feel sluggish on bad kitchen WiFi.
Mitigation: Implement client-side compression (e.g., browser-image-compression) before upload. You only need enough resolution for OCR, not print quality.
3. One Process Suggestion
The "Dry Run" (Week 5.5): Don't wait for Week 7 to do an "End-to-end meal test." In Week 5, once you have "Live Mode Basics," cook a simple Tuesday night dinner (e.g., just Pasta + Salad) using the app. You will immediately discover if the buttons are too small or if the "Next" card doesn't update fast enough.

CLAUDE:
This is a dramatic improvement. You've addressed nearly every structural issue from my original feedback. Let me give you an updated assessment.
What's Now Excellent
1. Clear Scope Boundaries
The v1 goal is precise: "Plan a 20-person gathering with 2+ uploaded recipes. Beautiful, responsive, functional." Combined with the explicit "Out of Scope" table, this gives future-you a clear decision filter.
2. Key Decisions Are Locked (with Rationale)
The "Key Decisions" table is exactly what was missing. Particularly strong:
Now/Next/Later as default (not Gantt) — you internalized the "2-second glance" feedback
LLM-assisted hybrid for timeline — deterministic validation + LLM suggestions is the right architecture
Polling before Realtime for share links — pragmatic sequencing
3. Each Feature Has Acceptance Criteria
This is the difference between "build a thing" and "know when you're done." The Live Mode criteria are especially good:
> "Disconnect network; timers continue, checkoffs queue. Reconnect; queued checkoffs sync."
That's a testable requirement.
4. Risk Register with Mitigations
You've named the dragons:
LLM latency on recalculation
Claude Vision accuracy
Service Worker complexity
Supabase Realtime edge cases
Timeline validation gaps
Each has a specific mitigation. This is how you avoid being surprised.
5. The Parking Lot Is a Real Asset
The v2 doc isn't just a dumping ground—it's organized, annotated with "Why Deferred," and includes prioritization suggestions. This makes v2 scoping a 30-minute exercise, not a research project.
Remaining Gaps & Suggestions
Gap 1: No "Kitchen Walkthrough" Pre-Start Check
In Live Mode, you have "Start Cooking" → immediately into tasks. But the most common failure mode is forgetting setup: oven not preheated, turkey not thawed, counter not cleared.
Suggestion: Add a 30-second "Ready Check" before Start:
Auto-generated from the first hour's tasks
"Oven preheating to 350°?" / "Counter cleared for pie assembly?"
Can skip, but defaults to showing
This is small scope (it's just a checklist modal generated from task data) and prevents the worst "oh no" moments.
Gap 2: What Happens When Claude Fails?
The risk register covers slow Claude responses but not failed or incoherent ones. During extraction or recalculation, Claude might:
Return malformed JSON
Hallucinate ingredients that weren't in the image
Suggest an impossible recalculation
Suggestion: Add explicit fallback behavior:
Extraction failure: Show "Couldn't extract this one—enter manually" with the image still displayed
Recalculation failure: "Suggestion unavailable—adjust manually" with the current timeline editable
You probably already plan to do this, but making it explicit in the spec prevents "TODO: handle error" in the code.
Gap 3: Reliability Requirements Are Only on Live Mode
You have reliability requirements for Live Mode:
> "Zero lost checkoffs per session. Timers accurate to ±1 second. Recovery from 5-minute offline without data loss."
But there's no equivalent for other features. What about:
Recipe extraction: What's the target success rate? (90%+ extractable with <3 field corrections?)
Timeline generation: What's the latency budget? (<5 seconds?)
Shopping list: What's the accuracy bar? (100% consolidated correctly?)
Suggestion: Add 1-2 acceptance metrics per feature, not just functional criteria.
Gap 4: No "Manually Enter Recipe" Path in v1
Feature 1 (Recipe Ingestion) is photo upload → Claude extraction → correction. But what if someone wants to type in a recipe from memory? Or the photo is completely illegible?
Suggestion: Add a "Manual entry" option as a fallback. This could be as simple as:
Empty form with the same fields as extracted recipes
Reuses the same save path
It's 2 hours of work and prevents a dead end.
Gap 5: Shopping List "Already Have" Is Per-Meal, Not Persistent
> "'I already have this' toggle for staples"
This is scoped as per-meal (you mark items on each shopping list). But the 80% case is persistent staples: salt, olive oil, butter, garlic, onions—things you always have.
Suggestion: Either:
v1 (minimal): Per-meal only, as scoped. Accept this limitation.
v1 (slightly better): Store "always have" in localStorage. Next meal inherits.
The second option is 1 hour of extra work and significantly reduces friction for repeat use. Your call.
Gap 6: Week 7 "Polish + Testing" Is Vague
Weeks 1-6 have specific deliverables. Week 7 is:
> "Bug fixes, Performance optimization, iOS Safari testing, End-to-end meal test"
This is a buffer week, which is good. But what's the acceptance criteria for "done"?
Suggestion: Define a "v1 ship checklist":
[ ] All success criteria pass
[ ] No P0 bugs
[ ] Lighthouse mobile score ≥90
[ ] Full meal test on iOS Safari (my primary device)
[ ] 1 family member tried share link and saw updates
One Architectural Concern: Timeline State Shape
The data model mentions Timeline (generated, anchor_time, started_at) but I'm not clear on:
Is generated a JSON blob or a foreign key to a Task table?
When a task is checked off or time-adjusted, what gets mutated?
What's the source of truth during Live Mode—the original generated timeline, or a "live state" overlay?
This matters for offline sync. If checkoffs mutate the original timeline, you need conflict handling. If they're a separate "session state," sync is simpler.
Suggestion: Before writing code, sketch the state transitions:
Timeline generated → stored as tasks[]
User starts cooking → session.started_at = now()
User checks off task → task.completed_at = now() (mutates task row)
Offline checkoff → queued in IndexedDB, applied on reconnect
This doesn't need to be in the roadmap, but write it somewhere.
Summary: Grade Upgrade
Dimension	Original Roadmap	V1 Roadmap + Parking Lot
Scope clarity	C+ (features listed, boundaries unclear)	A (explicit in/out, single goal)
Acceptance criteria	D (none)	A- (every feature has criteria)
Risk awareness	D (not mentioned)	B+ (5 risks with mitigations)
Technical pragmatism	B (reasonable choices)	A (hybrid engine, polling-first, PWA basics)
Build sequence	B- (phases, no weeks)	A (7-week plan, logical dependencies)
Emotional/delight design	C (mentioned, not designed)	B (correctly deferred to v2)
Overall: This is now a roadmap I'd trust to build from. The scope is tight, the risks are named, and the "Not Building" list is long enough to matter.
One Final Question for You
The v1 is designed for solo use. But Feature 6 (Shareable Timeline Link) already introduces a second "user" (the viewer). This creates an interesting tension:
Share links need Supabase RLS even if there's no auth—you're exposing a public read-only endpoint.
The viewer's polling creates load patterns you haven't tested.
If you hardcode "no auth" assumptions elsewhere (e.g., supabase.auth.user() returns your ID), share links might break.
Question: Have you sketched the Supabase RLS rules for share links? Specifically:
How does the link carry authorization (UUID in the URL? Short code?)
What rows can that token read? (Just tasks for that meal? All recipes?)
If not, I'd suggest adding a 1-hour spike to Week 6 to validate this before building the full feature.