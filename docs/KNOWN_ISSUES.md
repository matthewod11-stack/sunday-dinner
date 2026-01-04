# Sunday Dinner v1 — Known Issues & Parking Lot

> **Purpose:** Track issues, blockers, and deferred decisions across all development phases.
> **Related Docs:** [ROADMAP.md](./ROADMAP.md) | [PROGRESS.md](./PROGRESS.md) | [SESSION_PROTOCOL.md](./SESSION_PROTOCOL.md)

---

## How to Use This Document

**Add issues here when:**
- You encounter a bug that isn't blocking current work
- You discover something that needs investigation later
- A decision needs to be made but can wait
- You find edge cases that need handling eventually
- **[PARALLEL PHASES]** You need a shared file change that requires coordination

**Format:**

```markdown
### [PHASE-X] Brief description
**Status:** Open | In Progress | Resolved | Deferred
**Severity:** Blocker | High | Medium | Low
**Discovered:** YYYY-MM-DD
**Description:** What happened / what's the issue
**Workaround:** (if any)
**Resolution:** (when resolved)
```

**For coordination needs in parallel phases (Weeks 3-9), use:**

```markdown
### [COORDINATION NEEDED] Brief description
**Status:** Open | In Progress | Resolved
**Agent:** Agent A | Agent B | Both
**Discovered:** YYYY-MM-DD
**Description:** What shared file/interface needs to change and why
**Proposed Change:** Specific code change or contract modification
**Impact:** How this affects the other agent's work
**Resolution:** (when coordinated and implemented)
```

---

## Open Issues

*(No issues yet — project just starting)*

---

## Coordination Needed (Parallel Phases)

*(No active coordination issues)*

---

**Example format for reference:**

<!--
### [COORDINATION NEEDED] Add servingSize field to Recipe type
**Status:** Open
**Agent:** Agent A
**Discovered:** 2024-12-27
**Description:** Recipe scaling needs servingSize to calculate properly
**Proposed Change:** Add `servingSize?: number` to Recipe interface in `types/recipe.ts`
**Impact:** Agent B's meal service will need to handle this field when displaying recipe details
**Resolution:** TBD
-->

---

## Resolved Issues

### [PHASE-2] Zod v4 API error in extract route
**Status:** Resolved
**Severity:** High
**Discovered:** 2025-01-03
**Description:** Build failed due to `z.enum()` using deprecated `errorMap` parameter. Zod v4 changed the API.
**Resolution:** 2025-01-03 — Changed `errorMap: () => ({ message: "..." })` to `error: "..."` in `src/app/api/recipes/extract/route.ts`.

### [PHASE-2] Type error in meals API route
**Status:** Resolved
**Severity:** High
**Discovered:** 2025-01-03
**Description:** Build failed due to type error in `src/app/api/meals/route.ts`. Agent B fixed during their session.
**Resolution:** 2025-01-03 — Agent B fixed the type annotation issue.

### [PHASE-1] Supabase API key format invalid
**Status:** Resolved
**Severity:** Blocker
**Discovered:** 2024-12-28
**Description:** The anon key in `.env.local` had format `ysb_publishable_...` instead of standard Supabase JWT format `eyJ...`. This caused "Invalid API key" errors on all database operations.
**Resolution:** 2024-12-30 — Replaced with correct JWT key from Supabase dashboard. Health endpoint now returns `{"status":"ok","database":"connected"}`.

---

## Deferred Decisions

*(Decisions that can wait until v2 or later)*

| Decision | Reason to Defer | Target Phase |
|----------|-----------------|--------------|
| Multi-user auth | V1 is solo user only | V2 |
| Voice commands | Nice-to-have, not core | V2+ |
| Push notifications | Local timers + in-app alerts sufficient | V2+ |
| Recipe versioning | Not needed for first meals | V2+ |

---

## Edge Cases to Handle

*(Known edge cases that don't block v1 ship but should be tracked)*

| Case | Phase | Priority | Notes |
|------|-------|----------|-------|
| Multi-page recipes | 1 | Low | V1 only handles single-page, document limitation |
| Concurrent checkoffs (multi-device) | 3 | Low | V1 is solo user, last-write-wins is fine |
| Very long ingredient lists (50+) | 2 | Low | Monitor for UI/UX issues in shopping list |
| Recipes with no images | 1 | Medium | Ensure manual entry works well |
| Offline for extended periods (>1 hour) | 3 | Medium | Test sync behavior with large queues |

---

## Testing Gaps

*(Areas that need more testing, tracked for integration phases)*

| Area | Week to Test | Notes |
|------|--------------|-------|
| iOS Safari wake lock | 10 | Critical for kitchen use, needs fallback |
| Offline sync with 100+ queued operations | 9 | Stress test IndexedDB queue |
| Share link with very long timeline (100+ tasks) | 9 | Performance testing for viewer |
| Recipe extraction on very faded ink | 11 | Real family recipe cards in final testing |

---

## Notes on Issue Management

### During Single-Agent Phases (Weeks 1-2, 10-11)
- Add issues as you discover them
- Use severity to prioritize
- Move blockers to top of Open Issues
- Resolved issues go to bottom (historical reference)

### During Parallel-Agent Phases (Weeks 3-9)
- Use "COORDINATION NEEDED" tag for shared file changes
- Be specific about impact on other agent
- Both agents should review coordination items at session start
- One agent implements, other agent reviews and updates their code
- Close coordination items only when both agents verify

### At Integration Checkpoints (Weeks 6, 9)
- Review all open issues
- Triage: fix now, defer to next phase, or defer to v2
- Close resolved coordination items
- Update edge cases with findings from integration testing

---

*Last Updated: December 27, 2024*

