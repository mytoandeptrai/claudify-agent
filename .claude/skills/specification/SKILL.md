---
name: specification
description: Use once brainstorming has an approved design, to write the change's spec under spec/changes/<change-name>/spec/ with testable acceptance criteria, as deep as the work requires.
---

# Specification

Turn the approved design into the change's spec: the source of truth for how the system behaves after the change. Plan and code follow the spec.

Follow `references/writing.md`. Apply the project conventions in `spec/config.md` without repeating them.

<HARD-GATE>
Write only what the user approved or what the repo already states. Anything else is looked up or asked, never written as an assumption. A business rule
(money, limits, fees, refunds, permissions, state transitions, legal) with no source is a question for the user, never a "sensible default".
</HARD-GATE>

Started by brainstorming. If the user brings an approved design of their own, start here and treat it as the conversation.

## When to skip

A bug that breaks behaviour an existing AC already describes: go to **debugging**, no spec. A trivial change: no spec.

## Depth comes from the work

No word limit. The test is: an engineer who knows the codebase can build it without guessing anything that would change the result. Each fact appears once,
in the file that owns it. Existing code is linked, not described again.

| Work                       | Files in `spec/changes/<change-name>/spec/`                                   |
|----------------------------|-------------------------------------------------------------------------------|
| Small feature              | `spec.md`                                                                     |
| Medium feature             | `spec.md` with a `## Design` section                                          |
| Complex feature            | `spec.md` plus topic files that have real content                             |
| Large architectural change | as complex, plus `architecture.md` with target state and migration path       |

Possible topic files: `architecture.md`, `domain-model.md`, `data-model.md`, `api-contracts.md`, `business-rules.md`, `error-handling.md`, `security.md`,
`edge-cases.md`. Create one only when it has something to say; two lines belong in `spec.md`.

Do not split a feature into several changes to keep files short. Every extra change runs the whole spec → plan → apply → finish cycle again. Only
independent sub-projects, already separated in brainstorming, become separate changes.

## spec.md

`spec.md` is the entry point and the only place requirements and ACs live. Topic files carry design detail and refer to AC IDs; they never repeat a
requirement.

````markdown
# <change-name>
Status: draft | Depends on: <change or none> | Branch: feature/<change-name>

## Why
## Scope
- In: ...
- Out (non-goals): ...

## Requirements
<!-- One block per capability touched; the name matches spec/specs/<capability>/spec.md -->
### <capability> (new | modified)
#### ADDED Requirement: <name>
<statement using SHALL/MUST>
- AC-1 <name>: GIVEN ... WHEN ... THEN ...
- AC-2 <name>: GIVEN ... WHEN ... THEN ...
#### MODIFIED Requirement: <existing name>
<complete new text and its ACs, not a diff>
#### REMOVED Requirement: <existing name>
<reason>

## Non-functional requirements
<performance, availability, limits, with numbers; omit if none>

## Design
<decisions the code does not make obvious; or a one-line index of the topic files>

## Risks
## Open questions
````

## Acceptance criteria

- One AC = one observable behaviour in GIVEN / WHEN / THEN with concrete values. Every requirement has at least one success and one failure AC.
- IDs are per capability and never reused. New ACs continue after the highest `AC-<n>` in `spec/specs/<capability>/spec.md`; a MODIFIED requirement keeps
  its IDs. The full ID `<capability>/AC-<n>` appears in test names, and `node .claude/scripts/spec-check.mjs` checks it.
- An edge case that changes behaviour is an AC, not a remark.

## Topic files

- Headings are meaningful and stable: the plan links `spec/<file>.md#<heading>`, and the implementer reads only that section.
- Use the BACKBONE glossary terms. Add a new domain term to the glossary in the same step.
- Diagram when three or more parts or steps interact: `../brainstorming/references/diagrams.md`.
- Contracts (API, events, schemas) are exact: names, types, status codes, error bodies. How the code achieves them is not part of the spec.

## Check before review

1. No "TBD", "TODO" or half-written section.
2. No fact in two files; keep it in its owner and link from the other.
3. Every requirement has testable ACs, failures included.
4. No requirement can be read two ways.

Then do the builder check in `references/builder-check.md`. Answer what is already known, settle small points yourself, and bring the user's decisions to them
in one message, most important first.

## Approval

Add the change as one line under "Open changes" in `BACKBONE.md`. Commit the spec on the feature branch, then ask:

> "Spec committed in `spec/changes/<change-name>/spec/`. Please review it; tell me what to change before we write the plan."

Wait for an explicit yes. Then set `Status: approved` and invoke **writing-plans**. From here the spec is frozen; a changed decision goes back to
**brainstorming**.
