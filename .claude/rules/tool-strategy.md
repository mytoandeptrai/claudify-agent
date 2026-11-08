# Tool Selection Strategy

## Cost Hierarchy (Start Cheap)
Tier 1: Read, Glob, Grep (fastest)
Tier 2: SemanticSearch, StrReplace, Write
Tier 3: Task, Shell, ReadLints
Tier 4: Parallel subagents, Browser MCP

## Automatic Triggers
- After edits → ReadLints automatically
- After substantive changes → Shell (tests)
- Ambiguous requirements → AskQuestion (batch)
- Complex exploration → Task (parallel subagents)

## MCP Servers
- cursor-ide-browser: UI changes, visual verification
- user-github: PR/issue operations
- user-ESLint: Code quality checks
- user-context7: Library documentation

## Pattern
Follow tool selection examples in @.cursor/skills/tool-selection/SKILL.md
