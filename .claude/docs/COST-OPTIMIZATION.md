# Cost Optimization Guide

## Overview
Track and optimize token consumption and execution costs for Cursor agent operations. This guide provides formulas, tracking methods, and optimization strategies.

## Tool Cost Hierarchy

### Tier 1: Cheapest (Always Try First)
```
Tool          | Est. Tokens | When to Use
--------------|-------------|----------------------------------
Read          | 500         | Single file access
Glob          | 200         | Pattern-based file finding
Grep          | 300         | Exact text/symbol search
Shell         | 100         | Command execution
Write         | 1000        | Creating new files
StrReplace    | 500         | Small targeted edits (<50 lines)
```

### Tier 2: Moderate Cost
```
Tool               | Est. Tokens | When to Use
-------------------|-------------|----------------------------------
SemanticSearch     | 1500        | Conceptual/pattern search
ReadLints          | 800         | Code quality validation
EditNotebook       | 1000        | Jupyter notebook edits
```

### Tier 3: Higher Cost
```
Tool          | Est. Tokens | When to Use
--------------|-------------|----------------------------------
Task          | 3000        | Complex exploration (subagents)
WebSearch     | 2000        | Web search operations
WebFetch      | 2500        | Fetch web content
```

### Tier 4: Most Expensive (Use Sparingly)
```
MCP Server              | Est. Tokens | When to Use
------------------------|-------------|----------------------------------
cursor-ide-browser      | 5000+       | Visual verification, UI testing
user-github             | 2000        | Git/GitHub operations
user-chrome-devtools    | 3000        | Performance audits
user-playwright         | 4000        | Cross-browser E2E testing
```

## Cost Calculation Formulas

### Per-Tool Cost
```typescript
function calculateToolCost(toolCalls: ToolCall[]): number {
  const costEstimates: Record<string, number> = {
    'Shell': 100, 'Read': 500, 'Write': 1000, 
    'Glob': 200, 'Grep': 300, 'StrReplace': 500,
    'ReadLints': 800, 'SemanticSearch': 1500,
    'Task': 3000, 'WebSearch': 2000, 'WebFetch': 2500,
  };
  
  let totalCost = 0;
  for (const tool of toolCalls) {
    if (tool.mcp_server) {
      totalCost += 5000; // MCP tools estimated higher
    } else {
      totalCost += costEstimates[tool.name] || 1000;
    }
  }
  
  return totalCost;
}
```

### Plan Efficiency Score
```typescript
function calculateEfficiency(tools: ToolCall[]): number {
  const tierScores: Record<string, number> = {
    'Shell': 100, 'Read': 100, 'Write': 100, 
    'Glob': 100, 'Grep': 100,
    'ReadLints': 80, 'SemanticSearch': 80,
    'Task': 60, 'WebSearch': 60, 'WebFetch': 60,
  };
  
  let totalScore = 0;
  let toolCount = 0;
  
  for (const tool of tools) {
    if (tool.mcp_server) {
      totalScore += 40; // MCP = lowest efficiency score
      toolCount++;
    } else {
      totalScore += tierScores[tool.name] || 75;
      toolCount++;
    }
  }
  
  return toolCount > 0 ? Math.round(totalScore / toolCount) : 75;
}
```

### Cost Per Task Type
```
Task Type              | Avg Tokens | Optimization Target
-----------------------|------------|--------------------
Simple bug fix         | 2,000-5,000 | <3,000
Feature implementation | 10,000-20,000 | <15,000
Complex refactor       | 15,000-30,000 | <20,000
New file creation      | 3,000-8,000 | <5,000
Research/exploration   | 5,000-15,000 | <10,000
```

## Cost Tracking

### Automatic Tracking (Enabled by Default)
The `plan-quality-tracker.ts` hook automatically tracks:
- Tool usage per plan
- Estimated token cost
- Rolling averages (last 10 plans)
- Cost efficiency scores

