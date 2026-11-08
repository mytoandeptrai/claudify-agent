# Spec Config

> Rules for writing spec changes, read by `/spec-new` only. Project context, invariants and commands live in `BACKBONE.md`.

## Proposal
- Must have Why, Scope (in / out = Non-goals), Depends on, Risks.
- Reference docs by section instead of copying them.

## Requirements
- `#### ADDED|MODIFIED|REMOVED Requirement: <name>` containing SHALL or MUST.
- Each has scenarios GIVEN / WHEN / THEN with concrete values: at least one happy path and one failure.

## Tasks
- Each task fits in 2-4 hours, lists files/packages touched and its DoD.
- Tests ship with the task that adds the logic, not at the end.
- DoD default: the Verify command in `BACKBONE.md`.
