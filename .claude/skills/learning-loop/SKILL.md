# SKILL.md: Learning Loop

## Description
Analyzes plan metrics to identify patterns, detect repeated mistakes, and suggest continuous improvements based on historical execution data.

## When to Use
- Weekly review of plan performance
- After detecting repeated failures
- When plan accuracy drops below threshold
- Proactive optimization of workflows

## Capabilities
- Pattern recognition from metrics
- Anti-pattern detection
- Repeated mistake identification
- Trend analysis
- Improvement recommendations
- Rule update suggestions

## Commands
/learning-loop-analyze: Full pattern analysis
/learning-loop-weekly: Weekly performance review
/learning-loop-suggest: Generate improvement suggestions
/learning-loop-patterns: Show detected anti-patterns

## Workflows

### Weekly Analysis Workflow

1. **Load Metrics** (30s)
   ```bash
   Read: .cursor/plan-metrics.json
   ```
   - Last 10-20 plan executions
   - Extract key metrics

2. **Pattern Detection** (60s)
   - Run anti-pattern detection rules
   - Identify repeated mistakes
   - Calculate trends

3. **Analysis Report** (30s)
   ```markdown
   ## Weekly Learning Report
   
   ### Performance Summary
   - Avg Accuracy: X% (trend: ↑/↓/→)
   - Avg Iterations: X (target: <2)
   - Tool Efficiency: X% (target: >70%)
   
   ### Detected Anti-Patterns
   1. [SEVERITY] Pattern name
      - Suggestion: ...
   
   ### Repeated Mistakes
   - Mistake 1 (count: X)
   - Mistake 2 (count: X)
   
   ### Top 3 Improvements
   1. [Action item]
   2. [Action item]
   3. [Action item]
   
   ### Rule Update Suggestions
   - Suggest updating: .cursor/rules/[file]
   - Reason: [pattern detected]
   ```

4. **Action Items** (30s)
   - Prioritize top 3 improvements
   - Create tasks for rule updates
   - Schedule follow-up review

### Anti-Pattern Detection

The skill detects these anti-patterns automatically:

1. **Over-Engineering** (High)
   - Using expensive tools when cheap alternatives work
   - Detection: avg tool efficiency < 50% over 3 plans
   - Fix: Follow tool escalation protocol

2. **Planning Without Research** (Critical)
   - Creating plans without SemanticSearch
   - Detection: No SemanticSearch in last 3 plans
   - Fix: Always research before planning

3. **Repeated Execution Failures** (Critical)
   - Multiple consecutive low-accuracy plans
   - Detection: 2+ plans with <60% accuracy
   - Fix: Improve validation process

4. **MCP Overuse** (Medium)
   - Using MCP tools unnecessarily
   - Detection: High MCP usage + low accuracy
   - Fix: Use MCP only when essential

5. **Skipping Validation** (High)
   - Not running ReadLints/tests
   - Detection: No validation tools in 3 plans
   - Fix: Auto-validate after changes

6. **Context Bloat** (Medium)
   - Loading too much context
   - Detection: Low efficiency + high iterations
   - Fix: Apply tiered injection, minimalism

### Trend Analysis

Analyzes performance trends:

```typescript
if (secondHalfAvg > firstHalfAvg + 5) {
  trend = "improving";
  // Reinforce what's working
} else if (secondHalfAvg < firstHalfAvg - 5) {
  trend = "declining";
  // Investigate root causes
} else {
  trend = "stable";
  // Look for optimization opportunities
}
```

## Examples

### Example 1: Weekly Review

User: "/learning-loop-weekly"

Agent analyzes last 10 plans:

```markdown
## Weekly Learning Report (Mar 23-30, 2026)

### Performance Summary
- Avg Accuracy: 82.5% (↑ +5.2% from last week)
- Avg Iterations: 1.8 (↓ -0.5, improving)
- Tool Efficiency: 75.0% (→ stable)
- Avg Parallel Subagents: 2.3

### Wins This Week
✅ Accuracy improved above 80% threshold
✅ Iteration count decreasing
✅ MCP usage correlated with success

### Detected Anti-Patterns
1. [MEDIUM] MCP Overuse (2 occurrences)
   - Suggestion: Use MCP tools only when essential

### Repeated Mistakes
- None detected this week 🎉

### Top 3 Improvements
1. Continue current research practices
2. Reduce MCP usage for simple tasks
3. Document successful patterns

### Rule Updates
No updates needed this week
```

