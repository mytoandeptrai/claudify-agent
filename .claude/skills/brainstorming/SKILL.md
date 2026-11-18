---
name: brainstorming
description: Use before building a feature, a component or any behaviour change, to agree a design with the user through questions and 2-3 options before a spec or code exists.
---

# Brainstorming

Reach a design the user has approved, through a conversation: understand the request, ask, compare options, settle each part. Then hand over to
**specification**, which writes it down.

<HARD-GATE>
No spec, no code, no scaffolding until the user has approved a design. Small work gets a small design, a few sentences is fine, but it still gets approved:
the unexamined assumption in a "simple" change is the one that costs a day.
</HARD-GATE>

## When to skip

Typos, renames, a changed constant: just do them. A bug goes to **debugging**. Anything else that changes behaviour comes here.

## Steps

1. Study the context (next section).
2. Ask questions one at a time about goal, constraints and what success looks like.
3. Offer 2–3 approaches with trade-offs and a recommendation. The user chooses.
4. Create the branch `feature/<change-name>` from the base branch. Spec, plan and code are committed there.
5. Present the design part by part; get a yes on each part before the next.
6. Invoke **specification**, and nothing else.

## Study before asking

`BACKBONE.md` is already loaded. Read until you can explain how the affected area works now and what the change will touch:

- the code, callers and data the request mentions;
- `spec/specs/<capability>/spec.md` for each capability involved: the behaviour accepted today;
- only the doc sections the BACKBONE Docs index points to for this area;
- `spec/changes/`, to avoid a clash with a change in progress;
- recent commits, for earlier attempts.

Never ask what the repo can answer. Everything read here stays in the session for the spec and the plan; do not read it twice.

## Asking

- If the request is really several independent systems, say so first and agree how to split it. Each part becomes its own change. Do not refine a request that
  must be split.
- One question per message. Multiple choice when possible.
- Ask about purpose and limits, not about implementation detail.
- A business rule (money, limits, fees, refunds, permissions, state transitions, legal) is never assumed. No source in a spec, invariant or doc means you ask.

## Options

- 2–3 genuinely different approaches, recommendation first with its reason. Talk them through; skip the comparison matrix.
- **Check how each option fails.** If an option relies on something unreliable for a structural guarantee (an LLM, a heuristic), ask how it breaks under real
  load and what the deterministic alternative is. If keeping it correct would need patch after patch, choose the deterministic structure and keep the
  unreliable part for filling content into a fixed shape.

Then size the work. Size sets the depth of the spec, never the number of changes: one feature is one change.

| Work                         | Design                                   |
|------------------------------|------------------------------------------|
| Small change                 | a short summary of what was agreed       |
| Feature                      | the full design below                    |
| Several independent projects | agree the order, then one at a time      |

## Presenting the design

- Present it in parts. Each part is as long as it needs: one sentence for the obvious, more for the subtle.
- After each part, ask whether it is right so far. Go back when something does not fit.
- Cover architecture, components, data flow, error handling and how it will be tested.
- Add a diagram once at least three components or ordered steps are involved; read `references/diagrams.md` first. One sequence diagram of one case replaces a prose
  walk-through.

## Design principles

- Split into units with one purpose and a clear interface, each testable alone. For each: what it does, how it is called, what it needs.
- If using a unit requires knowing its internals, the boundary is in the wrong place.
- Leave out everything the goal does not need.
- In existing code, follow its patterns. Fix structural problems that block this work as part of the design; leave unrelated cleanup alone.

## After approval

Once **specification** has written the design, it is frozen.

- Changing the chosen approach, a contract other code depends on, or a consequence, comes back here for a new approval.
- Smaller deviations are recorded as findings and reach the PR description; the final review lists every difference.
- When executing-plans sends work back here, rework only the affected part, on the same branch, update the spec, and get it approved again.
