---
description: Merge a finished change's requirements into the spec backbone and archive it
argument-hint: <change-name>
---

Archive spec change: $ARGUMENTS

1. Read `spec/changes/<change-name>.md`. Refuse if any task is unchecked; list them.
2. For each `### <capability>` block under Requirements, update `spec/specs/<capability>.md` (create if new):
   - Keep only Requirements and Scenarios: the current truth of the system, no history, no tasks.
   - ADDED → append. MODIFIED → replace the requirement of the same name in full. REMOVED → delete it.
   - If a MODIFIED/REMOVED name does not exist in the backbone, stop and ask instead of guessing.
3. Move the change file to `spec/changes/archive/YYYY-MM-DD-<change-name>.md`.
4. Update `BACKBONE.md`: remove the change from "Open changes"; add or update the one-line entry under "Capabilities" for each capability touched.
5. Show me the diff of `spec/specs/` in a short summary.
