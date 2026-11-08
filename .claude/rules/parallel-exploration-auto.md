# Parallel Exploration Auto

## Automatic Triggers

**Launch 2-4 parallel subagents when**:
- Task spans >3 areas/directories
- Complexity >10 steps or >5 files
- Bug investigation (unknown root cause)
- Agent unfamiliarity detected (>3 questions)

## Configuration

```yaml
Agent:
  subagent_type: "Explore"
  model: "haiku"  # ALWAYS for exploration
  run_in_background: true
  timeout: 120s
```

## Rules

1. Default to 2-3 subagents, scale to 4 for complex tasks
2. ALWAYS use `model="haiku"` (90% of cases)
3. Consolidate findings before planning
4. See `.claude/skills/parallel-exploration/SKILL.md` for patterns

## Anti-Patterns

❌ >4 subagents, ❌ capable model for exploration, ❌ no consolidation
