# Agent B Week 3 Plan: Meal Setup + Scaling

## Overview
Build the complete meal creation and management workflow for Sunday Dinner.

## Scope (Agent B Boundary)
```
/app/meals/              # Meal routes
/lib/services/meal/      # Meal service implementation
```

## Tasks

### Task 1: Meal Service Implementation
- Create `/lib/services/meal/supabase-meal-service.ts`
- Implement MealService interface (from contracts)
- CRUD operations: create, get, list, update, delete
- Recipe management: addRecipe, updateRecipeScaling, removeRecipe

### Task 2: Meal Creation Form
- Update `/app/meals/new/page.tsx` with actual form
- Use existing `MealCreationFormSchema` from validation/form-schemas.ts
- Fields: name, serveTime (datetime-local), guestCount
- Server action for form submission

### Task 3: Recipe Picker Component
- Create `/components/meals/recipe-picker.tsx`
- List recipes from RecipeService.list()
- Selection UI with checkboxes
- Show recipe summary (name, servings, time)

### Task 4: Scaling Factor Input
- Create `/components/meals/scaling-input.tsx`
- Per-recipe scaling (target servings input)
- Auto-calculate multiplier from original servings
- Display scaled quantities preview

### Task 5: Claude Scaling Review
- Integrate AIService.reviewScaling()
- Display Claude's concerns (non-linear scaling)
- Show review notes in UI

### Task 6: Meal Detail View
- Create `/app/meals/[id]/page.tsx`
- Display meal info, serve time, guests
- List recipes with scaling info
- Show Claude review notes

### Task 7: Edit/Delete Functionality
- Edit form (reuse creation form)
- Delete with confirmation modal
- Handle cascade deletes

## Integration Points
- Uses RecipeService.list() (Agent A's domain)
- Uses AIService.reviewScaling() (shared infrastructure)

## Files to Create
```
src/lib/services/meal/
├── index.ts
└── supabase-meal-service.ts

src/components/meals/
├── index.ts
├── meal-form.tsx
├── recipe-picker.tsx
└── scaling-input.tsx

src/app/meals/
├── new/page.tsx (update)
├── [id]/page.tsx
└── [id]/edit/page.tsx
```

## Completion Criteria
- [ ] Can create a new meal with name, serve time, guest count
- [ ] Can add recipes to a meal with scaling
- [ ] Claude reviews scaling and shows concerns
- [ ] Can view meal details
- [ ] Can edit/delete meals
