# Claudify workflow

## Project backbone
@BACKBONE.md

If it still holds `<placeholders>`, suggest `/backbone-init`. Follow its Invariants on every task. After work done without a spec that changes structure, docs,
commands or capabilities, suggest `/backbone-sync`. The constraints of every task are in `.claude/rules/core.md`.

## Routing

Load the matching skill with the `Skill` tool first, then work; a skill decides the method, so calling it halfway through is too late. Explicit user
instructions beat a skill, and a skill beats your defaults.

| Situation                                                 | Command            | Skill                          |
|-----------------------------------------------------------|--------------------|--------------------------------|
| New feature, component or behaviour change                | `/spec-brainstorm` | **brainstorming**              |
| Design approved, spec not written                         | `/spec-new`        | **specification**              |
| Spec approved, no plan yet                                | `/spec-plan`       | **writing-plans**              |
| Plan exists: build or resume the next milestone           | `/spec-apply`      | **executing-plans**            |
| Status of a change                                        | `/spec-status`     | (reads progress.md)            |
| Every milestone ticked: verify the change as a whole      | `/spec-verify`     | **verification**               |
| Verified change: archive, then merge or PR                | `/spec-finish`     | **finishing-branch**           |
| A bug or an unexplained failure                           | `/debug`           | **debugging**                  |
| Before reporting done, fixed or passing                   |                    | **verification**               |
| Tests written or edited with no skill running             |                    | **bdd-testing**                |

Order is fixed: an approved design before the spec, an approved plan before code. If the user arrives with an approved design or plan, start at the matching
step. One feature is one change in `spec/changes/<change-name>/` (`spec/`, `plan.md`, `progress.md`), whatever its size; size changes the depth of the spec and the
number of milestones, never the number of changes.

## No skill needed

Questions, reading or searching the code, and one-line changes you can prove with one command: answer or do them directly. Inside a skill, follow what that
skill calls. Use a skill when it plainly fits, not whenever it might. When a code task without a skill is done, run the `Verify` command from `BACKBONE.md` once
at the end.
