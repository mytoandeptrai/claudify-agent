# Quick Reference

**For**: Cursor Agent Optimization  
**Updated**: March 30, 2026

---

## Commands

### Learning Loop
```
/learning-loop-weekly    - Weekly performance review
/learning-loop-patterns  - Detected anti-patterns
/learning-loop-suggest   - Improvement suggestions
/learning-loop-analyze   - Full pattern analysis
```

### Plan Mode
```
/plan-mode-full          - Complete optimized workflow
/plan-mode-quick         - Standard plan mode (no research)
/plan-mode-validate      - Validate existing plan
```

---

## Files to Check

### Metrics & Dashboards
| File | Purpose |
|------|---------|
| `.cursor/plan-metrics.json` | Recent plan metrics (accuracy, cost, efficiency) |
| `.cursor/weekly-learning-report.md` | Weekly insights & patterns |
| `.cursor/cost-dashboard.md` | Cost tracking & ROI |
| `.cursor/security-dashboard.md` | Security trends & vulnerabilities |

### Configuration
| File | Purpose |
|------|---------|
| `.cursor/hooks.config.json` | Hook configuration & thresholds |
| `.cursor/hooks.json` | Hook triggers & commands |
| `AGENTS.md` | Repository context (root level) |

### Rules & Skills
| File | Purpose |
|------|---------|
| `.cursor/rules/general.md` | Essential rules (always loaded) |
| `.cursor/rules/mcp-auto-use.md` | MCP server triggers |
| `.cursor/rules/parallel-exploration-auto.md` | Subagent triggers |
| `.cursor/skills/tool-selection/SKILL.md` | Tool decision trees |
| `.cursor/skills/parallel-exploration/SKILL.md` | Subagent patterns |
| `.cursor/skills/learning-loop/SKILL.md` | Learning loop workflow |

---

## Thresholds & Targets

### Performance Targets
| Metric | Target | Status Check |
|--------|--------|--------------|
| Plan Accuracy | >80% | `.cursor/plan-metrics.json` |
| Tool Efficiency | >70% | Efficiency score |
| Avg Iterations | <2.0 | Loop count |
| Security Coverage | 100% | Scans per change |

### Cost Targets
| Task Type | Budget | Alert Threshold |
|-----------|--------|----------------|
| Simple Fix | 3,000 tokens | >5,000 |
| Feature Implementation | 15,000 tokens | >20,000 |
| Complex Refactor | 20,000 tokens | >25,000 |
| Daily Total | - | >100,000 |
| Weekly Average | 10,000/plan | >15,000/plan |

### MCP Usage
| Server | Target Usage | When to Use |
|--------|--------------|-------------|
| user-context7 | High (liberal) | Library/framework questions |
| user-ESLint | Auto (every change) | After EVERY code change |
| user-github | Moderate | Git/GitHub operations |
| cursor-ide-browser | Low (sparingly) | Visual verification only |

---

## Anti-Patterns (Auto-Detected)

### Critical (Fix Immediately)
1. **Planning Without Research**
   - Detection: No SemanticSearch in last 3 plans
   - Fix: Always research 2-3 min before planning

2. **Repeated Execution Failures**
   - Detection: 2+ plans with <60% accuracy
   - Fix: Add validation subagent, create checkpoints

### High Priority (Fix This Week)
3. **Over-Engineering**
   - Detection: Avg tool efficiency <50% over 3 plans
   - Fix: Follow tool escalation (Tier 1 → Tier 4)

4. **Skipping Validation**
   - Detection: No ReadLints/tests in 3 plans
   - Fix: Enable auto-validate hook

### Medium Priority (Fix Next Week)
5. **MCP Overuse**
   - Detection: High MCP usage + low accuracy
   - Fix: Use MCP only when essential

6. **Context Bloat**
   - Detection: Rules >20 lines, low efficiency
   - Fix: Apply minimalism, use references

---

## Tool Escalation Protocol

**Rule**: Start cheap, escalate only if needed

### Tier 1 (Always Try First) - Cheapest
- **Read**: Single file access (500 tokens)
- **Glob**: Pattern matching (200 tokens)
- **Grep**: Exact text search (300 tokens)
- **Shell**: Command execution (100 tokens)

### Tier 2 (If Tier 1 Insufficient) - Moderate
- **SemanticSearch**: Conceptual search (1,500 tokens)
- **StrReplace**: Small edits <50 lines (500 tokens)
- **Write**: New files (1,000 tokens)

### Tier 3 (If Tier 2 Inadequate) - Higher
- **Task**: Complex exploration (3,000 tokens)
- **ReadLints**: Quality checks (800 tokens)
- **WebSearch/WebFetch**: External info (2,000+ tokens)

### Tier 4 (Last Resort) - Most Expensive
- **Parallel Subagents**: Multi-angle (3,000 each)
- **Browser MCP**: Visual verification (5,000+)
- **Complex Workflows**: Multi-step automation

---

## Pre-Commit Checklist

Before committing ANY code:

- [ ] **Security review passed** (auto-run after changes)
- [ ] **Lint clean** (auto-fixed by hook)
- [ ] **Tests passing** (auto-run)
- [ ] **Type check passed** (TypeScript)
- [ ] **Cost within budget** (check `.cursor/cost-dashboard.md`)
- [ ] **No anti-patterns detected** (check `.cursor/weekly-learning-report.md`)

---

## Best Practices

### Research Phase (2-3 min)
1. SemanticSearch for existing patterns
2. Launch parallel subagents if complex
3. ReadLints for code health
4. Batch questions with AskQuestion

### Planning Phase (1-2 min)
1. Follow enhanced plan structure
2. Include tool strategy section
3. Add risk mitigation
4. Define checkpoints

### Execution Phase
1. Create TodoWrite automatically
2. Update after each step
3. Run validation after changes
4. Report blockers early

### Review Phase
1. Check plan accuracy
2. Review cost metrics
3. Update dashboards
4. Document learnings

---

## Troubleshooting

### Plan Accuracy <70%
**Cause**: Insufficient research  
**Fix**: Spend 2-3 min on SemanticSearch, launch subagents

### Tool Efficiency <60%
**Cause**: Using expensive tools unnecessarily  
**Fix**: Follow escalation protocol, start with Tier 1

### Too Many Iterations (>3)
**Cause**: Poor feasibility validation  
**Fix**: Add validation subagent, create checkpoints

### MCP Success Rate <50%
**Cause**: Wrong tool for task  
**Fix**: Review MCP usage, use built-in tools instead

---

## Related Documentation

- `AGENT-INSTRUCTION-BEST-PRACTICES.md` - Core research
- `.cursor/docs/COST-OPTIMIZATION.md` - Cost tracking guide
- `.cursor/docs/PLAN-MODE-OPTIMIZATION.md` - Plan mode workflow
- `.cursor/OPTIMIZATION-COMPLETE.md` - Implementation summary

---

*Quick reference for daily use. For detailed guides, see documentation above.*
