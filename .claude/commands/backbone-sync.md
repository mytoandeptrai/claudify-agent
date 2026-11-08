---
description: Re-sync BACKBONE.md with the current source after work done without specs
argument-hint: [area to focus on]
---

Sync `BACKBONE.md` with the code as it is now. Focus: $ARGUMENTS

1. Find what changed since the last sync:
   - read the `Last synced:` commit in `BACKBONE.md`; run `git log --stat <commit>..HEAD` (and `git status` for uncommitted work);
   - no commit recorded → fall back to the shallow scan of `/backbone-init`.
   Read only the changed files that matter (manifests, new dirs, new docs, CI, public APIs); not every diff line.
2. Compare against `BACKBONE.md` section by section and list gaps:
   - Structure: new / moved / removed modules or repos;
   - Docs index: new docs, docs that now contradict the code (candidate outdated);
   - Commands: scripts or CI steps that changed;
   - Capabilities: behaviour that exists in code but has no `spec/specs/*.md` entry;
   - Open changes: entries whose `spec/changes/*.md` is gone or done.
3. Also compare with `spec/specs/*.md` for the touched areas. Report code that contradicts an archived requirement, but do not edit specs: that is my call (fix the code or open a change).
4. Ask me about anything you cannot decide from evidence, batched in one message. Never invent invariants.
5. If `CLAUDE.md` outside the claudify block grew past ~30 lines or repeats backbone facts, propose slimming it exactly as in step 6 of `.claude/commands/backbone-init.md`.
6. Show the diff (`BACKBONE.md` including `Last synced: <HEAD short sha> (<date>)`, plus `CLAUDE.md` if slimming) and wait for my approval before writing.
