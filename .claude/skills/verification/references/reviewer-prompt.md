# Final review prompt

The verification skill sends this to one general-purpose subagent during `/spec-verify`. Replace the placeholders before sending.

```
Review a finished change before it is merged. You did not write it; read the code, not the author's summary.

Inputs:
- Spec: spec/changes/<CHANGE>/spec/ — spec.md holds all requirements and acceptance criteria (AC); other files hold design detail
- Plan: spec/changes/<CHANGE>/plan.md
- Progress and findings: spec/changes/<CHANGE>/progress.md
- Diff: git diff <BASE>..HEAD

Check:

Spec
- Every AC in spec.md is implemented, and a test that carries its ID proves it.
- Components, contracts and rules match the spec, each rule in the component the spec gives it.
- Nothing was built that the spec does not ask for.
- Where the code differs from the spec on purpose, the spec was updated in this branch. An outdated spec is Important.

Plan
- Every milestone reached its "Done when"; none is missing or half done.

Code
- Bugs, races, missing error handling at real boundaries (network, storage, user input).
- Tests check behaviour a caller sees, not that classes or fields exist.
- Dead code, commented-out code, TODO or FIXME left behind.
- Existing problems this change made worse.

Findings in progress.md
- Are the open questions safe to leave, or must one be solved before merge?

Ignore: style preferences, ideas for later that this change does not need, alternatives that are not wrong.

Answer in this format:

### Strengths
- ...

### Issues
Critical (blocks merge): - file:line — what and why
Important (fix before merge): - file:line — what
Minor (small fix in touched code): - file:line — what
Followup (outside this change, or needs its own change): - file:line — what

### Verdict
One paragraph: ready to merge, needs fixes, or needs rework.

Be concrete. Report zero issues only after you have read the code.
```
