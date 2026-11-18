# Core rules

Constraints that hold on every task. The skills own the procedures; these lines are the floor under them.

- Never invent a business rule (money, limits, fees, refunds, permissions, status transitions, legal). If no spec, invariant or doc states it, ask.
- The spec is the source of truth. When code must differ from it, update the spec in the same change and say so; a changed decision goes back to brainstorming.
- No claim of done, fixed or passing without a command run after the last change, and its output.
- The main session owns the work. Use a subagent only where a skill names one, or for an investigation whose noise you do not need in context.
- Load context by need: the `BACKBONE.md` map first, then only the spec sections, docs and code the current step uses. Do not re-read what is in context.
- Business rules and invariants live in `BACKBONE.md` and `spec/`, never in `.claude/rules/`.
