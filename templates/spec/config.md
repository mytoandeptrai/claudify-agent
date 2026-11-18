# Spec Config

> Project conventions for specs, read by the specification and writing-plans skills. The method lives in the skills; project context, invariants and
> commands live in `BACKBONE.md`. Edit this file to fit the project; delete a line that does not apply.

## Layout
- Canonical specs: `spec/specs/<capability>/spec.md` — requirements and ACs only, the current truth.
- Saved brainstorm (optional, on request): `spec/discussions/YYYY-MM-DD-<topic>.md`, moved into the change by `/spec-new`.
- Open change: `spec/changes/<change-name>/` with `discussion.md` (if saved), `spec/` (spec.md + topic files), `plan.md`, `progress.md`.
- Finished change: `spec/archive/YYYY-MM-DD-<change-name>/`.

## Capabilities
<!-- The names used as <capability> in AC IDs, one line each, e.g. `payment`, `refund`. -->

## Acceptance criteria
- Test naming: <e.g. `describe("<capability>/AC-<n>: ...")`; Go: `// <capability>/AC-<n>` comment>.
- Required failure cases: <e.g. every money flow has an AC for a provider timeout>.

## Review
- Who approves specs and plans: <e.g. the change author's lead>.
