---
name: tool-selection
description: Decision trees for choosing the cheapest effective Claude Code tool (Read, Glob, Grep, Edit, Bash, Agent, MCP) per step. Use when planning steps or tool usage feels expensive.
---

# SKILL.md: Optimal Tool Selection

## Description
Automatically select best tools for each plan step based on task type, complexity, and available resources.

## When to Use
- Creating implementation plans
- Deciding which tools to use
- Optimizing workflow efficiency
- Troubleshooting tool failures

## Capabilities
- Tool selection decision tree
- Cost/complexity analysis
- Fallback tool identification
- Tool combination strategies

## Tool Selection Rules

### For Exploration

| Goal | Tool | When |
|------|------|------|
| Read single file | Read | Know exact path |
| Find multiple files | Glob + Read | Pattern matching |
| Exact text search | Grep | Specific strings/symbols |
| Conceptual search | Explore (quick) | Behavior/pattern |
| Broad exploration | Agent (Explore) | Multi-file investigation |

### For Implementation

| Goal | Tool | When |
|------|------|------|
| New file | Write | Creating from scratch |
| Small edit (<50 lines) | Edit | Targeted changes |
| Large rewrite (>50 lines) | Write | Replace entire file |
| Jupyter notebook | NotebookEdit | Cell-level edits |

### For Validation

| Goal | Tool | When |
|------|------|------|
| Code quality | Lint check | After edits |
| Functionality | Bash (tests) | Run test suite |
| Visual changes | Browser/Screenshot | UI verification |
| User feedback | AskUserQuestion | Decisions needed |

### For Complex Tasks

| Goal | Tool | When |
|------|------|------|
| Multi-step tracking | TodoWrite | 3+ steps |
| Ambiguous requirements | AskUserQuestion | Clarification needed |
| Risky changes | Checkpoints | Before breaking changes |
| Iterative fixes | fix-and-retest loop | Tests failing |

## Decision Trees

### "I need to find code"

```
Know file path?
├─ Yes → Read
└─ No
   ├─ Exact text/symbol?
   │  ├─ Yes → Grep
   │  └─ No
   │     ├─ Concept/behavior?
   │     │  ├─ Yes → Explore (quick)
   │     │  └─ No
   │     └─ Broad exploration?
   │        ├─ Yes → Agent (Explore)
   │        └─ No → Glob
```

### "I need to modify code"

```
Jupyter notebook?
├─ Yes → NotebookEdit
└─ No
   ├─ New file?
   │  ├─ Yes → Write
   │  └─ No
   │     ├─ <50 lines change?
   │     │  ├─ Yes → Edit
   │     │  └─ No → Write (replace entire file)
```

### "I need to verify"

```
Linting issues?
├─ Yes → Lint check
└─ No
   ├─ Tests needed?
   │  ├─ Yes → Bash (npm run test)
   │  └─ No
   │     ├─ Visual changes?
   │     │  ├─ Yes → Browser/Screenshot
   │     │  └─ No
   │     └─ User approval?
   │        ├─ Yes → AskUserQuestion
   │        └─ No → Continue
```

### "I need to automate browser"

```
Need performance profiling?
├─ Yes → chrome-devtools (performance traces)
└─ No
   ├─ Need Lighthouse audits?
   │  ├─ Yes → chrome-devtools
   │  └─ No
   │     ├─ Need cross-browser testing?
   │     │  ├─ Yes → playwright
   │     │  └─ No
   │     └─ Quick testing?
   │        ├─ Yes → claude-in-chrome (`/chrome`)
   │        └─ No → selenium (accessibility)
```

## Tool Cost Hierarchy

**Start cheap, escalate as needed:**

```
Tier 1 (Cheapest, fastest):
- Read (single file)
- Glob (file finding)
- Grep (exact text)

Tier 2 (Moderate cost):
- Explore (quick) (conceptual)
- Edit (edits)
- Write (new files)

Tier 3 (Higher cost):
- Agent (subagents)
- Bash (command execution)
- Lint check (analysis)

Tier 4 (Most expensive):
- Multiple parallel subagents
- Browser automation (MCP)
- Complex multi-tool workflows
```

## Tool Combinations

### Common Patterns

**Pattern 1: Feature Implementation**
```
1. Explore (quick): Find patterns
2. Read: Study examples
3. Write: Create new files
4. Bash: Run tests
5. Lint check: Verify quality
```

**Pattern 2: Bug Fix**
```
1. Grep: Find related code
2. Read: Understand issue
3. Edit: Fix code
4. Bash: Run tests
5. Lint check: Check quality
```

**Pattern 3: Refactor**
```
1. Agent (Explore): Map all usages
2. Explore (quick): Find patterns
3. Read: Review current code
4. Checkpoint: Before changes
5. Edit: Incremental changes
6. Bash: Run tests after each
7. Lint check: Verify quality
```

**Pattern 4: Code Review**
```
1. Glob: Find changed files
2. Read: Review diffs
3. Lint check: Check for issues
4. Bash: Run tests
5. AskUserQuestion: Clarify if needed
```

## Examples

### Example 1: Add API Endpoint

User: "Add /api/products endpoint"

Tool sequence:
1. **Explore (quick)**: "Find API route patterns"
   - Result: app/api/users/route.ts

2. **Read**: Existing route file
   - Understand pattern

3. **Write**: New route file
   - Create app/api/products/route.ts

