# Week 5 Agent B: Timeline Editing Plan

**Phase:** Phase 2, Week 5 (Core Features)
**Agent:** Agent B (Timeline/Meals)
**Created:** 2026-01-03

## Overview

Week 5 focuses on enabling users to edit their cooking timeline. The foundation from Week 4 includes:
- Timeline generation via Claude
- Deterministic validation (oven conflicts, dependencies)
- Now/Next/Later and Gantt views
- View switching (already complete!)

This week adds the editing capabilities to make timelines truly useful.

## Tasks

### 1. Task Editing (Time, Duration Adjustment)
**Priority:** High
**Approach:**
- Create `TaskEditModal` component using existing Modal primitive
- Form fields: title, start time, duration, notes
- Start time as "X minutes before serve time" input
- Re-validate on save, show any new conflicts immediately
- API: PATCH `/api/timeline/[id]` with `action: updateTask`

**Files:**
- Create: `src/components/timeline/task-edit-modal.tsx`
- Update: `src/app/timeline/[mealId]/page.tsx`

### 2. Task Reordering (Form-Based)
**Priority:** Medium
**Approach:**
- Create `TaskReorderModal` component
- Show numbered list of tasks
- Use up/down arrow buttons to move tasks
- Update sort_order in database
- API: PATCH `/api/timeline/[id]` with `action: reorderTasks`

**Files:**
- Create: `src/components/timeline/task-reorder-modal.tsx`
- Add "Reorder" button to timeline toolbar

### 3. Task Deletion with Dependency Handling
**Priority:** Medium
**Approach:**
- Add delete button to `TaskEditModal`
- Show confirmation if task has dependents
- SupabaseTimelineService.deleteTask() already handles dependency cleanup
- API: PATCH `/api/timeline/[id]` with `action: deleteTask`

**Files:**
- Update: `src/components/timeline/task-edit-modal.tsx`

### 4. Timeline Regeneration
**Priority:** Medium
**Approach:**
- Implement `regenerate()` in SupabaseTimelineService
- Fetch fresh meal data from MealService
- Call `generate()` with updated meal
- Delete old tasks, replace with new ones
- Keep track of any manually-edited task notes

**Files:**
- Update: `src/lib/services/timeline/supabase-timeline-service.ts`
- Wire up existing "Regenerate" button in timeline page

### 5. Mobile-Responsive Timeline Views
**Priority:** Low
**Approach:**
- Review NowNextLaterView for mobile layout
- GanttView: Consider horizontal scroll on mobile
- TaskCard: Ensure touch targets are 44px minimum
- Test at 320px, 375px, 414px widths

**Files:**
- Update: `src/components/timeline/now-next-later-view.tsx`
- Update: `src/components/timeline/gantt-view.tsx`
- Update: `src/components/timeline/task-card.tsx`

## Implementation Order

1. Task Editing Modal (core functionality)
2. Task Deletion (add to modal)
3. Task Reordering
4. Timeline Regeneration (fix the stub)
5. Mobile Responsiveness (polish pass)

## Definition of Done

- [ ] Can edit task time and duration via modal
- [ ] Can delete tasks with confirmation
- [ ] Can reorder tasks via form UI
- [ ] Regenerate button works when recipes change
- [ ] Timeline views work on mobile (320px width)
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