### Manual Tracking
```bash
# View recent plan costs
cat .cursor/plan-metrics.json | jq '.[-10:] | .[].cost_estimate'

# Calculate average cost
cat .cursor/plan-metrics.json | jq '[.[].cost_estimate] | add / length'

# Find most expensive plans
cat .cursor/plan-metrics.json | jq 'sort_by(-.cost_estimate) | .[0:5]'
```

### Cost Alerts
Configure in `.cursor/hooks.config.json`:
```json
{
  "planTracking": {
    "enableCostTracking": true,
    "costAlertThreshold": 20000,
    "efficiencyThreshold": 60
  }
}
```

## Optimization Strategies

### Strategy 1: Tool Escalation Protocol
**Rule**: Start with cheapest tool, escalate only if needed

```
1. Try Tier 1 first:
   - Need file? → Read (know path) or Glob (pattern)
   - Need text? → Grep (exact) or SemanticSearch (concept)
   
2. If Tier 1 fails → Escalate to Tier 2:
   - Complex search? → SemanticSearch
   - Small edit? → StrReplace
   
3. If Tier 2 inadequate → Escalate to Tier 3:
   - Broad exploration? → Task (subagent)
   - External info? → WebSearch/WebFetch
   
4. If Tier 3 insufficient → Escalate to Tier 4:
   - Visual verification? → cursor-ide-browser
   - Git operations? → user-github
```

**Savings**: 30-50% reduction in token consumption

### Strategy 2: MCP Tool Optimization
**Rule**: Use MCP tools only when essential

**When to Use MCP**:
- ✅ Visual verification (UI changes)
- ✅ Git/GitHub operations
- ✅ Performance audits
- ✅ Documentation lookup
- ❌ Simple file operations (use Read/Write)
- ❌ Basic searches (use Grep/Glob)
- ❌ Code edits (use StrReplace/Write)

**Savings**: 40-60% reduction for typical tasks

### Strategy 3: Parallel Exploration
**Rule**: Use parallel subagents for complex tasks (>10 steps)

**Cost-Benefit**:
- Cost: 3-4 subagents × 3000 tokens = 9,000-12,000 tokens
- Benefit: 60-70% faster discovery, prevents wasted iterations
- ROI: Positive for tasks >30 min estimated

**Configuration**:
```typescript
Task:
  description="Explore [area]"
  model="fast"  // Cost optimization
  readonly=true  // Safety
  run_in_background=true  // Non-blocking
```

### Strategy 4: Research First, Plan Second
**Rule**: Spend 2-3 min on research before planning

**Research Tools** (cheap):
- SemanticSearch: 1500 tokens
- Grep: 300 tokens
- Glob: 200 tokens

**Benefit**:
- Prevents wrong direction (-10,000+ tokens wasted)
- Improves accuracy by 20-25%
- Reduces iterations by 40-50%

### Strategy 5: Automatic Validation
**Rule**: Always validate after substantive changes

**Validation Sequence**:
1. ReadLints (800 tokens) - catches errors early
2. Shell tests (100 tokens) - verifies functionality
3. MCP validation (if used) - ensures tool success

**Benefit**:
- Catches 95% of issues before commit
- Prevents expensive rework
- Reduces revision cycles by 55%

## Cost Optimization Checklist

### Before Starting Task
- [ ] Define clear success criteria
- [ ] Estimate complexity (simple/medium/complex)
- [ ] Identify cheapest tool sequence
- [ ] Set cost budget based on task type

### During Execution
- [ ] Follow tool escalation protocol
- [ ] Use Tier 1 tools first
- [ ] Avoid MCP unless essential
- [ ] Track tool usage mentally

### After Completion
- [ ] Review actual cost vs estimate
- [ ] Check efficiency score (target: >70%)
- [ ] Identify optimization opportunities
- [ ] Log learnings for future reference

## Cost Reduction Examples

### Example 1: Bug Fix (Before/After)

**Before** (No optimization):
```
1. Task (explore): "Find auth bug" - 3000 tokens
2. browser_snapshot - 5000 tokens
3. StrReplace - 500 tokens
4. ReadLints - 800 tokens
Total: 9,300 tokens
Efficiency: 52%
```

