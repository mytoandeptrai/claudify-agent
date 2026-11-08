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
6. Show the full diff and wait for my approval before writing.
