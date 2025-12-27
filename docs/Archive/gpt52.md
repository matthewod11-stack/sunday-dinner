## Roadmap Feedback — Sunday Dinner (`SUNDAY_DINNER_ROADMAP.md`)

## High-level read
Your roadmap is strong on **product vision** and identifies the right “killer feature” (Live Execution). Where it needs reinforcement is: (1) **clear definitions of done** for the hard parts (planning/scheduling/recalculation), (2) **explicit dependencies** (notifications, realtime, permissions, offline/resilience), and (3) **guardrails** so AI variability can’t break execution.

---

## 1. Structure & Detail Assessment

### Where it’s too vague to be actionable
- **Timeline generation algorithm**: “minute-by-minute timeline” is the hardest product surface area; the roadmap doesn’t define:
  - **Inputs**: per-step durations? oven occupancy? parallelizable tasks? hard deadlines like “rest 20 min”?
  - **Constraints model**: shared resources (oven zones, burners, mixer, counter space) + human constraints (“only one person can carve”).
  - **Output semantics**: “task” vs “step” vs “timer”; overlap rules; what “due_time” actually means.
  - **Quality bar**: what makes a timeline “good enough” vs “great.”
- **“Running behind” recalculation**: needs explicit rules:
  - **Movable vs fixed**: what can shift vs cannot (rest times, food safety holds, arrival time).
  - **Allowed interventions**: can it propose technique changes (temp/time) or only reorder/retime tasks?
  - **Partial reality**: late starts, skipped steps, tasks started early, tasks completed out of order.
- **Conflict detection**: examples are good, but you need the conflict types you’ll implement in v1:
  - **Resource conflicts** (oven, burners, mixer).
  - **Temperature conflicts** (simultaneous incompatible temps).
  - **Attention conflicts** (two “must watch” steps at once).
  - **Critical-path risks** (thin buffer to serve time).
- **Recipe extraction & normalization**: you list OCR, but not the “normal form”:
  - Unit system (metric/imperial), ingredient canonicalization, ambiguity handling (“1 onion” vs grams).
- **Push notifications**: web push has platform constraints (notably iOS/Safari behavior). Roadmap doesn’t include:
  - “Notifications unavailable” fallback (kitchen mode timers, audible cues, on-screen banners).
- **URL scraping / PDF parsing**: both are edge-case heavy; roadmap lacks:
  - A “supported sources/formats” list for v1 + graceful degradation.

### Where it’s over-specified (risking early lock-in)
- **Design system specifics (palette/fonts/components)**: good inspiration, but reads like a near-final brand spec. It might slow iteration if early UX requires different density/contrast choices.
- **Library commitments** (Framer Motion, Tiptap, RecordRTC, waveform visualization):
  - Many are fine, but can be deferred until you validate the flows. Waveforms especially are “polish,” not core value.
- **“Gantt-style timeline” as the default**:
  - Great for planning on desktop; can become fiddly on mobile. Consider describing the timeline as an interaction goal (“always know what’s next”) rather than a fixed visualization.

### What’s missing to clarify priorities (future-you / future contributors)
- **Non-goals / v1 scope boundaries**: what you will explicitly not do initially (recipe discovery marketplace, nutrition tracking, etc.).
- **MVP definition of Live Mode**: the smallest slice that still feels magical and trustworthy.
- **Reliability requirements for the killer feature**:
  - Offline/resilience expectations (bad Wi‑Fi, screen lock, backgrounding).
  - “Never lose state” invariants (checkoffs, timers, assignments).
- **AI failure handling**:
  - OCR confidence scoring, human correction loop, “use original only” mode.
- **Cost / rate-limit budget**:
  - Claude + Whisper per-meal cost expectations and guardrails to prevent runaway.
- **Instrumentation**:
  - What you measure to improve (OCR correction rate, recalculation frequency, missed tasks, user edits to plan).
- **Accessibility acceptance criteria**:
  - Dynamic type, contrast targets, reduced motion, keyboard support (iPad), screen reader paths.

### Are dependencies between features clear?
Partially, but phase boundaries hide real dependencies:
- **Phase 2 depends on Phase 4 primitives**:
  - Delegation + helper view implies at least minimal **multi-user** and **permissions** sooner (even if “Families” ships later).
- **Push notifications depend on platform decisions**:
  - Web push constraints likely imply **PWA install UX** and “kitchen mode” fallbacks.
- **Realtime depends on hardened authorization**:
  - Supabase Realtime is easy to start, but correct **RLS** becomes critical once invites/share links exist.
