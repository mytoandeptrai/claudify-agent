---
name: verification
description: Use before saying work is done, fixed or passing, before a commit or PR, and to verify a whole change before finishing, so every claim rests on a command run after the last change.
---

# Verification

**No status claim (done, fixed, passing, works) without proof.** Pick the command whose output would prove it, execute it after the latest edit, read all of the
output, and only then report. A claim without evidence is read as evidence, and everything built on it inherits the error.

## The check

1. **Which command proves the claim?**
2. **Run it** now, completely. An earlier run counts only if nothing changed since.
3. **Read** the exit status and how many failed, not only the final line.
4. **Report** the result as shown. When it disagrees with what you expected, report the actual state.

Do this before every commit, push or PR, at the end of each milestone, and before you return control.

## What proves what

| Statement                | Proof                                          | Not proof                         |
|--------------------------|------------------------------------------------|-----------------------------------|
| Tests pass               | test run with 0 failures                       | an earlier run, "should pass"     |
| Lint is clean            | linter output with 0 errors                    | a partial run                     |
| It builds                | build command exits 0                          | lint passing                      |
| Bug is fixed             | a test of the original symptom passes          | "the code was changed"            |
| Regression test is real  | it failed without the fix and passes with it   | it passes once                    |
| Requirements are met     | each AC checked against its test               | the suite is green                |
| Every AC has a test      | `spec-check.mjs` reports 0 missing             | "tests exist"                     |
| Structure is sound       | the BACKBONE Verify command passes             | tests pass                        |
| A subagent did the work  | the diff shows it                              | the subagent says so              |

## Cost

Proof is run once per state of the code, not once per message. Rerun only when code changed since the last run. Keep output short: the summary line and the
failures, not the full log.

## Whole-change verification (`/spec-verify <change-name>`)

Each milestone was already proven. Before finishing, prove the change as a whole, once:

1. progress.md: all milestones ticked, Status `implemented`, no open blocker. Otherwise list what is open and stop.
2. `node .claude/scripts/spec-check.mjs spec/changes/<change-name>`: every AC has a test. For a missing one, add the test, or get the user's written acceptance
   of the gap.
3. The full Verify command and the full test suite, run now.
4. Walk every AC in `spec.md` against the test that carries its ID.
5. One independent review: send `references/reviewer-prompt.md`, filled with the change name and the Base from progress.md, to ONE fresh general-purpose
   subagent. It is the only subagent in the workflow, because a reader without the author's context catches what the author cannot. Fix Critical, Important
   and Minor issues as one more pass of the milestone loop; record Followup items in Findings. One review, no second round.
6. Write the results under Verification in progress.md, set Status `verified`, and suggest `/spec-ship <change-name>`.

## Two examples

- **Tests:** run → `34/34 passed` → "All 34 tests pass." Not: "They should pass now."
- **Regression test:** write it → passes with the fix → remove the fix → it **must fail** → restore → passes. Not: "I added a regression test."

## Excuses

| Excuse                              | Answer                                         |
|-------------------------------------|------------------------------------------------|
| "I'm confident it works"            | Confidence is not output. Run it.              |
| "The linter passed"                 | Lint, build and tests prove different things.  |
| "Checking part of it is enough"     | Unchecked parts stay unknown.                  |
| "Skip it this time"                 | The skipped time is the one that fails.        |
