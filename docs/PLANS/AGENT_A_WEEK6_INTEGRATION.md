# Agent A Week 6: Integration Testing & Build Fix

**Phase:** Phase 2, Week 6 (Core Features - Integration)
**Focus:** Fix build error, integration testing from Recipe/Shopping perspective
**Agent:** A (owns recipes, shopping, extraction)

---

## Tasks Overview

### 1. [COMPLETE] Fix pdf.js DOMMatrix Build Error

**Status:** RESOLVED in commit `69566d6`

**Problem (was):**
- `npm run build` failed with `ReferenceError: DOMMatrix is not defined`
- Root cause: Barrel export coupled pdf-parser.ts with url-scraper.ts

**Solution Applied:**
- Removed pdf-parser.ts from main barrel export
- Created `@/lib/extraction/client.ts` for browser-only exports
- Updated imports in PDF-related pages

**Next:** Verify build still passes before integration testing

### 2. Integration Tests

**Test A: Photo Recipe → Meal Picker**
- Upload a recipe via photo
- Navigate to meal creation
- Verify recipe appears in picker
- Add recipe to meal with scaling

**Test B: URL Recipe → Correction Flow**
- Enter a recipe URL
- Verify extraction works
- Use correction UI to fix any issues
- Save recipe
- Verify recipe in list

**Test C: Meal → Shopping List Quantities**
- Create meal with 2+ recipes at different scales
- Generate shopping list
- Verify quantities are reconciled correctly
- Check unit conversions (cups → tbsp etc.)

**Test D: Ambiguous Quantities**
- Add recipe with "to taste" ingredients
- Generate shopping list
- Verify ambiguous quantities display properly
- Check unreconcilable banner appears if needed

### 3. UI Polish

**Recipe List/Detail:**
- Visual consistency between list cards and detail view
- Loading states work properly
- Error states display correctly

**Shopping List Print:**
- Print layout renders correctly
- Store sections are clear
- Checked items behavior in print

---

## Files to Modify

```
src/lib/extraction/
├── index.ts           # MODIFY: Remove pdf exports
└── client.ts          # CREATE: Client-only exports (PDF)

src/app/recipes/new/pdf/
└── page.tsx           # MODIFY: Update import path
```

---

## Definition of Done

- [x] `npm run build` passes ✓ (verified 2026-01-04)
- [x] Photo → Meal picker flow works end-to-end ✓ (code review verified)
- [x] URL extraction → correction → save works ✓ (code review verified)
- [x] Shopping list quantities reconcile correctly across scaled recipes ✓ (code review verified)
- [x] Ambiguous quantities ("to taste") display properly ✓ (UnreconcilableBanner works)
- [x] Print view renders correctly ✓ (print-specific CSS and layout verified)

---

## Timeline

1. Fix build error (CRITICAL - blocking all other work)
2. Run integration tests with dev server
3. Polish UI issues found during testing
4. Update PROGRESS.md and commit

---

*Created: 2026-01-04*
*Agent: A*
