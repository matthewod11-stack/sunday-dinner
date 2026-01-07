# Agent B Week 8: Share Link Viewer

**Phase:** Phase 3, Week 8 (Live Mode)
**Focus:** Share link viewer route with real-time polling

## Context

Week 7 Agent B completed:
- `meal_share_tokens` table with UUID primary key
- RLS policies for public read, host manage
- ShareService with generateLink, validateToken, getShareData, revokeLinks
- API routes: POST /api/share, GET /api/share/[token], DELETE /api/share

## Week 8 Tasks

1. **Share link viewer route** (`/share/[token]`)
   - Page component at `/app/share/[token]/page.tsx`
   - Server-side token validation on initial load
   - Client-side hydration with share data

2. **Token validation UI states**
   - Loading state while validating
   - Valid: Show timeline viewer
   - Invalid/Not found: Show "invalid link" message
   - Expired: Show "link expired" UI with expiration time

3. **Read-only Now/Next/Later view**
   - Adapt LiveTimelineView for read-only (no checkoff)
   - Create ViewerTaskCard (no checkoff button, no timer)
   - Show recipe names, times, descriptions
   - Progress indicator (X of Y tasks complete)

4. **Polling for updates**
   - Create usePolling hook with 5-second interval
   - Pause when tab hidden (visibilitychange)
   - Resume on tab focus
   - Show "Last updated X" timestamp

5. **Link expired UI**
   - Clear messaging with lock icon
   - Show when the link expired
   - Suggest asking host for new link

6. **Expiration recalculation**
   - Add API endpoint or service method to update token expiration
   - Called when meal serve_time changes
   - Update all tokens for that meal

7. **Mobile-responsive viewer**
   - Touch-friendly task cards (44px targets)
   - Stacked layout on mobile
   - Clear serve time display

## File Structure

```
src/
├── app/share/[token]/
│   └── page.tsx              # Main viewer page
├── components/share/
│   ├── index.ts              # Barrel export
│   ├── share-modal.tsx       # (existing)
│   ├── viewer-timeline.tsx   # Read-only timeline view
│   ├── viewer-task-card.tsx  # Read-only task card
│   ├── expired-link.tsx      # Expired link UI
│   └── invalid-link.tsx      # Invalid link UI
└── lib/polling/
    ├── index.ts              # Barrel export
    └── use-polling.ts        # Polling hook
```

## API Design

### Existing: GET /api/share/[token]
Returns ShareMealData or error

### New Consideration: Serve time change
When meal serve_time changes, meal edit page should recalculate token expiration.
This happens in meal service, not share service.

## Key Patterns

**Polling:**
```typescript
const usePolling = (fetcher: () => Promise<T>, interval: number) => {
  // Set up interval
  // Pause on visibilitychange
  // Return data, isLoading, lastUpdated
}
```

**Read-only adaption:**
- Copy LiveTimelineView structure but remove onCheckoff props
- ViewerTaskCard shows status visually but has no interaction
- Completed tasks show checkmark, pending show circle

## Dependencies

- Existing LiveTimelineView as reference
- execution-service.ts for groupTasksForLive, calculateRealTime
- share types from src/types/share.ts

## Verification

- [ ] npm run typecheck passes
- [ ] npm run lint passes
- [ ] Token validation works (valid, expired, not found)
- [ ] Polling updates viewer every 5 seconds
- [ ] Mobile layout is responsive
