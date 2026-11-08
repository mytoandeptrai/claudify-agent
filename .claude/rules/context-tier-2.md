# Context Tier 2 (Task-Specific, Loaded On-Demand)

## Automatic Context Loading

**Purpose**: Task-specific context loaded based on keywords, file patterns, and task type.

**Loading Mechanism**: Automatic based on triggers below.

---

## Testing Context

**Triggers**: 
- Keywords: "test", "spec", "testing", "__tests__", "vitest", "jest"
- File patterns: `**/__tests__/**`, `**/*.test.ts`, `**/*.spec.ts`
- Commands: `/test`, `/tdd`

**Loaded Context**:
```
## Testing Requirements
- Use Vitest for unit tests, Playwright for E2E
- Place tests in __tests__/ directory
- Name test files: [feature].test.ts
- Follow AAA pattern: Arrange, Act, Assert
- Minimum 80% coverage for new code
- Mock external APIs with MSW
- Include error boundary tests

## Test Commands
npm run test              # Full suite
npm run test:unit         # Unit tests only
npm run test:coverage     # With coverage report
npm run test -- path/to   # Specific file

## Test Examples
- Unit test: @__tests__/auth.test.ts
- Integration: @__tests__/api/users.test.ts
- E2E: @e2e/checkout.spec.ts
```

---

## API Development Context

**Triggers**:
- Keywords: "API", "endpoint", "route", "REST", "GraphQL"
- File patterns: `**/app/api/**`, `**/routes/**`, `**/controllers/**`
- Commands: `/api`, `/endpoint`

**Loaded Context**:
```
## API Structure
- All routes in app/api/[resource]/route.ts
- Use Next.js App Router conventions
- Export GET, POST, PUT, DELETE handlers

## Authentication
- Validate JWT with @src/auth/validateToken.ts
- Extract user from token claims
- Return 401 for unauthorized, 403 for forbidden

## Validation
- Use Zod schemas for all input validation
- Return 400 with error details for invalid input
- Sanitize input before database queries

## Error Handling
```typescript
try {
  // business logic
} catch (error) {
  logger.error('API error', { error, userId });
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## API Examples
- REST pattern: @app/api/users/route.ts
- Error handling: @app/api/orders/route.ts
- Validation: @src/validators/orderSchema.ts
```

---

## UI/Styling Context

**Triggers**:
- Keywords: "UI", "component", "styling", "CSS", "Tailwind", "frontend"
- File patterns: `**/components/**`, `**/app/**`, `**/pages/**`, `*.tsx`, `*.css`
- Commands: `/component`, `/ui`

**Loaded Context**:
```
## CSS Framework
- Use Tailwind CSS for all styling
- Follow utility-first approach
- Use clsx for conditional classes

## Component Structure
```tsx
interface Props {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children }: Props) {
  return (
    <button className={clsx(
      'px-4 py-2 rounded font-medium',
      variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-200'
    )}>
      {children}
    </button>
  );
}
```

## Responsive Design
- Mobile-first approach
- Use md:, lg:, xl: breakpoints
- Test on multiple screen sizes

## UI Examples
- Button: @components/Button.tsx
- Form: @components/forms/TextInput.tsx
- Layout: @components/Layout.tsx
```

---

## Performance Context

**Triggers**:
- Keywords: "performance", "optimize", "slow", "fast", "lighthouse", "audit"
- Commands: `/optimize`, `/performance`, `/audit`

**Loaded Context**:
```
## Performance Optimization
- Profile BEFORE optimizing (cursor-ide-browser or user-chrome-devtools)
- Use React.memo for expensive components
- Implement code splitting for large bundles
- Lazy load non-critical components
- Cache API responses with React Query or SWR

## Performance Metrics
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Lighthouse Performance: >90

## Performance Examples
- Memoization: @components/ExpensiveList.tsx
- Code splitting: @app/dashboard/page.tsx
- Caching: @lib/react-query.ts
```

---

## Database Context

**Triggers**:
- Keywords: "database", "DB", "Prisma", "Drizzle", "migration", "schema", "query"
- File patterns: `**/prisma/**`, `**/models/**`, `**/db/**`, `*.prisma`
- Commands: `/db`, `/migration`, `/schema`

**Loaded Context**:
```
## Database ORM
- Use Prisma ORM for database operations
- Schema in prisma/schema.prisma
- Migrations required for schema changes

## Query Patterns
- Use transactions for multi-step operations
- Include related data with include/select
- Index frequently queried fields

## Database Examples
- Schema: @prisma/schema.prisma
- Query pattern: @src/db/queries/users.ts
- Migration: @prisma/migrations/[latest]
```

---

## Security Context

**Triggers**:
- Keywords: "security", "auth", "authentication", "authorization", "encrypt", "hash"
- File patterns: `**/auth/**`, `**/security/**`, `**/middleware/**`
- Commands: `/security`, `/auth`, `/review-security`

**Loaded Context**:
```
## Authentication
- JWT tokens with 15min expiration
- Refresh tokens with 7day expiration
- Store tokens in httpOnly cookies
- Validate tokens on all protected routes

## Password Security
- Hash passwords with bcrypt (cost: 12)
- Minimum 8 characters, mixed case, numbers
- Rate limit login attempts (5 per minute)

## Input Security
- Sanitize all user input
- Use parameterized queries (no SQL injection)
- Escape output to prevent XSS

## Security Examples
- Auth middleware: @src/middleware/auth.ts
- Password hashing: @src/lib/password.ts
- Input validation: @src/validators/userSchema.ts
```

---

## Deployment Context

**Triggers**:
- Keywords: "deploy", "production", "staging", "CI/CD", "build"
- Commands: `/deploy`, `/build`, `/ci`

**Loaded Context**:
```
## Build Process
- npm run build before deploying
- Check build output for errors
- Verify environment variables

## Deployment Pipeline
- Run tests in CI
- Run linter in CI
- Run typecheck in CI
- Deploy to staging first
- Manual approval for production

## Deployment Examples
- CI config: @.github/workflows/ci.yml
- Build script: @scripts/build.ts
- Deploy: @scripts/deploy.ts
```

---

## Automatic Context Pruning

**Rule**: To avoid over-specification (per ETH Zurich research):

```
1. Load ONLY relevant Tier 2 context based on triggers
2. DO NOT load multiple Tier 2 contexts unless task spans multiple areas
3. If task spans multiple areas, load summaries only
4. Agent discovers details via search tools (Grep, SemanticSearch)
```

**Example**:
```
Task: "Add API endpoint" → Load API context only
Task: "Add UI component" → Load UI context only
Task: "Add authenticated API" → Load API + Security context (summaries)
```

---

## Context Loading Decision Tree

```
Task involves testing? → Load Testing context
Task involves API? → Load API context
Task involves UI/components? → Load UI/Styling context
Task involves performance? → Load Performance context
Task involves database? → Load Database context
Task involves auth/security? → Load Security context
Task involves deployment? → Load Deployment context
Multiple areas? → Load summaries of each, agent discovers details
```

---

**Note**: These contexts load automatically based on task analysis. No manual intervention needed.
