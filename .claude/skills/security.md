# Security & Defensive Coding Standards (OWASP Top 10)

## Mandatory Checks
1. **Secrets Management:**
   - NEVER commit `.env`, `.pem`, API keys, or JWT secrets to source control.
   - Always reference environment variables via `process.env.VARIABLE_NAME`.
   - Provide clear `.env.example` templates with empty placeholders.

2. **Injection Prevention:**
   - Use parameterized queries or verified ORMs (Prisma, Drizzle) for SQL. Never concatenate user input into SQL strings.
   - Sanitize all user inputs before rendering into raw HTML (`dangerouslySetInnerHTML`).

3. **Authentication & Authorization:**
   - Enforce server-side role and session checks on every sensitive endpoint. Never trust client-side claims alone.
   - Use constant-time comparison algorithms for secrets/hashes to prevent timing attacks.

4. **Input Validation:**
   - All external payload boundaries (HTTP Body, Query Params, Webhooks) must be strictly validated with Zod/Valibot schemas.
