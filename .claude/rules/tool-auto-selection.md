# Tool Auto-Selection

## Tool Cost Hierarchy (Start Cheap, Escalate)

**Tier 1 (Cheapest)**: Read, Glob, Grep, Bash  
**Tier 2 (Moderate)**: Explore (quick), Edit, Write  
**Tier 3 (Higher)**: Agent, Lint check  
**Tier 4 (Most Expensive)**: Parallel subagents, Browser MCP

## Automatic Triggers

### After Code Changes
- After Edit/Write → Lint check (automatic)
- After substantive changes → Bash (tests)

### For Exploration
- Know path? → Read  
- Pattern? → Glob + Read  
- Exact text? → Grep  
- Concept? → Explore (quick)  
- Broad? → Agent (Explore)

### For Implementation
- New file? → Write  
- <50 lines? → Edit  
- >50 lines? → Write (entire file)

### For Complex Tasks
- >10 steps or >5 files → Launch 3-4 parallel subagents

## Rules

1. Always start with Tier 1, escalate only if needed
2. Never skip tiers unless justified
3. Run Lint check after EVERY code change
4. Use parallel subagents for broad exploration (>3 files)

## Decision Trees
See `.claude/skills/tool-selection/SKILL.md` for complete decision trees and patterns.

## Anti-Patterns to Avoid
- ❌ Tool hoarding (using 5 tools when 1 works)
- ❌ Using expensive tools for simple tasks
- ❌ Skipping validation after edits
- ❌ No checkpoints for risky changes
