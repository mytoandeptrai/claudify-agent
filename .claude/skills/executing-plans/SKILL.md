---
name: executing-plans
description: Use with an approved plan.md in spec/changes/<change-name>/, to build one milestone per run in the main session, reading only the spec sections that milestone names and updating progress.md.
---

# Executing Plans

Build the plan one milestone at a time, in the main session. No subagents while building.

<HARD-GATE>
A milestone counts as done only when, in this run, every AC in its *Covers* has a passing test that carries the AC ID and the BACKBONE Verify command is
green. Tick nothing in progress.md without that evidence. If a milestone cannot go green, record the blocker and stop; do not start the next one.
</HARD-GATE>

## When to skip

No plan.md: use **brainstorming**, or **debugging** for a bug. Trivial changes need no plan.

## Load only what this milestone needs

1. Read `spec/changes/<change-name>/progress.md`: current milestone, done tasks, blockers, findings. If Status is `blocked`, take the blocker to the user first.
2. Read `plan.md` once: Goal, Components, Assumptions, and the current milestone in full. Other milestones by title only.
3. Read the spec sections in the milestone's *Read* line and nothing else of the spec. `BACKBONE.md` is already loaded; its Invariants apply.
4. Branch: read the `Branch:` field of `spec.md`. If the branch exists, check it out and continue. If not (first run), create it from its base, commit the
   change folder (discussion, spec, plan, progress) as `docs(<change-name>): spec and plan`, write `Base: <that commit's parent>` in progress.md and set
   Status `in progress`. Never push: pushing happens only after `/spec-verify` passes.
5. Question the milestone before coding: a task with no AC, an AC you cannot test, an assumption the code contradicts. Ask; do not pick a meaning and build on
   it.

**Read more when needed; never guess.** If a task touches something the listed sections do not cover (a dependency, a contract, a rule), open the spec section
or code that owns it, and add a finding saying the *Read* line missed it. Never fill a gap in the spec with your own judgement: a business rule without a source
is a question for the user.

Within one session, do not re-read what is already loaded. In a new session, progress.md and the *Read* line bring you back; the full spec does not.

## One run = one milestone

`/spec-execute` completes the current milestone, then stops and reports. A milestone is the smallest piece with its own commit and visible result. Running one
task per call reloads the same context for every task; running the whole plan at once skips the user's review between slices. Continue to the next milestone
in the same run only when the user asked for more than one.

## Code defaults

The smallest code that passes, placed where the spec puts it: each rule in the component that owns it, one level of abstraction per function, conversions in
adapters, no abstraction before there is a second user. Step 6 checks the diff against the same standard.

## The milestone loop

1. **Tests first.** With **bdd-testing**, write one test per AC in *Covers*, named with the full AC ID (`refund/AC-2: expired QR is refunded`). Test
   behaviour, not structure.
2. **See them fail.** The failure must come from the missing behaviour; a syntax slip or bad import does not count. A test that passes at once is testing something
   that already exists; rewrite it.
3. **Make them pass** with the smallest code, in the component the plan names, using the glossary terms. Nothing extra.
4. **Run** the milestone tests, nearby tests, and the Verify command. Keep output short: failures and the summary line. Fix and rerun; after five failed
   attempts on the same failure, stop and record it as a blocker.
5. **Self-check** the milestone diff only:
   - Is the *Done when* met, with every *Verified by* item green?
   - Could this break a test elsewhere?
   - Anything unexpected: a helper you found, a hidden coupling, a sharp edge?

   Fix problems now. If the code must differ from the spec: a changed decision (approach, a contract others use, a consequence, a requirement) halts the
   milestone and returns to brainstorming; a smaller difference becomes a finding, and the spec section is corrected in the same commit so the spec stays
   true. Notes for later go to Findings. A new function whose callers in this milestone were not switched over is unfinished work, not a finding.
6. **Structure check.** Read `references/structure-checklist.md` once per session and review the milestone diff against it yourself. At most six findings; a
   design problem goes to the circuit-breaker below.
7. **Clean up** what you touched: apply the structure findings, then leave the code around your change better than before (the same file, neighbouring
   functions, helpers you called, direct callers, anything your change exposed). Allowed: rename, extract, remove duplication or dead code, simplify a
   condition, split a long function you edited, move a responsibility to its owner. Not allowed: cleaning code you did not touch, or changing a contract other
   code relies on; that needs the user. A bug in touched code is fixed now, with a test, and mentioned in the commit; a bug outside your change goes to Findings. "Nothing worth
   changing" is a valid result; "too much for now" is not.
8. **Run again**: tests and Verify. The cleanup must not change behaviour. Apply **verification** before you call the milestone done.
9. **Commit once** for the milestone: tests, code, cleanup and any spec correction together. Conventional Commits, subject describes the result, not the
   milestone title: `feat(<change-name>): reject refunds after the settlement window`. The body says why and lists the AC IDs covered.
10. **Update progress.md and stop.** Tick the milestone, list its task IDs and the commit SHA under Done, record the verification commands and results, add
    findings and blockers, set *Current* to the next milestone. Commit it with the milestone or right after. Report in 2–3 lines: what is done, the proof,
    the next milestone.

## Circuit-breaker: when the design is wrong

The loop assumes the design is right. Sometimes that proves false halfway through, and the habits above (fix in place, clean up, note it for later) quietly
turn into patching around a bad design. Warning signs:

- You add code whose only purpose is to force the design to behave: a guard, a conversion, a special case. The second one is the alarm.
- The same interface or contract has been changed two or three times.
- Every new milestone needs extra support code just to keep the earlier ones working.

Taken together, these point to a flawed design rather than a difficult milestone. Stop patching. Set Status `blocked` in progress.md with what you learned and reopen
brainstorming for the affected part. Waiting for the final review is too late.

## Findings

Findings are kept in progress.md, per milestone: **Changes** from the plan, **Gotchas** for later milestones, **Open questions**. They carry knowledge between
sessions and feed the final review. Write only what the code taught you; never paste tool output or copy the plan.

## After the last milestone

Set Status `implemented` and suggest `/spec-verify <change-name>`. Do not start finishing-branch from here.

## Red flags

| Thought                                            | Answer                                                                       |
|----------------------------------------------------|------------------------------------------------------------------------------|
| "This case is obvious, no test needed"             | Then the test is quick. Write it.                                            |
| "I'll read the whole spec to be safe"              | Read what the milestone names, then what the code shows you need. Ask the rest. |
| "It was already like this"                         | If you touched it, it is yours. Findings are for code you did not touch.     |
| "One more guard and it will work"                  | Stacked guards hide a flawed design. At the second, halt and report.        |
