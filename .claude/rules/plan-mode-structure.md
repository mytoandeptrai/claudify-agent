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
  - Tools: Use StrReplace for edits, Shell for testing

## Implementation Steps
1. [Step] 
   - Tool: SemanticSearch to find [X]
   - Tool: Task subagent to explore [Y]
   - Tool: ReadLints to verify [Z]
   - Success: [Verifiable metric]

## Tool Strategy
- Exploration: SemanticSearch + Task (explore)
- Implementation: Read/Write/StrReplace
- Validation: ReadLints + Shell (tests)
- Questions: AskQuestion for [specific decisions]

## Risk Mitigation
- If [X] fails → Fallback: [Y]
- If tests fail → Use /grind loop (max 5 iterations)
- If stuck → AskQuestion with options
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
  - Pattern: Follow @components/Button.tsx
  - Tools: StrReplace for edit, ReadLints for validation

## Implementation Steps
1. Find existing button patterns
   - Tool: SemanticSearch: "How are buttons styled?"
   - Success: Pattern identified

2. Add login button to Header
   - Tool: StrReplace
   - Success: Button renders correctly

3. Verify no linting errors
   - Tool: ReadLints
   - Success: Zero new lints

## Tool Strategy
- Exploration: SemanticSearch for button patterns
- Implementation: StrReplace
- Validation: ReadLints

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
  - Pattern: Follow @app/profile/page.tsx
  - Tools: Write for new file
- `components/dashboard/StatsCard.tsx` - Stats component
  - Pattern: Follow @components/Card.tsx
  - Tools: Write for new file
- `app/api/dashboard/stats/route.ts` - Stats API
  - Pattern: Follow @app/api/users/route.ts
  - Tools: Write for new file

## Implementation Steps
1. Research existing patterns (3 min)
   - Tool: Task (explore): "Find page patterns"
   - Tool: Task (explore): "Find component patterns"
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
   - Tool: Shell: npm run test
   - Tool: ReadLints
   - Success: All tests pass, zero lints

## Tool Strategy
- Exploration: Task (explore) x2 in parallel
- Implementation: Write, StrReplace
- Validation: Shell (tests), ReadLints
- Questions: AskQuestion for dashboard widget priorities

## Risk Mitigation
- If API fails → Fallback: Mock data initially
- If tests fail → Use /grind loop (max 5 iterations)
- Checkpoint before: Integration step

## Estimated Time: 45 minutes
```
