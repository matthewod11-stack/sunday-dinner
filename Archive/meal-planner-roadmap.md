# Meal Planner App

**Product Roadmap & Technical Specification**  
*December 2025*

---

## Vision

A conversational meal planning app that transforms scattered recipes—handwritten cards, photos, PDFs, URLs—into organized, executable meal plans. Think of it as a command center for family dinners: shopping lists broken out by store, minute-by-minute timelines, delegated tasks, and recipe cards that preserve grandma's handwriting while scaling to feed 18.

---

## Core User Flow

1. Drop in recipes (photos, PDFs, URLs, text)
2. AI extracts and normalizes them
3. Chat to build the menu, scale quantities, set constraints
4. Generate operational output (timeline, shopping lists, recipe cards)
5. Share with crew, delegate tasks, execute

---

## Key Features

### Recipe Ingestion
- Photo/image upload with OCR (preserve original handwriting as image)
- PDF parsing
- URL scraping (structured recipe data from recipe sites)
- Manual text entry
- AI extraction to normalized format (ingredients, steps, yield)

### Conversational Menu Planning
- Chat interface to build menus
- Guest count and dietary constraints
- Automatic quantity scaling
- AI suggestions for complementary dishes
- Equipment/oven conflict detection

### Operational Output
- Interactive timeline (anchored to start or serve time)
- Shopping lists by store
- Recipe quick-reference cards
- Printable PDF export
- Fancy menu card for table decoration

### Live Timeline
- Tap "started" to anchor timeline to real time
- Running behind? Recalculates remaining steps
- Checkable tasks
- Reminders/alarms for key moments

### Delegation & Collaboration
- Invite family members to the meal
- Assign store runs to individuals
- Assign task windows ("You're on salad at 5:30")
- Stripped-down view for helpers (just their stuff)
- Real-time check-ins ("Sarah marked green beans done")

### Recipe Storage
- Personal recipe library
- Original + extracted views (see grandma's card AND scale it)
- Version history ("Original" vs "Matt's tweaks 2024")
- Tagging: occasion, source, type

---

## Development Phases

### Phase 1: Foundation (MVP)

**Goal:** Basic chat + recipe input + output generation

1. Chat interface with file upload (images, PDFs)
2. Claude vision for recipe extraction from photos
3. Basic recipe storage (Supabase)
4. Menu builder conversation flow
5. Output generation: React component view
6. Shopping list generation
7. Basic timeline generation

### Phase 2: Polish & Export

**Goal:** Production-quality output + better recipe management

1. PDF export (timeline, shopping lists, recipe cards)
2. URL recipe scraping
3. Recipe versioning
4. Tagging and search
5. Shopping list by store customization
6. AI suggestions (sides, drinks, balance)
7. Fancy menu card generator

### Phase 3: Live Mode & Collaboration

**Goal:** Real-time execution support + family sharing

1. Interactive timeline with "start" anchor
2. Timeline recalculation when running behind
3. Push notifications / alarms
4. User invites to meals
5. Task and store delegation
6. Helper-specific views
7. Real-time status updates

### Phase 4: Family Social (V2)

**Goal:** Recipe sharing + memories

- Family/group recipe sharing
- Post-meal notes ("Make 20% more green beans next time")
- Photo attachments from the meal
- Meal history and memories
- Tablet-optimized interface

---

## Technical Architecture

### Stack

- **Frontend:** Next.js + React + Tailwind
- **Backend:** Supabase (auth, database, storage, realtime)
- **AI:** Claude API (vision for OCR, chat for planning)
- **PDF Generation:** React-PDF or similar
- **Notifications:** Web push / Supabase realtime

### Data Model

```
Meal
  ├── Recipes[] (with scaling factors)
  ├── GuestList (count, names, dietary notes)
  ├── Timeline (anchored to start or serve time)
  ├── ShoppingLists[] (by store)
  ├── Assignments[] (person → tasks/stores)
  └── ChatHistory (the conversation that built it)

Recipe
  ├── OriginalSource (image, PDF, URL)
  ├── ExtractedData (ingredients, steps, yield)
  ├── Versions[]
  └── Tags[]

User
  ├── Recipes[] (personal library)
  ├── Meals[] (past and planned)
  └── Family/Group connections
```

### Key Technical Challenges

#### Recipe Extraction Accuracy
Handwritten recipes vary wildly. Need robust prompting for Claude vision to handle abbreviations, smudges, family shorthand. Store both original image and extracted data so users can correct mistakes.

#### Timeline Generation
Working backwards from serve time requires understanding task dependencies, parallel work, oven conflicts. Start simple (user-guided), add AI optimization later.

#### Scaling Math
Recipes don't always scale linearly (spices, baking chemistry). Surface this to users rather than pretending it's perfect. "Scaled from 4 to 18 servings—double-check seasoning."

#### Real-time Collaboration
Supabase realtime for task updates. Keep it simple—no complex conflict resolution needed. Last-write-wins is fine for checking off tasks.

---

## Name Ideas

- MealOps
- The Prep Sheet
- Sunday Dinner
- Heirloom
- Family Table
- The Spread
- Mise (as in mise en place)

---

## Next Steps

- [ ] Spin up Next.js project with Supabase
- [ ] Build basic chat interface with file upload
- [ ] Implement Claude vision recipe extraction
- [ ] Create recipe storage schema
- [ ] Build output component (port Christmas Eve artifact as starting point)
- [ ] Iterate on conversation flow
