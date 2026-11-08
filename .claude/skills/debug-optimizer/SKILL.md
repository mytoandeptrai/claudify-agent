# SKILL.md: Debug Mode Optimizer

## Description
Automatic optimization of debug mode workflows for maximum efficiency. Activates automatically in debug mode to coordinate tools, MCPs, skills, hooks, and rules.

## When to Use (Automatic Activation)
**This skill activates AUTOMATICALLY in debug mode for ALL tasks.**

**Purpose**: Coordinate all optimization mechanisms to minimize task completion time and token usage while maximizing quality.

---

## Automatic Optimizations

### 1. Tool Selection Optimization
**Automatic Triggers**:
```
Task analysis → Select optimal tools based on:
- Task type (exploration, implementation, validation)
- Complexity (number of files, steps)
- Required precision (exact vs conceptual)
- Cost hierarchy (Tier 1 → Tier 4)
```

**Optimization Rules**:
```
✓ ALWAYS start with Tier 1 tools (Read, Glob, Grep)
✓ Escalate one tier at a time only if needed
✓ NEVER use expensive tools when cheap tools work
✓ Track tool effectiveness for future optimization
```

---

### 2. MCP Server Optimization
**Automatic Triggers**:
```
File patterns + Keywords + Task type → Select optimal MCPs:
- components/**, "UI" → cursor-ide-browser
- __tests__/**, "E2E" → user-playwright
- "PR", "issue" → user-github
- "lint" → user-ESLint
- "docs", "how to" → user-context7
- "performance" → user-chrome-devtools
```

**Optimization Rules**:
```
✓ ALWAYS run user-ESLint after code changes (cheap, high value)
✓ ALWAYS fetch user-context7 before library implementation (prevents errors)
✓ Use cursor-ide-browser ONLY when visual verification essential
✓ Chain MCPs automatically for complex workflows
✓ Track MCP usage and cost for optimization
```

---

### 3. Parallel Subagent Optimization
**Automatic Triggers**:
```
Task complexity analysis → Launch parallel subagents:
- >3 areas mentioned → Launch 4 subagents
- >10 steps → Launch 3 subagents
- Bug investigation → Launch 4 subagents
- Large refactor (>5 files) → Launch 4 subagents
```

**Configuration** (Automatic):
```yaml
model: "fast"  # Cost optimization
readonly: true  # Safety
run_in_background: true  # Non-blocking
timeout: 120s  # Time-box per subagent
max_parallel: 4  # Diminishing returns after 4
```

---

### 4. Context Engineering Optimization
**Automatic Triggers**:
```
Task keywords + File patterns → Load relevant Tier 2 context:
- "test" → Testing context
- "API" → API development context
- "UI", "component" → UI/Styling context
- "performance" → Performance context
- "database" → Database context
- "security" → Security context
```

**Optimization Rules**:
```
✓ Load ONLY relevant context (avoid over-specification)
✓ Use Tier 1 (minimal) + Tier 2 (task-specific) injection
✓ Prune context after task completion
✓ Agent discovers details via search tools (not context)
```

---

### 5. Hook-Based Validation Optimization
**Automatic Triggers**:
```
After code changes (after_code_change hook):
- auto-lint-fix → Fix lint issues first
- auto-validate → Unified validation (lint + typecheck + tests + MCP)

After plan mode (plan_mode_exit hook):
- plan-quality-tracker → Track metrics and provide feedback
```

**Validation Pipeline** (Automatic):
```
1. Code change detected
2. after_code_change hook triggers
3. auto-lint-fix: Run ESLint, auto-fix
4. auto-validate: 
   - Lint check
   - Typecheck
   - Run tests
   - Validate MCP tools
5. Report results to user
```

---

## Debug-Specific Workflows

### Workflow 1: Feature Implementation (Optimized)
```
User: "Add user authentication with JWT"

Automatic Optimizations:
1. **Parallel Exploration** (4 subagents, 60s):
   - Find auth patterns
   - Find JWT libraries
   - Find existing auth code
   - Find auth tests

2. **Context Loading** (Tier 2):
   - Security context
   - API context

3. **MCP Chain**:
   - user-context7: Fetch JWT library docs
   - Implement feature
   - user-ESLint: Auto-lint
   - user-github: Create PR

4. **Validation Hooks**:
   - auto-lint-fix: Fix issues
   - auto-validate: Unified validation (includes MCP validation + tests)

Time: 5-7 minutes (vs 15-20 manual)
```

---

### Workflow 2: Bug Fix (Optimized)
```
User: "Fix checkout bug #456"

Automatic Optimizations:
1. **Parallel Exploration** (4 subagents, 90s):
   - Find checkout code
   - Find payment code
   - Find recent changes
   - Find similar issues

2. **Context Loading** (Tier 2):
   - API context (if API-related)
   - Database context (if DB-related)

3. **MCP Chain**:
   - user-github: Fetch issue #456
   - user-context7: Check payment docs (if needed)
   - Implement fix
   - user-ESLint: Auto-lint
   - user-github: Create PR

4. **Validation Hooks**:
   - auto-lint-fix: Fix issues
   - auto-validate: Unified validation (includes MCP validation + tests)

Time: 3-5 minutes (vs 10-15 manual)
```

---

