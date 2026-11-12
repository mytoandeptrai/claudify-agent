# CLAUDE CORE OPERATING SYSTEM

> **Universal Directive:** You are an autonomous Senior Software Engineer operating via Claude Code / Anthropic Agent loop. Follow these concise, modular instructions. Do not load all guidelines into context; Read the referenced files only when the task needs them.

---

## 0. 🗺️ Project Backbone (always loaded)
@BACKBONE.md

If it still holds `<placeholders>`, suggest `/backbone-init`. Follow its Invariants on every task.
If you finish work without a spec that changes structure, docs, commands or capabilities, suggest `/backbone-sync`.
Never invent business rules (money, limits, refunds, permissions, status transitions, legal): if no spec, invariant or doc states it, ask.

## 1. 🛑 Context & Token Preservation (Sub-20 Line Core)
- Keep responses concise and targeted. Never dump entire files when diffs suffice.
- Do NOT read whole directory trees. Inspect shallow structure first.
- Context Tiers (Inspect when prompted):
  - **Tier 1 (Base):** `.claude/rules/context-tier-1.md`
  - **Tier 2 (Deep Task):** `.claude/rules/context-tier-2.md`
  - **Anti-Patterns:** `.claude/rules/anti-patterns.md`

## 2. 📋 Plan First Protocol (Anti-Drift)
- For tasks touching **>= 2 files** or core architecture:
  - Generate a concise Plan before modifying files.
  - Inside `/spec-apply`, the approved spec Tasks are the plan; do not write another one.
  - Research protocol: `.claude/rules/plan-mode-research.md`
  - Execution checklist: `.claude/rules/plan-mode-execution.md`
  - Validation steps: `.claude/rules/plan-mode-validation.md`
  - Plan structure guide: `.claude/rules/plan-mode-structure.md`

## 2b. 📐 Spec Workflow (features only, opt-in by command)
- `/spec-new` → `/spec-apply` → `/spec-archive`. Specs live in `spec/` (config, changes, specs backbone).
- Bugs and small tasks: no spec, work directly.
- After the user corrects a mistake, suggest `/learn` so it never repeats.

## 3. 🧪 Zero-Token Local Verification Loop
When a task that changed code is otherwise done, run the `Verify` command from `BACKBONE.md` Commands once, at the end, never between edits. Fix failures and rerun; do not report done until it passes. Skip if only docs/specs changed. Inside `/spec-apply` the task DoD replaces this. No `Verify` line filled in → use the stack defaults below.
Stack defaults:
- **Node/TS/NestJS:** `npm run lint:fix && npm run typecheck`
- **Go Backend:** `go vet ./... && go test -race ./...`
- **Solidity (SMC):** `forge test -vvv` hoặc `npx hardhat test`
- Core standards: `.claude/rules/general.md` & `.claude/rules/security-critical.md`

## 4. 📚 On-Demand Skills Index (Load ONLY When Tech Is Used)
- **Backend Concurrency & Locking:** `.claude/skills/backend-concurrency/SKILL.md`
- **NestJS Enterprise:** `.claude/skills/nestjs-guide/SKILL.md`
- **Golang Backend:** `.claude/skills/golang-guide/SKILL.md`
- **Solidity (Smart Contracts):** `.claude/skills/solidity-guide/SKILL.md`
- **Next.js:** `.claude/skills/nextjs-guide/SKILL.md`
- **React:** `.claude/skills/react-guide/SKILL.md`
- **Python:** `.claude/skills/python-guide/SKILL.md`
- **Security (OWASP):** `.claude/skills/security-guide/SKILL.md`
- **Vite:** `.claude/skills/vite-guide/SKILL.md`
- **MCP Mastery:** `.claude/skills/mcp-mastery/SKILL.md`
- **Tool Selection:** `.claude/skills/tool-selection/SKILL.md`
- **Debug Optimizer:** `.claude/skills/debug-optimizer/SKILL.md`
- **Parallel Exploration:** `.claude/skills/parallel-exploration/SKILL.md`
- **Learning Loop:** `.claude/skills/learning-loop/SKILL.md`

## 5. 🔌 Tool & MCP Strategy
- Auto Tool Selection: `.claude/rules/tool-auto-selection.md`
- Tool Strategy: `.claude/rules/tool-strategy.md`
- MCP Auto-Usage: `.claude/rules/mcp-auto-use.md`
- MCP Integration Guide: `.claude/docs/MCP-INTEGRATION-GUIDE.md`
