# Agent A Week 7: Live Execution Core + Timers

**Phase:** Phase 3 - Live Mode (Week 7)
**Agent:** A
**Focus:** Kitchen Walkthrough, Live Execution, Task Checkoff, Timers
**Created:** 2026-01-04

---

## Overview

Build the live cooking execution mode. Users tap "Start Cooking" to anchor the timeline to real time, check off tasks as they complete them, and use local timers for time-sensitive steps.

---

## Directory Structure (My Boundary)

```
src/
├── app/live/
│   ├── page.tsx                    # List of meals ready for cooking
│   └── [mealId]/
│       ├── page.tsx                # Live execution view
│       └── walkthrough/page.tsx    # Optional: Kitchen walkthrough route
├── lib/services/execution/
│   └── execution-service.ts        # Live execution state management
└── lib/timers/
    ├── timer-service.ts            # Local timer implementation
    └── timer-audio.ts              # Web Audio API for alerts
```

---

## Implementation Tasks

### Task 1: Kitchen Walkthrough Component (Ready Check Modal)

**Purpose:** Help users prepare before starting the cooking session.

**Files:**
- `src/components/live/kitchen-walkthrough.tsx`
- `src/components/live/index.ts` (barrel export)

**Implementation:**
- Modal overlay with semi-opaque backdrop
- Auto-generated checklist from first hour's tasks (equipment, ingredients)
- Collapsible sections: "Equipment to Prep", "Ingredients to Stage"
- Extract equipment from task titles: oven, mixer, food processor, etc.
- "Skip" checkbox with localStorage persistence (`sunday-dinner-skip-walkthrough`)
- "I'm Ready" button → closes modal, enables "Start Cooking"

**Trade-offs:**
- Static equipment keywords vs AI parsing: Choose static for offline reliability

---

### Task 2: Start Cooking Flow

**Purpose:** Anchor the timeline to real clock time.

**Files:**
- `src/lib/services/execution/execution-service.ts`
- `src/app/live/[mealId]/page.tsx`

**Implementation:**
- "Start Cooking" button (prominent, terracotta)
- On click:
  1. Set `isRunning = true` on timeline
  2. Set `startedAt = now().toISOString()`
  3. Calculate real times for all tasks based on serve time
  4. Persist to Supabase
- State: `executionState: 'not_started' | 'walkthrough' | 'cooking' | 'completed'`

**API Route:**
- `POST /api/live/[mealId]/start` - Mark timeline as running

---

### Task 3: Live Now/Next/Later View

**Purpose:** Real-time view of cooking progress.

**Files:**
- `src/components/live/live-timeline-view.tsx`

**Implementation:**
- Reuse `NowNextLaterView` grouping logic, but with real time calculations
- Add "Current Time" indicator showing real clock
- Tasks show actual clock times (not relative)
- Auto-scroll to keep NOW task visible
- Visual pulse on current task

**Differences from planning view:**
- Planning: relative times ("2h before serve")
- Live: actual clock times ("3:45 PM")

---

### Task 4: Task Checkoff with Visual Feedback

**Purpose:** Mark tasks complete with satisfying UX feedback.

**Files:**
- Modify `src/components/timeline/task-card.tsx` (careful - shared!)
- Create `src/components/live/live-task-card.tsx` (wrapper)

**Implementation:**
- Tap checkbox → status changes to "completed"
- Visual feedback:
  - Checkbox fills with green checkmark
  - Card slides slightly, subtle background color change
  - Confetti micro-animation on last task
- Persist to Supabase immediately
- Update `completedAt` timestamp

**API Route:**
- `PATCH /api/live/[mealId]/tasks/[taskId]` - Update task status

---

### Task 5: Undo Checkoff (30 second window)

**Purpose:** Recover from accidental checkoffs.

**Files:**
- `src/components/live/undo-toast.tsx`
- `src/hooks/use-undo.ts`

