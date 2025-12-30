# Sunday Dinner

A family meal planning & execution tool for 20+ person gatherings.

Upload recipes (photo, URL, PDF, or manual entry), plan scaled meals, generate cooking timelines anchored to your serve time, create consolidated shopping lists, and execute in real-time with offline support.

## Features

- **Recipe Ingestion** — Upload photos of family recipe cards, paste URLs, upload PDFs, or enter manually
- **Smart Scaling** — Scale any recipe for your guest count with AI-assisted portion review
- **Timeline Generation** — Auto-generate cooking schedules anchored to your serve time
- **Shopping Lists** — Consolidated, unit-reconciled lists organized by store section
- **Live Mode** — Real-time cooking execution with task checkoffs and timers
- **Offline Support** — Works in airplane mode during cooking, syncs when back online
- **Share Links** — Let family members follow along with read-only timeline view

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **AI:** Claude API (recipe extraction, timeline generation, scaling review)
- **PWA:** Service Worker, offline-first architecture

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)
- Anthropic API key (for Claude)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sunday-dinner.git
cd sunday-dinner

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your credentials to .env.local:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - ANTHROPIC_API_KEY
```

### Development

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run typecheck    # TypeScript check
npm run lint         # ESLint check
```

## Project Status

**Current Phase:** Foundation Complete (Week 2 of 11)

| Phase | Status | Description |
|-------|--------|-------------|
| Foundation | Complete | Types, contracts, base components, app shell |
| Core Features | Next | Recipe ingestion, meal planning, timeline, shopping |
| Live Mode | Pending | Execution, timers, running behind, offline |
| Polish | Pending | iOS Safari, performance, final testing |

## Design System

"Warm Heirloom" — a heritage kitchen aesthetic with:
- **Primary:** Terracotta (#c2410c)
- **Secondary:** Sage (#3f6212)
- **Accent:** Amber (#d97706)
- **Typography:** Fraunces (headings), system fonts (body)

## License

MIT

---

Built with care for Sunday family dinners.
