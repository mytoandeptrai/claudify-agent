# SKILL.md: MCP Server Mastery

## Description
Automatic selection and optimal use of available MCP servers for maximum efficiency. Activates automatically based on task analysis in debug mode.

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

### 1. cursor-ide-browser
**Capabilities**:
- Browser automation (navigate, click, fill, scroll)
- Visual verification (screenshots, snapshots)
- Performance profiling (CPU, timing)
- Console/network inspection

**Automatic Triggers**:
- User mentions: "UI", "visual", "frontend", "browser test"
- Changes to: `components/`, `app/`, `pages/`
- Task involves: Design matching, E2E testing

**Optimal Usage Pattern**:
```
1. browser_snapshot (take_screenshot: true)
2. Identify refs from snapshot
3. Interact via refs (browser_click, browser_fill)
4. browser_take_screenshot (verify)
5. Use performance profiling if optimization mentioned
```

**Cost**: High → Use sparingly, only when visual verification needed

### 2. user-github
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

### 3. user-ESLint
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

### 4. user-context7
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

### 5. user-chrome-devtools
**Capabilities**:
- Lighthouse audits
- Performance metrics
- Accessibility checks

**Automatic Triggers**:
- User mentions: "performance", "lighthouse", "accessibility"
- Optimization tasks

**Cost**: Moderate → Use for performance audits

### 6. user-playwright / user-selenium
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
├─ Yes → cursor-ide-browser
│  └─ Performance audit? → user-chrome-devtools
│  └─ E2E tests? → user-playwright
└─ No
   ├─ GitHub operations? → user-github
   ├─ Code quality? → user-ESLint (automatic)
   ├─ Library docs? → user-context7
   └─ None → Standard tools only
```

## Cost Optimization Rules (Automatically Enforced)

1. **Always run user-ESLint** after code changes (low cost, high value)
2. **Fetch user-context7** before library implementation (prevents errors)
3. **Use cursor-ide-browser** only when visual verification essential
4. **Prefer user-github** over manual git commands (automation)
5. **Run performance audits** only when performance mentioned
6. **Start with Tier 1 MCPs** (cheap) before Tier 2-3 (expensive)
7. **Chain MCPs automatically** for complex workflows (see examples)
8. **Track MCP usage** in .cursor/mcp-usage-log.md for optimization

## Debug Mode Auto-Triggers

**In debug mode, these triggers are AUTOMATICALLY monitored**:

```
File Change Detection:
- components/**, app/**, pages/** → cursor-ide-browser
- __tests__/**, e2e/** → user-playwright
- *.ts, *.tsx → user-ESLint (after changes)

Keyword Detection:
- "PR", "issue", "branch" → user-github
- "lint", "quality" → user-ESLint
- "how to", "docs", "API" → user-context7
- "performance", "optimize" → user-chrome-devtools + cursor-ide-browser

Error Detection:
- ESLint errors → user-ESLint (auto-fix mode)
- Test failures → user-playwright (debug mode)
- Build errors → user-context7 (fetch build docs)
```

## Examples

### Example 1: UI Feature Development

User: "Add dark mode toggle to settings"

MCP Sequence:
1. **user-context7**: Fetch Tailwind dark mode docs
2. **cursor-ide-browser**: 
   - Navigate to settings page
   - Verify toggle renders correctly
   - Screenshot for confirmation
3. **user-ESLint**: Check code quality (automatic)

### Example 2: Bug Fix Workflow

User: "Fix checkout issue #456"

MCP Sequence:
1. **user-github**: Fetch issue #456 details
2. **user-context7**: Check payment library docs
3. **user-ESLint**: Verify fix quality (automatic)
4. **user-github**: Create PR linking issue

### Example 3: Performance Optimization

User: "Optimize dashboard loading"

MCP Sequence:
1. **user-chrome-devtools**: Run Lighthouse audit
2. **cursor-ide-browser**: Profile CPU usage
3. **user-context7**: Fetch React optimization docs
4. **user-chrome-devtools**: Re-run audit to verify improvement
