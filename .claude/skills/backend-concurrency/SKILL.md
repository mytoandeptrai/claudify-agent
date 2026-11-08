---
name: backend-concurrency
description: Deep dive guide for concurrency control, distributed locking, transaction isolation, race conditions, deadlocks, and idempotency in high-load backend systems.
---

# Backend Concurrency, Locking & Data Consistency Guide

## Quick Start
When architecting concurrent backend services:
1. **Never Check-Then-Act**: Eliminate race conditions at the database level using atomic updates.
2. **Deterministic Lock Ordering**: Always acquire locks in numeric/lexicographical order to avoid deadlocks.
3. **Short-Lived Transactions**: Never perform external HTTP, third-party RPCs, or file I/O inside database transactions.
4. **Idempotency by Design**: Every state-changing API or message consumer must enforce deduplication via unique keys.
5. **Right Isolation Level**: Choose Read Committed for standard CRUD, Serializable/Pessimistic for financial ledger balance updates.

---

## 1. Concurrency Anomalies & Data Hazards

### Lost Updates (The Classical Race Condition)
Occurs when two concurrent transactions read the same initial state, compute a new value, and overwrite each other's changes.

```
Request A: Read Balance ($100)
Request B: Read Balance ($100)
Request A: Compute 100 - 40 = $60  --> Write Balance ($60)
Request B: Compute 100 - 30 = $70  --> Write Balance ($70) (A's update lost!)
```

#### Solution 1: Single Atomic Query (Best Performance)
```sql
-- Safe under concurrent execution; the database engine guarantees atomic row-level serialization
UPDATE accounts
SET balance = balance - :amount, updated_at = NOW()
WHERE id = :id AND balance >= :amount;
```

#### Solution 2: Optimistic Concurrency Control (OCC)
Best for read-heavy workloads with low-to-medium contention:
```sql
-- 1. Read record with current version
SELECT id, balance, version FROM accounts WHERE id = 123; -- version = 5

-- 2. Update asserting the version hasn't drifted
UPDATE accounts
SET balance = :newBalance, version = version + 1
WHERE id = 123 AND version = 5;

-- If rows affected == 0, another request intervened. Abort or retry with exponential jitter.
```

---

## 2. Pessimistic Locking & Safe Transaction Boundaries

### `SELECT FOR UPDATE` Pattern
Use when calculations are complex and cannot be expressed in a single atomic SQL statement:

```typescript
// TypeORM / NestJS Example
await dataSource.transaction(async (manager) => {
  // 1. Lock the row exclusively until the transaction commits
  const account = await manager.findOne(Account, {
    where: { id: accountId },
    lock: { mode: 'pessimistic_write' }, // SELECT ... FOR UPDATE
  });

  if (account.balance < amount) {
    throw new BadRequestException('Insufficient funds');
  }

  account.balance -= amount;
  await manager.save(account);

  // 2. Insert audit log within the same transaction boundary
  await manager.insert(AuditLog, {
    accountId,
    amount: -amount,
    action: 'WITHDRAWAL',
  });
});
```

### ⚠️ The Cardinal Sin: I/O inside Database Locks
```typescript
// ❌ HORRIBLE: Holding database lock during network latency
await queryRunner.startTransaction();
const account = await queryRunner.manager.findOne(Account, { lock: { mode: 'pessimistic_write' } });

// DANGER: If Stripe takes 3 seconds, all other requests to this account (and connection pool) FREEZE!
await stripe.charges.create({ ... }); 

await queryRunner.commitTransaction();

// ✅ CORRECT: Do external I/O before or after database transaction locks!
const preAuth = await stripe.paymentIntents.create({ ... });
await dataSource.transaction(async (manager) => {
  // Ultra-fast DB update in milliseconds
  await manager.update(Account, id, { ... });
});
```

---

## 3. Distributed Locking (Redis / Redlock)

When concurrency spans multiple service nodes, database row locks may be insufficient (e.g., rate-limiting, preventing multiple cron workers from firing, external API quota limits).

### Safe Redis Lock Pattern
```typescript
import { Redis } from 'ioredis';
import { randomUUID } from 'crypto';

export class DistributedLockService {
  constructor(private readonly redis: Redis) {}

  async acquireLock(resource: string, ttlMs: number): Promise<string | null> {
    const lockToken = randomUUID();
    // NX: Only set if not exists, PX: Millisecond expiration
    const acquired = await this.redis.set(`lock:${resource}`, lockToken, 'PX', ttlMs, 'NX');
    return acquired === 'OK' ? lockToken : null;
  }

  async releaseLock(resource: string, lockToken: string): Promise<boolean> {
    // Lua script guarantees that we ONLY delete the key if value matches our token!
    // Prevents deleting someone else's lock if ours expired due to unexpected lag.
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.redis.eval(luaScript, 1, `lock:${resource}`, lockToken);
    return result === 1;
  }
}
```

---

## 4. Deadlock Prevention: Deterministic Ordering

### The Problem
- **Transaction 1:** Locks Account 1 $\rightarrow$ Attempts to lock Account 2.
- **Transaction 2:** Locks Account 2 $\rightarrow$ Attempts to lock Account 1.
- **Result:** Mutual deadlock. The DB engine terminates one transaction with an error.

### The Solution: Global Lock Ordering
Always sort resource identifiers prior to locking:

```go
// Go implementation for multi-account transfer
func TransferFunds(ctx context.Context, db *sql.DB, fromID, toID int64, amount float64) error {
    tx, err := db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelReadCommitted})
    if err != nil {
        return err
    }
    defer tx.Rollback()

    // Deterministic Lock Ordering: always lock smaller ID first
    firstID, secondID := fromID, toID
    if firstID > secondID {
        firstID, secondID = toID, fromID
    }

    // Acquire lock 1
    if _, err := tx.ExecContext(ctx, "SELECT id FROM accounts WHERE id = $1 FOR UPDATE", firstID); err != nil {
        return err
    }
    // Acquire lock 2
    if _, err := tx.ExecContext(ctx, "SELECT id FROM accounts WHERE id = $1 FOR UPDATE", secondID); err != nil {
        return err
    }

    // Perform balances updates safely...
    return tx.Commit()
}
```

---

## 5. Idempotent Consumer & Deduplication

For Kafka consumers, RabbitMQ listeners, and Webhook handlers:
```
Message Arrives --> Check Redis for MessageID
  ├─ If Exists: Acknowledge & Ignore (Duplicate)
  └─ If Not Exists: 
        Set MessageID in Redis (TTL = 24h)
        Process Business Logic
        Ack Message
```

```sql
-- Database Level Idempotency Ledger
CREATE TABLE idempotency_keys (
    key VARCHAR(255) PRIMARY KEY,
    response_body JSONB NOT NULL,
    status_code INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
