# Agent B Week 6: Integration Testing & Polish

**Phase:** Phase 2, Week 6 (Core Features - Integration)
**Focus:** Integration testing from Meal/Timeline perspective
**Agent:** B (owns meals, timeline, validator)

---

## Tasks Overview

### 1. Integration Test: Meal Creation with Multiple Recipes

**Objective:** Verify meal creation with 2+ recipes works end-to-end

**Steps:**
- Navigate to meal creation
- Add 2+ recipes from picker (depend on Agent A's saved recipes)
- Apply different scaling factors
- Verify scaling UI displays correctly
- Verify Claude scaling review flags concerns appropriately
- Save meal and verify detail view

**Files to verify:**
- `/app/meals/new/page.tsx`
- `/app/meals/[id]/page.tsx`
- `/lib/services/meal/supabase-meal-service.ts`

### 2. Integration Test: Timeline Generation from Real Meal

**Objective:** Verify timeline tasks reference correct recipe steps

**Steps:**
- Create meal with 2+ recipes with distinct cooking steps
- Generate timeline
- Verify each task references the correct recipe
- Verify task order makes sense (prep before cook, etc.)
- Check timing calculations relative to serve time

**Files to verify:**
- `/app/timeline/[mealId]/page.tsx`
- `/lib/services/timeline/supabase-timeline-service.ts`
- `/lib/services/ai/prompts.ts` (timeline generation prompt)

### 3. Integration Test: Oven Conflict Detection

**Objective:** Verify conflict detection works with multiple oven-requiring recipes

**Steps:**
- Create meal with 2+ recipes that require oven
- Set overlapping cook times (e.g., both at 350°F but different times)
- Generate timeline
- Verify conflict banner appears
- Verify conflict details are accurate (which tasks, which temps)

**Files to verify:**
- `/lib/validator/timeline-validator.ts`
- `/components/timeline/conflict-banner.tsx`

### 4. Integration Test: Timeline Editing + Regeneration

**Objective:** Verify editing flow and regeneration behavior

**Steps:**
- Generate timeline for a meal
- Edit a task (change time, duration)
- Verify edit persists
- Add/remove recipe from meal
- Regenerate timeline
- Note: Edits may not be preserved on full regeneration (expected behavior)

**Files to verify:**
- `/components/timeline/task-edit-modal.tsx`
- `/components/timeline/task-reorder-modal.tsx`
- Timeline service `regenerate()` method

### 5. Integration Test: View Components with Real Data

**Objective:** Verify Now/Next/Later and Gantt views work with real meal data

**Steps:**
- Generate timeline for meal with 10+ tasks
- Test Now/Next/Later view grouping logic
- Test Gantt view horizontal layout
- Switch between views
- Verify visual consistency

**Files to verify:**
- `/components/timeline/now-next-later-view.tsx`
- `/components/timeline/gantt-view.tsx`
- `/components/timeline/view-switcher.tsx`

### 6. Polish: Meal Creation/Edit Flow

**Objective:** Ensure consistent UX

**Areas to check:**
- Form validation feedback
- Loading states during saves
- Error handling for failed operations
- Navigation flow (back buttons, breadcrumbs)
- Empty state when no recipes exist

### 7. Polish: Timeline Mobile Responsiveness

**Objective:** Final mobile check

**Areas to check:**
- Touch targets ≥44px on all interactive elements
- Gantt view horizontal scroll on mobile
- Toolbar layout on narrow screens
- Modal sizing on mobile
- Task cards readable on small screens

### 8. Performance: Timeline Generation with 4+ Recipes

**Objective:** Profile and identify bottlenecks

**Steps:**
- Create meal with 4 recipes, each with 8-10 steps
- Time the timeline generation
- Note API response time vs UI render time
- Check for any obvious inefficiencies

---

## Coordination with Agent A

Agent A is handling:
- PDF build fix (CRITICAL)
- Recipe→Shopping list integration
- Recipe list/detail polish

We share:
- Recipe→Meal picker integration (I verify recipes appear in picker)
- Both should verify build passes after their changes

---

## Files to Modify

```
src/lib/services/meal/           # Potential bug fixes
src/lib/services/timeline/       # Potential bug fixes
src/lib/validator/               # Potential bug fixes
src/components/timeline/         # Polish/accessibility
src/app/meals/                   # Polish/UX
src/app/timeline/                # Polish/UX
```

---

## Definition of Done

- [x] Meal creation with 2+ scaled recipes works
- [x] Timeline generation references correct recipe steps
- [x] Oven conflict detection works across multiple recipes
- [x] Timeline editing (time, duration, reorder) persists correctly *(bug fixed: end_time_minutes calculation)*
- [x] Now/Next/Later and Gantt views render real data correctly
- [x] Meal creation/edit flows are consistent
- [x] Timeline is mobile-responsive (44px touch targets)
- [x] Timeline generation with 4+ recipes completes in reasonable time (<10s)
- [x] `npm run typecheck` passes
- [x] `npm run lint` passes

**Status: COMPLETE (2026-01-04)**

---

## Timeline

1. Run dev server, test existing functionality
2. Work through integration tests 1-5
3. Document any bugs found
4. Polish issues 6-7
5. Performance profiling (8)
6. Update PROGRESS.md and commit

---

*Created: 2026-01-04*
*Agent: B*