- **“Running behind” depends on step-duration fidelity**:
  - If extracted recipes don’t reliably contain durations, recalculation becomes guessy and erodes trust.

---

## 2. Existing Feature Enhancement

### Recipe Ingestion
- **Functional → delightful**
  - Side-by-side **“original vs extracted”** view with inline corrections.
  - Auto-crop/de-skew/contrast enhancement tuned for handwriting.
  - Ingredient canonicalization with gentle prompts only when it matters (“salted or unsalted?”).
- **Edge cases / failure modes**
  - Multi-page scans, partial photos, glare, cursive, “front/back” cards.
  - Ambiguous quantities (“one can”, “a handful”), missing times, implied times.
  - Duplicates (same recipe uploaded twice, slightly edited variants).
- **UX tightening**
  - Make correction feel like reviewing a draft, not data entry.
  - One universal “This is wrong” affordance that jumps to the exact field/line.

### Conversational Planning
- **Functional → delightful**
  - Chat actions always produce **structured artifacts** (menu items, tasks, constraints) with provenance (“added because you said X”).
  - “Explain this plan” and “What’s risky?” summaries.
- **Edge cases / failure modes**
  - Conflicting instructions over time (“serve at 6” then “actually 5:30”).
  - Dietary constraints that affect shared tools (veg/meat cross-contamination, shared oven).
  - Scaling that breaks physics (pan sizes, oven capacity, chilling/resting).
- **UX tightening**
  - Chat should not be the only control surface; every chat change should be visible/editable in UI.
  - Suggested prompts only when the user stalls; keep default UI calm.

### Operational Output (timeline, shopping, quick cards, delegation view)
- **Functional → delightful**
  - Consolidated shopping list with **unit reconciliation** and “already have it” toggles.
  - Quick cards emphasize **critical steps + timers** over full prose.
- **Edge cases / failure modes**
  - Same ingredient in different forms (onion vs diced onion; butter vs melted butter).
  - “Store split” varies by user; needs customization and defaults.
- **UX tightening**
  - Collapse complexity: “Show me only what matters in the next hour.”
  - Make export/print a first-class “kitchen artifact,” not an afterthought.

### Live Execution Mode ⭐
- **Functional → delightful**
  - “Now / Next / Later” triad that always answers: **what should I do right now?**
  - One-tap timers from steps; persistent banner for active timers.
  - “We’re behind” mode that proposes one clear adjustment at a time (swap/reorder/retime).
- **Edge cases / failure modes**
  - Screen lock/backgrounding; refresh; denied notification permissions.
  - Concurrent edits/checkoffs; accidental taps; conflict resolution and undo.
  - Clock drift across devices; server-time anchoring + reconciliation.
- **UX tightening**
  - Big touch targets, undo for checkoffs, confirm only for destructive actions.
  - Kitchen mode should prioritize readability + wake lock + low interaction cost.

### Recipe Preservation (audio, versioning, notes, gallery, session logs)
- **Functional → delightful**
  - “Story behind this dish” prompts with optional structure (who/when/why).
  - Version diffs highlight **what changed** (ingredient deltas, step deltas).
- **Edge cases / failure modes**
  - Consent/privacy for recordings; sharing rules; deletion.
  - Storage costs (audio/photos/originals) and lifecycle policies.
- **UX tightening**
  - Make preservation passive: after cooking, prompt a 30-second “what to change next time.”

### Family & Collaboration
- **Functional → delightful**
  - Helpers join via link that “just works” with near-zero onboarding; optional account later.
  - Clear roles: helper can’t break plan; contributor can edit; admin can invite.
- **Edge cases / failure modes**
  - Link leakage; expiration/revocation needed.
  - Helper offline/spotty connectivity; durable sync.
- **UX tightening**
  - Helper screen is laser-focused: their next task + where things are + timers.

---

## 3. New Ideas (1–3 max)

### 1) Offline-first “Kitchen Pack” (resilient live mode)
- **Problem it solves**: Kitchens have unreliable Wi‑Fi, sleeping devices, and constant context switching; your killer feature can’t depend on perfect connectivity.
- **Why high leverage**: A modest investment (PWA + offline caching + optimistic checkoffs + background sync) protects the core promise and reduces anxiety.
- **How it compounds**: Makes Live Mode, delegation, and exports robust; turns “works on Grandma’s iPad” into a guarantee.