4. **Bash**: Run tests
   - Command: npm run test -- products.test.ts

5. **Lint check**: Check for errors
   - Verify quality

**Why these tools**:
- Explore (quick): Find pattern (conceptual)
- Read: Study example (single file)
- Write: New file (creation)
- Bash: Validate (tests)
- Lint check: Quality gate

### Example 2: Refactor Authentication

User: "Refactor auth system"

Tool sequence:
1. **Agent (Explore)**: "Find all auth code"
   - Parallel: JWT, sessions, OAuth, hashing

2. **Explore (quick)**: "Find token validation"
   - Result: src/auth/validateToken.ts

3. **Read**: Auth files
   - Understand current implementation

4. **Checkpoint**: Before breaking changes
   - Rollback point

5. **Edit**: Incremental changes
   - Small, safe edits

6. **Bash**: Run auth tests
   - After each change

7. **Lint check**: Verify quality
   - Zero new lints

**Why these tools**:
- Agent: Broad exploration (complex)
- Explore (quick): Specific patterns
- Read: Understanding
- Checkpoint: Safety (risky change)
- Edit: Targeted edits
- Bash + Lint check: Validation

### Example 3: Fix Bug

User: "Fix login bug"

Tool sequence:
1. **Grep**: "Find login function"
   - Exact text search

2. **Read**: Login code
   - Understand issue

3. **Lint check**: Check for errors
   - Identify problems

4. **Edit**: Fix code
   - Targeted fix

5. **Bash**: Run login tests
   - Verify fix

6. **Lint check**: Final check
   - Quality gate

**Why these tools**:
- Grep: Exact search (cheap)
- Read: Understanding
- Lint check: Find issues
- Edit: Small fix
- Bash + Lint check: Validate

## Anti-Patterns

### ❌ Using Expensive Tools When Cheap Works

Bad: Agent subagent to find single file
Good: Read (know path) or Glob (pattern)

### ❌ Using Wrong Tool for Job

Bad: Grep for conceptual search
Good: Explore (quick) for behavior

### ❌ Skipping Validation

Bad: Edit without Lint check
Good: Always validate after substantive changes

### ❌ No Checkpoints for Risky Changes

Bad: Refactor without rollback
Good: Checkpoint before breaking changes

## Automatic Tool Selection Workflow

### Decision Matrix (Automatic, No User Input)

```
Task Type → Tool Sequence
─────────────────────────
"Find [symbol/text]" → Grep → Read
"Find [pattern/concept]" → Explore (quick) → Agent (if broad)
"Add [feature]" → Research patterns → Write/Edit → Lint check → Bash
"Fix [bug]" → Grep/Explore (quick) → Read → Edit → Lint check → Bash
"Refactor [X]" → Agent (Explore) → Checkpoint → Edit → Lint check → Bash
"Test [feature]" → Read existing tests → Write tests → Bash → Lint check
```

### MCP Server Selection (Automatic)

```
User Request → MCP Server
─────────────────────────
"UI", "visual", "browser" → claude-in-chrome
"PR", "issue", "github" → github
"lint", "quality" → eslint
"how to [library]", "[framework] setup" → context7
```

## Tool Escalation Protocol

**Rule**: Start with Tier 1, escalate only if needed

```
Tier 1 (Try First):
- Read: Know exact file path
- Glob: Pattern matching
- Grep: Exact text search

If Tier 1 fails → Escalate to Tier 2:
- Explore (quick): Conceptual search
- Edit: Small edits
- Write: New files

If Tier 2 insufficient → Escalate to Tier 3:
- Agent: Complex exploration
- Bash: Run commands/tests
- Lint check: Quality checks

If Tier 3 inadequate → Escalate to Tier 4:
- Parallel subagents: Multi-angle exploration
- Browser MCP: Visual verification
- Complex workflows: Multi-step automation
```

## Automatic Validation Rules

**After EVERY Code Change**:
1. Lint check on modified files
2. Fix introduced lints immediately
3. If tests exist → run relevant tests
4. Update TodoWrite if tracking

**Before EVERY Commit**:
1. Run full test suite
2. Run linter
3. Run typecheck
4. Create checkpoint if breaking change

## Examples

### Example: Automatic Tool Selection

User: "Add authentication to checkout"

Agent automatically selects:
1. **Explore (quick)**: "How is authentication implemented?" (Tier 2)
2. **Read**: `@src/auth/validateToken.ts` (Tier 1)
3. **Edit**: Add auth to checkout (Tier 2)
4. **Lint check**: Verify quality (Tier 3, automatic)
5. **Bash**: Run auth tests (Tier 3, automatic)

### Example: Automatic MCP Use

User: "Fix issue #123"

Agent automatically:
1. **github**: Fetch issue #123
2. **Grep**: Find related code
3. **Edit**: Implement fix
4. **eslint**: Check quality
5. **github**: Create PR linking issue

---

## Troubleshooting

### Tool Not Available

**Problem**: Selected tool not accessible

**Solutions**:
1. Check MCP server running
2. Use alternative tool
3. Fallback to manual approach

### Tool Taking Too Long

**Problem**: Tool execution slow

**Solutions**:
1. Use model="haiku" for subagents
2. Narrow scope (target_directories)
3. Try cheaper alternative
4. Time-box execution

### Tool Failing Repeatedly

**Problem**: Tool errors persist

**Solutions**:
1. Check parameters
2. Verify permissions
3. Try alternative approach
4. Report blocker
