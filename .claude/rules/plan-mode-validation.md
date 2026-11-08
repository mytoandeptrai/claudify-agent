# Plan Mode Plan Validation

## Automatic Validation Steps

Before presenting plan to user:

1. **Feasibility Check**
   - Task subagent: "Validate this plan"
   - Check file accessibility
   - Verify tool availability
   - Estimate time accuracy

2. **Dependency Analysis**
   - Step ordering correct
   - No missing prerequisites
   - Parallel opportunities identified

3. **Risk Assessment**
   - High-risk steps flagged
   - Fallback strategies defined
   - Checkpoint locations set

4. **Tool Availability**
   - MCP servers running
   - Permissions verified
   - Alternative tools identified

## Validation Output

If PASS: Present plan to user
If FAIL: 
- List specific issues
- Suggest fixes
- Auto-correct if possible
- Re-validate

## Validation Checklist

### Feasibility Check
- [ ] All required files accessible
- [ ] No circular dependencies
- [ ] Estimated time realistic (based on complexity)
- [ ] Tools available for all steps

### Dependency Analysis
- [ ] Step ordering correct
- [ ] No missing prerequisites
- [ ] Parallel opportunities identified

### Risk Assessment
- [ ] High-risk steps flagged
- [ ] Fallback strategies defined
- [ ] Rollback plan (Checkpoints) identified

### Tool Availability
- [ ] Required MCP servers running
- [ ] Permissions verified
- [ ] Alternative tools identified

## Validation Subagent Pattern

```
Task:
  description="Validate implementation plan"
  prompt="Review this plan for feasibility:
  
  ## Plan to Validate
  [Plan content]
  
  ## Validation Checklist
  1. Check if all referenced files exist
  2. Verify tool availability
  3. Estimate actual time based on complexity
  4. Identify potential blockers
  5. Suggest improvements
  
  ## Output Format
  Pass/Fail: [Your verdict]
  Issues: [List specific problems]
  Suggestions: [Concrete improvements]
  Confidence: [High/Medium/Low]"
  subagent_type="generalPurpose"
  readonly=true
```

## Examples

### Example 1: Simple Plan Validation

Plan: "Add login button to header"

Validation checks:
- ✅ File exists: components/Header.tsx
- ✅ Tool available: StrReplace
- ✅ Time realistic: 10 minutes
- ✅ No dependencies
- ✅ Low risk

Result: PASS → Present to user

### Example 2: Complex Plan Validation

Plan: "Migrate authentication from JWT to sessions"

Validation checks:
- ✅ Files accessible: src/auth/, app/api/auth/
- ⚠️ Risk: Breaking change (checkpoint needed)
- ⚠️ Time: 2 hours might be optimistic → suggest 3 hours
- ✅ Tools available: Read, Write, Shell, ReadLints
- ✅ Fallback: Keep JWT code until tests pass

Result: PASS with warnings → Present with caveats

### Example 3: Failed Validation

Plan: "Rewrite entire backend in Rust"

Validation checks:
- ❌ Time unrealistic: 1 week → needs 2-3 months
- ❌ Risk: Critical system rewrite
- ❌ Missing: Testing strategy
- ❌ Missing: Rollback plan
- ❌ Dependencies: Team training needed

Result: FAIL → Suggest phased approach:
1. Start with non-critical service
2. Add testing strategy
3. Create rollback plan
4. Revise time estimate
5. Re-validate
