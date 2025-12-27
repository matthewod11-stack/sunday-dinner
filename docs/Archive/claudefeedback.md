# Sunday Dinner Roadmap Feedback

**Date:** December 26, 2025  
**Reviewer:** Claude (Anthropic)

---

## 1. Structure & Detail Assessment

### Where the Roadmap Is Too Vague to Be Actionable

**The Recalculation Problem Is Underspecified**

"Running behind? Recalculate remaining steps" is a 10-word description of what might be the hardest algorithmic problem in the entire app. You need to answer:

- **What's compressible?** Some tasks can be shortened (chop faster), others can't (meat rests for 20 min). Where does this knowledge come from?
- **What happens to critical path items?** If the turkey is 45 minutes late, do you shift serve time, or do you compress the sides into a frantic 10-minute window?
- **What's your recalculation latency budget?** If the user taps "I'm behind" and waits 8 seconds for Claude to respond, they've already lost trust.

**Recommendation:** Write a 1-page spec titled "Recalculation: Inputs, Constraints, and Output Contract" before Phase 2. This should define which operations are deterministic (and thus fast) vs. which require LLM reasoning (and thus need loading states).

**"Chemistry Warnings" Is a Research Project Disguised as a Feature**

Smart scaling "with chemistry warnings" implies knowledge that doesn't exist in any API. Baking soda doesn't scale linearly. Yeast behaves differently at volume. Caramelization timing changes with pan surface area.

**Recommendation:** Scope this down for v1. Either:
- Only warn for known categories (baking = "scaling may affect results")  
- Or surface Claude's uncertainty ("I'm not sure this scales safely—consider testing first")

Don't promise precision you can't deliver.

**Timeline Generation Has No Specification**

The data model shows `Timeline (generated, anchor_time, started_at)` but doesn't define:
- How steps become tasks (is 1 recipe step = 1 task, or does "sauté onions, then add garlic" become 2 tasks?)
- How concurrent capacity is modeled (do you ask the user "how many burners?" or assume 4?)
- What "generated" means—is this a JSON blob? A denormalized set of task rows?

**Recommendation:** Add a "Timeline Data Contract" section that defines the schema, the generation inputs, and what happens when a user edits the generated plan.

---

### Where It's Over-Specified (Risking Premature Lock-In)

**The Design System Is Premature for a Roadmap**

Hex codes, font choices, and component descriptions are valuable, but they belong in a design file or Storybook, not a roadmap. Including them here creates two risks:
1. They become "decided" before you've validated flows with real users
2. They distract from the harder question: what does the *interaction* feel like?

**Recommendation:** Keep the *mood* ("Warm, not clinical") in the roadmap. Move the specific palette to a `DESIGN_SYSTEM.md` that can evolve independently.

**Library Choices Are Decisions, Not Requirements**

RecordRTC, Tiptap, Framer Motion—these are reasonable choices, but naming them in the roadmap makes them feel load-bearing. They're not. The requirements are:
- Record audio in-browser
- Edit rich text
- Animate smoothly

**Recommendation:** Express these as capabilities, not libraries. Let implementation decisions stay in the code.

---

### What's Missing for Future-You to Understand Priorities

**No "What We're NOT Building" Section**

You've defined what Sunday Dinner *is*, but not what it *isn't*. Without explicit non-goals, scope creep is inevitable. You need statements like:
- NOT a recipe discovery/social platform
- NOT a nutrition/macro tracker  
- NOT a meal planning service (subscriptions, auto-generated weekly menus)
- NOT supporting commercial kitchen scale (>50 servings)

**No Risk Register**

The roadmap assumes things go well. What if:
- Claude API has an outage during Thanksgiving?
- Recipe extraction is only 70% accurate on handwritten cards?
- Supabase Realtime can't handle 8 family members syncing?

**Recommendation:** Add a "Known Risks & Mitigations" section, even if brief. This helps future-you make faster decisions when things break.

