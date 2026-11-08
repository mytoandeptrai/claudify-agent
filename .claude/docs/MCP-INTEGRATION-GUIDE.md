# MCP Integration Guide

## Overview

MCP (Model Context Protocol) servers extend Cursor agent capabilities with specialized tools for browser automation, GitHub operations, code quality, and documentation access.

## Available MCP Servers

### 1. cursor-ide-browser
**Purpose**: Browser automation and visual verification

**Tools**:
- `browser_snapshot`: Inspect page structure (ARIA tree)
- `browser_take_screenshot`: Capture visual state
- `browser_click`: Click elements by ref
- `browser_fill`: Fill forms
- `browser_scroll`: Navigate pages
- `browser_profile_start/stop`: CPU profiling

**When to Use**:
- UI changes need visual verification
- E2E testing required
- Performance profiling needed
- Design mockup matching

**Best Practices**:
1. Always use `browser_snapshot` before interactions
2. Use refs from snapshot (not coordinates)
3. Take fresh screenshot after each action
4. Use performance profiling only when optimization mentioned
5. Lock/unlock browser properly (don't call lock before navigate)

**Cost**: High ($$$$) → Use sparingly

---

### 2. user-github
**Purpose**: GitHub operations automation

**Tools**:
- Issue management (fetch, create, update)
- PR operations (create, review, merge)
- Repository management
- Branch operations

**When to Use**:
- Any git/GitHub operation
- Issue fixing workflows
- PR creation/review
- Code review automation

**Best Practices**:
1. Always fetch issue/PR details first
2. Link issues to commits automatically
3. Run tests before creating PR
4. Use conventional commit messages
5. Create PRs with proper descriptions

**Cost**: Moderate ($$) → Use for all git operations

---

### 3. user-ESLint
**Purpose**: Code quality automation

**Tools**:
- Automatic linting
- Auto-fix issues
- Quality reporting
- Rule customization

**When to Use**:
- AFTER EVERY code change (automatic)
- Before commits
- When user mentions quality/errors

**Best Practices**:
1. Run automatically after StrReplace/Write
2. Apply auto-fixes immediately
3. Report remaining issues to user
4. Fix before committing
5. Configure rules per project

**Cost**: Low ($) → Run automatically

---

### 4. user-context7
**Purpose**: Library/framework documentation

**Tools**:
- Fetch current docs
- API syntax verification
- Setup guides
- Version-specific information

**When to Use**:
- Library/framework questions
- Setup/configuration needed
- API syntax uncertain
- Best practices verification

**Best Practices**:
1. Fetch docs BEFORE implementing
2. Verify current best practices
3. Apply to implementation
4. Cite doc source
5. Check version compatibility

**Cost**: Low ($) → Fetch proactively

---

### 5. user-chrome-devtools
**Purpose**: Performance and accessibility audits

**Tools**:
- Lighthouse audits
- Performance metrics
- Accessibility checks
- Network analysis

**When to Use**:
- Performance optimization tasks
- Accessibility compliance
- Lighthouse score improvement
- Network optimization

**Best Practices**:
1. Run baseline audit first
2. Implement optimizations
3. Re-run audit to verify
4. Focus on low-hanging fruit
5. Track metrics over time

**Cost**: Moderate ($$) → Use for audits

---

### 6. user-playwright / user-selenium
**Purpose**: Cross-browser and E2E testing

**Tools**:
- Cross-browser testing
- E2E automation
- Accessibility testing
- Visual regression

**When to Use**:
- E2E test creation
- Cross-browser verification
- Accessibility compliance
- Visual regression testing

**Best Practices**:
1. Write tests in parallel with features
2. Test on multiple browsers
3. Include accessibility checks
4. Use page object pattern
5. Run in CI/CD pipeline

**Cost**: High ($$$$) → Use for comprehensive testing

---

## MCP Selection Decision Tree

```
Task Type → MCP Server
─────────────────────
UI/Browser changes?
├─ Yes → cursor-ide-browser
│  └─ Performance audit? → user-chrome-devtools
│  └─ E2E tests? → user-playwright
└─ No
   ├─ GitHub operations? → user-github
   ├─ Code quality check? → user-ESLint (automatic)
   ├─ Library docs needed? → user-context7
   └─ None → Standard tools only
```

---

## Cost Optimization Strategies

### Rule 1: Always Run ESLint
- Cost: Low
- Value: High (catches errors early)
- Trigger: Automatic after code changes

### Rule 2: Fetch Docs Proactively
- Cost: Low
- Value: High (prevents wrong implementations)
- Trigger: Library/framework mentioned

### Rule 3: Use Browser Sparingly
- Cost: High
- Value: High (visual verification)
- Trigger: Only when visual confirmation essential

### Rule 4: Automate Git Operations
- Cost: Moderate
- Value: High (saves time, reduces errors)
- Trigger: Any git/GitHub task

### Rule 5: Parallel Exploration
- Cost: Moderate (multiple subagents)
- Value: High (60-70% faster discovery)
- Trigger: Complex tasks, broad exploration

---

## MCP Usage Metrics

Track per MCP server:
- **Usage frequency**: How often used
- **Success rate**: Correlation with task success
- **Cost efficiency**: Value vs token consumption
- **User satisfaction**: Feedback scores

**Optimization**: Auto-disable MCPs with low success rates

---

## Examples

### Example 1: UI Feature Development

User: "Add dark mode toggle to settings"

MCP Sequence:
1. **user-context7**: Fetch Tailwind dark mode docs
2. **cursor-ide-browser**: 
   - Navigate to settings page
   - Verify toggle renders
   - Screenshot confirmation
3. **user-ESLint**: Check quality (automatic)

Total MCP cost: $$ (context7) + $$$ (browser) + $ (eslint) = $$$$
Time saved: 15 minutes manual verification

---

### Example 2: Bug Fix Workflow

User: "Fix checkout issue #456"

MCP Sequence:
1. **user-github**: Fetch issue #456 details
2. **user-context7**: Check payment library docs
3. **user-ESLint**: Verify fix quality (automatic)
4. **user-github**: Create PR linking issue

Total MCP cost: $$ (github) + $ (context7) + $ (eslint) + $$ (github) = $$$$
Time saved: 20 minutes manual operations

---

### Example 3: Performance Optimization

User: "Optimize dashboard loading"

MCP Sequence:
1. **user-chrome-devtools**: Lighthouse audit (baseline)
2. **cursor-ide-browser**: CPU profiling
3. **user-context7**: React optimization docs
4. **Implement optimizations**
5. **user-chrome-devtools**: Re-run audit (verify)

Total MCP cost: $$ (chrome) + $$$ (browser) + $ (context7) + $$ (chrome) = $$$$
Time saved: 30 minutes manual testing

---

## Troubleshooting

### MCP Not Available

**Problem**: Selected MCP server not accessible

**Solutions**:
1. Check MCP server is running: `Settings → MCP → [Server]`
2. Verify authentication if required
3. Use alternative tool if unavailable
4. Report missing MCP to admin

---

### MCP Taking Too Long

**Problem**: MCP execution slow

**Solutions**:
1. Narrow scope (e.g., specific URL for browser)
2. Use `model="fast"` for subagents
3. Time-box execution (max 120s)
4. Try cheaper alternative

---

### MCP Failing Repeatedly

**Problem**: MCP errors persist

**Solutions**:
1. Check parameters (URLs, refs, etc.)
2. Verify permissions/authentication
3. Try alternative approach
4. Report blocker to user

---

## Best Practices Summary

✅ **DO**:
- Run user-ESLint after ALL code changes
- Fetch user-context7 docs BEFORE library implementation
- Use cursor-ide-browser for visual verification
- Automate git operations with user-github
- Run performance audits for optimization tasks

❌ **DON'T**:
- Use browser MCP for non-visual tasks (waste)
- Skip ESLint validation (risky)
- Manual git operations when MCP available
- Fetch docs after implementation (too late)
- Use expensive MCPs when cheap alternatives work

---

## Maintenance

### Weekly Review
- Check MCP usage metrics
- Identify underperforming MCPs
- Update selection rules
- Refine cost optimization

### Monthly Optimization
- Analyze success correlations
- Update best practices
- Add new MCP patterns
- Remove unused MCPs

---

**Last Updated**: March 29, 2026
**License**: CC BY 4.0
