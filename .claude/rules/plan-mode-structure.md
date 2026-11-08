# Plan Mode Plan Structure

## Required Plan Sections

Every plan MUST include:

1. **Summary** (1-2 sentences)
   - What will be done
   - Why it's needed

2. **Files to Create/Modify**
   - Path and purpose
   - Reference pattern: "Follow @[file]"
   - Tools: "Use [tool] for [operation]"

3. **Implementation Steps**
   - Sequential ordering
   - Tool for each step
   - Success metric: "Tests pass", "Lints clear"

4. **Tool Strategy**
   - Exploration tools
   - Implementation tools
   - Validation tools
   - Question strategy

5. **Testing Strategy**
   - Test types
   - Test files to create/modify
   - Commands to run

6. **Risk Mitigation**
   - High-risk steps flagged
   - Fallback strategies
   - Checkpoint locations

7. **Estimated Time**
   - Based on complexity
   - Includes buffer (20%)

## Plan Quality Gates

- [ ] All steps verifiable
- [ ] Tools specified
- [ ] Patterns referenced
- [ ] Risks identified
- [ ] Tests included

## Enhanced Plan Structure Template

```markdown
## Files to Create/Modify
- `path/to/file.ts` - Purpose
  - Pattern: Follow @[reference file]
  - Tools: Use Edit for edits, Bash for testing

## Implementation Steps
1. [Step] 
   - Tool: Explore (quick) to find [X]
   - Tool: Agent subagent to explore [Y]
   - Tool: Lint check to verify [Z]
   - Success: [Verifiable metric]

## Tool Strategy
- Exploration: Explore (quick) + Agent (Explore)
- Implementation: Read/Write/Edit
- Validation: Lint check + Bash (tests)
- Questions: AskUserQuestion for [specific decisions]

## Risk Mitigation
- If [X] fails → Fallback: [Y]
- If tests fail → Use the fix-and-retest loop (max 5 iterations)
- If stuck → AskUserQuestion with options
```

## Examples

### Example 1: Simple Feature
User: "Add login button"

Plan structure:
```markdown
## Summary
Add login button to header navigation following existing button patterns.

## Files to Modify
- `components/Header.tsx` - Add login button to nav
  - Pattern: Follow `components/Button.tsx`
  - Tools: Edit for edit, Lint check for validation

## Implementation Steps
1. Find existing button patterns
   - Tool: Explore (quick): "How are buttons styled?"
   - Success: Pattern identified

2. Add login button to Header
   - Tool: Edit
   - Success: Button renders correctly

3. Verify no linting errors
   - Tool: Lint check
   - Success: Zero new lints

## Tool Strategy
- Exploration: Explore (quick) for button patterns
- Implementation: Edit
- Validation: Lint check

## Estimated Time: 10 minutes
```

### Example 2: Complex Feature
User: "Add user dashboard"

Plan structure:
```markdown
## Summary
Create user dashboard with stats, activity feed, and settings panel.

## Files to Create
- `app/dashboard/page.tsx` - Main dashboard page
  - Pattern: Follow `app/profile/page.tsx`
  - Tools: Write for new file
- `components/dashboard/StatsCard.tsx` - Stats component
  - Pattern: Follow `components/Card.tsx`
  - Tools: Write for new file
- `app/api/dashboard/stats/route.ts` - Stats API
  - Pattern: Follow `app/api/users/route.ts`
  - Tools: Write for new file

## Implementation Steps
1. Research existing patterns (3 min)
   - Tool: Agent (Explore): "Find page patterns"
   - Tool: Agent (Explore): "Find component patterns"
   - Success: Patterns identified

2. Create API endpoint (5 min)
   - Tool: Write
   - Success: Endpoint created, tests pass

3. Build dashboard page (10 min)
   - Tool: Write
   - Success: Page renders

4. Create UI components (15 min)
   - Tool: Write for each component
   - Success: Components render

5. Integration testing (5 min)
   - Tool: Bash: npm run test
   - Tool: Lint check
   - Success: All tests pass, zero lints

## Tool Strategy
- Exploration: Agent (Explore) x2 in parallel
- Implementation: Write, Edit
- Validation: Bash (tests), Lint check
- Questions: AskUserQuestion for dashboard widget priorities

## Risk Mitigation
- If API fails → Fallback: Mock data initially
- If tests fail → Use the fix-and-retest loop (max 5 iterations)
- Checkpoint before: Integration step

## Estimated Time: 45 minutes
```