**No Definition of "Done" for the Killer Feature**

Live Execution is correctly identified as the core value, but there's no acceptance criteria. What would make you confident it's ready?

**Recommendation:** Write 3-5 concrete scenarios that must work flawlessly:
1. Solo cook, 4 dishes, 3-hour timeline, one "running behind" event
2. Two cooks, 6 dishes, real-time sync of checkoffs
3. Offline for 5 minutes mid-cook, reconnects and recovers state

---

### Are Dependencies Between Features Clear?

**No.** The phase breakdown implies linear ordering, but hides critical dependencies:

| Feature | Hidden Dependency |
|---------|-------------------|
| Delegation (Phase 2) | Requires user identity + minimal permissions (Phase 4) |
| Push notifications (Phase 2) | Requires PWA install flow (not mentioned) + iOS Safari workarounds |
| Recipe versioning (Phase 3) | Requires diff algorithm + storage model decisions |
| Shareable links (Phase 4) | Requires guest auth + RLS rules from day one |

**Recommendation:** Create a dependency graph. It doesn't need to be fancy—just a list of "X requires Y" statements that surface hidden work.

---

## 2. Existing Feature Enhancement

### Recipe Ingestion

| Dimension | Gap Analysis |
|-----------|--------------|
| **Functional → Delightful** | The current spec treats extraction as a black box ("AI extracts"). Delight comes from transparency: show confidence scores, highlight uncertain fields, let users tap-to-correct inline on the original image. |
| **Edge Cases** | Multi-page recipes, recipes with embedded photos, recipes where ingredients are inline with instructions ("add 2 eggs, then fold in flour"), handwriting with personal abbreviations ("T" vs "t" for tablespoon vs teaspoon). |
| **UX Tightening** | The "original preserved alongside extracted" concept is right, but the *flow* matters more: is the original always visible? Can you toggle? The original should feel like a safety net, not a data archive. |

**One Concrete Improvement:** Add a "confidence heatmap" overlay on the original image. Green = high confidence, yellow = uncertain, red = couldn't parse. Tapping a region jumps to that field in the structured data.

---

### Conversational Planning

| Dimension | Gap Analysis |
|-----------|--------------|
| **Functional → Delightful** | Chat is the *input* method, but the *output* should be structured artifacts (menu cards, timeline previews, shopping list drafts). Every Claude response should produce something tangible, not just prose. |
| **Edge Cases** | Conflicting instructions over time ("serve at 6" then later "actually make it 5:30"), requests that require knowledge you don't have ("pair with a wine under $20"), requests that break physics ("scale this 45-minute roast to serve 40"). |
| **UX Tightening** | Chat should not be the *only* way to modify the plan. Every structured artifact Claude creates should be directly editable. Users should be able to ignore chat entirely and just drag-drop in a visual interface. |

**One Concrete Improvement:** Implement "chat produces cards." Every Claude action creates a visible, editable artifact. If the user says "add green bean casserole," they should see a recipe card appear in the sidebar, not just a "Got it!" message.

---

### Live Execution Mode ⭐

This is where the app lives or dies. The roadmap lists features but doesn't specify the *experience*.

| Dimension | Gap Analysis |
|-----------|--------------|
| **Functional → Delightful** | The current spec describes a Gantt chart with checkboxes. That's functional. Delightful is: you glance at your phone and immediately know what to do next, without scrolling, parsing, or thinking. |
| **Edge Cases** | Device sleeps and misses a notification. Two people check off the same task. Network drops for 3 minutes. User checks off a task that hasn't started yet. User wants to "un-check" something marked done by accident. |
| **UX Tightening** | Kitchen Display Mode needs to be its own design exercise. Assume: wet hands, 4-foot viewing distance, cognitive overload. The default state should be one task, one timer, one button. |

**One Concrete Improvement:** Design around "the 2-second glance." If someone looks at their phone while stirring, they should know what's next in under 2 seconds. This likely means the default view is NOT a timeline—it's a single "Now" card with "Next" peeking below.

