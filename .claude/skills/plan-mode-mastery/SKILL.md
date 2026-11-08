---
name: plan-mode-mastery
description: Research, structure, validate and execute implementation plans in Plan Mode. Use when planning a non-trivial feature, refactor or migration.
---

# SKILL.md: Plan Mode Mastery

## Description
Comprehensive plan mode workflow with automatic research, validation, and execution monitoring.

## When to Use
- User requests Plan Mode
- Large feature implementation
- Complex refactoring
- Ambiguous requirements
- Multi-step tasks

## Capabilities
- Automatic pre-plan research
- Tool-aware plan creation
- Feasibility validation
- Progress monitoring
- Adaptive re-planning
- Iteration loops

## Commands
/plan-mode-full: Complete optimized workflow
/plan-mode-quick: Standard plan mode (no research)
/plan-mode-validate: Validate existing plan

## Workflows

### Full Plan Mode Workflow

1. **Pre-Plan Research** (2-3 minutes)
   - Explore (quick) for patterns
   - Parallel subagent exploration
   - Lint check check
   - AskUserQuestion (batch) if needed

2. **Plan Creation** (1-2 minutes)
   - Enhanced structure with tools
   - Risk assessment
   - Checkpoint strategy
   - Time estimation

3. **Plan Validation** (1 minute)
   - Feasibility subagent
   - Tool availability check
   - Dependency analysis

4. **Execution Monitoring**
   - TodoWrite tracking
   - Automatic checkpoints
   - Iteration loops
   - Adaptive re-planning

## Tool Integration

### Research Phase Tools
- **Explore (quick)**: Find existing patterns
- **Agent (Explore)**: Parallel codebase exploration
- **Lint check**: Check code health
- **AskUserQuestion**: Batch clarifications

### Planning Phase Tools
- **CreatePlan**: Structured plan creation
- **TodoWrite**: Progress tracking setup
- **Checkpoints**: Strategic rollback points

### Execution Phase Tools
- **Read/Write/Edit**: Implementation
- **Bash**: Run tests and commands
- **Lint check**: Quality validation
- **Agent (subagents)**: Parallel work

### Monitoring Tools
- **TodoWrite**: Real-time progress
- **Fix-and-retest loop**: Iteration loops
- **AskUserQuestion**: Blocker resolution

## Examples

### Example 1: Feature Implementation

User: "Add user dashboard"

Agent invokes /plan-mode-full:

**Research Phase**:
- Explore (quick): "How are pages structured?"
- Agent (parallel):
  - "Find dashboard-like features"
  - "Find API route patterns"
  - "Find component patterns"
- Lint check: Check current health
- AskUserQuestion: "Which widgets for MVP?" (batched)

**Plan Phase**:
Creates enhanced plan with:
- Files to create/modify with patterns
- Tool strategy for each step
- Risk mitigation (checkpoint before API changes)
- Time estimate: 45 minutes

**Validation Phase**:
- Agent: "Validate plan feasibility"
- Check: All files accessible
- Verify: Tool availability
- Result: PASS

**Execution Phase**:
- TodoWrite: Track 7 steps
- Checkpoint: Before API changes
- fix-and-retest loop: Fix test failures
- Progress updates: After each step

### Example 2: Complex Refactor

User: "Refactor authentication system"

**Research Phase**:
- Explore (quick): "How is auth implemented?"
- Agent (parallel x4):
  - "Find JWT validation logic"
  - "Find session management"
  - "Find OAuth integrations"
  - "Find password hashing"
- Lint check: Check all auth files
- AskUserQuestion: "Target auth method?"

**Plan Phase**:
- Summary: Migrate from JWT to sessions
- Files: 8 files to modify
- Steps: 12 steps with checkpoints
- Risks: Breaking change, data migration
- Time: 3 hours

**Validation Phase**:
- Agent: Validate complexity
- Warning: High risk, suggest phased approach
- Result: PASS with warnings

**Execution Phase**:
- TodoWrite: 12 steps tracked
- Checkpoints: 3 (before breaking changes)
- Adaptive re-plan: Discovered legacy code
- fix-and-retest: Fixed auth edge cases

### Example 3: Bug Fix

User: "Fix authentication bug #123"

**Research Phase**:
- Explore (quick): "How does auth flow work?"
- Agent: "Investigate bug #123"
- Lint check: Check auth files
- Result: Token expiration issue found

**Plan Phase**:
- Summary: Fix JWT expiration handling
- Files: 2 files to modify
- Steps: 4 steps
- Time: 20 minutes

**Validation Phase**:
- Quick validation (simple fix)
- Result: PASS

**Execution Phase**:
- TodoWrite: 4 steps
- Edit: Fix expiration logic
- Bash: Run auth tests
- Lint check: Verify quality
- Complete: Bug fixed

## Best Practices

### 1. Always Research First
- Never plan blind
- Spend 2-3 min on research
- Find patterns before coding
- Ask questions in batches

### 2. Validate Before Presenting
- Use validation subagent
- Check file accessibility
- Verify time estimates
- Flag risks explicitly

### 3. Track Progress Religiously
- Update todos immediately
- One task in_progress at a time
- Create checkpoints strategically
- Report blockers early

### 4. Iterate When Stuck
- Use the fix-and-retest loop for tests (max 5 iterations)
- Update scratchpad
- AskUserQuestion if blocked
- Re-plan if >30% deviation

### 5. Time-Box Research
- Max 3 minutes for research
- "Good enough" threshold
- Progressive disclosure
- Optimize for speed

## Anti-Patterns

### ❌ Planning Without Research
Bad: "I'll create a plan immediately"
Good: "Let me research existing patterns first"

### ❌ Vague Plans
Bad: "Implement authentication"
Good: "Add JWT validation to /api/login following @src/auth/validateToken.ts pattern"

### ❌ No Validation
Bad: Present plan without checking
Good: Validate feasibility before presenting

### ❌ Skipping Progress Tracking
Bad: Work without updating todos
Good: Update TodoWrite after each step

### ❌ No Checkpoints
Bad: Risky changes without rollback
Good: Checkpoint before breaking changes

## Troubleshooting

### Research Taking Too Long
**Problem**: >5 minutes in research phase

**Solutions**:
- Time-box to 3 minutes max
- Use model="haiku" for subagents
- Narrow target_directories
- Accept "good enough" patterns

### Validation Failing Repeatedly
**Problem**: Plan fails validation multiple times

**Solutions**:
- Simplify the plan
- Break into smaller phases
- Add more fallback strategies
- Revise time estimates

### Tests Not Passing
**Problem**: fix-and-retest loop failing after 5 iterations

**Solutions**:
- Report BLOCKED with details
- AskUserQuestion for guidance
- Re-plan approach
- Check for missing dependencies

### Plan Deviation
**Problem**: Execution diverging >30% from plan

**Solutions**:
- Pause immediately
- Create checkpoint
- Assess what changed
- Present updated plan
- Get approval before continuing
