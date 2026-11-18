# Diagrams

Use Mermaid: it renders on GitHub, GitLab and in most IDE previews.

## Pick the diagram by the question

| Question                                              | Diagram                                                                 |
|-------------------------------------------------------|-------------------------------------------------------------------------|
| Which systems talk to each other?                     | `flowchart` of our system and the external ones, no internals           |
| Which components take part and who depends on whom?   | `flowchart` of the components inside one system, typed by role          |
| What happens in which order, and on failure?          | `sequenceDiagram` that includes the failure branch                      |
| Which states exist and what moves between them?       | `stateDiagram-v2` for one entity or job                                 |
| What is stored and how is it related?                 | `erDiagram`                                                             |
| What is different after the change?                   | the same diagram twice (before / after), changed nodes marked; or a table |
| In what order does it ship?                           | a table: step, what it delivers, what still runs on the old path        |

## Rules

- Write the question as a one-line caption above the diagram. A second diagram must answer a different question.
- Keep one zoom level per diagram: either systems, or the components inside one system.
- Nodes are things a team would draw on a whiteboard: services, modules, stores, external systems, aggregates. Helper classes are not nodes. Above about 12
  nodes, split the diagram.
- Show the kind of each node (shape, subgraph or legend). Every edge has a direction and a verb label; "uses" is too vague, a method name is too low.
- Labels have four words or fewer. No signatures, no line breaks inside labels, no styling.
- The text after a diagram explains why it looks this way and what it does not show. It does not read the arrows aloud.