### Workflow 3: Large Refactor (Optimized)
```
User: "Migrate from Prisma to Drizzle"

Automatic Optimizations:
1. **Parallel Exploration** (4 subagents, 120s):
   - Find all Prisma usage
   - Find all queries
   - Find all migrations
   - Find all tests

2. **Context Loading** (Tier 2):
   - Database context
   - Testing context

3. **MCP Chain**:
   - user-context7: Fetch Drizzle docs
   - Implement migration (incremental)
   - user-ESLint: Auto-lint after each change
   - test-runner: Run tests after each change

4. **Validation Hooks** (after each step):
   - auto-lint-fix: Fix issues
   - auto-validate: Run unified validation (includes tests)

Time: 20-30 minutes (vs 60-90 manual)
```

---

## Error Pattern Recognition

### Automatic Error Detection
```
Monitor for error patterns:
- ESLint errors → Trigger auto-lint-fix
- Test failures → Trigger auto-validate with debug mode
- Build errors → Fetch build docs via user-context7
- Runtime errors → Trigger browser debugging
```

### Automatic Recovery
```
Error detected → Automatic response:
1. Identify error type
2. Fetch relevant docs (user-context7)
3. Implement fix
4. Validate (lint + tests)
5. If still failing → Escalate to human
```

---

## Performance Metrics (Automatic Tracking)

### Track Per Task
```
- Task completion time
- Token consumption
- Tool calls count
- MCP calls count
- Validation gate pass rate
- User satisfaction (manual rating)
```

### Weekly Optimization Review
```
Analyze metrics:
- Which optimizations saved most time?
- Which tools/MCPs most effective?
- Where are bottlenecks?
- What can be further automated?
- Adjust rules and triggers accordingly
```

---

## Cost Optimization (Enforced)

### Token Budget Allocation
```
Tier 1 tools (Read, Glob, Grep): 40% of budget
Tier 2 tools (SemanticSearch, StrReplace): 30% of budget
Tier 3 tools (Task, Shell, ReadLints): 20% of budget
Tier 4 tools (Parallel subagents, Browser MCP): 10% of budget
```

### Automatic Cost Control
```
If task exceeds budget:
1. Warn user
2. Suggest scope reduction
3. Offer to continue with approval
```

---

## Examples

### Example 1: Add Dark Mode (Optimized)
User: "Add dark mode toggle to settings page"

**Automatic Optimizations**:
```
1. Parallel subagents (2, 45s):
   - "Find settings page structure"
   - "Find Tailwind dark mode examples"

2. Context loaded: UI/Styling

3. MCP chain:
   - user-context7: Tailwind dark mode docs
   - cursor-ide-browser: Verify UI
   - user-ESLint: Auto-lint

4. Hooks:
   - auto-lint-fix: ✅ Passed
   - auto-validate: ✅ All validations passed

Result: 4 minutes, 100% quality gates pass
```

---

### Example 2: Performance Audit (Optimized)
User: "Audit and improve dashboard performance"

**Automatic Optimizations**:
```
1. Parallel subagents (3, 90s):
   - "Find dashboard code"
   - "Find performance bottlenecks"
   - "Find optimization patterns"

2. Context loaded: Performance

3. MCP chain:
   - user-chrome-devtools: Lighthouse audit
   - cursor-ide-browser: CPU profiling
   - user-context7: React optimization docs
   - Implement optimizations
   - user-chrome-devtools: Re-audit

4. Hooks:
   - auto-validate: ✅ All validations passed (MCP + tests)

Result: 8 minutes, Lighthouse score 92 (from 67)
```

---

### Example 3: Security Review (Optimized)
User: "Review authentication for vulnerabilities"

**Automatic Optimizations**:
```
1. Parallel subagents (4, 90s):
   - "Find auth code"
   - "Find token validation"
   - "Find password handling"
   - "Find input validation"

2. Context loaded: Security

3. MCP chain:
   - user-context7: OWASP auth guidelines
   - Implement security fixes
   - user-ESLint: Auto-lint
   - test-runner: Run security tests

4. Hooks:
   - auto-lint-fix: ✅ Fixed 3 issues
   - test-runner: ✅ All tests pass

Result: 6 minutes, 5 vulnerabilities fixed
```

---

## Anti-Patterns (Automatically Avoided)

### ❌ Over-Automation
**Prevention**: Start with minimal automation, add only when pain points observed

### ❌ Context Bloat
**Prevention**: Enforce 20-line max per context file, use references over content

### ❌ MCP Cost Explosion
**Prevention**: Cost-awareness rules, prefer cheaper tools first, track usage

### ❌ Hook Failures Blocking Progress
**Prevention**: Hooks exit gracefully, agent continues if hooks fail

---

## Integration with Other Skills

### Works with:
- **mcp-mastery**: Coordinates MCP selection
- **tool-selection**: Optimizes tool choices
- **parallel-exploration**: Launches subagents efficiently

### Coordinates with:
- **Rules**: Enforces tool-auto-selection, parallel-exploration-auto, context tiers
- **Hooks**: Triggers validation pipeline
- **MCPs**: Chains multiple servers for complex workflows

---

**Note**: This skill activates automatically in debug mode. No manual intervention needed. All optimizations applied transparently to maximize efficiency.
