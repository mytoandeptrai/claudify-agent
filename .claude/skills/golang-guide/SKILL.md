# Go (Golang) High-Performance Backend Skill

## 1. Idiomatic Go Architecture
- **Standard Project Layout:** Organize projects following standard Go conventions:
  - `cmd/<app>/main.go`: Application entrypoint.
  - `internal/`: Private application code (not importable by external packages).
  - `pkg/`: Public library code meant for external consumption.
- **Explicit Error Handling:** Never ignore errors with `_`. Always wrap errors with context: `fmt.Errorf("context: %w", err)`.
- **Interface Segregation:** Keep interfaces small (1-2 methods). Define interfaces where they are consumed, not where they are implemented.

## 2. Concurrency & Goroutine Safety
- Always guard concurrent access using `sync.Mutex` or `sync.RWMutex`.
- Use `sync.WaitGroup` or `errgroup.Group` for orchestrating parallel routines.
- Every long-running goroutine MUST accept and respect `context.Context` for cancellation and timeouts.
- Never leak goroutines: Ensure sender/receiver channels are properly drained and closed.

## 3. Local Verification Loop (Zero-Token Verification)
Run these commands locally before completing code changes:
```bash
go vet ./...              # Official compiler static analysis
golangci-lint run ./...   # Comprehensive linter suite
go test -race ./...       # Concurrency race condition detector
```

## 4. Anti-Patterns to Avoid
- ❌ Do NOT use `panic` for expected runtime errors. Reserve `panic` strictly for unrecoverable setup failures.
- ❌ Do NOT store `context.Context` inside a struct. Always pass `ctx` as the first function parameter.
- ❌ Do NOT pass huge structs by value; pass pointers when modifying or when structs exceed small footprint.
