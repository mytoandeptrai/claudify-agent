---
name: mcp-mastery
description: Pick the right MCP server (claude-in-chrome, github, eslint, context7, chrome-devtools, playwright) for a task. Use for browser verification, GitHub ops, lint, library docs, performance audits or E2E tests.
---

# SKILL.md: MCP Server Mastery

## Description
Automatic selection and optimal use of available MCP servers for maximum efficiency. Activates automatically based on task analysis.

## When to Use (Automatic Triggers)
**This skill activates AUTOMATICALLY when**:
- Any task involving browser automation
- GitHub operations (PRs, issues)
- Code quality checks
- Library/framework documentation needs
- Performance optimization tasks
- E2E testing requirements

**No manual activation needed** - MCP selection happens automatically based on:
- User request keywords
- File patterns being modified
- Task complexity and type
- Error patterns detected

## Available MCP Servers

### 1. claude-in-chrome
**Capabilities**:
- Browser automation in your real Chrome (navigate, click, fill, scroll) — enable with `/chrome`
- Visual verification (screenshots, page reads)
- Console/network inspection

**Automatic Triggers**:
- User mentions: "UI", "visual", "frontend", "browser test"
- Changes to: `components/`, `app/`, `pages/`
- Task involves: Design matching, E2E testing

**Optimal Usage Pattern**:
```
1. navigate → read_page (accessibility tree)
2. Identify element refs from the page read
3. Interact via refs (computer click, form_input)
4. computer screenshot (verify)
5. Use chrome-devtools for profiling if optimization mentioned
```

**Cost**: High → Use sparingly, only when visual verification needed

### 2. github
**Capabilities**:
- Issue/PR management
- Repository operations
- Code review automation
- Branch management

**Automatic Triggers**:
- User mentions: "PR", "issue", "branch", "commit"
- Commands: `/pr`, `/fix-issue`, `/review`

**Optimal Usage Pattern**:
```
1. Fetch issue/PR details
2. Implement changes
3. Run tests/lints
4. Create/update PR automatically
5. Link issues
```

**Cost**: Moderate → Use for all git operations

### 3. eslint
**Capabilities**:
- Automatic linting
- Auto-fix issues
- Quality reporting

**Automatic Triggers**:
- After EVERY substantive code change
- User mentions: "lint", "quality", "errors"

**Optimal Usage Pattern**:
```
1. Run ESLint on changed files (automatic)
2. Apply auto-fixes
3. Report remaining issues
4. Fix before committing
```

**Cost**: Low → Run automatically after all edits

### 4. context7
**Capabilities**:
- Fetch current library docs
- API syntax verification
- Setup/configuration guides
- Version-specific information

**Automatic Triggers**:
- Questions about libraries/frameworks
- Setup/configuration needed
- API syntax uncertain

**Optimal Usage Pattern**:
```
1. Fetch docs BEFORE implementing
2. Verify current best practices
3. Apply to implementation
4. Cite doc source
```

**Cost**: Low → Fetch proactively for library work

### 5. chrome-devtools
**Capabilities**:
- Lighthouse audits
- Performance metrics
- Accessibility checks

**Automatic Triggers**:
- User mentions: "performance", "lighthouse", "accessibility"
- Optimization tasks

**Cost**: Moderate → Use for performance audits

### 6. playwright / selenium
**Capabilities**:
- Cross-browser testing
- E2E automation
- Accessibility testing

**Automatic Triggers**:
- E2E testing needed
- Cross-browser verification
- Accessibility compliance

**Cost**: High → Use for comprehensive testing

## MCP Selection Decision Tree

```
Task involves browser/UI?
├─ Yes → claude-in-chrome
│  └─ Performance audit? → chrome-devtools
│  └─ E2E tests? → playwright
└─ No
   ├─ GitHub operations? → github
   ├─ Code quality? → eslint (automatic)
   ├─ Library docs? → context7
   └─ None → Standard tools only
```

## Cost Optimization Rules (Automatically Enforced)

1. **Always run eslint** after code changes (low cost, high value)
2. **Fetch context7** before library implementation (prevents errors)
3. **Use claude-in-chrome** only when visual verification essential
4. **Prefer github** over manual git commands (automation)
5. **Run performance audits** only when performance mentioned
6. **Start with Tier 1 MCPs** (cheap) before Tier 2-3 (expensive)
7. **Chain MCPs automatically** for complex workflows (see examples)
8. **Track MCP usage** in .claude/mcp-usage-log.md for optimization

## Auto-Triggers

**These triggers are monitored automatically**:

```
File Change Detection:
- components/**, app/**, pages/** → claude-in-chrome
- __tests__/**, e2e/** → playwright
- *.ts, *.tsx → eslint (after changes)

Keyword Detection:
- "PR", "issue", "branch" → github
- "lint", "quality" → eslint
- "how to", "docs", "API" → context7
- "performance", "optimize" → chrome-devtools + claude-in-chrome

Error Detection:
- ESLint errors → eslint (auto-fix mode)
- Test failures → playwright (headed run / trace viewer)
- Build errors → context7 (fetch build docs)
```

## Examples

### Example 1: UI Feature Development

User: "Add dark mode toggle to settings"

MCP Sequence:
1. **context7**: Fetch Tailwind dark mode docs
2. **claude-in-chrome**: 
   - Navigate to settings page
   - Verify toggle renders correctly
   - Screenshot for confirmation
3. **eslint**: Check code quality (automatic)

### Example 2: Bug Fix Workflow

User: "Fix checkout issue #456"

MCP Sequence:
1. **github**: Fetch issue #456 details
2. **context7**: Check payment library docs
3. **eslint**: Verify fix quality (automatic)
4. **github**: Create PR linking issue

### Example 3: Performance Optimization

User: "Optimize dashboard loading"

MCP Sequence:
1. **chrome-devtools**: Run Lighthouse audit
2. **chrome-devtools**: Profile CPU usage
3. **context7**: Fetch React optimization docs
4. **chrome-devtools**: Re-run audit to verify improvement