---

### Operational Output (Shopping Lists, Quick Cards, Delegation)

| Dimension | Gap Analysis |
|-----------|--------------|
| **Functional → Delightful** | Lists are functional. Delight is: grouping by store section (produce → dairy → meat), showing quantities in familiar units, allowing "I already have this" toggles, and printing a list that fits on a half-sheet you can actually carry. |
| **Edge Cases** | Ingredient deduplication across recipes ("2 cups milk" from one + "1 cup milk" from another = one "3 cups milk" line). Substitution handling ("or use Greek yogurt instead of sour cream"). |
| **UX Tightening** | Quick cards should be designed for the *counter*, not the *screen*. This means: one recipe per page, large type, critical timings bold, no wasted space on metadata the cook doesn't need mid-task. |

**One Concrete Improvement:** Let users mark "staples" at a family level. Salt, olive oil, butter—things you always have. These should never appear on shopping lists unless explicitly added.

---

### Recipe Preservation (Audio, Versioning, Notes)

| Dimension | Gap Analysis |
|-----------|--------------|
| **Functional → Delightful** | Recording works. Delight is: prompting at the right moment ("Want to record why you made that substitution?"), surfacing recordings at the right moment ("Last time, Mom said…"), making the archive feel alive, not dusty. |
| **Edge Cases** | Audio quality in kitchens (exhaust fans, sizzling, crosstalk). Long recordings (Grandma talks for 20 minutes). Transcription errors for proper nouns, family terms, and foreign words. |
| **UX Tightening** | Versioning UI should emphasize *what changed*, not *that a version exists*. Show a diff: "Matt's 2024: doubled garlic, reduced salt by half, added lemon zest." |

**One Concrete Improvement:** After every cooking session, prompt for a 30-second voice note: "Anything you'd change next time?" This is easier than typing and captures the moment of learning.

---

### Family & Collaboration

| Dimension | Gap Analysis |
|-----------|--------------|
| **Functional → Delightful** | Invite links work. Delight is: a helper opens the link on their phone and *immediately* sees only their tasks, in large type, with no login required. They feel useful, not confused. |
| **Edge Cases** | Link security (expires? revocable?). Helpers with no smartphone. Family members who "help" by rearranging your plan. |
| **UX Tightening** | The helper view should be aggressively simple. No timeline. No other people's tasks. Just: "Your next task is X at Y time. Tap when done." |

**One Concrete Improvement:** Let the host send a helper link via iMessage/WhatsApp with a preview card: "Sarah invited you to help with Thanksgiving. Your first task is Salad Prep at 4:30 PM."

---

## 3. New Ideas (3 Max)

### 1. "Quiet Kitchen" Mode — Graceful Degradation When Things Go Wrong

**Problem:** Your killer feature depends on connectivity, notifications, and real-time sync. Kitchens are hostile environments: spotty WiFi, greasy fingers, devices in low-power mode. When any of these fail, the magic breaks—and breaking during live cooking destroys trust forever.

**Solution:** Design an explicit "Quiet Kitchen" fallback:
- Local-first state that works offline (IndexedDB + service worker)
- On-screen timers that don't require push notifications
- Periodic sync rather than real-time when connectivity is poor
- Clear indicator: "Last synced 2 min ago" vs. "Live"

**Why High-Leverage:** This isn't a feature—it's insurance for your core value prop. A small investment (2-3 days of PWA hardening) protects against catastrophic trust loss. Users will forgive a rough edge; they won't forgive a ruined dinner.

**Compounding Effect:** This makes Live Mode, Kitchen Display, and Helper View all more robust. It turns "works on Grandma's iPad" from aspiration to guarantee.

---

### 2. "Shopping Trip" Mode — From List to Cart

**Problem:** The shopping list is generated, but the *shopping experience* isn't designed. You're still manually checking off items on a static list while navigating a store you know by heart.

