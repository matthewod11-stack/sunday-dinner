# Plan: Side-by-Side Correction UI

**Agent:** A (Recipe + Shopping)
**Task:** Week 3, Tasks 5-8
**Status:** Planning

---

## Goal

Create a side-by-side UI where users can:
1. View the original recipe photo (left)
2. Review and edit extracted fields (right)
3. See which fields are uncertain (highlighted)
4. Save the corrected recipe

---

## Component Architecture

```
CorrectionPage (/recipes/new/correct)
├── OriginalView
│   └── Zoomable image preview
├── RecipeForm
│   ├── BasicInfo (name, servings, times)
│   ├── IngredientsEditor
│   │   └── IngredientRow (repeatable)
│   └── InstructionsEditor
│       └── InstructionRow (repeatable)
└── Actions (Save, Cancel, Start Over)
```

---

## Key Components

### 1. RecipeForm
Form with all editable fields from ExtractionResult:
- name (text input)
- servingSize (number input)
- prepTimeMinutes (number input)
- cookTimeMinutes (number input)
- ingredients[] (dynamic list)
- instructions[] (dynamic list)

### 2. UncertainField wrapper
Highlights fields that are in `uncertainFields[]`:
- Orange/amber border
- Warning icon
- Tooltip explaining why it's uncertain

### 3. IngredientRow
Editable row for a single ingredient:
- quantity (number input, nullable)
- unit (text input, nullable)
- name (text input, required)
- notes (text input, optional)
- Delete button

### 4. InstructionRow
Editable row for a single instruction:
- stepNumber (auto-numbered, reorderable)
- description (textarea)
- durationMinutes (optional)
- ovenRequired (checkbox)
- ovenTemp (conditional)
- Delete button

---

## State Management

```typescript
// Page state
const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
const [recipe, setRecipe] = useState<Recipe | null>(null);
const [isSaving, setIsSaving] = useState(false);

// Load from sessionStorage on mount
useEffect(() => {
  const stored = sessionStorage.getItem("extraction_result");
  if (stored) {
    setExtraction(JSON.parse(stored));
    // Convert ExtractionResult to editable Recipe
  }
}, []);
```

---

## Uncertain Field Highlighting

Fields are marked uncertain when:
- Empty or missing (e.g., servingSize not found)
- Unusual values (e.g., "cook time: 4 hours")
- Low confidence from extraction

Visual indicators:
- Amber border (`border-warning`)
- Warning icon with tooltip
- "Review recommended" label

---

## Mobile Considerations

On mobile:
- Stack vertically (photo above, form below)
- Collapsible photo section
- Sticky save button at bottom

---

## Implementation Files

1. `/src/app/recipes/new/correct/page.tsx` - Main page
2. `/src/components/recipe/recipe-form.tsx` - Form component
3. `/src/components/recipe/ingredient-editor.tsx` - Ingredients list
4. `/src/components/recipe/instruction-editor.tsx` - Instructions list
5. `/src/components/recipe/uncertain-field.tsx` - Highlight wrapper

---

## Definition of Done

- [ ] Correction page loads extraction from sessionStorage
- [ ] Original photo displayed on left (collapsible on mobile)
- [ ] All extracted fields editable
- [ ] Uncertain fields visually highlighted
- [ ] Can add/remove ingredients
- [ ] Can add/remove/reorder instructions
- [ ] Form validates before save
- [ ] Typecheck and lint pass
