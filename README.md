<p align="center">
  <h1 align="center">⚡ claudify-agent</h1>
  <p align="center">
    <strong>Spec-driven workflow for Claude Code: full-depth specs, disciplined milestone execution, behaviour you can verify, context loaded only when needed.</strong>
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/claudify-agent"><img src="https://img.shields.io/npm/v/claudify-agent.svg" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/claudify-agent"><img src="https://img.shields.io/npm/dm/claudify-agent.svg" alt="NPM Downloads" /></a>
    <a href="https://github.com/mytoandeptrai/claudify-agent/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  </p>
  <p align="center">
    English | <a href="README.vi.md">Tiếng Việt</a>
  </p>
</p>

---

## 💡 Overview

Claudify v2 combines three things:

- **SDD** — the specification is the source of truth for what the system must do.
- **BDD** — acceptance criteria are GIVEN / WHEN / THEN, and every one is proven by a test that names its ID.
- **Engineering workflow** — brainstorming, writing plans, executing plans milestone by milestone, verification, finishing a branch.

Design choices that keep the token cost down without thinning the spec:

- **Small always-loaded context.** Only `CLAUDE.md`, `BACKBONE.md` and one short `.claude/rules/core.md` load every session. Skills load when invoked.
- **One feature, one change.** No word cap on specs. A big feature gets more milestones, not more changes, so the spec → plan → apply → finish cycle runs once.
- **Milestone execution in the main session.** Each `/spec-apply` reads `progress.md`, the current milestone, and only the spec sections that milestone names.
- **One subagent in the whole workflow:** the end-of-feature reviewer in `/spec-verify`.

## 📦 Quick Start

```bash
npx claudify-agent@latest init
```

This installs:

- `CLAUDE.md` — the workflow routing table. An existing `CLAUDE.md` keeps its content; claudify manages only the block between `<!-- claudify:start -->` and
  `<!-- claudify:end -->`.
- `BACKBONE.md` — the project map (structure, glossary, docs index, capabilities, open changes, Verify command, invariants), loaded every session.
- `spec/config.md` — the project's spec conventions.
- `.claude/commands/` — the slash commands below, one line each.
- `.claude/skills/` — the 8 workflow skills.
- `.claude/rules/core.md` — the constraints of every task.
- `.claude/scripts/spec-check.mjs` — AC ↔ test traceability check.

Then run `/backbone-init` in Claude Code to fill `BACKBONE.md`.

### Upgrading from v1

v1 shipped rules, hooks and stack skills that v2 drops. Remove them, then install again:

```bash
npx claudify-agent@latest uninstall   # removes v1 and v2 files, keeps BACKBONE.md and spec/
npx claudify-agent@latest init
```

`init` keeps your existing `spec/config.md`; compare it with `templates/spec/config.md`. v1 changes were single files (`spec/changes/<name>.md`) and canonical
specs were `spec/specs/<capability>.md`; v2 uses `spec/changes/<name>/spec/spec.md` and `spec/specs/<capability>/spec.md`. Finish open v1 changes before you
upgrade, or move them by hand.

### Uninstall

```bash
npx claudify-agent uninstall          # keeps BACKBONE.md and spec/
npx claudify-agent uninstall --all    # also removes BACKBONE.md and spec/
```

It deletes only the files claudify installed (v1 and v2), the claudify block in `CLAUDE.md` and v1's hook entries in `.claude/settings.json`. Add `--yes` to
skip the prompt.

## 🔁 Workflow

```
/spec-brainstorm → /spec-new → /spec-plan → /spec-apply (per milestone) → /spec-verify → /spec-finish
```

| Command                  | Skill            | Does                                                                                     |
|--------------------------|------------------|------------------------------------------------------------------------------------------|
| `/spec-brainstorm <idea>` | brainstorming    | Asks one question per message, compares 2–3 options, ends with an approved design; on request saves it to `spec/discussions/`. |
| `/spec-new <change>`     | specification    | Creates `feature/<change>` and `spec/changes/<change>/` (moves the saved discussion in), writes `spec/`: `spec.md` with requirements and ACs, topic files when the work needs them. |
| `/spec-plan <change>`    | writing-plans    | Writes `plan.md` (milestones, tasks, the AC IDs and spec sections each one needs) and `progress.md`. |
| `/spec-apply <change>`   | executing-plans  | One milestone: tests first, code, Verify, self-review, one commit, progress.md updated.  |
| `/spec-status [change]`  | —                | Reads progress.md and reports where the change stands.                                    |
| `/spec-verify <change>`  | verification     | spec-check, full Verify, AC walk-through, one reviewer subagent. Status → `verified`.    |
| `/spec-finish <change>`  | finishing-branch | Syncs requirements into `spec/specs/`, archives the change, merge / PR / keep / discard. |
| `/debug <symptom>`       | debugging        | Root cause with evidence, red-first regression test, fix.                                |
| `/backbone-init`, `/backbone-sync` | —      | Create or refresh `BACKBONE.md`.                                                         |

Skills also trigger on their own when the work matches (see the table in `CLAUDE.md`). Bugs and trivial changes skip the spec.

### Layout

```
spec/
├── config.md                      project spec conventions
├── discussions/<date>-<topic>.md  saved brainstorms not yet a change (only when you ask to save)
├── specs/<capability>/spec.md     accepted requirements + ACs: the current truth
├── changes/<change>/
│   ├── discussion.md              the saved brainstorm, moved in by /spec-new (if any)
│   ├── spec/spec.md               requirements + ACs (the only owner), Why, Scope, Design
│   ├── spec/<topic>.md            data-model, api-contracts, business-rules, ... only when they have content
│   ├── plan.md                    milestones and tasks: intent, not code; points at spec sections
│   └── progress.md                execution state: current milestone, done, verification, blockers, findings
└── archive/YYYY-MM-DD-<change>/   finished changes
```

**Spec, plan, progress.** The spec says *what* the system must do and owns every AC. The plan says *how the work is cut*: milestones, component-level tasks,
which ACs and spec sections each milestone needs. Progress says *where execution stands*, by milestone and task ID, without copying the plan. Each fact has
one owner, so nothing drifts and nothing is read twice.

### Traceability (spec ↔ test)

ACs have IDs `<capability>/AC-<n>`. Tests name them: `describe("refund/AC-2: expired QR is refunded", ...)`, or `// refund/AC-2` in Go.

```bash
node .claude/scripts/spec-check.mjs spec/changes/add-refund   # one change
node .claude/scripts/spec-check.mjs                           # all canonical specs
```

## 📄 License

MIT © [jacob-tech](https://github.com/mytoandeptrai)
