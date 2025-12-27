# Sunday Dinner

**A meal command center for families who host big gatherings.**

*Conversational planning • Live execution • Recipe preservation*

---

## Vision

Sunday Dinner transforms the chaos of cooking for 20 into a orchestrated experience. Drop in grandma's handwritten recipe card, chat to build your menu, get a minute-by-minute timeline, delegate tasks to family members, and when things inevitably run behind—recalculate on the fly.

It's not just a recipe app. It's how your family cooks together.

---

## Core Principles

1. **Operational first** — Planning is nice, but execution is everything. The live timeline is the killer feature.
2. **Preserve the original** — Grandma's handwriting matters. Store the source, extract the data.
3. **Works on Grandma's iPad** — Accessibility isn't optional. Large touch targets, clear typography, simple flows.
4. **Warm, not clinical** — This is family, not a commercial kitchen. The aesthetic should feel like home.

---

## User Flow

```
1. DROP IN RECIPES
   Photos, PDFs, URLs, handwritten cards
   ↓
2. AI EXTRACTS & NORMALIZES
   Claude Vision pulls ingredients, steps, yield
   Original preserved alongside extracted data
   ↓
3. CHAT TO BUILD THE MENU
   "Add Mom's green bean casserole, scale to 20"
   "What pairs well with prime rib?"
   ↓
4. GENERATE THE PLAN
   Timeline anchored to serve time
   Shopping lists by store
   Task assignments by person
   ↓
5. EXECUTE LIVE
   Tap "Start" to anchor to real time
   Check off tasks as you go
   Running behind? Recalculate remaining steps
   ↓
6. PRESERVE THE MEMORY
   Record audio of the story behind the dish
   Save notes for next time
   "Make 20% more green beans"
```

---

## Feature Set

### Recipe Ingestion
- **Photo upload** with Claude Vision OCR
- **PDF parsing** for cookbook scans
- **URL scraping** for online recipes
- **Manual entry** with rich text editor
- **Preserve originals** — handwritten card image stored alongside extracted data

### Conversational Planning
- **Natural language chat** powered by Claude
- **Smart scaling** — "Scale this to 20 servings" with chemistry warnings
- **Dietary constraints** — "Mark vegetarian dishes, we have 3 vegetarians"
- **AI suggestions** — "What sides go with prime rib?"
- **Conflict detection** — "Both dishes need the oven at 400° at the same time"

### Operational Output
- **Interactive timeline** — Gantt-style, anchored to start or serve time
- **Shopping lists** — Broken out by store (Costco vs grocery vs specialty)
- **Recipe quick cards** — Printer-friendly, one page per dish
- **Delegation view** — "Sarah: salads at 5:30, Tom: bar setup at 5:00"

### Live Execution Mode ⭐ (Killer Feature)
- **Start button** anchors timeline to real time
- **Checkable tasks** with visual progress
- **Running behind?** Recalculate remaining steps
- **Push notifications** for upcoming tasks
- **Delegation updates** — "Sarah marked green beans done"
- **Kitchen display mode** — Large text, minimal UI, tap to advance

### Recipe Preservation
- **Audio memories** — Record family members explaining techniques (Whisper transcription)
- **Recipe versioning** — "Original 1987" vs "Matt's 2024 tweaks"
- **Post-meal notes** — "Double the garlic next time"
- **Photo gallery** — Attach finished dish photos to cooking sessions

### Family & Collaboration
- **Invite family members** to a meal
- **Role-based access** — Admin, contributor, helper
- **Helper view** — Stripped down, just their tasks
- **Shareable links** — Send timeline to anyone helping

---

## Design System

### Color Palette (Warm Heirloom)

| Name | Hex | Usage |
|------|-----|-------|
| **Cream** | `#FAF9F6` | Main background |
| **Warm White** | `#FFF8F0` | Cards, elevated surfaces |
| **Warm Dark** | `#2C2C2C` | Primary text |
| **Warm Gray** | `#6B6B6B` | Secondary text |
| **Terracotta** | `#D4745E` | Primary actions, links |
| **Sage** | `#8B9D83` | Success states, completed tasks |
| **Honey** | `#E6B77D` | Highlights, warnings, timers |
| **Dusty Blue** | `#7C98AB` | Secondary actions |
| **Burgundy** | `#722F37` | Accent, wine pairings |

### Typography

- **Headings:** Playfair Display (serif) — warmth, tradition
- **Body:** Inter (sans-serif) — clarity, accessibility
- **Monospace:** JetBrains Mono — timers, quantities

### Components

- **Recipe Cards** — Warm paper texture, subtle shadow, rounded corners
- **Timeline** — Horizontal scroll, color-coded by dish, current time indicator
- **Chat Interface** — Conversational bubbles, warm tones, inline recipe previews
- **Audio Player** — Waveform visualization, warm gold accent for family recordings
- **Task Checklist** — Large touch targets (44px+), satisfying check animation

---

## Technical Architecture

### Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS + custom design tokens |
| **UI Components** | Radix UI primitives + custom styling |
| **State** | React Query (@tanstack/react-query) |
| **Database** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **AI** | Claude API (Sonnet 4 for chat, Vision for OCR) |
| **Transcription** | OpenAI Whisper API |
| **Animation** | Framer Motion |
| **Rich Text** | Tiptap |
| **Audio Recording** | RecordRTC |
| **Hosting** | Vercel |

