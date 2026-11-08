# MCP Server Auto-Use

## Automatic Triggers

### context7 (Library/Framework Questions)
**Trigger Keywords**: "how to", "implement", "best practice", "pattern", "library", "framework", "package"

**Auto-Fetch Examples**:
- User: "Add authentication" → Fetch: "Next.js auth patterns 2026"
- User: "Create API endpoint" → Fetch: "REST API best practices"
- User: "Use WebSocket" → Fetch: "WebSocket implementation guide"

**Rule**: **ALWAYS** fetch docs BEFORE implementing unfamiliar patterns

### Other MCP Servers

| MCP Server | When to Use | Cost |
|------------|-------------|------|
| claude-in-chrome | UI changes, visual verification | High |
| github | PR/issue operations, git commands | Moderate |
| eslint | After EVERY code change (automatic) | Low |
| chrome-devtools | Performance audits, Lighthouse | Moderate |
| playwright | E2E testing, cross-browser | High |

## Cost Hierarchy

**Tier 1 (Use Liberally)**: eslint, context7  
**Tier 2 (Use When Needed)**: github, chrome-devtools  
**Tier 3 (Use Sparingly)**: claude-in-chrome, playwright

## Rules

1. Always try cheaper tools first (follow escalation protocol)
2. Run eslint automatically after code changes
3. Fetch docs with context7 BEFORE implementing
4. Use claude-in-chrome ONLY for visual verification
5. Use github for all GitHub operations

## Patterns & Examples
See `.claude/docs/MCP-INTEGRATION-GUIDE.md` for complete patterns, chaining examples, and cost optimization strategies.

## Fallback
- Browser unavailable → Use playwright MCP, or WebFetch for static pages
- GitHub unavailable → Use Bash with gh CLI
- ESLint unavailable → Use Bash with npm run lint
- Context7 unavailable → Use WebSearch
