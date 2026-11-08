# Spec Config

> Read by `/spec-new` and `/spec-apply` only. Keep it short: every line here is paid for on each spec command.

## Context
- Project: <one or two lines: what the system does>
- Stack: <languages, frameworks>
- Sources of truth (read before writing a change): <design docs, ADRs>. If a change contradicts them, stop and say so.

## Invariants
<!-- Rules every change MUST respect. One line each. -->
- <e.g. money amounts are integers in base units, never floats>

## Style
- Language: <e.g. Vietnamese prose, English technical terms and spec keywords>
- Concise: bullets, tables, short snippets. Reference docs by section instead of copying them.

## Rules
### Proposal
- Must have Why, Scope (in / out = Non-goals), Depends on, Affected capabilities, Risks.
### Requirements
- `### Requirement: <name>` containing SHALL or MUST.
- Each has `#### Scenario:` GIVEN / WHEN / THEN with concrete values: at least one happy path and one failure.
### Tasks
- Each task fits in 2-4 hours, lists files/packages touched and its DoD.
- Tests ship with the task that adds the logic, not at the end.
- DoD default: <e.g. `npm run lint && npm run typecheck && npm test`>
