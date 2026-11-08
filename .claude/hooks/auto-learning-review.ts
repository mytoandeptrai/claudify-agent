// .cursor/hooks/auto-learning-review.ts
// Automated weekly learning loop review - runs every 10 plans or weekly

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const METRICS_FILE = join(process.cwd(), ".cursor/plan-metrics.json");
const WEEKLY_REPORT_FILE = join(process.cwd(), ".cursor/weekly-learning-report.md");
const ANTI_PATTERNS_FILE = join(process.cwd(), ".cursor/rules/anti-patterns.md");

interface PlanMetrics {
  plan_accuracy: number;
  iteration_count: number;
  tool_efficiency: number;
  cost_estimate?: number;
  anti_patterns_detected?: string[];
  timestamp: string;
}

interface AntiPattern {
  id: string;
  name: string;
  count: number;
  lastOccurrence: string;
  suggestion: string;
}

// Read input from stdin (hook trigger)
const stdin = await new Promise<string>((resolve) => {
  let data = "";
  process.stdin.on("data", (chunk) => (data += chunk));
  process.stdin.on("end", () => resolve(data));
});

console.error("[Auto Learning Review] Starting automated review...");

// Load metrics
if (!existsSync(METRICS_FILE)) {
  console.error("[Auto Learning Review] No metrics file found. Run some plans first.");
  process.exit(0);
}

const allMetrics: PlanMetrics[] = JSON.parse(readFileSync(METRICS_FILE, "utf-8"));
const recentMetrics = allMetrics.slice(-10); // Last 10 plans

if (recentMetrics.length < 3) {
  console.error("[Auto Learning Review] Not enough data (need 3+ plans). Current:", recentMetrics.length);
  process.exit(0);
}

// Calculate averages
const avgAccuracy = recentMetrics.reduce((sum, m) => sum + m.plan_accuracy, 0) / recentMetrics.length;
const avgIterations = recentMetrics.reduce((sum, m) => sum + m.iteration_count, 0) / recentMetrics.length;
const avgEfficiency = recentMetrics.reduce((sum, m) => sum + m.tool_efficiency, 0) / recentMetrics.length;
const totalCost = recentMetrics.reduce((sum, m) => sum + (m.cost_estimate || 0), 0);

// Detect patterns
const patternCounts: Record<string, number> = {};
recentMetrics.forEach(m => {
  if (m.anti_patterns_detected) {
    m.anti_patterns_detected.forEach(pattern => {
      patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
    });
  }
});

// Identify repeated patterns (3+ occurrences)
const repeatedPatterns: AntiPattern[] = Object.entries(patternCounts)
  .filter(([_, count]) => count >= 3)
  .map(([name, count]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    count,
    lastOccurrence: recentMetrics.find(m => m.anti_patterns_detected?.includes(name))?.timestamp || '',
    suggestion: getSuggestionForPattern(name)
  }));

// Generate report
const report = generateReport({
  planCount: recentMetrics.length,
  avgAccuracy,
  avgIterations,
  avgEfficiency,
  totalCost,
  repeatedPatterns,
  trend: calculateTrend(recentMetrics)
});

// Write report
writeFileSync(WEEKLY_REPORT_FILE, report, 'utf-8');
console.error(`[Auto Learning Review] Report generated: ${WEEKLY_REPORT_FILE}`);

// Auto-update rules if patterns detected
if (repeatedPatterns.length > 0) {
  console.error(`[Auto Learning Review] Detected ${repeatedPatterns.length} repeated patterns (3+ occurrences)`);
  console.error("[Auto Learning Review] Review .cursor/weekly-learning-report.md for details");
} else {
  console.error("[Auto Learning Review] No repeated patterns detected. Great job!");
}

