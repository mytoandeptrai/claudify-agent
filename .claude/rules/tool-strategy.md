# Tool Selection Strategy

## Cost Hierarchy (Start Cheap)
Tier 1: Read, Glob, Grep (fastest)
Tier 2: Explore (quick), Edit, Write
Tier 3: Agent, Bash, Lint check
Tier 4: Parallel subagents, Browser MCP

## Automatic Triggers
- After edits → Lint check automatically
- After substantive changes → Bash (tests)
- Ambiguous requirements → AskUserQuestion (batch)
- Complex exploration → Agent (parallel subagents)

## MCP Servers
- claude-in-chrome: UI changes, visual verification
- github: PR/issue operations
- eslint: Code quality checks
- context7: Library documentation

## Pattern
Follow tool selection examples in @.claude/skills/tool-selection/SKILL.md
