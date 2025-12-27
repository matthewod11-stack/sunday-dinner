# Sunday Dinner v1 — Session Protocol

> **Purpose:** Ensure continuity across multiple Claude Code sessions in both single-agent and parallel-agent phases.
> **Based on:** [Anthropic: Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

---

## Core Principle

> "Each new session begins with no memory of what came before."

We use **structured artifacts** to maintain continuity:

| Artifact | Purpose | Location |
|----------|---------|----------|
| **PROGRESS.md** | Log of completed work | `docs/PROGRESS.md` |
| **ROADMAP.md** | Checkbox tracking | `docs/ROADMAP.md` |
| **features.json** | Pass/fail status | `features.json` |
| **KNOWN_ISSUES.md** | Parking lot | `docs/KNOWN_ISSUES.md` |

---

## Quick Reference Card

```
╔═══════════════════════════════════════════════════════════════════════╗
║  SESSION MANAGEMENT - QUICK REFERENCE                                 ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  SESSION START:                                                       ║
║    ./scripts/dev-init.sh                                              ║
║                                                                       ║
║  DURING SESSION:                                                      ║
║    • Work on ONE task at a time                                       ║
║    • Update docs after each completed task                            ║
║    • Commit frequently                                                ║
║                                                                       ║
║  CHECKPOINT (context getting long):                                   ║
║    "Update PROGRESS.md and features.json with current state"          ║
║                                                                       ║
║  SESSION END (before compaction):                                     ║
║    "Before ending: Please follow session end protocol..."             ║
║                                                                       ║
║  IF BLOCKED:                                                          ║
║    Add to KNOWN_ISSUES.md → Move to next task                         ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## Phase-Specific Protocols

### For Single-Agent Phases (Weeks 1-2, 10-11)

Use standard long-running workflow without coordination overhead.

#### Session Start Protocol

1. **Run init script:** `./scripts/dev-init.sh`
2. **Read progress:** `cat docs/PROGRESS.md` (focus on most recent session)
3. **Check features:** `cat features.json` (look for in-progress or next not-started)
4. **Verify previous work:** Run tests if any exist
5. **Check blockers:** `cat docs/KNOWN_ISSUES.md` (any open issues?)
6. **Pick next task:** First unchecked in ROADMAP.md for current phase

#### During Session

- Work on ONE checkbox item from ROADMAP.md
- Update PROGRESS.md after completing each task (not just at session end)
- Update features.json when task status changes
- Commit frequently with descriptive messages
- If blocked, document in KNOWN_ISSUES.md and move to next independent task

#### Session End Protocol

1. Run verification (tests, type-check)
2. Add session entry to TOP of `docs/PROGRESS.md`
   - Include: Completed, Verified, Notes, Next Session Should
3. Update `features.json` with pass/fail status
4. Check off completed tasks in `docs/ROADMAP.md`
5. Commit with descriptive message (e.g., `feat(foundation): add base components`)
6. Note "Next Session Should" in PROGRESS.md entry

---

### For Parallel-Agent Phases (Weeks 3-6, 7-9)

Add coordination mechanisms to prevent conflicts between agents.

#### Session Start Protocol

1. **Run init script:** `./scripts/dev-init.sh`
   - Script will show: current phase, your agent, boundary rules, other agent's recent work
2. **Read progress:** Review latest PROGRESS.md entries from BOTH agents
3. **Check features:** Look at `features.json` for YOUR agent's tasks
4. **Check git log:** `git log -5 --oneline` to see other agent's recent commits
5. **Check coordination:** Review `docs/KNOWN_ISSUES.md` for "COORDINATION NEEDED" tags
6. **Pick next task:** First unchecked task in ROADMAP.md for YOUR agent
7. **Morning sync (optional):** Add brief entry to PROGRESS.md:

```markdown
## Session YYYY-MM-DD AM [Agent A] - Morning Sync
**Focus Today:** Recipe photo upload UI
**Shared files needed:** None
**Interface questions:** Confirm RecipeService.create() signature
```

#### Boundary Rules Reminder

**Always check before starting:**

**Phase 2 (Core Features):**
- Agent A owns: `/app/recipes/`, `/app/shopping/`, `/lib/services/recipe/`, `/lib/services/shopping/`, `/lib/extraction/`
- Agent B owns: `/app/meals/`, `/app/timeline/`, `/lib/services/meal/`, `/lib/services/timeline/`, `/lib/validator/`
- Shared (read-only): `/types/`, `/contracts/`, `/components/ui/`, `/lib/supabase.ts`

**Phase 3 (Live Mode):**
- Agent A owns: `/app/live/`, `/lib/services/execution/`, `/lib/offline/`, `/lib/timers/`
- Agent B owns: `/app/share/`, `/lib/services/share/`, `/lib/polling/`
- Shared (coordinate): `/lib/supabase.ts`, Supabase migrations

**If you need to modify a shared file:**
1. DO NOT edit it directly
2. Document the need in `KNOWN_ISSUES.md` with "COORDINATION NEEDED" tag
3. Both agents review and coordinate timing
4. One agent makes the change, other agent reviews and updates their code

#### During Session

- Work on ONE task at a time in YOUR boundary
- Update PROGRESS.md after each completed task
- Commit frequently with agent identifier: `feat(recipes): photo upload [Agent A]`
- If you discover other agent needs something, add to KNOWN_ISSUES.md
- If blocked on coordination, move to next independent task in your boundary

#### Session End Protocol

1. Run verification (tests, type-check for your code)
2. Add session entry to TOP of `docs/PROGRESS.md` with `[Agent X]` identifier
   - Include: Completed, Verified, Notes, Next Session Should
3. Update `features.json` with status for your tasks
4. Check off completed tasks in `docs/ROADMAP.md`
5. Commit with message including agent: `feat(recipes): photo upload [Agent A]`
6. Note "Next Session Should" with agent-specific context
7. **Evening sync (optional):** Update PROGRESS.md entry:

```markdown
**Evening Summary:**
**Shipped:** Recipe photo upload, compression, Claude Vision integration
**Contract changes needed:** None
**Blockers:** None
**Next session:** URL scraping implementation
```

---

## Coordination Mechanisms (Parallel Phases Only)

### Morning/Evening Sync

**Optional but recommended** for tight coordination:

**Morning (5 min):**
- What I'm building today
- Any shared files I need to touch
- Any interface questions

**Evening (5 min):**
- What I shipped
- Any contract changes needed
- Blockers for tomorrow

### Contract Change Protocol

If an agent needs to modify a shared type or interface:

1. **Propose:** Document in KNOWN_ISSUES.md with "COORDINATION NEEDED" tag
   ```markdown
   ### [COORDINATION NEEDED] Add `servingSize` field to Recipe type
   **Status:** Open
   **Agent:** Agent A
   **Discovered:** 2024-12-27
   **Description:** Recipe scaling needs servingSize to calculate properly
   **Proposed Change:** Add `servingSize?: number` to Recipe interface in `types/recipe.ts`
   **Impact:** Agent B's meal service will need to handle this field
   ```

2. **Review:** Both agents (or user) review the impact
   - Agent A: Why is this needed? What breaks without it?
   - Agent B: What changes in my code? Can I work around it?

3. **Coordinate:** Agree on timing
   - Merge contract change first (in `/types/` or `/contracts/`)
   - Then each agent updates their implementations

4. **Implement:** One agent makes the contract change
   - Commit: `feat(types): add servingSize to Recipe [Coordination]`
   - Other agent pulls and updates their code

5. **Close:** Mark resolved in KNOWN_ISSUES.md

### Integration Points to Test

These require both agents to verify together (Weeks 6, 9):

| Integration Point | Agent A Provides | Agent B Consumes |
|-------------------|------------------|------------------|
| Recipe → Meal | `RecipeService.list()` | Recipe picker in Meal creation |
| Meal → Shopping | `Meal` with scaled recipes | Shopping list generation |
| Timeline → Live | `Timeline` with tasks | Live execution view |
| Checkoff → Share | Task status updates | Viewer polling |

---

## Session Prompts

### Session Start Prompt (Single-Agent)

```
I'm continuing work on Sunday Dinner v1.

This is a multi-session implementation. Please follow the session protocol:

1. Run ./scripts/dev-init.sh to verify environment
2. Read docs/PROGRESS.md for previous session work
3. Read docs/ROADMAP.md to find the NEXT unchecked task
4. Check features.json for pass/fail status
5. Check docs/KNOWN_ISSUES.md for any blockers

Work on ONE task only (single-feature-per-session rule). Tell me what's next.
```

### Session Start Prompt (Parallel-Agent)

```
I'm continuing work on Sunday Dinner v1 as [Agent A / Agent B].

This is a multi-session, parallel-agent implementation. Please follow the session protocol:

1. Run ./scripts/dev-init.sh (will show boundary rules and coordination status)
2. Read docs/PROGRESS.md for recent work from BOTH agents
3. Check features.json for MY agent's tasks
4. Check git log for other agent's recent commits
5. Check docs/KNOWN_ISSUES.md for "COORDINATION NEEDED" items
6. Read docs/ROADMAP.md to find next task in MY boundary

Work on ONE task only in my boundary. Tell me what's next.

BOUNDARY RULES:
[Paste boundary rules from ROADMAP.md for current phase]
```

### Session End Prompt

```
Before ending: Please follow session end protocol:

1. Run verification (tests, type-check)
2. Add session entry to TOP of docs/PROGRESS.md [include [Agent X] if parallel]
3. Update features.json with pass/fail status
4. Check off completed task in docs/ROADMAP.md
5. Commit with descriptive message [include [Agent X] if parallel]

What's the "Next Session Should" note for PROGRESS.md?
```

### Checkpoint Prompt (Mid-Session)

```
Let's checkpoint. Update docs/PROGRESS.md and features.json
with current state, then we can continue.
```

### After Long Break Prompt

```
Resuming Sunday Dinner v1 after a break. Full context reload:

1. Run ./scripts/dev-init.sh
2. Read docs/SESSION_PROTOCOL.md (workflow rules)
3. Read docs/PROGRESS.md (all session history)
4. Check features.json and KNOWN_ISSUES.md

Summarize: where are we, what's next, any blockers?
```

---

## Understanding Sessions vs Tasks

**Session = Context Window** (not calendar day, not task)

```
┌─────────────────────────────────────────────────────────────┐
│  Context Window                                             │
│                                                             │
│  Task A ──► Task B ──► Task C ──► [Context limit]           │
│    ↓          ↓                         ↓                   │
│  Update    Update              SESSION ENDS                 │
│   docs      docs               (update docs)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
              ┌───────────────────────────────┐
              │  NEW SESSION                  │
              │  Run init, read progress      │
              │  Continue Task C or next      │
              └───────────────────────────────┘
```

- **Update docs** → After every completed task
- **New session** → After compaction or fresh start
- **Day boundary** → Doesn't matter much
- **Can complete multiple tasks** in one context window
- **Large tasks can span** multiple sessions

---

## Tips for Success

1. **Start sessions the same way** — Always run `dev-init.sh`
2. **Checkpoint often** — Don't wait for context limit
3. **PROGRESS.md entries at TOP** — Most recent first
4. **Descriptive commits** — They serve as documentation
5. **Park blockers immediately** — Don't let them derail progress
6. **JSON for tracking** — Resists inappropriate edits
7. **Verify before marking complete** — Tests must pass
8. **In parallel phases:** Respect boundaries, communicate early

---

## PAUSE Points for Learning

The ROADMAP.md includes 6 PAUSE points for reflection and smooth transitions:

- **PAUSE 0:** Post-Infrastructure Setup (30-60 min) — Before Week 1
- **PAUSE 1:** Pre-Parallel Transition (45-90 min) — End of Week 2
- **PAUSE 2:** Mid-Parallel Checkpoint (30-45 min) — End of Week 3
- **PAUSE 3:** Core Features Integration (2-4 hours) — End of Week 6
- **PAUSE 4:** Live Mode Integration (2-3 hours) — End of Week 9
- **PAUSE 5:** Pre-Ship Validation (1-2 hours) — End of Week 10

**Do not skip these.** They ensure smooth learning and workflow transitions.

---

*Last Updated: December 27, 2024*

