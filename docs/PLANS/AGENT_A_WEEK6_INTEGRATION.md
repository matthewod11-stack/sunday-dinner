# Agent A Week 6: Integration Testing & Build Fix

**Phase:** Phase 2, Week 6 (Core Features - Integration)
**Focus:** Fix build error, integration testing from Recipe/Shopping perspective
**Agent:** A (owns recipes, shopping, extraction)

---

## Tasks Overview

### 1. [CRITICAL] Fix pdf.js DOMMatrix Build Error

**Problem:**
- `npm run build` fails with `ReferenceError: DOMMatrix is not defined`
- Error occurs in `/api/recipes/extract-url/route.ts`
- Root cause: Barrel export couples pdf-parser.ts with url-scraper.ts

**Root Cause Analysis:**
```
extract-url/route.ts
  → imports from @/lib/extraction (barrel export)
    → index.ts re-exports pdf-parser.ts
      → pdf-parser.ts imports pdfjs-dist
        → pdfjs-dist requires DOMMatrix (browser API)
          → FAIL in Node.js server environment
```

**Solution: Separate Client-Only PDF Module**
1. Remove pdf-parser.ts from main barrel export
2. Create `@/lib/extraction/client.ts` for browser-only exports
3. Update imports in PDF-related pages to use new path
4. Verify build succeeds

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

- [ ] `npm run build` passes
- [ ] Photo → Meal picker flow works end-to-end
- [ ] URL extraction → correction → save works
- [ ] Shopping list quantities reconcile correctly across scaled recipes
- [ ] Ambiguous quantities ("to taste") display properly
- [ ] Print view renders correctly

---

## Timeline

1. Fix build error (CRITICAL - blocking all other work)
2. Run integration tests with dev server
3. Polish UI issues found during testing
4. Update PROGRESS.md and commit

---

*Created: 2026-01-04*
*Agent: A*
