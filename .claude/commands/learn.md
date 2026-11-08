---
description: Turn a mistake I just corrected into a rule so it never repeats
argument-hint: <what went wrong and what is right>
---

Lesson to learn: $ARGUMENTS

If the argument is empty, infer the lesson from the correction I made earlier in this conversation.

1. State the lesson as one imperative line: what to do (or never do) and when. Add a one-line why if not obvious.
2. Pick where it belongs, most specific first:
   - business invariant of this project → Invariants in `spec/config.md`;
   - a technology or practice covered by a skill → that `.claude/skills/<name>/SKILL.md`, under a `## Lessons` section;
   - general working style → `.claude/rules/lessons.md` (always loaded, keep it under 30 lines).
3. Check the target for an existing rule that covers it; if so, sharpen that line instead of adding a duplicate.
4. Show me the exact diff and wait for my approval before writing.
