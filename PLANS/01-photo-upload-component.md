# Plan: Photo Upload Component with Mobile Camera Support

**Agent:** A (Recipe + Shopping)
**Task:** Week 3, Task 1
**Status:** Planning

---

## Goal

Create a photo upload component that allows users to take/select photos of recipes on both desktop and mobile devices. The component should:
1. Support file selection (desktop)
2. Support camera capture (mobile, using `capture="environment"`)
3. Show preview of selected image
4. Integrate with existing image compression utility
5. Provide feedback during upload/processing states

---

## Existing Infrastructure to Use

| Component | Location | Usage |
|-----------|----------|-------|
| `compressImage()` | `src/lib/image/compress.ts` | Compress to <500KB before Claude Vision |
| `Button` | `src/components/ui/button.tsx` | Upload trigger button |
| `Card` | `src/components/ui/card.tsx` | Container for upload area |
| Skeleton | `src/components/ui/skeleton.tsx` | Loading states |
| ClaudeAIService | `src/lib/services/ai/claude-ai-service.ts` | Recipe extraction |
| ExtractionResult | `src/types/recipe.ts` | Result type from extraction |

---

## Implementation Steps

### Step 1: Create PhotoUpload Component

**File:** `src/components/recipe/photo-upload.tsx`

```typescript
interface PhotoUploadProps {
  onPhotoSelected: (photo: PhotoData) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

interface PhotoData {
  file: File;
  preview: string;  // Object URL for display
  compressed: {
    base64: string;
    mimeType: ImageMimeType;
  };
}
```

**Features:**
- Hidden file input with `accept="image/*"` and `capture="environment"` for mobile
- Visual dropzone area with drag-and-drop support (desktop)
- "Take Photo" and "Choose File" buttons for mobile
- Preview thumbnail after selection
- Compression happens automatically on selection

### Step 2: Update New Recipe Page

**File:** `src/app/recipes/new/page.tsx`

- Replace placeholder "Coming Soon" badge with working PhotoUpload component
- Add state management for the upload flow
- Route to extraction/correction UI when photo is selected

### Step 3: Create Recipe Extraction Flow Page

**File:** `src/app/recipes/new/photo/page.tsx`

This will handle:
- Showing the uploaded photo
- Calling Claude Vision for extraction
- Navigating to correction UI with results

---

## Component Hierarchy

```
NewRecipePage
├── PhotoUpload (for photo method)
│   ├── DropZone
│   ├── FileInput (hidden)
│   ├── PreviewThumbnail
│   └── UploadProgress
└── (other methods: URL, PDF, Manual - Week 4)
```

---

## Mobile Camera Considerations

1. **capture="environment"** - Uses back camera (better for recipe cards)
2. **accept="image/*"** - Allows any image format, compression handles conversion
3. **Touch-friendly buttons** - Minimum 44px touch targets
4. **Responsive layout** - Stack vertically on mobile

---

## Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| Unsupported format | "Please use JPEG, PNG, GIF, or WebP" | Re-select file |
| File too large | "Image too large to compress. Try a smaller photo." | Re-select file |
| Compression failed | "Couldn't process image. Try a different photo." | Re-select file |

---

## Definition of Done

- [ ] PhotoUpload component created with TypeScript types
- [ ] Mobile camera capture works (capture="environment")
- [ ] Desktop file selection works with drag-and-drop
- [ ] Image preview displays after selection
- [ ] Compression happens automatically (uses existing utility)
- [ ] Error states handled gracefully
- [ ] New Recipe page updated to use PhotoUpload
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes

---

## Next Step

After this task, Task 2-4 will connect the compressed image to Claude Vision for extraction.
