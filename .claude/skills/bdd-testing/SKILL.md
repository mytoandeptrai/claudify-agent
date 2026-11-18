---
name: bdd-testing
description: Use when writing or changing tests for code that makes decisions, transforms data or has side effects, to write behaviour tests named after the acceptance criteria they prove.
---

# Behaviour testing

A test describes what the code does for whoever calls it, not how the code is built. Write it first and watch it fail for the right reason.

Before the first test of a session, read `references/test-design.md`: it says how to build a test that survives refactoring. Apply the test conventions in `spec/config.md`.

## When to skip

Code without real behaviour needs no test: enums, DTOs and plain data classes, type aliases, re-exports, pure delegation, constants. The compiler and linter
cover them. Code with behaviour always gets one: decisions (validation, routing), transformations (parsing, formatting, calculation), side effects (network,
files, database, mutation), and coordination of other units.

## Rules

1. **Behaviour, not structure.** No tests that a class exists, a field is there, or an enum has values.
2. **Read like a sentence.** Each test is GIVEN / WHEN / THEN; its name tells the reader what broke before they read the body: `empty email is rejected`,
   not `test_validate`.
3. **AC tests carry the ID.** A test that proves an acceptance criterion has the full ID in its name, so `spec-check.mjs` can find it:
   `describe("refund/AC-2: expired QR is refunded", ...)`, or `func TestRefund_AC2` with a `// refund/AC-2` comment.
4. **Real collaborators first.** If they are fast and simple, use them. Mock only at the edge: network, filesystem, clock, randomness.
5. **Assert the result, not the call.** `result.error == "Email required"` proves behaviour; "the validator was called once" only proves the mock.
6. **No test-only code in production.** `reset()` or `destroy()` helpers live in test utilities.

## Red, then green

1. Write the test for one behaviour.
2. Run it. It must fail with the message you expect, because the behaviour is missing. A typo or import error is not a red test. A new test that passes at once
   is testing behaviour that already exists: change it.
3. Write the least code that makes it pass. No branches for cases no test covers, no early generalisation, nothing "while I'm here".

**Tests for existing code** are expected to pass at once. Prove each one works: break the behaviour on purpose, see it fail, restore it.

## Smells

| You see                                            | Do instead                                                                  |
|----------------------------------------------------|-----------------------------------------------------------------------------|
| Mocks of your own classes "to isolate the unit"    | Use the real class; mock only external boundaries.                          |
| A mock missing fields the real object has          | Make the mock match the real shape, or use the real object.                 |
| Setup longer than the test                         | The code is too coupled. Simplify the interface or use real collaborators.  |
| You cannot say what failure the test would catch   | There is no behaviour to test. Skip it, or write the API you wish you had.  |
| Everything needs a mock                            | Too many dependencies: restructure the code, not the test.                  |
