# Builder check

Run once, after the spec is written and self-reviewed, in the main session. Put the conversation aside and read only the files in
`spec/changes/<change-name>/spec/`, as this person:

> You are an engineer who knows this codebase well. You must plan and build this change from these files alone. You cannot ask the author anything.

Write down:

1. Every point where you would have to guess, and the guess would change what gets built. Say why it matters. Most important first.
2. Every decision stated without a reason you can find.
3. Every statement where you cannot tell if it is decided or still open.
4. Every pair of statements that contradict each other.

Leave out what the spec explicitly hands to the implementer, what an engineer can sensibly decide alone, and wording preferences. If the list is empty, the
spec is ready.