**Implementation:**
- Show toast with "Undo" button for 30 seconds after checkoff
- Toast position: bottom-center (doesn't block task view)
- Timer countdown visual (shrinking progress bar)
- On tap undo: revert to `pending`, remove `completedAt`
- Auto-dismiss after 30s

**State:**
```typescript
interface UndoableAction {
  taskId: string;
  previousStatus: TaskStatus;
  expiresAt: number; // Date.now() + 30000
}
```

---

### Task 6: Progress Indicator

**Purpose:** Show overall cooking progress.

**Files:**
- `src/components/live/progress-bar.tsx`

**Implementation:**
- Horizontal bar at top of live view
- Shows: `completed / total tasks` with percentage
- Color gradient: terracotta → sage as progress increases
- Time remaining estimate based on serve time
- Format: "12/24 tasks • 1h 45m until dinner"

---

### Task 7: Local Timer Implementation

**Purpose:** Track time-sensitive tasks without network.

**Files:**
- `src/lib/timers/timer-service.ts`
- `src/lib/timers/timer-audio.ts`
- `src/components/live/timer-controls.tsx`
- `src/components/live/active-timer-banner.tsx`

**Implementation:**

**Timer Service:**
```typescript
interface Timer {
  id: string;
  taskId: string;
  label: string;
  durationSeconds: number;
  remainingSeconds: number;
  status: 'running' | 'paused' | 'completed' | 'dismissed';
  createdAt: number;
}

class TimerService {
  private timers: Map<string, Timer>;
  private intervals: Map<string, NodeJS.Timeout>;

  startTimer(taskId: string, label: string, durationMinutes: number): string;
  pauseTimer(timerId: string): void;
  resumeTimer(timerId: string): void;
  resetTimer(timerId: string): void;
  dismissTimer(timerId: string): void;
  getActiveTimers(): Timer[];
}
```

**Timer Audio:**
- Web Audio API for alarm sound (works even when tab backgrounded)
- Oscillator-based beep pattern (no audio file dependency)
- Respects device mute state on iOS
- Fallback to vibration API on mobile

**Timer Controls:**
- Button on each task card: "Set Timer"
- Pre-fills with task duration
- Manual duration adjustment

**Active Timer Banner:**
- Sticky banner at bottom when timers running
- Shows most urgent timer (least time remaining)
- Tap to expand and see all active timers
- Prominent display: "TIMER: Roast potatoes — 12:34"

---

### Task 8: API Routes for Live Mode

**Files:**
- `src/app/api/live/[mealId]/route.ts` - GET live state
- `src/app/api/live/[mealId]/start/route.ts` - POST start cooking
- `src/app/api/live/[mealId]/tasks/[taskId]/route.ts` - PATCH task status

---

## Component Tree

```
/live/[mealId]/page.tsx
├── KitchenWalkthrough (modal, shown on first visit)
│   ├── EquipmentChecklist
│   └── IngredientChecklist
├── LiveHeader
│   ├── ProgressBar
│   └── ServeTimeCountdown
├── LiveTimelineView
│   ├── SectionHeader (Now/Next/Later)
│   └── LiveTaskCard[]
│       ├── TaskCheckbox
│       ├── TaskInfo
│       └── TimerButton
├── ActiveTimerBanner (sticky bottom)
│   └── TimerDisplay[]
└── UndoToast (bottom toast)
```

---

## Verification Checklist

- [ ] Kitchen Walkthrough shows first-hour equipment/ingredients
- [ ] Skip preference persists in localStorage
- [ ] "Start Cooking" anchors timeline to real time
- [ ] Tasks show actual clock times when live
- [ ] Checkoff updates status with visual feedback
- [ ] Undo works within 30 seconds
- [ ] Progress bar reflects completed/total
- [ ] Timer can start/pause/reset
- [ ] Timer alert sounds when complete
- [ ] Active timer banner shows countdown
- [ ] All changes persist to Supabase
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes

---

## Dependencies

**Existing (reuse):**
- `NowNextLaterView` grouping logic
- `TaskCard` component (wrap, don't modify directly)
- Timeline types (`isRunning`, `startedAt`, `currentTaskId`)
- Modal component from UI library

**New:**
- Web Audio API (browser native)
- No new npm packages needed

---

## Risk Mitigation

1. **TaskCard shared component:** Create `LiveTaskCard` wrapper that adds live-specific behavior
2. **Timer accuracy:** Use `requestAnimationFrame` or `setInterval` with drift correction
3. **iOS audio:** Pre-load audio context on first user interaction (button tap)
4. **Background tabs:** Web Audio continues, but test thoroughly

---

## Order of Implementation

1. Execution service + API routes (foundation)
2. Live page shell with basic timeline
3. Start cooking flow
4. Task checkoff + undo
5. Progress indicator
6. Kitchen walkthrough
7. Timer service
8. Timer controls + banner

This order builds from foundational services up, ensuring we have working live mode early and add features incrementally.
