---
description: Scan the project and draft BACKBONE.md (project map loaded every session)
argument-hint: [extra notes about the project]
---

Draft or refresh `BACKBONE.md` at the project root. Notes from me: $ARGUMENTS

1. Scan shallowly, do not read whole trees:
   - manifests: package.json, go.mod, pyproject.toml, foundry.toml, Cargo.toml, docker/compose files;
   - top-level dirs (and sub-repos if this is a multi-repo workspace);
   - README, CLAUDE.md, `docs/` file names and first headings; `openspec/` or `spec/` if present;
   - CI workflows for the real lint/test/build commands.
2. Fill every section of the existing `BACKBONE.md` (or the template if missing):
   - Docs index: one line per doc, with status. Mark a doc outdated only with evidence (superseded note, archive folder, version mismatch); otherwise ask.
   - Domain glossary: the main business nouns from models/entities/DB schema/status enums, with meaning and states. Ask me when a name is cryptic (e.g. `tbl_sub_v3`, `flag_v2`) instead of guessing. Keep it to the terms that matter (~15).
   - Capabilities: one line per `spec/specs/*.md` (or `openspec/specs/*/` if migrating from OpenSpec).
   - Invariants: only rules found in docs or that I confirm. Never invent business rules.
3. Keep it under ~80 lines. Link, never copy.
4. List what you could not determine as questions, batched in one message.
5. Set `Last synced: <HEAD short sha> (<date>)` so `/backbone-sync` can diff from here.
6. Slim `CLAUDE.md`: it is loaded every session too, so project facts in it are paid twice. Only touch content OUTSIDE the `<!-- claudify:start -->`…`<!-- claudify:end -->` block. If that content is more than ~30 lines, propose:
   - project facts (overview, repos, structure, commands) → the matching `BACKBONE.md` section;
   - must-follow rules and known traps → `BACKBONE.md` Invariants;
   - long procedures (deploy, onboarding, runbooks) → keep or move to a doc under `docs/`, linked from the Docs index;
   - AI working rules specific to this project → keep in `CLAUDE.md`.
   Show a table "original line range → destination" so nothing disappears silently. Never drop content that has no destination; when unsure, keep it in `CLAUDE.md`.
7. Show the full diff (`BACKBONE.md`, and `CLAUDE.md` / new docs if slimming) and wait for my approval before writing. If I decline the slimming, write only `BACKBONE.md`.
