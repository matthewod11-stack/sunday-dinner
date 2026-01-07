# Agent A Week 8 — Running Behind + Large Text Mode + Wake Lock

**Phase:** Phase 3, Week 8 (Live Mode)
**Agent:** A
**Focus:** Running behind flow, large text mode, wake lock

---

## Overview

This plan covers the "I'm running behind" user flow, accessibility features (large text mode), and screen wake lock for kitchen use.

---

## Part 1: Running Behind Flow

### 1.1 "I'm Behind" Button
- Add floating button to live mode view (visible when cooking)
- Style: Warning color, stands out but not alarming
- Position: Bottom-right, above active timer banner

### 1.2 Running Behind Modal
- Modal opens when "I'm behind" tapped
- Shows loading state while Claude analyzes
- States: loading → suggestion → accepted/dismissed

### 1.3 API Route: `/api/live/[mealId]/recalculate`
- POST with timeline state + current time
- Calls `aiService.suggestRecalculation()`
- Returns single `RecalculationSuggestion`
- Rate limit: Max 3 attempts per cooking session

### 1.4 Suggestion Display
- Human-readable: "Push 'Mash potatoes' from 4:45 → 5:00?"
- Show tasks shifted count
- Three buttons:
  - "Accept" → Apply changes, close modal
  - "Adjust Differently" → Re-request (max 3x)
  - "I'll fix it myself" → Navigate to timeline edit page

### 1.5 Accept Suggestion Flow
- Apply time changes to affected tasks
- Persist to database via PATCH
- Show confirmation toast
- Create undo action (revert within 30s)

### 1.6 Offline Fallback
- Detect when offline (via navigator.onLine or network error)
- Show "+15 min" simple button instead of Claude suggestion
- Shifts all pending tasks by 15 minutes
- No API call needed

---

## Part 2: Large Text Mode

### 2.1 Toggle in Header
- "Aa" icon button in live mode header
- Toggle stored in localStorage (`sunday-dinner-large-text`)

### 2.2 Large Text Styles
When enabled:
- Task titles: 1.5rem → 2rem
- Task times: 1rem → 1.5rem
- Progress bar: Taller
- Hide secondary info (recipe name, description details)
- Increase touch targets

### 2.3 CSS Custom Properties
```css
:root[data-large-text="true"] {
  --live-title-size: 2rem;
  --live-time-size: 1.5rem;
  --live-touch-target: 56px;
}
```

---

## Part 3: Wake Lock

### 3.1 Web Wake Lock API
```typescript
const wakeLock = await navigator.wakeLock.request('screen');
```
- Request when entering cooking mode
- Release when leaving live page or cooking ends

### 3.2 iOS Safari Fallback
iOS Safari doesn't support Wake Lock API. Workaround:
- Create hidden `<video>` element
- Play silent video in loop
- This prevents screen from sleeping
- Video: 1x1 pixel, transparent, silent

### 3.3 Wake Lock Service
New file: `src/lib/wake-lock/wake-lock-service.ts`
- `requestWakeLock()` - Request with fallback
- `releaseWakeLock()` - Release when done
- `isWakeLockActive()` - Check status
- Handle visibility change (re-request on return)

---

## File Structure

```
src/
├── components/live/
│   ├── running-behind-button.tsx    # NEW
│   ├── running-behind-modal.tsx     # NEW
│   ├── large-text-toggle.tsx        # NEW
│   └── ... (existing)
├── lib/wake-lock/
│   ├── index.ts                     # NEW
│   └── wake-lock-service.ts         # NEW
├── app/api/live/[mealId]/
│   └── recalculate/route.ts         # NEW
└── app/live/[mealId]/
    └── page.tsx                     # MODIFY - integrate features
```

---

## Implementation Order

1. **Running Behind Button + Modal** (core feature)
2. **Recalculate API Route** (enables Claude suggestions)
3. **Accept/Dismiss Flow** (user actions)
4. **Offline Fallback** (+15 min button)
5. **Suggestion Undo** (safety net)
6. **Large Text Mode** (accessibility)
7. **Wake Lock Service** (screen on)

---

## Key Design Decisions

**Rate Limiting Attempts:**
- Store attempt count in component state
- Max 3 "Adjust Differently" requests per session
- After 3rd: Show "I'll fix it myself" only
- Reason: Prevent excessive API costs

**Offline Detection:**
- Check `navigator.onLine` first
- Also catch API fetch errors
- Show offline fallback immediately on error

**Wake Lock Re-acquisition:**
- Wake lock releases on tab switch
- Re-request when document becomes visible
- Use `visibilitychange` event listener

**Large Text Persistence:**
- Store in localStorage, not database
- Device-specific preference
- Default: off (normal text)

---

## Testing Checklist

- [ ] "I'm behind" button shows during cooking
- [ ] Modal shows loading state
- [ ] Suggestion displays with readable format
- [ ] "Accept" applies changes and shows toast
- [ ] "Adjust Differently" limited to 3 attempts
- [ ] "I'll fix it myself" navigates to edit
- [ ] Undo reverts accepted suggestion
- [ ] Offline shows "+15 min" fallback
- [ ] Large text mode toggles and persists
- [ ] Wake lock keeps screen on
- [ ] iOS fallback works (silent video)

---

*Created: 2026-01-07*
