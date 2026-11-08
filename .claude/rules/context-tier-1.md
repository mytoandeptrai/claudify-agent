# Context Tier 1 (Always Loaded)

## Minimal Essential Context

**Purpose**: Always-loaded context (5-10 lines) providing critical constraints only.

---

## Critical Constraints

```
- Use ES modules (import/export), not CommonJS
- TypeScript strict mode, no `any` types
- All user input validated with Zod schemas
```

---

## Essential Commands

```bash
npm run lint       # After substantive changes
npm run test       # Prefer single test files
npm run typecheck  # After TypeScript changes
```

---

## Canonical Examples

```
Component pattern: @components/Button.tsx
API route pattern: @app/api/users/route.ts
Test pattern: @__tests__/auth.test.ts
```

---

**Note**: This is the MINIMAL context. Task-specific context loaded from Tier 2 based on keywords and file patterns.

**Rule**: If it's not in this file, agent discovers via search tools (Grep, SemanticSearch, Task).
