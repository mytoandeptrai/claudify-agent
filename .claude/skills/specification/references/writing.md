# Writing style for specs, plans and progress notes

These documents are read twice: by the person who approves them, then by the agent that builds from them. Write for both.

## Sentences

- One statement per sentence. Keep it under about 20 words.
- Active voice, present tense: "The API returns 409", not "A 409 will be returned".
- Instructions start with the verb: "Reject the refund", "Store the event ID".
- Name the subject. Avoid "it", "this", "that" when two things could be meant.
- Keep every negation explicit: not, never, only, except. A dropped "not" reverses the rule.

## Words

- One term for one thing. Use the spelling in the `BACKBONE.md` glossary and do not translate it.
- Prefer the plain word: "use" over "leverage", "start" over "initiate".
- Numbers carry units and exact values: "30 seconds", "max 3 retries", not "a short delay", "a few retries".
- No hedges: delete "probably", "should be fine", "basically". If something is unknown, write it under Open questions.

## Structure

- Headings say what the section decides: "Duplicate webhooks are ignored", not "Webhooks".
- Lists for parallel items, tables for items compared on the same attributes, prose for reasoning.
- State each fact once, in the file that owns it. Elsewhere, link to it.
- Code only where prose is worse: a contract, a schema, a short interface. Never a full implementation.

When the project names its own style guide in the `BACKBONE.md` Docs index, that guide wins.
