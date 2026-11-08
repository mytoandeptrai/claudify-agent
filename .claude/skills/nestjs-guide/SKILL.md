# NestJS Enterprise Backend Architecture Skill

## 1. Architectural Modularity & Clean Boundaries
- **Module Encapsulation:** Every domain feature MUST be encapsulated in its own module (`users.module.ts`, `orders.module.ts`).
- Export ONLY what other modules explicitly require via the `exports` array.
- **Dependency Injection (DI):** Prefer constructor injection with explicit interfaces. Keep services stateless (singleton by default).

## 2. Validation & Security Pipeline
- **Global ValidationPipe:**
  Always enable `ValidationPipe` with strict stripping:
  ```typescript
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // Strip properties without decorators
    forbidNonWhitelisted: true,   // Throw error if unauthorized fields exist
    transform: true,              // Automatically transform payloads to DTO instances
  }));
  ```
- **DTO Safety:** Every input DTO must use `class-validator` and `class-transformer`. Never use raw `any` in `@Body()`, `@Query()`, or `@Param()`.

## 3. Database & Transaction Boundaries (TypeORM / Prisma)
- **Transaction Isolation:** Use QueryRunner (TypeORM) or `$transaction` (Prisma) for multi-entity updates.
- **Pessimistic Locking in TypeORM:**
  ```typescript
  const account = await queryRunner.manager.findOne(Account, {
    where: { id },
    lock: { mode: 'pessimistic_write' },
  });
  ```
- **Avoid Long Transactions:** Prepare data and validate inputs BEFORE starting the database transaction.

## 4. Error Handling & Exception Filters
- Never throw generic `new Error()`. Use built-in NestJS HTTP exceptions:
  `NotFoundException`, `BadRequestException`, `ConflictException`, `ForbiddenException`.
- Use custom Global Exception Filters to normalize error response structures across the entire API.

## 5. Anti-Patterns to Avoid
- ❌ Do NOT perform database queries or business logic inside Controllers. Controllers ONLY handle routing and HTTP status.
- ❌ Do NOT create circular dependencies between modules; use `forwardRef()` only as an extreme last resort.
- ❌ Do NOT use Request-scoped providers (`Scope.REQUEST`) unless strictly necessary (massive performance penalty).
