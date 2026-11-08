# Root Cause Debugging & Troubleshooting

## 4-Step Systematic Debugging Protocol
1. **Reproduce & Isolate:** Recreate the exact failure case with minimal reproduction code or single targeted test.
2. **Inspect & Trace:** Check actual runtime logs, stack traces, and variable states instead of guessing.
3. **Hypothesize & Form Minimal Fix:** Identify the root mechanism causing the breakdown. Form the smallest possible diff that completely fixes the issue.
4. **Regression Prevention:** Add a targeted regression test confirming the bug is dead and adjacent modules remain intact.

## Anti-Patterns
- ❌ Do NOT randomly wrap code in `try-catch` blocks without handling or logging errors.
- ❌ Do NOT suppress TypeScript compiler errors with `@ts-ignore` or `as any`.
- ❌ Do NOT write sprawling test fixtures when a focused unit test suffices.