### Data Model

```
Meal
├── id, name, serve_time, guest_count
├── Recipes[] (with scaling_factor, assigned_to)
├── Timeline (generated, anchor_time, started_at)
├── ShoppingLists[] (store_name, items[])
├── Tasks[] (description, assigned_to, due_time, completed_at)
├── Guests[] (name, dietary_notes)
└── ChatHistory[] (the conversation that built it)

Recipe
├── id, title, description, servings, prep_time, cook_time
├── OriginalSource (image_url, pdf_url, source_url)
├── Ingredients[] (name, amount, unit, notes)
├── Instructions[] (step_number, text, duration_minutes)
├── Versions[] (version_name, created_by, created_at)
├── AudioMemories[] (audio_url, transcript, recorded_by)
├── Photos[]
└── Tags[]

User
├── id, email, name, avatar_url
├── Families[] (membership)
└── Preferences (default_stores[], dietary_restrictions[])

Family
├── id, name
├── Members[] (user_id, role)
├── Recipes[] (shared library)
└── Meals[] (past and planned)
```

---

## Development Phases

### Phase 1: Foundation (Weeks 1-3)
**Goal:** Basic chat + recipe input + plan generation

- [ ] Project setup (Next.js, Supabase, Tailwind)
- [ ] Design system implementation (colors, typography, base components)
- [ ] Authentication (Supabase Auth)
- [ ] Recipe CRUD (create, read, update, delete)
- [ ] Claude Vision recipe extraction from photos
- [ ] Basic chat interface for menu building
- [ ] Simple timeline generation (static, not live)
- [ ] Shopping list generation

**Milestone:** Can upload a recipe photo, extract it, chat to add to a meal, see timeline and shopping list.

### Phase 2: Live Mode (Weeks 4-6)
**Goal:** Real-time execution — the killer feature

- [ ] Interactive timeline with "Start" anchor
- [ ] Real-time clock sync
- [ ] Task checkoff with Supabase Realtime
- [ ] "Running behind" recalculation algorithm
- [ ] Push notifications for upcoming tasks
- [ ] Kitchen display mode (large text, minimal UI)
- [ ] Delegation: assign tasks to family members
- [ ] Helper view (just their tasks)

**Milestone:** Can run a live meal from the app, check off tasks, see updates in real-time across devices.

### Phase 3: Recipe Depth (Weeks 7-9)
**Goal:** Full recipe preservation features

- [ ] Audio recording with RecordRTC
- [ ] Whisper transcription integration
- [ ] Audio player with waveform visualization
- [ ] Recipe versioning (create new version, compare)
- [ ] Photo gallery for recipes
- [ ] Cooking session logs ("Made this on 12/24/2025")
- [ ] Post-meal notes ("Next time: more garlic")
- [ ] URL recipe scraping

**Milestone:** Full recipe preservation with audio memories, versions, and cooking history.

### Phase 4: Collaboration (Weeks 10-11)
**Goal:** Multi-user family experience

- [ ] Family creation and management
- [ ] Invite flow (shareable links)
- [ ] Role-based permissions (admin, contributor, helper)
- [ ] Shared recipe library
- [ ] Real-time collaboration (see others' updates)
- [ ] Guest list management with dietary notes
- [ ] Shareable meal links for non-users

**Milestone:** Entire family can participate in meal planning and execution.

### Phase 5: Polish & Production (Weeks 12-14)
**Goal:** Production-ready with excellent UX

- [ ] PDF export (timeline, shopping lists, recipe cards)
- [ ] Scroll-driven animations (parallax hero, fade-in sections)
- [ ] Accessibility audit (WCAG AA)
- [ ] Performance optimization (Lighthouse 90+)
- [ ] Error boundaries and loading states
- [ ] E2E testing (Playwright)
- [ ] Production deployment to Vercel
- [ ] User acceptance testing

**Milestone:** Production-ready app that families can rely on for their next big gathering.

---

## Success Metrics

### Technical
| Metric | Target |
|--------|--------|
| Page Load (LCP) | <2.5s |
| Time to Interactive | <3.5s |
| Lighthouse Score | 90+ (all categories) |
| Animation Frame Rate | 60fps desktop, 30fps mobile |

### User Experience
| Metric | Target |
|--------|--------|
| Recipe extraction accuracy | 90%+ |
| Timeline generation | <5 seconds |
| Task sync latency | <500ms |
| Audio transcription | <30s for 5min recording |

---

## Name Alternatives Considered

- ~~MealOps~~ — Too corporate
- ~~Kitchen Heirloom~~ — Focuses on preservation over execution
- ~~The Prep Sheet~~ — Good but less warm
- ~~Mise~~ — Too insider/chef-y
- **Sunday Dinner** ✓ — Evokes the gathering, warm and approachable

---

## Next Steps

1. Initialize Next.js project with design system
2. Build landing page with warm heirloom aesthetic
3. Create recipe card component
4. Implement chat interface shell
5. Connect Claude API for first conversation

---

*Last Updated: December 2025*
