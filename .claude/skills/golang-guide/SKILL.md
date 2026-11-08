---
name: golang-guide
description: Comprehensive architecture, concurrency patterns, error handling, clean architecture, and performance guidelines for production Golang backends.
---

# Golang Production Backend Engineering Guide

## Quick Start
When writing or reviewing Go backend services:
1. **Explicit Error Wrapping**: Always wrap errors with context: `fmt.Errorf("orderservice.CreateOrder: %w", err)`.
2. **Context Propagation**: Pass `ctx context.Context` as the first argument in every I/O-bound function.
3. **No Goroutine Leaks**: Every spawned goroutine must have a deterministic termination condition via context or channel close.
4. **Interface Segregation**: Accept interfaces, return structs. Define interfaces at consumption boundaries.
5. **Zero Allocations in Hot Paths**: Pre-allocate slice capacity `make([]T, 0, expectedCap)` and reuse buffers via `sync.Pool`.

---

## 1. Project Architecture (Standard Go Layout)

Follow the idiomatic Go enterprise layout:

```text
my-go-service/
├── cmd/
│   └── api/
│       └── main.go           # Application bootstrap & dependency wiring
├── internal/                 # Private application code (enforced by Go compiler)
│   ├── domain/               # Core business models & repository interfaces (Pure Go, 0 external deps)
│   │   ├── order.go
│   │   └── customer.go
│   ├── usecase/              # Application business logic orchestrators
│   │   └── order_service.go
│   ├── repository/           # Database implementations (Postgres, GORM, Redis)
│   │   ├── postgres_order.go
│   │   └── redis_cache.go
│   └── transport/            # Inbound adapters (HTTP handlers, gRPC servers, Kafka consumers)
│       ├── http/
│       │   ├── handler.go
│       │   └── router.go
│       └── grpc/
├── pkg/                      # Public reusable utilities (logging, metrics, crypto)
├── go.mod
└── go.sum
```

---

## 2. Idiomatic Error Handling

Go does not use exceptions. Errors are normal values and must be explicitly handled.

### Error Wrapping & Inspection
```go
package service

import (
    "errors"
    "fmt"
)

var (
    ErrNotFound     = errors.New("record not found")
    ErrUnauthorized = errors.New("unauthorized operation")
)

func (s *OrderService) GetOrder(ctx context.Context, id string) (*domain.Order, error) {
    order, err := s.repo.FindByID(ctx, id)
    if err != nil {
        if errors.Is(err, repository.ErrNotFound) {
            // Map internal DB error to domain error with wrapping
            return nil, fmt.Errorf("%w: order id %s", ErrNotFound, id)
        }
        // Preserve stack context without losing root cause
        return nil, fmt.Errorf("failed fetching order from repository: %w", err)
    }
    return order, nil
}
```

---

## 3. Concurrency Patterns & Safe Goroutines

### Worker Pool Pattern (Rate-Limited Parallel Execution)
Prevent spawning millions of goroutines that crash memory:

```go
func ProcessJobs(ctx context.Context, jobs []Job, concurrency int) error {
    jobsChan := make(chan Job, len(jobs))
    errGroup, ctx := errgroup.WithContext(ctx)

    // Feed jobs
    for _, job := range jobs {
        jobsChan <- job
    }
    close(jobsChan)

    // Spawn fixed worker pool
    for i := 0; i < concurrency; i++ {
        errGroup.Go(func() error {
            for {
                select {
                case <-ctx.Done():
                    return ctx.Err()
                case job, ok := <-jobsChan:
                    if !ok {
                        return nil // Channel drained
                    }
                    if err := job.Execute(ctx); err != nil {
                        return fmt.Errorf("job %s failed: %w", job.ID, err)
                    }
                }
            }
        })
    }

    return errGroup.Wait()
}
```

### Mutex Safety & Avoiding Data Races
```go
type SafeCache struct {
    mu    sync.RWMutex
    store map[string]string
}

func (c *SafeCache) Get(key string) (string, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    val, ok := c.store[key]
    return val, ok
}

func (c *SafeCache) Set(key, value string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.store[key] = value
}
```

---

## 4. Database Interactions (Clean Context-Aware SQL)

Always use transactions with timeouts:

```go
func (r *PostgresOrderRepo) DeductBalance(ctx context.Context, accountID int64, amount float64) error {
    // 1. Enforce operation timeout
    ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
    defer cancel()

    tx, err := r.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelReadCommitted})
    if err != nil {
        return fmt.Errorf("failed starting tx: %w", err)
    }
    defer tx.Rollback()

    // 2. Atomic mutation
    query := `UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1`
    res, err := tx.ExecContext(ctx, query, amount, accountID)
    if err != nil {
        return fmt.Errorf("db update error: %w", err)
    }

    rows, err := res.RowsAffected()
    if err != nil {
        return err
    }
    if rows == 0 {
        return errors.New("insufficient balance or account does not exist")
    }

    return tx.Commit()
}
```
