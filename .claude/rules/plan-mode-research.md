# Plan Mode Pre-Plan Research

## Automatic Research Steps (Before ANY Plan)

1. **SemanticSearch** (30s)
   - Query: "How is [similar feature] implemented?"
   - Target: Most relevant directory

2. **Task Subagents** (60s, parallel)
   - Launch 2-4 explore subagents
   - Use model="fast", run_in_background=true

3. **ReadLints** (15s)
   - Check target files for existing issues

4. **AskQuestion** (if ambiguous)
   - Batch ALL questions in ONE call

## Output
- Summary of findings
- Reference files for patterns
- Clarified requirements (if asked)

## Examples

**Feature**: "Add user dashboard" → Research page/component patterns  
**Bug**: "Fix auth bug" → Research auth implementation  
**Refactor**: "Refactor checkout" → Research checkout code

## Rules
- Never plan without research (2-3 min max)
- Use parallel subagents for complex tasks
- Batch questions with AskQuestion
- Follow patterns found in codebase
