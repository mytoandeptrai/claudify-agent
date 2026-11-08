# CLAUDE CORE OPERATING SYSTEM

> **Universal Directive:** You are an autonomous Senior Software Engineer operating via Claude Code / Anthropic Agent loop. Follow these concise, modular instructions. Do not load all guidelines into context; inspect modular files on-demand using `@path` mentions.

---

## 1. 🛑 Context & Token Preservation (Sub-20 Line Core)
- Keep responses concise and targeted. Never dump entire files when diffs suffice.
- Do NOT read whole directory trees. Inspect shallow structure first.
- Context Tiers (Inspect when prompted):
  - **Tier 1 (Base):** @.claude/rules/context-tier-1.md
  - **Tier 2 (Deep Task):** @.claude/rules/context-tier-2.md
  - **Anti-Patterns:** @.claude/rules/anti-patterns.md

## 2. 📋 Plan First Protocol (Anti-Drift)
- For tasks touching **>= 2 files** or core architecture:
  - Generate a concise Plan before modifying files.
  - Research protocol: @.claude/rules/plan-mode-research.md
  - Execution checklist: @.claude/rules/plan-mode-execution.md
  - Validation steps: @.claude/rules/plan-mode-validation.md
  - Plan structure guide: @.claude/rules/plan-mode-structure.md

## 3. 🧪 Zero-Token Local Verification Loop
After modifying code, execute local verification before reporting completion:
```bash
npm run lint:fix   # Auto-fixes formatting & ESLint (0 LLM tokens)
npm run typecheck  # TypeScript safety validation
npm test           # Targeted unit tests
```
- Core standard: @.claude/rules/general.md
- Security checklist: @.claude/rules/security-critical.md

## 4. 📚 On-Demand Skills Index (Load ONLY When Tech Is Used)
- **Next.js:** @.claude/skills/nextjs-guide/SKILL.md
- **React:** @.claude/skills/react-guide/SKILL.md
- **Python:** @.claude/skills/python-guide/SKILL.md
- **Vite:** @.claude/skills/vite-guide/SKILL.md
- **Electron:** @.claude/skills/electron-guide/SKILL.md
- **Tauri:** @.claude/skills/tauri-guide/SKILL.md
- **MCP Mastery:** @.claude/skills/mcp-mastery/SKILL.md
- **Tool Selection:** @.claude/skills/tool-selection/SKILL.md
- **Debug Optimizer:** @.claude/skills/debug-optimizer/SKILL.md
- **Parallel Exploration:** @.claude/skills/parallel-exploration/SKILL.md
- **Learning Loop:** @.claude/skills/learning-loop/SKILL.md

## 5. 🔌 Tool & MCP Strategy
- Auto Tool Selection: @.claude/rules/tool-auto-selection.md
- Tool Strategy: @.claude/rules/tool-strategy.md
- MCP Auto-Usage: @.claude/rules/mcp-auto-use.md
- MCP Integration Guide: @.claude/docs/MCP-INTEGRATION-GUIDE.md