**Solution:** A dedicated "Shopping Trip" view that:
- Reorders items by typical store layout (produce → dairy → meat → frozen)
- Lets you swipe-to-check with large touch targets (cart-friendly)
- Shows "for: Green Bean Casserole, Mashed Potatoes" on each item so you remember why you're buying it
- Tracks what you skipped ("Couldn't find X—substitute?")

**Why High-Leverage:** Shopping is a high-friction moment that happens *before* the app's core value (live cooking). A delightful shopping experience primes users to trust the cooking experience. It's also a natural "first touch" for helpers who might not cook but can shop.

**Compounding Effect:** The same UI patterns (large touch targets, swipe-to-complete, progress tracking) translate directly to Live Execution. You're building muscle memory.

---

### 3. "Kitchen Walkthrough" — Pre-Game Prep Check

**Problem:** Live Execution assumes everything is ready when you hit "Start." In reality, people forget to preheat, haven't defrosted the turkey, or don't have a clean surface for pastry. The first 10 minutes become chaos.

**Solution:** Before "Start," offer a 2-minute walkthrough:
- "Confirm oven is preheating to 350°"
- "Confirm turkey is fully thawed"
- "Confirm counter space is clear for pie assembly"

These are generated from the timeline's first-hour tasks and equipment requirements.

**Why High-Leverage:** This catches 90% of the "oh no" moments that derail meals. It's cheap to build (just a checklist generated from existing data) and creates a ritual that makes users feel prepared and calm.

**Compounding Effect:** The walkthrough surfaces dependencies the planner might have missed ("wait, both dishes need the stand mixer at the same time?"), which feeds back into better planning prompts.

---

## 4. Jobs Innovation Lens

### How Can I Make the Complex Appear Simple?

**Where complexity is leaking:**
1. **Extraction uncertainty** — Users see AI output and don't know what to trust. Is "1 T butter" tablespoon or teaspoon?
2. **Timeline generation** — The Gantt chart exposes the scheduling problem's complexity. Users think "too many lines, where do I look?"
3. **Recalculation** — When you're behind, the last thing you want is an algorithm explaining 12 cascading changes.

**How to abstract it away:**
1. **Don't show confidence—show action.** Instead of "85% confident this is 1 Tbsp," ask: "Is this Tablespoon or teaspoon?" Only surface uncertainty as a decision.
2. **Hide the timeline until they need it.** Default to "Now / Next / Soon" cards. The Gantt is an expert view for hosts who want to see the whole picture.
3. **One adjustment at a time.** When recalculating, don't show the new timeline—show one change: "Push mashed potatoes back 15 minutes? (Yes / Adjust differently)"

**The principle:** Complexity should be *available*, not *default*. Progressive disclosure is your friend.

---

### What Would This Be Like If It Just Worked Magically?

**The zero-friction ideal:**

I take three photos of handwritten recipe cards. I say "Thanksgiving, 20 people, serve at 5." The app responds: "Got it. Start cooking at 11:30. Shop by Wednesday. Here's who should do what." My sister opens a link and sees only her tasks. During cooking, I glance at my phone and see exactly one thing: what to do now. When I fall behind, the app says "delay serving 20 minutes?" and I say yes. After dinner, it asks "anything to remember?" and I mumble a voice note.

**What would have to be true for that to happen:**

1. **Recipe extraction works on 95%+ of handwritten cards** — This requires exceptional OCR and a robust human-in-the-loop for the 5%.
2. **Timeline generation is instant and trustworthy** — This requires deterministic scheduling (not LLM reasoning for the core algorithm) with LLM assist for edge cases.
3. **State sync is invisible** — Supabase Realtime works, or you have a robust local-first fallback.
4. **Notifications actually fire** — PWA install flow, notification permissions, iOS Safari workarounds are all solved.
5. **Voice capture just works** — Whisper is fast enough that there's no perceived delay.

The hardest part isn't any one of these—it's that *all five* must work, every time. Your architecture should optimize for "never break during live cooking" above all else.