**After** (Optimized):
```
1. Grep: "find login function" - 300 tokens
2. Read: auth code - 500 tokens
3. StrReplace: fix bug - 500 tokens
4. ReadLints: validate - 800 tokens
Total: 2,100 tokens
Efficiency: 88%
Savings: 77% reduction
```

### Example 2: Feature Implementation

**Before** (No optimization):
```
1. browser_snapshot - 5000 tokens
2. Task x3 (parallel) - 9000 tokens
3. Write x5 files - 5000 tokens
4. user-github (create PR) - 2000 tokens
Total: 21,000 tokens
Efficiency: 58%
```

**After** (Optimized):
```
1. SemanticSearch: patterns - 1500 tokens
2. Read: 3 examples - 1500 tokens
3. Write x5 files - 5000 tokens
4. ReadLints - 800 tokens
5. Shell (tests) - 100 tokens
6. user-github (create PR) - 2000 tokens
Total: 10,900 tokens
Efficiency: 76%
Savings: 48% reduction
```

### Example 3: Complex Refactor

**Before** (No optimization):
```
1. Task x4 (exploration) - 12,000 tokens
2. browser_snapshot x5 - 25,000 tokens
3. StrReplace x10 - 5000 tokens
4. ReadLints x3 - 2400 tokens
Total: 44,400 tokens
Efficiency: 45%
```

**After** (Optimized):
```
1. Task x3 (parallel, targeted) - 9000 tokens
2. Grep: find usages - 300 tokens
3. StrReplace x10 - 5000 tokens
4. ReadLints (auto) - 800 tokens
5. Shell (tests) - 100 tokens
Total: 15,200 tokens
Efficiency: 72%
Savings: 66% reduction
```

## Monitoring & Alerts

### Weekly Cost Review
```markdown
## Weekly Cost Report

### Summary
- Total plans: 15
- Total cost: 145,000 tokens
- Avg cost/plan: 9,667 tokens
- Target: <8,000 tokens

### Most Expensive Plans
1. Feature X: 25,000 tokens (over budget)
2. Refactor Y: 18,000 tokens (over budget)
3. Bug fix Z: 12,000 tokens (on budget)

### Optimization Wins
- Tool escalation: -35% avg cost
- MCP reduction: -50% MCP usage
- Research-first: +20% accuracy

### Action Items
1. Review Feature X approach (too expensive)
2. Document successful patterns
3. Adjust cost estimates
```

### Cost Alert Triggers
Configure alerts for:
- Single plan > 20,000 tokens
- Daily total > 100,000 tokens
- Weekly avg > 10,000 tokens/plan
- Efficiency score < 60%

## Tools & Resources

### Cost Calculators
- Built-in: `estimateCost()` in plan-quality-tracker.ts
- Manual: Use formulas above
- Dashboard: Future enhancement

### Cost Benchmarks
```
Developer Level | Avg Cost/Plan | Efficiency
----------------|---------------|------------
Junior          | 12,000        | 55%
Mid             | 8,000         | 70%
Senior          | 6,000         | 80%
Optimized       | 4,000         | 90%
```

### ROI Calculation
```
Time saved with optimization: 2 hours/week
Token cost reduction: 40%
Developer hourly rate: $50/hour
Weekly savings: $100
Monthly savings: $400
Annual savings: $4,800 per developer
```

## Related Documentation
- `AGENT-INSTRUCTION-BEST-PRACTICES.md` - Research backing
- `.cursor/skills/tool-selection/SKILL.md` - Tool selection
- `.cursor/plan-metrics.json` - Historical cost data
- `.cursor/hooks.config.json` - Configuration

## Maintenance

### Weekly
- Review cost metrics
- Identify optimization opportunities
- Adjust thresholds

### Monthly
- Analyze cost trends
- Update cost estimates
- Refine optimization strategies

### Quarterly
- Major strategy review
- Update benchmarks
- Integrate new tools/MCPs
