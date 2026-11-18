---
name: writing-plans
description: Use after the spec is approved and before any code, to write plan.md (milestones and component-level tasks that point at the spec) and an empty progress.md, readable in 2-3 minutes.
---

# Writing Plans

Cut the approved spec into milestones an experienced engineer can execute. The plan states intent: what changes, in which component, in what order, and how
each step is proven. The how belongs to the implementer.

Follow `../specification/references/writing.md`.

<HARD-GATE>
Keep implementation out of the plan: tests, function bodies, whole files, commit text and shell commands are written later, by the implementer. If it takes longer than 2–3
minutes to read, it is doing the implementer's job and will be out of date by the second milestone. Remove the detail.
</HARD-GATE>

Started by specification after approval. The plan never repeats the spec: each milestone points at the spec sections it needs, and execution reads only those.

## When to skip

No approved spec: go back to **specification**. A bug fix or trivial change has no plan.

## Before writing

1. Is the spec one coherent feature? If it covers independent systems, return it to brainstorming to split. A large feature is not a reason to split; it gets
   more milestones.
2. Use what brainstorming and specification already read in this session. Read again only what changed or was never read.
3. Verify in the code, right now, each fact the milestone order relies on (an existing caller, a shared type, test coverage of a path). If you cannot verify
   one, raise it with the user before approval instead of leaving "verify X" for the implementer. Undo any probe.

## plan.md

Save to `spec/changes/<change-name>/plan.md`.

````markdown
# <change-name> — plan

Spec: spec/changes/<change-name>/spec/spec.md

## Goal
One sentence: what this builds.

## Components
- <Component> — responsibility, interface, depends on ...
A few sentences each. Describe the boundary, not the code.

## Milestones
### M1: <vertical slice, short>
Read: spec.md#requirements (<capability>), data-model.md#<heading>
Covers: <capability>/AC-1, AC-2
- M1.1 <task: what changes in which component>
- M1.2 <task>
Done when: <observable result>
Verified by: <capability>/AC-1, AC-2; Verify command from BACKBONE.md

### M2: ...

## Extra checks
<only checks the spec's ACs do not cover, e.g. a migration or a regression, each with its reason; omit if none>

## Assumptions
- <premise the order depends on, checked in the code, stated as fact>

## Open questions
- <question> — blocks <milestone>, answered by <who>
````

- Each milestone is a vertical slice with a visible result: small enough for one clean commit, large enough to be more than one edit. In a new project, M1
  includes the test runner and one passing behaviour test.
- Task IDs (`M1.1`) never change; progress.md refers to them.
- A task names the component and the outcome: "PaymentRepository: idempotent insert by provider event ID", not "add a unique index in line 40".
- Every AC of the spec is in exactly one milestone's *Covers*. *Read* lists every spec section that milestone's tasks need.
- No code blocks, except a short interface sketch when words are clearly worse.

## progress.md

Create it next to the plan. executing-plans owns it from then on. It holds only what the plan does not: where execution is, what was proven, what blocks it,
what was learned. It refers to milestones and tasks by ID and never copies their text.

````markdown
# Progress: <change-name>

Base: <commit> | Current: M1 | Status: not started

## Milestones
- [ ] M1
- [ ] M2

## Done
<!-- task IDs, and the commit that closed each milestone -->

## Verification
<!-- per milestone: command → result -->

## Blockers
None.

## Findings
<!-- what the code revealed that the plan or spec did not say; spec updates made -->
````

## Check before review

1. Any code block over about 5 lines? Replace it with a sentence.
2. Readable in 2–3 minutes?
3. Every AC covered once? Every component built somewhere? Every *Read* line complete?
4. Every milestone a real slice with a visible result, not "scaffolding" that cannot be tested alone?
5. Every assumption checked in the code, none left as "check whether"?
6. Any requirement, AC text or contract copied from the spec? Replace it with a link.

## Approval

Do not commit; `/spec-execute` commits the spec and plan when it creates the branch. Then ask:

> "Plan written in `spec/changes/<change-name>/plan.md`. Please review it; tell me what to change before we start."

Wait for an explicit yes, then invoke **executing-plans**.

## Red flags

| Thought                                         | Answer                                                        |
|-------------------------------------------------|---------------------------------------------------------------|
| "I'll add the test code to save time later"     | The implementer writes it with the code in front of them.     |
| "More detail is safer"                          | More detail is slower to review and wrong sooner.             |
| "The implementer can confirm X"                 | Confirm it yourself now; otherwise the plan approves a guess. |