---

### What's the One Thing This Absolutely Must Do Perfectly?

**The answer: Real-time execution reliability.**

Not recipe extraction (that can have a human fallback). Not conversational planning (users can edit directly). Not audio memories (nice-to-have).

The one thing is: **When you tap "Start" and begin cooking, the app must never lose state, never show the wrong task, never miss a timer, and never leave you wondering what's next.**

**Is the roadmap organized around protecting that?**

Partially. Live Mode is correctly called the "killer feature," but:
- It's in Phase 2, not Phase 1, which means foundational architectural decisions (offline-first? local state? sync strategy?) might be made in Phase 1 without Live Mode's constraints in mind.
- There's no explicit "reliability work" in any phase—no mention of offline, conflict resolution, or state recovery.
- The success metrics focus on latency and frame rate, not reliability (% of sessions with zero dropped checkoffs, % of sessions with successful notification delivery).

**Recommendation:** Add "Live Mode Reliability" as a cross-cutting concern from Phase 1. Every architectural decision should be evaluated against: "Does this make Live Mode more or less trustworthy?"

---

### How Would I Make This Insanely Great Instead of Just Good?

**The difference between "useful" and "recommended":**

A *useful* app helps you cook a meal. An *insanely great* app makes you feel like a better host, strengthens family bonds, and creates traditions that outlast the technology.

**Where the roadmap stops at "good":**

| Good | Insanely Great |
|------|----------------|
| Stores recipes | Surfaces "remember when Mom taught you this?" at the right moment |
| Generates a timeline | Makes you feel calm and in control, even when behind |
| Supports collaboration | Makes helpers feel genuinely useful, not like they're following orders |
| Preserves audio | Captures the story in a way that makes you cry 20 years later |

**Concrete gaps to close:**

1. **Emotional texture.** The roadmap is feature-focused, not feeling-focused. What's the emotional arc of using this app? (Anticipation → Confidence → Flow → Pride → Nostalgia)

2. **Ritual design.** Great products become rituals. What's the ritual here? Is there a "Start the meal" moment that feels significant? A "Meal complete" celebration? A "Year in review" for December?

3. **Compounding value.** Each use should make the next use better. Does the app learn that you always run 15 minutes late on desserts? Does it remember that your oven runs hot? Does it know that Aunt Carol always brings too much wine?

4. **Shareability.** People recommend products that make them look good. What does someone *share* from Sunday Dinner? A beautiful photo of the meal? A "we cooked 23 hours of food together this year" stat? A recipe card to text to a friend?

**The gap in one sentence:** The roadmap describes a tool. To be insanely great, it needs to describe a *relationship*—with your family, your traditions, and your past.

---

## 5. Technical Considerations

### Architectural Choices That Might Age Poorly

