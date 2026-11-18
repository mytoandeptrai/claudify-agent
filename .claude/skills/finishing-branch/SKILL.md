---
name: finishing-branch
description: Use when a change is verified (progress.md Status verified), to merge its requirements into the canonical specs, archive it, and then merge, open a PR, keep or discard the branch.
---

# Finishing a branch

Confirm the change is verified → move its requirements into the canonical specs and archive it (only when it lands) → let the user choose → do it.

<HARD-GATE>
Never archive or integrate a change whose progress.md Status is not `verified`; run `/spec-verify <change-name>` first. Never merge, push or delete without
the user choosing an option below.
</HARD-GATE>

## When to skip

Work without a change folder (a bug fix, a trivial change): skip step 2 and only show the options.

## 1. Confirm verification is current

Read `spec/changes/<change-name>/progress.md`. Status must be `verified`, with the Verification section written by `/spec-verify`. If code was committed after
that (anything beyond the progress.md update), run `/spec-verify` again. If verification is current, do not run the full suite again here.

A project with no test suite: say so plainly and continue. No suite is not the same as a failing suite.

## 2. Archive and update canonical specs

Only when the work lands (options 1, 2 and B1). It is committed on the feature branch so the spec update travels with the code.

1. For each `### <capability>` block under Requirements in `spec/changes/<change-name>/spec/spec.md`, update `spec/specs/<capability>/spec.md`, creating it
   if needed:
   - It keeps only requirements and their ACs, with IDs unchanged: the system as it is now. No history, tasks or design notes.
   - ADDED: append. MODIFIED: replace the requirement with the same name completely. REMOVED: delete it.
   - If a MODIFIED or REMOVED requirement does not exist in the canonical spec, stop and ask. Do not guess.
2. Design knowledge that stays useful (a contract, a data model, an architecture decision) moves into the doc the BACKBONE Docs index assigns to it. If no doc
   owns it, it stays in the archive. Ask before creating a new doc.
3. `git mv spec/changes/<change-name> spec/archive/YYYY-MM-DD-<change-name>`.
4. In `BACKBONE.md`, remove the change from "Open changes" and add or update the one-line "Capabilities" entry for each capability touched.
5. Run `node .claude/scripts/spec-check.mjs` on all canonical specs. Commit: `docs(<change-name>): archive change and update specs`.
6. Give the user a short summary of what changed in `spec/specs/`.

## 3. Find the base branch

```bash
BASE_BRANCH=$(git rev-parse --abbrev-ref origin/HEAD 2>/dev/null); BASE_BRANCH=${BASE_BRANCH#origin/}
```

If empty, use a local `main` or `master`; if still unclear, ask which branch this came from. If the commits are already on the base branch, use the second
menu.

## 4. Offer the options

Show the menu without extra explanation.

```
Change verified. Choose one:

1. Merge into <base-branch> locally
2. Push and open a Pull Request
3. Keep the branch for now
4. Discard this work
```

When the commits are already on the base branch:

```
Change verified. These commits were made directly on <base-branch>.

B1. Leave them in place
B2. Revert them
```

For 1, 2 and B1, do step 2 before carrying out the choice.

## 5. Carry out the choice

**1. Merge locally**

```bash
git switch "$BASE_BRANCH" && git pull --ff-only
git merge --no-ff <feature-branch>
<Verify command from BACKBONE.md>   # on the merged result
git branch -d <feature-branch>
```

**2. Pull Request**

```bash
git push -u origin <feature-branch>
gh pr create --title "<title>" --body "$(cat <<'EOF'
## What changed
<2-3 bullets>

## Acceptance criteria
<AC IDs from spec.md>

## Differences from the spec
<from progress.md Findings, or "none">

## Test plan
- [ ] <steps>
EOF
)"
```

**3. Keep** — report "Branch <name> kept; the change stays open in spec/changes/." Nothing else.

**4. Discard** — first show what will be lost and require the exact word `discard`:

```
This permanently deletes:
- branch <name>
- commits: <list>

Type 'discard' to confirm.
```

Then check out the base branch, run `git branch -D <feature-branch>`, and remove the change from "Open changes" in `BACKBONE.md`.

**B1. Keep on base** — after step 2, report and stop.

**B2. Revert** — list the commits in `<Base>..HEAD` (Base from progress.md), require the exact word `revert`, then `git revert --no-edit <Base>..HEAD`. Never
reset or delete the base branch.

## Summary

| Option        | Lands          | Archives | Push | Branch afterwards |
|---------------|----------------|----------|------|-------------------|
| 1 Merge       | yes            | yes      | -    | deleted           |
| 2 PR          | through the PR | yes      | yes  | kept              |
| 3 Keep        | -              | -        | -    | kept              |
| 4 Discard     | -              | -        | -    | force-deleted     |
| B1 Keep       | already landed | yes      | -    | -                 |
| B2 Revert     | -              | -        | -    | revert commits    |

## Never

- Archive or integrate a change that is not `verified`.
- Merge without running Verify on the merged result.
- Invent a canonical requirement that MODIFIED or REMOVED refers to but the canonical spec lacks.
- Delete or revert without the typed confirmation word.
- Force-push unless the user asks for it.
- Reset or delete the base branch.
