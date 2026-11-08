# Plan Mode Execution Monitoring

## Automatic Progress Tracking

### TodoWrite Creation
When plan approved:
1. Convert steps to todos automatically
2. First step: in_progress
3. Update after EACH completion
4. Only ONE in_progress at a time

### Checkpoint Strategy
Create checkpoint before:
- Large refactors (>5 files)
- Database changes
- API contract changes
- Breaking changes
- Irreversible operations

### Iteration Loops
If tests fail:
1. Use /grind automatically
2. Max 5 iterations
3. Update scratchpad
4. Report if BLOCKED

### Adaptive Re-planning
If deviation >30%:
1. Pause execution
2. Create updated plan
3. Present delta
4. Get approval

### Quality Gates
After EACH step:
- ReadLints on modified files
- Fix introduced lints immediately
- Run relevant tests
- Update todos

## Progress Tracking Template

```markdown
## Current Progress
Step 3/7: Creating API endpoints (in_progress)

## Completed Steps
✅ Step 1: Research patterns (2 min)
✅ Step 2: Create project structure (5 min)

## Remaining Steps
⏳ Step 3: Create API endpoints (in_progress)
⏹ Step 4: Build UI components
⏹ Step 5: Integration
⏹ Step 6: Testing
⏹ Step 7: Documentation

## Quality Status
- Lints: ✅ Clear
- Tests: ✅ Passing
- Checkpoints: 1 created (before Step 3)
```

## Checkpoint Guidelines

### When to Create Checkpoints

**ALWAYS create checkpoint before:**
1. Database schema migrations
2. API contract changes
3. Authentication/authorization changes
4. Payment processing changes
5. Data migration
6. Breaking changes
7. Removing existing functionality

**OPTIONAL checkpoints:**
1. After completing major phases
2. Before experimental changes
3. When trying multiple approaches

### Checkpoint Naming Convention

```
checkpoint-[plan-name]-step-[N]-[description]

Examples:
- checkpoint-auth-migration-step-3-before-db-change
- checkpoint-dashboard-feature-step-2-before-api
- checkpoint-checkout-refactor-step-5-before-breaking-change
```

### Rollback Triggers

**Automatic rollback if:**
1. Tests fail after 5 /grind iterations
2. Critical linter errors introduced
3. User requests rollback
4. Agent detects critical error
5. Data corruption detected

## Iteration Loop (/grind)

### When to Use
- Tests failing
- Linter errors persist
- Matching design mockups
- Fixing edge cases

### Process
1. Run tests → identify failures
2. Fix code → run tests again
3. Repeat until pass or max 5 iterations
4. Update scratchpad: `.cursor/scratchpad.md`
5. Report BLOCKED if stuck

### Scratchpad Format

```markdown
## Task: Make all tests pass

### Iteration 1
- ❌ 3 tests failing
- Fixed authentication logic

### Iteration 2
- ❌ 1 test failing
- Fixed edge case in validation

### Iteration 3
- ✅ All tests passing
- DONE
```

## Adaptive Re-planning

### When to Re-plan

**Re-plan required if:**
1. >30% of plan steps changed
2. New blockers discovered
3. Time estimate off by >50%
4. User changes requirements
5. Critical dependency missing

### Re-plan Process

1. **Pause execution**
   - Stop current step
   - Create checkpoint if needed

2. **Assess deviation**
   - What changed?
   - Why did it change?
   - Impact on remaining steps?

3. **Create updated plan**
   - Show delta from original
   - Explain why changes needed
   - Provide new time estimate

4. **Get approval**
   - Present to user
   - Explain trade-offs
   - Wait for approval to continue

### Re-plan Template

```markdown
## Plan Update Required

### What Changed
- Original: [what we planned]
- Reality: [what we discovered]
- Impact: [how it affects the plan]

### Proposed Changes
1. Add step: [new step]
2. Remove step: [unnecessary step]
3. Modify step: [changed step]
4. New time estimate: [X minutes]

### Reason for Changes
[Brief explanation]

### Approval Required
Shall I proceed with this updated plan?
```

## Examples

### Example 1: Normal Execution

Plan: "Add login button" (5 steps)

Execution:
```
✅ Step 1: Research patterns
   - Tool: SemanticSearch
   - ReadLints: Clear
   - TodoWrite: Updated

✅ Step 2: Add button to Header
   - Tool: StrReplace
   - ReadLints: Clear
   - TodoWrite: Updated

✅ Step 3: Style button
   - Tool: Write
   - ReadLints: Clear
   - TodoWrite: Updated

✅ Step 4: Add click handler
   - Tool: StrReplace
   - Tests: Pass
   - TodoWrite: Updated

✅ Step 5: Final validation
   - Tool: ReadLints
   - Tool: Shell (tests)
   - All clear → COMPLETE
```

### Example 2: Tests Failing

Plan: "Add authentication" (Step 4: Testing)

Execution:
```
❌ Tests failing: 2 failures

→ Automatic /grind loop:

Iteration 1:
- Fix: Token validation logic
- Result: 1 test still failing

Iteration 2:
- Fix: Edge case for expired tokens
- Result: All tests passing ✅

→ Continue to next step
```

### Example 3: Checkpoint & Rollback

Plan: "Migrate auth from JWT to sessions"

Execution:
```
✅ Step 1: Research session patterns
✅ Step 2: Add session dependencies

📸 CHECKPOINT created: Before DB changes

❌ Step 3: Database migration
   - Error: Breaking change detected
   - Tests failing

→ Automatic rollback to checkpoint
→ User notified
→ Alternative approach suggested
```

### Example 4: Adaptive Re-planning

Plan: "Add dashboard" (original: 5 steps)

Discovery during execution:
```
⚠️ Discovered: Existing dashboard component
⚠️ Impact: 3 steps unnecessary
⚠️ New approach: Modify existing instead

## Plan Update Required

### What Changed
- Original: Create new dashboard from scratch
- Reality: Existing dashboard can be extended
- Impact: 60% reduction in work

### Proposed Changes
1. Remove: Create new page file
2. Remove: Create new layout
3. Modify: Extend existing dashboard
4. New time estimate: 20 minutes (was 45)

Shall I proceed with updated plan?
```