| Choice | Risk | Mitigation |
|--------|------|------------|
| **Supabase as sole backend** | Realtime has scalability limits; vendor lock-in for auth, storage, and DB | Abstract Supabase behind service interfaces from day one. If you can swap to Firebase or self-hosted Postgres + LiveKit in 1 sprint, you're fine. |
| **LLM for timeline generation** | Latency, cost, and non-determinism make testing hard | Use LLM for *understanding intent* and *generating suggestions*, but use deterministic algorithms for the core scheduling. The scheduler should be pure functions with 100% unit test coverage. |
| **React Query for state** | Fine for server state, but Live Mode is complex client+server state | Consider colocating Live Mode state in a dedicated store (Zustand or Jotai) with explicit sync to Supabase. This makes offline mode easier. |
| **Vercel for hosting** | Serverless function timeouts (10-60s) will break AI orchestration | Move heavy AI work (batch extraction, long planning conversations) to a queue-based worker (Inngest, Trigger.dev, or Vercel's own background functions). |

### Mobile/Tablet Responsiveness: What Will Be Hard

| Feature | Mobile Challenge | Recommendation |
|---------|------------------|----------------|
| **Gantt timeline** | Horizontal scroll on vertical screens is awkward | Build a "Now/Next/Later" stack view as the primary mobile interface. Gantt is desktop/landscape only. |
| **Chat + plan split view** | Can't show both on a phone | Use a bottom sheet or full-screen modal for chat. Don't try to split. |
| **Kitchen Display Mode** | Tablets in landscape, potentially mounted | Design this as a separate layout, not a responsive version. Assume 10+ feet viewing distance. |
| **Audio recording** | iOS Safari is finicky with MediaRecorder | Test extensively on iOS Safari. Consider a "record to cloud" fallback if client-side fails. |
| **Drag-and-drop timeline editing** | Touch drag is imprecise | Use tap-to-select + action buttons instead of drag. Or accept that timeline editing is desktop-only. |

### State-of-the-Art Check

| Area | Current Spec | Consider Instead |
|------|--------------|------------------|
| **AI model** | "Sonnet 4" | Don't lock to a model. Use an abstraction (LangChain, Vercel AI SDK) that lets you swap models per-task. Vision might be better on GPT-4o; chat might be better on Claude. |
| **Real-time** | Supabase Realtime | Fine for now, but evaluate Liveblocks or PartyKit if you need more sophisticated conflict resolution or presence features. |
| **Offline** | Not mentioned | This is the biggest gap. Add PWA + Service Worker + IndexedDB from Phase 1. Consider Replicache or ElectricSQL if you want true local-first. |
| **Voice** | Whisper for transcription | For real-time voice commands during cooking, consider OpenAI Realtime API or Deepgram for lower latency. Whisper is fine for async transcription. |
| **Animation** | Framer Motion | Good choice, but ensure you're using `layout` animations and not triggering reflows. Test on low-end tablets. |

### Performance & Scalability Concerns

1. **Image storage costs.** If every recipe stores the original photo + enhanced version + multiple finished dish photos, storage will grow fast. Implement:
   - Client-side compression before upload (target <500KB for recipe cards)
   - Progressive JPEG for fast preview loads
   - Lifecycle policy to move old images to cold storage

2. **AI API costs.** Vision + chat + transcription per meal could easily hit $2-5. Implement:
   - Caching of extraction results (don't re-extract unchanged images)
   - Rate limiting on chat (cap tokens per meal)
   - Cost tracking per user in case you ever monetize

3. **Realtime fanout.** 8 family members all subscribed to the same meal timeline is fine. But if each has 3 devices, and there's a chatty sync protocol, you could hit Supabase's message limits.
   - Implement smart subscriptions: helpers only subscribe to their tasks, not the full timeline.
   - Use presence sparingly.

4. **Timeline recalculation.** If this is LLM-powered and takes 5+ seconds, users will hate it.
   - Build the core scheduler as a pure TypeScript function that runs in <100ms.
   - Only use LLM for explaining changes or handling edge cases.

---

## Summary: Top 5 Recommendations

1. **Write a "Recalculation Spec" before Phase 2.** This is the hardest problem in the app and currently lives in 6 words.

2. **Add "Offline Mode" to Phase 1.** Your killer feature can't depend on perfect connectivity. Bake resilience in from the start.

3. **Design the "2-second glance" view.** The default live cooking interface should answer "what now?" without scrolling or parsing. This might not be a timeline at all.

4. **Define explicit non-goals.** What you're NOT building is as important as what you are. This protects scope and helps future-you make faster decisions.

5. **Add reliability metrics.** Current success metrics are about speed. Add: "Zero lost checkoffs per session," "Notification delivery rate >95%," "Recovery from 5-min offline without data loss."

---

*This app has a clear vision and a genuine killer feature. The roadmap's strength is in knowing what matters (live execution). Its weakness is in underestimating how hard "reliable and trustworthy" is to achieve. Protect the core, build trust incrementally, and resist the temptation to add features before the foundation is solid.*
