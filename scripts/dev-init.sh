#!/bin/bash
# Sunday Dinner v1 - Session Initialization Script
# Run at the start of each development session

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Sunday Dinner v1 - Session Init                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Confirm directory
EXPECTED_DIR="sunday-dinner"
CURRENT_DIR=$(basename "$PWD")

if [ "$CURRENT_DIR" != "$EXPECTED_DIR" ]; then
    echo -e "${RED}ERROR: Expected to be in $EXPECTED_DIR directory${NC}"
    echo "Current: $PWD"
    exit 1
fi
echo -e "${GREEN}✓ Working directory confirmed: $EXPECTED_DIR${NC}"

# 2. Check required files
echo ""
echo -e "${BLUE}Checking infrastructure files...${NC}"

REQUIRED_FILES=(
    "docs/ROADMAP.md"
    "docs/PROGRESS.md"
    "docs/SESSION_PROTOCOL.md"
    "docs/KNOWN_ISSUES.md"
    "features.json"
)

ALL_FILES_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗ MISSING: $file${NC}"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
    echo ""
    echo -e "${RED}ERROR: Required files are missing. Cannot proceed.${NC}"
    exit 1
fi

# 3. Detect current phase from features.json
echo ""
echo -e "${BLUE}Detecting current phase...${NC}"

if [ -f "features.json" ]; then
    CURRENT_PHASE=$(grep -o '"currentPhase": *"[^"]*"' features.json | cut -d'"' -f4)
    echo -e "${CYAN}Current Phase: $CURRENT_PHASE${NC}"
    
    # Determine if parallel or single agent
    case "$CURRENT_PHASE" in
        "phase-1-foundation")
            echo -e "${GREEN}Mode: Single Agent (Foundation)${NC}"
            PHASE_MODE="single"
            PHASE_NAME="Phase 1: Foundation (Weeks 1-2)"
            ;;
        "phase-2-core")
            echo -e "${MAGENTA}Mode: Parallel Agents (Core Features)${NC}"
            PHASE_MODE="parallel"
            PHASE_NAME="Phase 2: Core Features (Weeks 3-6)"
            ;;
        "phase-3-live")
            echo -e "${MAGENTA}Mode: Parallel Agents (Live Mode)${NC}"
            PHASE_MODE="parallel"
            PHASE_NAME="Phase 3: Live Mode (Weeks 7-9)"
            ;;
        "phase-4-polish")
            echo -e "${GREEN}Mode: Single Agent (Polish)${NC}"
            PHASE_MODE="single"
            PHASE_NAME="Phase 4: Integration & Polish (Weeks 10-11)"
            ;;
        *)
            echo -e "${YELLOW}Unknown phase, assuming single agent${NC}"
            PHASE_MODE="single"
            PHASE_NAME="Unknown Phase"
            ;;
    esac
else
    echo -e "${YELLOW}features.json not found, assuming single agent${NC}"
    PHASE_MODE="single"
    PHASE_NAME="Unknown Phase"
fi

# 4. Show boundary rules if in parallel phase
if [ "$PHASE_MODE" = "parallel" ]; then
    echo ""
    echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║                    PARALLEL AGENT MODE                             ║${NC}"
    echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if [ "$CURRENT_PHASE" = "phase-2-core" ]; then
        echo -e "${YELLOW}BOUNDARY RULES (Phase 2 - Core Features):${NC}"
        echo ""
        echo -e "${CYAN}Agent A owns:${NC}"
        echo "  - /app/recipes/, /app/shopping/"
        echo "  - /lib/services/recipe/, /lib/services/shopping/"
        echo "  - /lib/extraction/"
        echo ""
        echo -e "${CYAN}Agent B owns:${NC}"
        echo "  - /app/meals/, /app/timeline/"
        echo "  - /lib/services/meal/, /lib/services/timeline/"
        echo "  - /lib/validator/"
        echo ""
        echo -e "${CYAN}Shared (read-only):${NC}"
        echo "  - /types/, /contracts/, /components/ui/, /lib/supabase.ts"
        echo ""
        echo -e "${YELLOW}⚠ If you need to modify shared files, document in KNOWN_ISSUES.md${NC}"
        echo -e "${YELLOW}  with \"COORDINATION NEEDED\" tag${NC}"
        echo ""
    elif [ "$CURRENT_PHASE" = "phase-3-live" ]; then
        echo -e "${YELLOW}BOUNDARY RULES (Phase 3 - Live Mode):${NC}"
        echo ""
        echo -e "${CYAN}Agent A owns:${NC}"
        echo "  - /app/live/"
        echo "  - /lib/services/execution/, /lib/offline/, /lib/timers/"
        echo ""
        echo -e "${CYAN}Agent B owns:${NC}"
        echo "  - /app/share/"
        echo "  - /lib/services/share/, /lib/polling/"
        echo ""
        echo -e "${CYAN}Shared (coordinate on):${NC}"
        echo "  - /lib/supabase.ts, Supabase migrations"
        echo ""
        echo -e "${YELLOW}⚠ Coordinate shared changes via KNOWN_ISSUES.md${NC}"
        echo ""
    fi
    
    # Show recent commits from other agent
    echo -e "${BLUE}Recent work from other agent (last 3 commits):${NC}"
    git log -3 --oneline --decorate 2>/dev/null || echo "  (No git history yet)"
    echo ""
