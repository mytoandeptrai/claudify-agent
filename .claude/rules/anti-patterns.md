# Anti-Pattern Detection

## Triggers
Detected automatically by learning-loop skill from plan-metrics.json

## Common Anti-Patterns
- Over-engineering (using expensive tools unnecessarily)
- Planning without research (no SemanticSearch)
- Repeated failures (low accuracy x3)
- MCP overuse (>3 MCPs with low accuracy)
- Skipping validation (no ReadLints/tests)

## Actions
1. Review `.cursor/plan-metrics.json` for patterns
2. Run `/learning-loop-analyze` for detailed report
3. Update rules only for repeated patterns (3+ occurrences)

## Prevention
- Follow tool escalation protocol (Tier 1 → Tier 4)
- Always research before planning
- Auto-validate after changes
- Keep rules minimal (<20 lines)
