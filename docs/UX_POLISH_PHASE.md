# UX Polish Phase (Phase 3.5)

> **Status:** Planning
> **Inspiration:** Mela Recipe App
> **Priority:** Before iOS Safari testing (Phase 4)

---

## Design Inspiration

Reference screenshots from Mela app stored in `docs/design-reference/`:

| Screenshot | Shows |
|------------|-------|
| `mela-calendar-recipe-view.png` | Three-panel layout: sidebar categories, calendar scheduling, recipe detail |
| `mela-browser-integration.png` | Embedded web browser with "Add this Recipe" overlay |
| `mela-cook-mode.png` | "Karaoke mode" cooking — progressive text reveal with synced ingredients |

---

## Design Principles Observed

### 1. Effortless Organization
Categories feel natural, not bureaucratic. "Want to Cook" and "Favorites" are emotional bookmarks, not folder hierarchies. Organization happens through use, not manual filing.

### 2. Contextual Panels
Information appears where you need it. No full-page navigation — focus shifts between panels. The eye moves naturally left-to-right through increasing specificity.

### 3. The "Karaoke Mode" for Cooking
The signature feature. Like song lyrics on Spotify:
- **Past:** Faded/grayed — you've done this
- **Present:** Bold, prominent — do this now
- **Future:** Visible but muted — what's coming

Relevant ingredients highlight as you progress through steps. Cooking becomes a guided performance, not reference-checking.

### 4. Calm Density
Lots of information without clutter. Generous whitespace, clear typography hierarchy, muted colors with selective accent (terracotta/orange quantities stand out against gray text).

---

## Opportunities for Sunday Dinner

### High Value — Unique to Our Use Case

| Mela Concept | Sunday Dinner Adaptation | Why It's Different |
|--------------|-------------------------|-------------------|
| Cook Mode (lyrics view) | **Multi-Recipe Live Timeline** | You're cooking 3-5 dishes simultaneously. The "lyrics" show which task is NOW across ALL recipes, like a musical score with multiple instrument lines. |
| Progressive reveal | **Timeline task states** | Current task bold, completed tasks fade, upcoming visible. Applied to your Now/Next/Later view during Live Mode. |
| Ingredient highlighting | **Shopping list ↔ Timeline sync** | As you execute a step, highlight which shopping list items are being used. Or: show which ingredients to have prepped for the next hour. |

### Medium Value — Would Enhance Experience

| Mela Concept | Sunday Dinner Adaptation | Notes |
|--------------|-------------------------|-------|
| Three-panel layout | **Recipe browser redesign** | Left: categories/filters. Middle: recipe cards. Right: detail preview. Would require responsive breakpoint strategy. |
| Calendar scheduling | **Meal calendar view** | Drop meals onto dates. See what's planned this month. Useful for repeat users planning multiple gatherings. |
| "Add this Recipe" overlay | **URL import preview** | Before fully extracting, show a preview card of what we detected. Confirm before processing. |

### Lower Priority — Nice to Have

| Concept | Adaptation |
|---------|-----------|
| Embedded browser | Out of scope for v1 (URL paste is sufficient) |
| Category icons | Visual polish for recipe organization |
| Dark mode cook view | Mela's cook mode uses dark overlay — reduces screen glare in kitchen |

---

## Key Divergence: Multi-Recipe Orchestration

Mela is designed for cooking one recipe at a time. Sunday Dinner orchestrates **multiple recipes simultaneously** for 20+ people.

This creates unique design challenges:

1. **The "Score" View** — Like a conductor's score showing all instruments, we need to show all recipes' timelines stacked/interleaved, with the current moment highlighted across all of them.

2. **Context Switching Cues** — When you finish the "sauté onions" step for the chili and need to "check the roast," the UI should make that transition clear.

3. **Ingredient Staging** — For a multi-dish meal, you might prep all vegetables at once even though they're used in different recipes at different times. The "lyrics" view could show ingredient prep blocks that span multiple recipes.

4. **Parallel vs Sequential Tasks** — Some tasks truly overlap (two things simmering). Visual language for "you can do these in either order" vs "this blocks that."

---

## Implementation Approach (TBD)

This section will be filled in during planning. Placeholder for:

### Phase 3.5 Week Breakdown

```
Week 3.5A: [TBD — likely Live Mode enhancements]
- [ ] Task 1
- [ ] Task 2

Week 3.5B: [TBD — likely Recipe browser/organization]
- [ ] Task 1
- [ ] Task 2
```

### Agent Assignment

TBD — May be single agent work, or could split:
- Agent A: Recipe organization/browsing improvements
- Agent B: Live Mode "karaoke" enhancements

### Technical Considerations

- [ ] Audit current Live Mode components for enhancement points
- [ ] Determine if three-panel layout is feasible with current responsive strategy
- [ ] Prototype the "score view" for multi-recipe timeline
- [ ] Consider animation/transition library for progressive reveal

---

## Questions to Resolve During Planning

1. **Scope:** How much of this goes into v1 vs post-v1 polish?
2. **Priority:** Which opportunity has highest impact for the 20+ person use case?
3. **Risk:** Does adding this delay iOS testing (current Phase 4)?
4. **MVP:** What's the smallest version of "karaoke mode" that adds value?

---

## Reference

- Original conversation: January 18, 2026
- Screenshots: `docs/design-reference/mela-*.png`
- Related: Phase 3 Live Mode work in `ROADMAP.md`

---

*Created: January 18, 2026*
