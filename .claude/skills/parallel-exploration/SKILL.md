# SKILL.md: Parallel Exploration

## Description
Automatically launch multiple subagents in parallel for broad codebase exploration, reducing discovery time by 60-70%.

## When to Use
- Complex feature implementation (>5 files)
- Large refactors
- Bug investigation (root cause unknown)
- New codebase unfamiliarity
- Multi-part tasks

## Automatic Triggers

**Launch parallel subagents when**:
- User request mentions >3 different areas
- Task complexity: High (requires >10 steps)
- Codebase unfamiliarity detected
- Investigation phase taking >5 minutes

## Parallel Exploration Patterns

### Pattern 1: Feature Implementation

```
User: "Add user dashboard"

Parallel Subagents (model="fast", run_in_background=true):
1. "Find dashboard-like pages and layouts"
2. "Find API route patterns for data fetching"
3. "Find component structures for widgets"
4. "Find existing chart/visualization libraries"

Duration: 60s parallel (vs 240s sequential)
Output: Consolidated findings → Plan creation
```

### Pattern 2: Bug Investigation

```
User: "Checkout randomly fails"

Parallel Subagents:
1. "Find checkout flow code (UI → API → DB)"
2. "Find error handling in payment processing"
3. "Find recent changes to checkout files"
4. "Find similar issues/fixes in codebase"

Duration: 90s parallel
Output: Root cause hypothesis + fix locations
```

### Pattern 3: Large Refactor

```
User: "Migrate from JWT to sessions"

Parallel Subagents:
1. "Find all JWT validation code"
2. "Find all token generation code"
3. "Find all authentication middleware"
4. "Find all tests using JWT"

Duration: 120s parallel
Output: Complete migration map + risk assessment
```

## Subagent Configuration

```typescript
// Optimal configuration for parallel exploration
Task:
  description="Explore [specific area]"
  prompt="Find [specific pattern/code] in [target directory]"
  subagent_type="explore"
  model="fast"  // Cost optimization
  readonly=true  // Safety
  run_in_background=true  // Non-blocking
```

## Cost Optimization

**Subagent Cost Hierarchy**:
```
explore (fast model): $ (Use for discovery)
generalPurpose (fast): $$ (Use for analysis)
generalPurpose (capable): $$$ (Use for complex reasoning)
browser-use: $$$$ (Use only when browser needed)
```

**Mandatory Cost Rules**:
1. **ALWAYS** use `model="fast"` for exploration subagents (90% of cases)
2. **ONLY** use capable model for:
   - Complex reasoning tasks
   - Multi-step analysis
   - Security-critical reviews
3. **DOCUMENT** model choice in plan (justify if not "fast")
4. Use `readonly=true` unless modification needed
5. Use `run_in_background=true` for non-blocking
6. Limit to 4 parallel subagents max (diminishing returns)
7. Time-box to 120s max per subagent

**Cost Impact**: Using `model="fast"` reduces exploration costs by 50-70%

## Consolidation Strategy

**After parallel exploration completes**:

1. **Aggregate findings** from all subagents
2. **Identify overlaps** (multiple agents found same thing)
3. **Resolve conflicts** (contradictory findings)
4. **Create unified map** of codebase areas
5. **Generate plan** using consolidated knowledge

**Example Consolidation**:
```markdown
## Exploration Results (4 subagents, 60s parallel)

### Consensus Findings (found by multiple agents)
- Page structure: `app/[feature]/page.tsx` pattern
- API routes: `app/api/[resource]/route.ts`
- Components: `components/[feature]/` directory

### Unique Findings
- Agent 1: Found layout pattern in `app/layout.tsx`
- Agent 2: Found data fetching in `lib/fetcher.ts`
- Agent 3: Found component examples in `components/`
- Agent 4: Found chart library: Recharts in use

### Next Steps
- Follow `@app/profile/page.tsx` for page structure
- Use `@lib/fetcher.ts` for API calls
- Reference `@components/Card.tsx` for component pattern
```

## Examples

### Example 1: New Feature

User: "Add activity feed to user profile"

Automatic parallel exploration:
```
Subagent 1: "Find profile page structure"
Subagent 2: "Find feed/activity patterns"
Subagent 3: "Find API patterns for real-time data"
Subagent 4: "Find websocket/pubsub usage"

Result: Complete implementation map in 60s
```

### Example 2: Complex Bug

User: "User sessions expire prematurely"

Automatic parallel exploration:
```
Subagent 1: "Find session management code"
Subagent 2: "Find session expiration logic"
Subagent 3: "Find recent changes to auth files"
Subagent 4: "Find session-related tests"

Result: Root cause identified in 90s
```

### Example 3: Large Refactor

User: "Migrate from REST to GraphQL"

Automatic parallel exploration:
```
Subagent 1: "Find all REST API calls"
Subagent 2: "Find data fetching patterns"
Subagent 3: "Find existing GraphQL usage"
Subagent 4: "Find mutation operations"

Result: Complete migration strategy in 120s
```

## Anti-Patterns

❌ **Don't**:
- Launch >4 parallel subagents (chaos)
- Use capable model for simple exploration (waste)
- Run subagents sequentially (defeats purpose)
- Forget to consolidate findings (confusion)

✅ **Do**:
- Use `model="fast"` for exploration
- Launch 2-4 subagents in parallel
- Time-box to 120s max
- Consolidate findings before planning
- Reference specific files found
