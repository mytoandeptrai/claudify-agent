# Structure checklist

Used by executing-plans after a milestone is green. Read the milestone diff (`git diff <milestone start>..HEAD`) as a reviewer who did not write it, against
the spec sections the milestone's *Read* line names. Judge only code the diff added or made worse.

## Layers inside a function

Every function should work at one layer only:

- **Rule** — a business decision: is it allowed, how much, which next state.
- **Flow** — the steps, their order, what happens when one fails.
- **Mapping** — converting data from one shape to another, e.g. HTTP body into a command, DB row into a domain object.
- **I/O** — database, network, queue, cache, files, clock.

A body that jumps between layers is the most common finding.

## What to check

**Ownership**

1. A business decision lives outside the domain (in an HTTP layer, an adapter, a mapper, a test helper). → Put it in the unit whose data drives the decision.
2. Domain code knows a framework, transport or storage type, or receives a raw request or row. → The domain declares an interface; the adapter implements it
   and converts.
3. A dependency points outward or in a circle (callbacks or events passing outer types inward, two units importing each other). → Reverse it through an
   interface owned by the inner side.

**Placement**

4. A unit reads another unit's fields to make a decision the other unit could make. → Move the method to the data.
5. A domain value (amount, ID, status) travels as a bare string, number or map and is validated in several places. → Give it a small type.

**Shape**

6. One function maps, decides, calls I/O and maps back. → Split by layer; mapping goes to the adapter.
7. A function is long, has parts you would name separately, or nests more than two levels. → Extract each named part.
8. The same three or more values always travel together, or a function takes many parameters. → Group them in one object.

**Reasons to change**

9. The unit gained a second, unrelated reason to change in this milestone. → Split it.
10. One rule, format or ordering is now written in two places. → Keep it in one unit.
11. A method only forwards a call, an interface has one implementation and no second user, or a flag is never set. → Remove the layer. Too much structure is
    also a finding.

**Across the diff**

12. The same logic appears twice. → Merge it.
13. The code disagrees with a contract or rule in the spec. → Fix the code, or update the spec if the spec was wrong and say so.

## Limits

- Naming, formatting and style belong to the Verify command and the final review, not here.
- A problem that needs a different design is not fixed here: write one line, then follow the circuit-breaker in executing-plans.
- At most six findings, ordered by how expensive they make the next change. None is a normal result.
