---
name: debugging
description: Use for a bug, an unexpected failure or a broken test outside a running milestone, to prove the root cause before changing code and lock the fix with a regression test that fails first.
---

# Debugging

Find the cause before you fix anything. Unless the bug is a typo, first make it happen on demand, then name its cause with evidence, and only then edit code.

## When to skip

- **Obvious slips** — a misspelled name, a wrong constant, an off-by-one you can see in the diff. Fix it and still run **verification**.
- **A red test inside a milestone you are building** — that is the normal loop of **executing-plans**.

## Steps

1. **Reproduce.** Run the failing case and keep the exact error. If it does not reproduce, collect inputs, environment and versions first; do not reason about
   a failure you cannot see.
2. **Locate.** Read the whole error; it often names the answer. Follow the code path the evidence points to.
3. **State the cause with its evidence:** "Cause: X. Evidence: Y." If you cannot fill both parts, keep looking. With two candidate causes, find the test that
   tells them apart.
4. **Confirm** with the cheapest check that can prove it wrong: a log line, a breakpoint, a minimal input. If it is wrong, return to step 2. Do not build a
   second guess on an unconfirmed first one.
5. **Regression test, red.** With **bdd-testing**, write a test that fails because of this bug, with the original symptom. If an AC describes the broken
   behaviour, name the test with its ID.
6. **Fix, green.** The smallest change that removes the cause, not the symptom and not just the place where it surfaced.
7. **Verify.** The regression test passes and the nearby suite stays green. Apply **verification** before saying it is fixed.
8. **Commit** with Conventional Commits, type `fix:`, and the cause in the body.

## When the cause is the design

If the confirmed cause is structural (wrong boundary, missing abstraction, tangled responsibilities), do not patch around it. That fix needs a design: go to
**brainstorming**. If the symptom must disappear right now, a temporary workaround is fine when you say it is one and record the real cause in the open change's
progress.md Findings, or in your reply when no change is open.

## Red flags

| Thought                                   | Answer                                                              |
|-------------------------------------------|---------------------------------------------------------------------|
| "Let me change this and see"              | That is guessing. Write the cause and evidence first.               |
| "It's probably X"                         | "Probably" is a hypothesis. Confirm it.                             |
| "The error is gone, so it's fixed"        | Gone is not explained. Can you say why it happened?                 |
| "Third attempt, this one will work"       | Two failed fixes mean the cause is not understood. Back to evidence. |
