---
description: Draft a lightweight spec for a new feature (single file, ~800 words)
argument-hint: <change-name> <what the feature should do>
---

Create a spec change for: $ARGUMENTS

1. `BACKBONE.md` is already in context. Read `spec/config.md`, then only the `spec/specs/*.md` capabilities this feature touches and only the doc sections from the Docs index it needs.
2. Ask me (one batched question) anything that changes scope. Do not guess scope.
3. Write `spec/changes/<change-name>.md` with exactly these sections, following the rules in `spec/config.md`:

```markdown
# <change-name>
Status: draft | Depends on: <change or none>

## Why
## Scope
- In: ...
- Out (non-goals): ...
## Requirements
<!-- One block per affected capability, named like spec/specs/<capability>.md -->
### <capability> (new | modified)
#### ADDED Requirement: <name>
<statement with SHALL/MUST>
- AC-1 <name>: GIVEN ... WHEN ... THEN ...
- AC-2 <name>: GIVEN ... WHEN ... THEN ...
#### MODIFIED Requirement: <existing name>
<full new text and its ACs, not just the diff>
#### REMOVED Requirement: <existing name>
<reason>
## Design
<only decisions not obvious from the code: data flow, schema, API, edge cases. Omit section if trivial.>
## Risks
## Tasks
- [ ] 1. <task> — files: ... — covers: <capability>/AC-1, AC-2 — DoD: ...
```

4. AC IDs: numbered per capability and never reused. New ACs continue after the highest `AC-<n>` in `spec/specs/<capability>.md`; a MODIFIED requirement keeps its existing AC IDs. The full ID is `<capability>/AC-<n>`.
5. Use the terms from the Domain glossary in `BACKBONE.md`. A new domain term → add it to the glossary in the same step.
6. Keep the whole file under ~800 words, plus ~300 per extra capability. No restating config, docs or code; link them.
   If it still does not fit (e.g. more than 4 capabilities), propose splitting into smaller changes with `Depends on:` instead of one giant spec.
7. Add the change as one line under "Open changes" in `BACKBONE.md`.
8. Do not write code. Finish by showing the task list and asking me to approve before `/spec-apply`.
