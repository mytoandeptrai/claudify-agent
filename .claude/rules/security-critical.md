# Security-Critical Operations

## Triggers
Keywords: "auth", "security", "password", "token", "encrypt", "API key", "secret", "credential"

## Critical Rules
- Never hardcode credentials - use environment variables
- Always validate and sanitize user input
- Use parameterized queries (no SQL injection)
- Hash passwords with bcrypt/argon2
- Use strong crypto (SHA-256+, AES-256)

## Security Checklist
See `.cursor/security-report.md` for OWASP Top 10 checklist

## Examples
- Auth pattern: `@src/auth/validateToken.ts`
- Password hashing: `@src/lib/password.ts`
- Input validation: `@src/validators/userSchema.ts`
