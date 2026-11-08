# Backend Concurrency, Locking & Data Consistency Skill

> **Critical Mission:** Prevent distributed race conditions, deadlocks, dirty reads, lost updates, and phantom reads across high-throughput backend services (Golang, NestJS, Node.js).

---

## 1. Concurrency & Race Condition Defense

### The "Check-Then-Act" Trap (Time-of-Check to Time-of-Use)
- ❌ **Anti-pattern:**
  ```typescript
  const user = await repo.findById(id);
  if (user.balance >= amount) {
    user.balance -= amount;
    await repo.save(user); // RACE CONDITION: concurrent requests double-spend!
  }
  ```
- ✅ **Resolution 1 (Atomic DB Operations):**
  Push state mutations directly to the database layer:
  ```sql
  UPDATE accounts SET balance = balance - 100 WHERE id = :id AND balance >= 100;
  ```
- ✅ **Resolution 2 (Optimistic Locking with Versioning):**
  Add a `version` column to tables/entities. On update:
  `WHERE id = :id AND version = :currentVersion`. If rows affected == 0, retry with exponential backoff.

---

## 2. Distributed Locking & Deadlock Prevention

### Distributed Locks (Redis / Redlock)
- When protecting critical sections across multiple container instances (Golang microservices, NestJS replicas):
  - Always set an explicit **TTL (Time-To-Live)** to avoid permanent orphan locks if a node crashes.
  - Acquire locks using atomic `SET key value NX PX 5000`.
  - Always release locks using Lua script to verify ownership (never release someone else's expired lock).

### Deadlock Prevention Protocol
- **Ordered Resource Acquisition:** If a transaction must acquire locks on multiple rows/tables (e.g., Transfer from Account A to B):
  - **Rule:** Always acquire locks in deterministic lexicographical/numeric order:
    `lock(min(fromId, toId))` THEN `lock(max(fromId, toId))`.
  - Never allow Service 1 to lock A $\rightarrow$ B while Service 2 locks B $\rightarrow$ A.

---

## 3. Database Isolation Levels & Dirty Read Prevention

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read | Typical Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Read Committed** (Postgres default) | ❌ Prevented | ⚠️ Possible | ⚠️ Possible | Standard CRUD, read queries. |
| **Repeatable Read** | ❌ Prevented | ❌ Prevented | ⚠️ Possible | Multi-step calculations, reports. |
| **Serializable** | ❌ Prevented | ❌ Prevented | ❌ Prevented | High-risk financial balances, ticketing. |

### Pessimistic Locking (`SELECT FOR UPDATE`)
- In SQL/ORM (TypeORM, Prisma, GORM):
  - Use `SELECT ... FOR UPDATE` only within an explicit database transaction.
  - Keep transactions as short as humanly possible: **Never perform external HTTP requests or heavy I/O while holding a DB lock.**

---

## 4. Idempotency & Message Deduplication
- For webhooks, payment processors, and RabbitMQ/Kafka consumers:
  - Every mutation request MUST accept an `Idempotency-Key` or unique event ID.
  - Store processed keys in Redis or DB with unique constraints to reject duplicate concurrent processing.