### Example 2: Pattern Detection

User: "/learning-loop-patterns"

Agent detects patterns:

```markdown
## Detected Anti-Patterns

### 1. [CRITICAL] Planning Without Research
**Occurrences**: 3 times in last 5 plans
**Impact**: Avg accuracy 58% (vs 82% when researched)
**Suggestion**: Always use SemanticSearch before planning

### 2. [HIGH] Skipping Validation
**Occurrences**: 4 times in last 5 plans
**Impact**: 75% of unvalidated plans had lints
**Suggestion**: Enable auto-validate hook

### Recommended Actions
1. Add rule: "Always research before planning"
2. Enable auto-validate in hooks.config.json
3. Create checklist for plan creation
```

### Example 3: Improvement Suggestions

User: "/learning-loop-suggest"

Agent generates suggestions:

```markdown
## Improvement Suggestions

### Immediate (This Week)
1. **Add pre-plan research step**
   - Time cost: +2 min per plan
   - Benefit: +20% accuracy improvement
   
2. **Enable automatic validation**
   - Already configured, just use it
   - Benefit: Catch 100% of lint issues

3. **Reduce MCP tool usage**
   - Current: 4.2 MCP tools/plan
   - Target: 2.0 MCP tools/plan
   - Savings: ~30% token cost

### Medium-term (This Month)
1. Create validation checklist
2. Document successful patterns
3. Update anti-pattern detection rules

### Long-term (This Quarter)
1. Integrate with CI/CD metrics
2. A/B test different workflows
3. Build pattern recognition dashboard
```

## Best Practices

### 1. Review Weekly
- Schedule fixed time (e.g., Friday 4pm)
- Review last 10 plans
- Identify top 3 improvements
- Update rules if needed

### 2. Act on Patterns
- Don't just detect - fix
- Prioritize critical patterns first
- Track improvement over time

### 3. Keep Rules Minimal
- Only add rules for repeated patterns
- Keep rules under 20 lines
- Use references over content

### 4. Measure Impact
- Before/after comparisons
- Track metric changes
- Adjust based on data

## Anti-Patterns

### ❌ Ignoring Detected Patterns
Bad: Detect patterns but don't act  
Good: Create action items, track fixes

### ❌ Over-Analyzing
Bad: Analyze every single plan  
Good: Weekly batch analysis

### ❌ Too Many Rules
Bad: Add rule for every mistake  
Good: Only for repeated patterns (3+ occurrences)

### ❌ No Follow-up
Bad: Generate suggestions, forget them  
Good: Schedule follow-up review

## Troubleshooting

### Not Enough Data
**Problem**: Less than 3 plans to analyze

**Solution**: 
- Wait for more data
- Run analysis after 10+ plans
- Use qualitative feedback initially

### False Positive Patterns
**Problem**: Pattern detected but not actually an issue

**Solution**:
- Adjust detection thresholds
- Add exception rules
- Manual review before acting

### No Patterns Detected
**Problem**: Analysis shows no patterns

**Solution**:
- Check if thresholds too strict
- Look for subtle patterns
- Consider qualitative feedback

## Metrics Reference

### Key Metrics Tracked
- `plan_accuracy`: % of plan followed correctly
- `iteration_count`: Number of /grind loops
- `tool_efficiency`: Cost-weighted tool score
- `parallel_subagents`: Number of parallel explorations
- `mcp_usage`: MCP server utilization
- `cost_estimate`: Estimated token consumption

### Thresholds
- **Excellent**: Accuracy >90%, Iterations <2, Efficiency >80%
- **Good**: Accuracy 70-90%, Iterations 2-3, Efficiency 60-80%
- **Needs Work**: Accuracy <70%, Iterations >3, Efficiency <60%

## Related Documentation
- `AGENT-INSTRUCTION-BEST-PRACTICES.md` - Core research
- `.cursor/hooks.config.json` - Configuration
- `.cursor/plan-metrics.json` - Historical data
- `.cursor/docs/PLAN-MODE-OPTIMIZATION.md` - Plan mode guide