function getSuggestionForPattern(patternName: string): string {
  const suggestions: Record<string, string> = {
    "Over-Engineering": "Follow tool escalation protocol: Tier 1 (Read/Glob/Grep) → Tier 2 → Tier 3 → Tier 4",
    "Planning Without Research": "Always run SemanticSearch before creating plans. Spend 2-3 min on research.",
    "Repeated Execution Failures": "Add validation subagent before plan execution. Create checkpoints.",
    "MCP Overuse": "Use MCP tools only when essential. Prefer built-in tools for simple tasks.",
    "Skipping Validation": "Enable auto-validate hook. Run ReadLints after EVERY code change.",
    "Context Bloat": "Keep rules under 20 lines. Use references over content."
  };
  return suggestions[patternName] || "Review pattern in learning-loop skill documentation.";
}

function calculateTrend(metrics: PlanMetrics[]): "improving" | "stable" | "declining" {
  if (metrics.length < 5) return "stable";
  
  const firstHalf = metrics.slice(0, Math.floor(metrics.length / 2));
  const secondHalf = metrics.slice(Math.floor(metrics.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, m) => sum + m.plan_accuracy, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, m) => sum + m.plan_accuracy, 0) / secondHalf.length;
  
  if (secondAvg > firstAvg + 5) return "improving";
  if (secondAvg < firstAvg - 5) return "declining";
  return "stable";
}

function generateReport(data: any): string {
  const date = new Date().toISOString().split('T')[0];
  
  return `# Weekly Learning Report

**Generated**: ${date}  
**Analysis Period**: Last ${data.planCount} plans  
**Trend**: ${data.trend.toUpperCase()}

---

## Performance Summary

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Avg Accuracy | ${data.avgAccuracy.toFixed(1)}% | >80% | ${data.avgAccuracy >= 80 ? '✅' : '⚠️'} |
| Avg Iterations | ${data.avgIterations.toFixed(1)} | <2.0 | ${data.avgIterations < 2 ? '✅' : '⚠️'} |
| Tool Efficiency | ${data.avgEfficiency.toFixed(1)}% | >70% | ${data.avgEfficiency >= 70 ? '✅' : '⚠️'} |
| Total Cost | ${data.totalCost.toLocaleString()} tokens | Optimize | ${data.totalCost < 100000 ? '✅' : '⚠️'} |

---

## Repeated Patterns Detected (3+ Occurrences)

${data.repeatedPatterns.length > 0 ? data.repeatedPatterns.map((p: AntiPattern) => `### ${p.name}

**Occurrences**: ${p.count} times  
**Last Seen**: ${p.lastOccurrence || 'Unknown'}  
**Suggestion**: ${p.suggestion}

---
`).join('\n') : '✅ No repeated patterns detected! Great job maintaining best practices.'}

## Action Items

${data.repeatedPatterns.length > 0 ? `
### Critical (Fix This Week)
${data.repeatedPatterns.filter((p: AntiPattern) => p.count >= 5).map((p: AntiPattern) => `- [ ] ${p.name}: ${p.suggestion}`).join('\n') || '- [ ] None'}

### Important (Fix Next Week)
${data.repeatedPatterns.filter((p: AntiPattern) => p.count >= 3 && p.count < 5).map((p: AntiPattern) => `- [ ] ${p.name}: ${p.suggestion}`).join('\n') || '- [ ] None'}
` : `
### Continue Current Practices
- [ ] Maintain research-first approach
- [ ] Keep following tool escalation protocol
- [ ] Continue automatic validation
`}

---

## Trend Analysis

${data.trend === 'improving' ? '📈 **Performance is IMPROVING** - Keep doing what works!' : 
  data.trend === 'declining' ? '📉 **Performance is DECLINING** - Review recent changes and patterns.' : 
  '➡️ **Performance is STABLE** - Look for optimization opportunities.'}

---

## Next Review

**Scheduled**: In 10 plans or 7 days (whichever comes first)  
**Focus Areas**: 
${data.repeatedPatterns.length > 0 ? data.repeatedPatterns.slice(0, 3).map((p: AntiPattern) => `- ${p.name}`) : '- Continue monitoring current practices'}

---

*This report was automatically generated by the auto-learning-review hook*
`;
}
