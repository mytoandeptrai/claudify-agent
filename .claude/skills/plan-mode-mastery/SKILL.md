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
   - SemanticSearch for patterns
   - Parallel subagent exploration
   - ReadLints check
   - AskQuestion (batch) if needed

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
- **SemanticSearch**: Find existing patterns
- **Task (explore)**: Parallel codebase exploration
- **ReadLints**: Check code health
- **AskQuestion**: Batch clarifications

### Planning Phase Tools
- **CreatePlan**: Structured plan creation
- **TodoWrite**: Progress tracking setup
- **Checkpoints**: Strategic rollback points

### Execution Phase Tools
- **Read/Write/StrReplace**: Implementation
- **Shell**: Run tests and commands
- **ReadLints**: Quality validation
- **Task (subagents)**: Parallel work

### Monitoring Tools
- **TodoWrite**: Real-time progress
- **/grind**: Iteration loops
- **AskQuestion**: Blocker resolution

## Examples

### Example 1: Feature Implementation

User: "Add user dashboard"

Agent invokes /plan-mode-full:

**Research Phase**:
- SemanticSearch: "How are pages structured?"
- Task (parallel):
  - "Find dashboard-like features"
  - "Find API route patterns"
  - "Find component patterns"
- ReadLints: Check current health
- AskQuestion: "Which widgets for MVP?" (batched)

**Plan Phase**:
Creates enhanced plan with:
- Files to create/modify with patterns
- Tool strategy for each step
- Risk mitigation (checkpoint before API changes)
- Time estimate: 45 minutes

**Validation Phase**:
- Task: "Validate plan feasibility"
- Check: All files accessible
- Verify: Tool availability
- Result: PASS

**Execution Phase**:
- TodoWrite: Track 7 steps
- Checkpoint: Before API changes
- /grind loop: Fix test failures
- Progress updates: After each step

### Example 2: Complex Refactor

User: "Refactor authentication system"

**Research Phase**:
- SemanticSearch: "How is auth implemented?"
- Task (parallel x4):
  - "Find JWT validation logic"
  - "Find session management"
  - "Find OAuth integrations"
  - "Find password hashing"
- ReadLints: Check all auth files
- AskQuestion: "Target auth method?"

**Plan Phase**:
- Summary: Migrate from JWT to sessions
- Files: 8 files to modify
- Steps: 12 steps with checkpoints
- Risks: Breaking change, data migration
- Time: 3 hours

**Validation Phase**:
- Task: Validate complexity
- Warning: High risk, suggest phased approach
- Result: PASS with warnings

**Execution Phase**:
- TodoWrite: 12 steps tracked
- Checkpoints: 3 (before breaking changes)
- Adaptive re-plan: Discovered legacy code
- /grind: Fixed auth edge cases

### Example 3: Bug Fix

User: "Fix authentication bug #123"

**Research Phase**:
- SemanticSearch: "How does auth flow work?"
- Task: "Investigate bug #123"
- ReadLints: Check auth files
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
- StrReplace: Fix expiration logic
- Shell: Run auth tests
- ReadLints: Verify quality
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
- Use /grind for tests (max 5 iterations)
- Update scratchpad
- AskQuestion if blocked
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
- Use model="fast" for subagents
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
**Problem**: /grind loop failing after 5 iterations

**Solutions**:
- Report BLOCKED with details
- AskQuestion for guidance
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
