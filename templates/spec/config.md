# Spec Config

> Project conventions for specs, plans and tests, read by the specification, writing-plans and bdd-testing skills. The method and the folder layout live
> in the skills; project context, invariants and commands live in `BACKBONE.md`. Edit this file to fit the project; delete a line that does not apply.

## Capabilities
<!-- The names used as <capability> in AC IDs, one line each, e.g. `payment`, `refund`. -->

## Spec depth
- Required topic files: <e.g. a database change always has `data-model.md`; an API change always has `api-contracts.md`>.

## Acceptance criteria
- Test naming: <e.g. `describe("<capability>/AC-<n>: ...")`; Go: `// <capability>/AC-<n>` comment>. The full ID `<capability>/AC-<n>` must appear in
  the test file, or `spec-check.mjs` reports the AC as untested.
- Required failure cases: <e.g. every money flow has an AC for a provider timeout>.

## Plan
- Milestone limits: <e.g. at most 5 milestones per change; each milestone fits in one day>.

## Review
- Who approves specs and plans: <e.g. the change author's lead>.