fi

# 5. Check for PAUSE points approaching
echo ""
echo -e "${BLUE}Checking for upcoming PAUSE points...${NC}"

# Simple detection based on phase and feature status
if [ "$CURRENT_PHASE" = "phase-1-foundation" ]; then
    FOUNDATION_COMPLETE=$(grep -c '"status": "pass"' features.json 2>/dev/null | head -1 || echo "0")
    FOUNDATION_TOTAL=$(grep -A 20 '"phase-1-foundation"' features.json | grep -c '"status":' || echo "7")
    
    if [ "$FOUNDATION_COMPLETE" -ge 5 ] && [ "$FOUNDATION_COMPLETE" -lt "$FOUNDATION_TOTAL" ]; then
        echo -e "${YELLOW}⚠ PAUSE 1 approaching: Pre-Parallel Transition (45-90 min)${NC}"
        echo "  Complete foundation work, then prepare for parallel agents"
        echo ""
    fi
fi

# 6. Install dependencies if needed (only if package.json exists)
if [ -f "package.json" ]; then
    echo ""
    echo -e "${BLUE}Checking dependencies...${NC}"
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✓${NC} node_modules exists"
    else
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi
    
    # 7. Run verification if scripts exist
    echo ""
    echo -e "${BLUE}Running verification...${NC}"
    
    if grep -q '"type-check"' package.json 2>/dev/null; then
        if npm run type-check > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} Type check passes"
        else
            echo -e "${RED}✗${NC} Type check FAILED"
        fi
    else
        echo -e "${YELLOW}⊘${NC} Type check script not configured yet"
    fi
    
    if grep -q '"test"' package.json 2>/dev/null; then
        if npm test -- --passWithNoTests --silent > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} Tests pass"
        else
            echo -e "${YELLOW}⊘${NC} Tests not passing (may be expected at this phase)"
        fi
    else
        echo -e "${YELLOW}⊘${NC} Test script not configured yet"
    fi
else
    echo ""
    echo -e "${YELLOW}⊘ No package.json yet (expected in early setup)${NC}"
fi

# 8. Show recent progress
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                     Recent Progress                                ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
if [ -f "docs/PROGRESS.md" ]; then
    # Show most recent session (up to 30 lines)
    awk '/^## Session/{if(found)exit; found=1} found' docs/PROGRESS.md | head -30
else
    echo -e "${RED}No PROGRESS.md found${NC}"
fi

# 9. Show feature status summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                     Feature Status                                 ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
if [ -f "features.json" ]; then
    PASS=$(grep -c '"status": "pass"' features.json 2>/dev/null || echo "0")
    FAIL=$(grep -c '"status": "fail"' features.json 2>/dev/null || echo "0")
    IN_PROGRESS=$(grep -c '"status": "in-progress"' features.json 2>/dev/null || echo "0")
    NOT_STARTED=$(grep -c '"status": "not-started"' features.json 2>/dev/null || echo "0")
    
    echo -e "${GREEN}✓ Pass:${NC} $PASS | ${RED}✗ Fail:${NC} $FAIL | ${YELLOW}⟳ In Progress:${NC} $IN_PROGRESS | ${CYAN}○ Not Started:${NC} $NOT_STARTED"
fi

# 10. Show coordination needs if in parallel phase
if [ "$PHASE_MODE" = "parallel" ] && [ -f "docs/KNOWN_ISSUES.md" ]; then
    COORDINATION_COUNT=$(grep -c "\[COORDINATION NEEDED\]" docs/KNOWN_ISSUES.md 2>/dev/null || echo "0")
    
    if [ "$COORDINATION_COUNT" -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}⚠ $COORDINATION_COUNT coordination item(s) need attention${NC}"
        echo "  Review docs/KNOWN_ISSUES.md before starting"
    fi
fi

# 11. Show next tasks
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                     Next Tasks                                     ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
if [ -f "docs/ROADMAP.md" ]; then
    echo "Next unchecked tasks:"
    grep -n "\[ \]" docs/ROADMAP.md | head -5 || echo "  (No unchecked tasks found)"
else
    echo -e "${RED}No ROADMAP.md found${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                          Ready to Begin                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$PHASE_MODE" = "parallel" ]; then
    echo -e "${MAGENTA}Remember: Work only in YOUR agent's boundary!${NC}"
    echo ""
fi

echo -e "${CYAN}Quick tips:${NC}"
echo "  • Work on ONE task at a time"
echo "  • Update PROGRESS.md after each completed task"
echo "  • Commit frequently with descriptive messages"
if [ "$PHASE_MODE" = "parallel" ]; then
    echo "  • Include agent identifier in commits: [Agent A] or [Agent B]"
    echo "  • Check git log for other agent's work before starting"
fi
echo ""

