# Test design

How to build a test that survives change. A good test stays the same when the code is refactored, when an unrelated feature lands, when a bug elsewhere is
fixed, or when the internals are redesigned. It changes only when the behaviour it describes changes.

## Never

- Make up a business rule so a test has numbers. When expected behaviour is unclear, look at callers, docs and the spec; name the open question and test only the
  clear part.
- Weaken, skip or delete a valid test to get a green build.
- Say a test passes without running it.

## Scope

- **Behaviour first.** Write the GIVEN / WHEN / THEN sentence before the code of the test. One behaviour per test.
- **Public entry point.** Call the code the way a real caller does. No private methods, no internal state.
- **Smallest scope that proves it.** Do not mock the thing under test, including the database when the database behaviour is the point.
- **Pick cases on purpose:** zero, one, many, boundaries, interface errors, exceptional paths, the simple case.

## Doubles

- Prefer, in order: real object, stub, fake, mock. Replace only what is slow, external or non-deterministic.
- A stub only provides input. It never contains the logic being tested.
- A fake must behave like the real thing; give it a contract test shared with the real implementation.
- Check an interaction (the call happened) only when the call itself is the behaviour, e.g. "an email is sent".

## Readability

- Name the test after the action and the result. Separate arrange, act and assert with blank lines.
- Put every value that matters in a named variable, and use the same variable to set up and to assert.
- Build test data with helpers named after the situation: `anExpiredPayment()`, not `makePayment(3, true, null)`.
- Helpers take few parameters (about three) and hide arguments the behaviour does not care about.
- No `if`, loops or calculations in a test. Parameterize only rows of the same behaviour.
- Prefer clear repetition over clever sharing: keep inline what the test is about.

## Assertions

- Assert the outcome the caller sees, not how it is represented internally.
- Assert only what the behaviour promises; extra assertions make the test break for unrelated reasons.
- Fix the clock, seeds, external I/O, shared state and execution order, so the test gives the same result every run.

## When a test fails

Decide what kind of failure it is before you touch it: expected red, real defect, brittle test, non-determinism, environment, or already broken before the
change. Run the narrowest test first, then the wider suite. If you cannot run it, report the command, the error and what did not run.

## Situations

- **Existing code without tests (safety net before a refactor).** Write tests through the public API that pass on current behaviour. Prove each one can fail:
  break the behaviour on purpose, see red, restore. Commit them before refactoring.
- **A test broke during a pure refactor.** The test was tied to internals. Move it up to the public behaviour; do not bend the code to fit the test.
- **Reviewing tests.** Must fix: does not prove the claimed behaviour, tests internals, uncontrolled time or network, a hidden or weakened failure, an invented
  rule. Should fix: a test checking more than one behaviour, important setup hidden in helpers, vague name, needless mocks, over-assertion.

## Done when

- [ ] Survives refactoring, an unrelated feature, a fix elsewhere and an equivalent algorithm.
- [ ] Called like a real caller; asserts output or visible state.
- [ ] Real collaborators where possible; every double justified.
- [ ] One behaviour, a name that says it, readable without opening helpers.
- [ ] No logic in the test; clock, seeds and I/O fixed.
- [ ] It was executed and passed, or failed exactly as intended.
