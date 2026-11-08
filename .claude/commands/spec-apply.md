---
description: Implement the next unchecked tasks of a spec change
argument-hint: <change-name> [task number]
---

Implement spec change: $ARGUMENTS

1. Read `spec/changes/<change-name>.md`; respect the Invariants in `BACKBONE.md`. Nothing else up front; read code only as each task needs it.
2. Take the requested task, or the first unchecked `- [ ]` task. Work one task at a time.
   Business-rule guard: money amounts, limits, fees, refunds, permissions, status transitions, legal/compliance rules MUST come from an AC, the Invariants or a linked doc. If the task needs one that is not written down, stop and ask me; never pick a "reasonable" value. Add my answer to the spec before coding it.
3. Implement it with tests for the ACs it covers. Each test name contains the full AC ID, e.g. `describe("refund/AC-2: expired QR is refunded", ...)` or `func TestRefund_AC2` with a `// refund/AC-2` comment. Use the Domain glossary terms for names. Then run its DoD. Fix until it passes (max 5 attempts, then stop and report).
4. Tick it `- [x]` in the change file. If reality differs from the spec, update the spec (Requirements/Design) in the same step and tell me.
5. If I ask you to commit: `feat(<change-name>): <what>` and list the AC IDs covered in the body.
6. Report in 2-3 lines: task done, proof run, next task. Continue to the next task only if I asked for more than one.

When every task is ticked, set `Status: done` and suggest `/spec-archive <change-name>`.