### 2) Hands-free mode (voice + big-step navigation)
- **Problem it solves**: Hands are wet/floured; touching screens is annoying; voice is natural mid-cook.
- **Why high leverage**: A narrow command set (“next step”, “start 10 min timer”, “mark done”, “what’s next”) delivers huge perceived magic.
- **How it compounds**: Strengthens Live Execution and Kitchen Display; reduces missed tasks and helper confusion.

### 3) Calendar integration + prep scheduling
- **Problem it solves**: The real failure mode is days-before prep (thaw, brine, shop), not just the last hour.
- **Why high leverage**: Turning the plan into scheduled reminders (“shop Friday”, “start brine Saturday”) increases success dramatically.
- **How it compounds**: Reuses planning engine + shopping list; makes “planning → execution” continuous.

---

## 4. Jobs Innovation Lens

### How can I make the complex appear simple?
Hidden complexity is leaking through in extraction accuracy, scheduling constraints, and recalculation. Abstract it by:
- **Separating “what” from “how”**: user chooses menu + serve time; system handles constraints invisibly.
- **Progressive disclosure**: default to “Now/Next” and reveal Gantt/constraints only when asked “why?”
- **Confidence surfaces**: show uncertainty only when it affects decisions (“This step duration is unknown—estimate?”).

### What would this be like if it just worked magically?
Zero-friction ideal:
- Upload messy photos/links → clean recipes with minimal review.
- Say “serve at 6 for 20” → a plan that fits your real kitchen capacity.
- During cooking, you never scroll/search—screen always shows the right next action, and timers/alerts never fail.

For that to be true:
- A deterministic, testable planning core (not purely LLM-driven), strong defaults, offline resilience, and a “next action” UI designed for kitchens.

### What’s the one thing this absolutely must do perfectly?
**Live execution trust.** If the timeline lies, recalculation feels random, or progress gets lost, you won’t use it. The roadmap correctly calls Live Mode the killer feature, but it should more explicitly protect it with reliability and recovery work.

### How would I make this insanely great instead of just good?
A “good” tool stores recipes. An “insanely great” tool makes hosts feel **calm and in control**, helpers feel **useful without confusion**, and creates a **repeatable ritual** (plan → run → capture notes → next time is better).

Gap to close: your roadmap lists features, but not the emotional outcomes + guardrails that guarantee them (offline, trust signals, failure recovery).

---

## 5. Technical Considerations

### Architectural choices that might age poorly
- **Over-reliance on LLM for core logic**: use AI to extract/suggest, but keep planning/recalc deterministic and testable.
- **Persisting “generated timeline” without lineage**: version plan artifacts (“v3 plan”), with diffs and rollback.
- **Client-heavy state without clear source of truth**: Live Mode needs strong invariants (server-time anchor, durable checkoffs, conflict resolution).
- **Vendor coupling**: Supabase + Claude + Whisper is fine, but add thin abstractions so providers can be swapped later.

### Mobile/tablet responsiveness risks
- **Gantt horizontal scroll** can become a trap on mobile; ensure a “Now/Next” alternative is always first-class.
- **Chat + timeline split view**: plan for tabs/bottom sheets and fast context switching on small screens.
- **Touch precision**: dense controls and drag interactions fail in kitchens; default to tap-first, big targets.

### State-of-the-art check (patterns worth considering)
- **Next.js direction**: lean into RSC/server actions for read-heavy screens; reserve client state for Live Mode + realtime.
- **Schema-first validation**: Zod (or similar) at boundaries (AI outputs, DB writes, realtime payloads) to prevent “AI-shaped data” corruption.
- **Background jobs/queues**: OCR, scraping, transcription, plan generation benefit from a worker model for retries and reliability.
- **PWA fundamentals**: install UX, offline caching, background sync, wake lock, “resume session” flows.

### Performance/scalability concerns
- **Media-heavy app**: compression, chunked uploads, progress UI, lifecycle policies.
- **Realtime fanout**: family scale is fine but requires careful RLS + filtered subscriptions.
- **Timeline rendering**: virtualization + minimal animation during active cooking; prioritize smooth scrolling and readability.
- **API cost/latency**: caching, incremental extraction; don’t re-OCR/re-transcribe unless inputs changed.

---

## Suggested roadmap tweaks (quick, high-impact)
- Pull a thin slice of **permissions + share links** earlier (even if “Families” remains later) so Phase 2 delegation is real.
- Add a **Resilience** track alongside Phase 2 (offline/PWA, wake lock, durable progress) to protect the killer feature.
- Define Phase 2 acceptance criteria around **trust**: no lost progress, clear next action, graceful degradation when offline/notifications denied.
