# MCP Server Auto-Use

## Automatic Triggers

### user-context7 (Library/Framework Questions)
**Trigger Keywords**: "how to", "implement", "best practice", "pattern", "library", "framework", "package"

**Auto-Fetch Examples**:
- User: "Add authentication" → Fetch: "Next.js auth patterns 2026"
- User: "Create API endpoint" → Fetch: "REST API best practices"
- User: "Use WebSocket" → Fetch: "WebSocket implementation guide"

**Rule**: **ALWAYS** fetch docs BEFORE implementing unfamiliar patterns

### Other MCP Servers

| MCP Server | When to Use | Cost |
|------------|-------------|------|
| cursor-ide-browser | UI changes, visual verification | High |
| user-github | PR/issue operations, git commands | Moderate |
| user-ESLint | After EVERY code change (automatic) | Low |
| user-chrome-devtools | Performance audits, Lighthouse | Moderate |
| user-playwright | E2E testing, cross-browser | High |

## Cost Hierarchy

**Tier 1 (Use Liberally)**: user-ESLint, user-context7  
**Tier 2 (Use When Needed)**: user-github, user-chrome-devtools  
**Tier 3 (Use Sparingly)**: cursor-ide-browser, user-playwright

## Rules

1. Always try cheaper tools first (follow escalation protocol)
2. Run user-ESLint automatically after code changes
3. Fetch docs with user-context7 BEFORE implementing
4. Use cursor-ide-browser ONLY for visual verification
5. Use user-github for all GitHub operations

## Patterns & Examples
See `.cursor/docs/MCP-INTEGRATION-GUIDE.md` for complete patterns, chaining examples, and cost optimization strategies.

## Fallback
- Browser unavailable → Use built-in Browser tools
- GitHub unavailable → Use Shell with gh CLI
- ESLint unavailable → Use Shell with npm run lint
- Context7 unavailable → Use WebSearch
