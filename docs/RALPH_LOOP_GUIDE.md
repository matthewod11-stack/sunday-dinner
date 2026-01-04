# Ralph Loop Guide for Sunday Dinner

> **Purpose:** Document how to use Ralph Wiggum autonomous loops for parallel agent development.
> **Last Updated:** 2025-01-03

---

## Overview

Ralph Loop is an autonomous execution pattern where Claude runs in a self-referential loop, working on a task until completion. The loop:
1. Starts with a prompt and completion criteria
2. Claude works on the task
3. When Claude tries to exit, a Stop hook intercepts and feeds the same prompt back
4. Loop continues until the completion promise is output or max iterations reached

---

## Known Issue: Skill Command Doesn't Work

The `/ralph-loop` skill command fails with:
```
Error: Bash command permission check failed... Command contains newlines that could separate multiple commands
```

**Root Cause:** The plugin's command file uses multi-line bash (`\`\`\`!`), which Claude Code blocks for security reasons.

**Workaround:** Run the setup script directly instead of using the skill.

---

## How to Start a Ralph Loop

### Step 1: Run the Setup Script Directly

Instead of `/ralph-loop "prompt" --options`, run:

```bash
/Users/mattod/.claude/plugins/marketplaces/claude-plugins-official/plugins/ralph-wiggum/scripts/setup-ralph-loop.sh "YOUR PROMPT HERE" --completion-promise "YOUR_PROMISE" --max-iterations 50
```

### Step 2: Agent Works Autonomously

After the script runs, the Stop hook is active. When Claude tries to exit:
- The hook reads `.claude/ralph-loop.local.md`
- Checks if the completion promise was output
- If not, blocks exit and feeds the prompt back
- Claude sees previous work in files/git and continues

### Step 3: Loop Ends When

1. Claude outputs `<promise>YOUR_PROMISE</promise>` (must be TRUE)
2. Max iterations reached
3. You manually delete `.claude/ralph-loop.local.md`

---

## Parallel Agent Setup

### Agent A (Recipes + Shopping)

```
You are Agent A for Sunday Dinner v1.

PHASE: Phase 2 - Core Features (Week X)
FOCUS: [specific focus]

YOUR BOUNDARY (you own these):
├── /app/recipes/           # All recipe routes
├── /app/shopping/          # Shopping list routes
├── /lib/services/recipe/   # Recipe service implementation
├── /lib/services/shopping/ # Shopping service implementation
└── /lib/extraction/        # Claude Vision, URL scraping, PDF

SHARED (read-only - do NOT modify):
├── /types/                 # Type definitions
├── /contracts/             # Service interfaces
├── /components/ui/         # Base components
└── /lib/supabase/          # Database client

WEEK X TASKS:
[list tasks from ROADMAP.md]

Read SESSION_STATE.md and ROADMAP.md, then begin. Create a plan in PLANS/ before implementing each task. Update SESSION_STATE.md after completing each task. Commit frequently with [Agent A] suffix.

Start the Ralph loop by running:
/Users/mattod/.claude/plugins/marketplaces/claude-plugins-official/plugins/ralph-wiggum/scripts/setup-ralph-loop.sh "Week X: [focus]" --completion-promise "AGENT_A_WEEKX_COMPLETE" --max-iterations 50
```

### Agent B (Meals + Timeline)

```
You are Agent B for Sunday Dinner v1.

PHASE: Phase 2 - Core Features (Week X)
FOCUS: [specific focus]

YOUR BOUNDARY (you own these):
├── /app/meals/             # Meal routes
├── /app/timeline/          # Timeline routes (planning view)
├── /lib/services/meal/     # Meal service implementation
├── /lib/services/timeline/ # Timeline service implementation
└── /lib/validator/         # Deterministic timeline validator

SHARED (read-only - do NOT modify):
├── /types/                 # Type definitions
├── /contracts/             # Service interfaces
├── /components/ui/         # Base components
└── /lib/supabase/          # Database client

WEEK X TASKS:
[list tasks from ROADMAP.md]

Read SESSION_STATE.md and ROADMAP.md, then begin. Create a plan in PLANS/ before implementing each task. Update SESSION_STATE.md after completing each task. Commit frequently with [Agent B] suffix.

Start the Ralph loop by running:
/Users/mattod/.claude/plugins/marketplaces/claude-plugins-official/plugins/ralph-wiggum/scripts/setup-ralph-loop.sh "Week X: [focus]" --completion-promise "AGENT_B_WEEKX_COMPLETE" --max-iterations 50
```

---

## Monitoring Progress

### Check Loop State
```bash
head -10 .claude/ralph-loop.local.md
```

### Check Current Iteration
```bash
grep '^iteration:' .claude/ralph-loop.local.md
```

### View Git Progress
```bash
git log --oneline -10
```

---

## Cancelling a Loop

### Option 1: Use the Cancel Skill
```
/cancel-ralph
```

### Option 2: Delete State File Manually
```bash
rm .claude/ralph-loop.local.md
```

---

## Important Notes

### Parallel Agent Conflicts

Both agents share `.claude/ralph-loop.local.md`. If running truly simultaneously:
- Start agents ~30 seconds apart
- Or use separate working directories (git worktrees)
- In practice, each agent manages their own loop state

### Context Management

- Enable auto-compact for long-running loops
- Agents should update SESSION_STATE.md frequently
- If context runs out, restart and resume from docs

### Commit Suffixes

- Agent A commits: `feat(recipes): description [Agent A]`
- Agent B commits: `feat(meals): description [Agent B]`
- Coordinator commits: No suffix or `[Coordination]`

---

## Session End Protocol

When a Ralph loop completes or is cancelled:

1. Run verification: `npm run typecheck && npm run lint`
2. Update PROGRESS.md with session entry (include `[Agent X]`)
3. Update features.json status
4. Check off tasks in ROADMAP.md
5. Commit with descriptive message
6. Push to remote

---

## Troubleshooting

### "Command contains newlines" Error
Use the direct script path instead of `/ralph-loop` skill.

### Loop Not Continuing
Check if `.claude/ralph-loop.local.md` exists and has valid frontmatter.

### Agent Stepping on Other's Files
Review boundary rules — only modify files in YOUR boundary. Add to KNOWN_ISSUES.md if coordination needed.

### Build Failures
Run `npm run typecheck` to identify issues. Fix before continuing. The other agent may have introduced issues in shared areas.

---

## Week-by-Week Quick Reference

| Week | Agent A Focus | Agent B Focus |
|------|---------------|---------------|
| 3 | Recipe photo + manual entry | Meal setup + scaling |
| 4 | URL + PDF ingestion | Timeline generation + views |
| 5 | Shopping list | Timeline editing |
| 6 | Integration testing (both) | Integration testing (both) |
| 7 | Live execution + timers | Share link schema |
| 8 | Running behind + large text | Share link viewer |
| 9 | Offline resilience | Share integration |

---

*This guide was created after discovering the Ralph Loop skill command issue on 2025-01-03.*
