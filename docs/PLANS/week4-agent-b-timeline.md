# Week 4 Agent B Plan: Timeline Generation + Views

**Agent:** B
**Scope:** Timeline generation service, validators, and UI views
**Created:** 2025-01-03

## Overview

Build the complete timeline generation pipeline:
1. Claude generates tasks from meal recipes
2. Deterministic validator checks for conflicts
3. UI displays timeline with conflict warnings
4. Two view modes: Now/Next/Later and Gantt

## Architecture

```
src/lib/services/timeline/
├── index.ts                    # Barrel export
├── supabase-timeline-service.ts # Main service implementation
└── validator.ts                # Deterministic validation logic

src/lib/validator/
└── timeline-validator.ts       # Pure validation functions

src/app/timeline/
├── page.tsx                    # Timeline list (redirect to meal's timeline)
└── [mealId]/
    ├── page.tsx                # Main timeline view
    └── generate/page.tsx       # Timeline generation flow

src/components/timeline/
├── index.ts                    # Barrel export
├── conflict-banner.tsx         # Warning UI for conflicts
├── now-next-later-view.tsx     # Primary view
├── gantt-view.tsx              # Secondary view
├── task-card.tsx               # Individual task display
└── view-switcher.tsx           # Toggle between views
```

## Implementation Order

### Task 1: Deterministic Validator (Pure Functions)

Create `src/lib/validator/timeline-validator.ts`:

```typescript
// Pure functions, no dependencies on services
export function validateOvenConflicts(tasks: Task[]): TimelineConflict[];
export function validateDependencies(tasks: Task[]): TimelineConflict[];
export function validateDurations(tasks: Task[]): TimelineConflict[];
export function validateServeTime(tasks: Task[]): TimelineConflict[];
export function validateTimeline(tasks: Task[]): ValidationResult;
```

**Validation Rules:**
1. **Oven overlap**: Two tasks with `requiresOven=true` cannot overlap in time
2. **Dependencies**: If task A `dependsOn: [B]`, A must start after B ends
3. **Duration**: All `durationMinutes` must be positive (>0)
4. **Serve time**: No task should have `endTimeMinutes > 0` (ends after serve)

### Task 2: Timeline Service

Create `src/lib/services/timeline/supabase-timeline-service.ts`:

Key methods for Week 4:
- `generate(meal)`: Call Claude AI, validate, return timeline with conflicts
- `get(id)`: Fetch timeline from Supabase
- `getByMealId(mealId)`: Fetch timeline for meal
- `save(timeline)`: Persist to Supabase
- `validate(timeline)`: Run deterministic validation

### Task 3: Timeline Components

**ConflictBanner**: Shows conflict warnings at top of timeline
- Error severity (red): Blocks cooking
- Warning severity (amber): Can proceed with caution

**NowNextLaterView**: Primary view
- Groups tasks: Now (current), Next (upcoming 30min), Later (rest)
- Shows task cards with time, duration, status

**TaskCard**: Individual task
- Title, time, duration
- Recipe source indicator
- Oven badge if applicable
- Status indicator

**GanttView**: Secondary (simpler version)
- Horizontal timeline bars
- Color-coded by recipe
- Time scale along bottom

### Task 4: API Routes

```
/api/timeline/generate     POST - Generate timeline for meal
/api/timeline/[id]         GET - Fetch timeline
/api/meals/[id]/timeline   GET - Get timeline for specific meal
```

## Dependencies

**Agent A's code (read-only):**
- Recipes fetched via existing recipe service
- Recipe detail view for linking

**Shared:**
- Types from `src/types/timeline.ts` (defined in Week 1)
- TimelineService contract from `src/contracts/timeline-service.ts`
- AI service from `src/lib/services/ai/`

## Testing Approach

1. Unit test validator functions (pure, easy to test)
2. Integration test service with mock AI responses
3. Manual E2E: Create meal → Generate timeline → View conflicts

## Success Criteria

- [ ] `validateTimeline()` detects oven overlap
- [ ] `validateTimeline()` detects dependency violations
- [ ] `validateTimeline()` detects invalid durations
- [ ] `validateTimeline()` detects tasks ending after serve time
- [ ] Timeline generates from meal with 2+ recipes
- [ ] Conflicts display in UI with appropriate severity
- [ ] Now/Next/Later view shows tasks grouped correctly
- [ ] Gantt view displays horizontal timeline
- [ ] All `npm run typecheck && npm run lint` passes
