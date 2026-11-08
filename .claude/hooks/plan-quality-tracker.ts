// .claude/hooks/plan-quality-tracker.ts
// Stop hook — plan metrics tracking from the real tool usage in the Claude Code transcript

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import {
  readHookInput,
  loadCurrentTurn,
  mcpServer,
  stateDir,
  notify,
  done,
  SUBAGENT_TOOLS,
  type Turn,
} from "./lib/claude-hook.ts";

interface AntiPattern {
  id: string;
  name: string;
  description: string;
  detectionRule: (metrics: PlanMetrics[]) => boolean;
  suggestion: string;
  severity: "critical" | "high" | "medium" | "low";
}

interface PlanMetrics {
  plan_accuracy: number;
  time_variance: number;
  tool_usage: Record<string, number>;
  iteration_count: number;
  blocker_count: number;
  timestamp: string;
  plan_type: string;
  mcp_usage: Record<string, number>;
  tool_efficiency: number;
  parallel_subagents: number;
  mcp_tools_used: string[];
  failed_tools: string[];
  conversation_duration_ms?: number;
  cost_estimate?: number;
  anti_patterns_detected?: string[];
  repeated_mistakes?: string[];
  session_id?: string;
  turn_id?: string;
}

interface PatternAnalysis {
  detectedPatterns: AntiPattern[];
  repeatedMistakes: string[];
  improvementSuggestions: string[];
  trendDirection: "improving" | "stable" | "declining";
}

interface ToolCall {
  name: string;
  execution_time_ms?: number;
  success: boolean;
  mcp_server?: string;
}

interface HooksConfig {
  planTracking?: {
    trackMetrics?: boolean;
    accuracyThreshold?: number;
    efficiencyThreshold?: number;
    maxIterations?: number;
    provideFeedback?: boolean;
    enableCostTracking?: boolean;
    enablePatternAnalysis?: boolean;
  };
}

const input = await readHookInput();

const METRICS_FILE = join(stateDir(input), "plan-metrics.json");

// Load configuration
const configPath = join(stateDir(input), 'hooks.config.json');
const config: HooksConfig = existsSync(configPath) 
  ? JSON.parse(readFileSync(configPath, 'utf-8')) 
  : {};

const planTrackingConfig = {
  trackMetrics: config.planTracking?.trackMetrics !== false,
  accuracyThreshold: config.planTracking?.accuracyThreshold || 70,
  efficiencyThreshold: config.planTracking?.efficiencyThreshold || 60,
  maxIterations: config.planTracking?.maxIterations || 5,
  provideFeedback: config.planTracking?.provideFeedback !== false,
  enableCostTracking: config.planTracking?.enableCostTracking !== false,
  enablePatternAnalysis: config.planTracking?.enablePatternAnalysis !== false
};

console.error(`[Plan Tracker] Processing execution data for session ${input.session_id}...`);

// Helper functions
function extractToolCalls(turn: Turn): ToolCall[] {
  return turn.toolUses.map(t => ({
    name: t.name,
    success: !t.isError,
    mcp_server: mcpServer(t.name)
  }));
}

function countParallelSubagents(turn: Turn): number {
  return turn.toolUses.filter(t => SUBAGENT_TOOLS.includes(t.name)).length;
}

function detectPlanType(turn: Turn): string {
  if (turn.toolUses.some(t => t.name === 'ExitPlanMode')) return 'plan-mode';
  
  const conversationText = JSON.stringify(turn.entries).toLowerCase();
  
  if (conversationText.includes('plan mode')) return 'plan-mode';
  if (conversationText.includes('browser') || conversationText.includes('web')) return 'browser-automation';
  if (conversationText.includes('github') || conversationText.includes('pr') || conversationText.includes('issue')) return 'github-ops';
  if (conversationText.includes('test')) return 'testing';
  if (conversationText.includes('refactor')) return 'refactoring';
  if (conversationText.includes('bug') || conversationText.includes('fix')) return 'bug-fix';
  if (conversationText.includes('feature') || conversationText.includes('implement')) return 'feature-development';
  
  return 'general';
}

// Iterations = failed tool calls that had to be retried (failed tests, lint, edits...)
function calculatePlanAccuracy(iterations: number): number {
  // Fewer iterations = higher accuracy
  if (iterations === 0) return 100;
  if (iterations <= 2) return 85;
  if (iterations <= 5) return 70;
  return 50;
}

function calculateToolEfficiency(tools: ToolCall[]): number {
  if (tools.length === 0) return 75; // Neutral score if no tools
  
  // Tier 1: Simple tools (Bash, Read, Edit, Write, Glob, Grep)
  // Tier 2: Analysis (LSP)
  // Tier 3: Complex (Agent/Task subagents, WebSearch, WebFetch)
  // Tier 4: MCP tools (mcp__*)
  
  const tierScores: Record<string, number> = {
    'Bash': 100, 'Read': 100, 'Edit': 100, 'MultiEdit': 100, 'Write': 100, 'Glob': 100, 'Grep': 100,
    'LSP': 80,
    'Agent': 60, 'Task': 60, 'WebSearch': 60, 'WebFetch': 60,
  };
  
  let totalScore = 0;
  let toolCount = 0;
  
  for (const tool of tools) {
    if (tool.mcp_server) {
      totalScore += 40; // MCP tools are most expensive
      toolCount++;
    } else {
      const tierScore = tierScores[tool.name] || 75; // Default to middle tier
      totalScore += tierScore;
      toolCount++;
    }
  }
  
  return toolCount > 0 ? Math.round(totalScore / toolCount) : 75;
}

function estimateCost(tools: ToolCall[]): number {
  // Estimated token cost per tool type
  const costEstimates: Record<string, number> = {
    'Bash': 100, 'Read': 500, 'Edit': 800, 'MultiEdit': 1000, 'Write': 1000, 'Glob': 200, 'Grep': 300,
    'LSP': 800,
    'Agent': 3000, 'Task': 3000, 'WebSearch': 2000, 'WebFetch': 2500,
  };
  
  let totalCost = 0;
  for (const tool of tools) {
    if (tool.mcp_server) {
      totalCost += 5000; // MCP tools estimated higher cost
    } else {
      totalCost += costEstimates[tool.name] || 1000;
    }
  }
  
  return totalCost;
}

// Anti-pattern definitions based on AGENT-INSTRUCTION-BEST-PRACTICES.md
const ANTI_PATTERNS: AntiPattern[] = [
  {
    id: "over-engineering",
    name: "Over-Engineering",
    description: "Using expensive tools when cheaper alternatives would work",
    detectionRule: (metrics: PlanMetrics[]) => {
      if (metrics.length < 3) return false;
      const recent = metrics.slice(-3);
      const avgEfficiency = recent.reduce((sum, m) => sum + (m.tool_efficiency || 75), 0) / recent.length;
      return avgEfficiency < 50;
    },
    suggestion: "Start with Tier 1 tools (Read, Grep, Glob) before escalating to Tier 3-4",
    severity: "high"
  },
  {
    id: "no-research",
    name: "Planning Without Research",
    description: "Creating plans without using Grep/Glob or Explore subagents",
    detectionRule: (metrics: PlanMetrics[]) => {
      if (metrics.length < 3) return false;
      const recent = metrics.slice(-3);
      return recent.every(m => !m.tool_usage['Grep'] && !m.tool_usage['Glob'] && m.parallel_subagents === 0);
    },
    suggestion: "Always research with Grep/Glob and parallel Explore subagents before planning complex features",
    severity: "critical"
  },
  {
    id: "repeated-failures",
    name: "Repeated Execution Failures",
    description: "Multiple consecutive plans with low accuracy or high iterations",
    detectionRule: (metrics: PlanMetrics[]) => {
      if (metrics.length < 3) return false;
      const recent = metrics.slice(-3);
      const lowAccuracy = recent.filter(m => m.plan_accuracy < 60).length;
      return lowAccuracy >= 2;
    },
    suggestion: "Review plan validation process, add more thorough feasibility checks",
    severity: "critical"
  },
  {
    id: "mcp-overuse",
    name: "MCP Overuse",
    description: "Using MCP tools for tasks that don't require them",
    detectionRule: (metrics: PlanMetrics[]) => {
      if (metrics.length < 3) return false;
      const recent = metrics.slice(-3);
      const highMCPUsage = recent.filter(m => Object.keys(m.mcp_usage).length > 3).length;
      const lowAccuracy = recent.filter(m => m.plan_accuracy < 70).length;
      return highMCPUsage >= 2 && lowAccuracy >= 2;
    },
    suggestion: "Use MCP tools only when essential (visual verification, git ops, docs)",
    severity: "medium"
  },
  {
    id: "no-validation",
    name: "Skipping Validation",
    description: "Not running lint/typecheck or tests after code changes",
    detectionRule: (metrics: PlanMetrics[]) => {
      if (metrics.length < 3) return false;
      const recent = metrics.slice(-3);
      return recent.every(m => !m.tool_usage['Bash']);
    },
    suggestion: "Always run lint/typecheck (Bash) after edits and tests after substantive changes",
    severity: "high"
  },
  {
    id: "context-bloat",
    name: "Context Bloat",
    description: "Loading too much context, violating minimalism principle",
    detectionRule: (metrics: PlanMetrics[]) => {
      // Detect via low efficiency + high iteration pattern
      if (metrics.length < 3) return false;
      const recent = metrics.slice(-3);
      return recent.every(m => m.iteration_count > 3 && m.tool_efficiency < 60);
    },
    suggestion: "Apply tiered injection, use references over content, keep rules under 20 lines",
    severity: "medium"
  }
];

function detectAntiPatterns(metrics: PlanMetrics[]): AntiPattern[] {
  const detected: AntiPattern[] = [];
  
  for (const pattern of ANTI_PATTERNS) {
    if (pattern.detectionRule(metrics)) {
      detected.push(pattern);
    }
  }
  
  return detected;
}

function identifyRepeatedMistakes(metrics: PlanMetrics[]): string[] {
  const mistakes: string[] = [];
  
  if (metrics.length < 5) return mistakes;
  
  const recent = metrics.slice(-5);
  
  // Check for repeated low accuracy
  const lowAccuracyCount = recent.filter(m => m.plan_accuracy < 70).length;
  if (lowAccuracyCount >= 3) {
    mistakes.push("Consistently low plan accuracy (<70%)");
  }
  
  // Check for repeated high iterations
  const highIterationCount = recent.filter(m => m.iteration_count > 3).length;
  if (highIterationCount >= 3) {
    mistakes.push("Frequently requiring many iterations (>3)");
  }
  
  // Check for repeated tool failures
  const toolFailureCount = recent.filter(m => m.failed_tools && m.failed_tools.length > 0).length;
  if (toolFailureCount >= 3) {
    mistakes.push("Recurring tool failures");
  }
  
  // Check for declining performance
  const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
  const secondHalf = recent.slice(Math.floor(recent.length / 2));
  const firstAvg = firstHalf.reduce((sum, m) => sum + m.plan_accuracy, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, m) => sum + m.plan_accuracy, 0) / secondHalf.length;
  
  if (secondAvg < firstAvg - 10) {
    mistakes.push("Performance declining over time");
  }
  
  return mistakes;
}

function generateImprovementSuggestions(antiPatterns: AntiPattern[], mistakes: string[]): string[] {
  const suggestions: string[] = [];
  
  // Add suggestions from detected anti-patterns
  for (const pattern of antiPatterns) {
    suggestions.push(`[${pattern.severity.toUpperCase()}] ${pattern.suggestion}`);
  }
  
  // Add suggestions for repeated mistakes
  if (mistakes.includes("Consistently low plan accuracy (<70%)")) {
    suggestions.push("Improve pre-plan research phase - spend 2-3 min on Grep/Glob and Explore subagents");
    suggestions.push("Add validation subagent before presenting plans");
  }
  
  if (mistakes.includes("Frequently requiring many iterations (>3)")) {
    suggestions.push("Add more thorough feasibility validation");
    suggestions.push("Create checkpoints before risky changes");
    suggestions.push("Use the fix-and-retest loop strategically (max 5 iterations)");
  }
  
  if (mistakes.includes("Recurring tool failures")) {
    suggestions.push("Verify tool prerequisites before use");
    suggestions.push("Follow tool escalation protocol (Tier 1 → Tier 4)");
    suggestions.push("Check MCP server availability");
  }
  
  if (mistakes.includes("Performance declining over time")) {
    suggestions.push("Review recent changes to workflow or rules");
    suggestions.push("Analyze failing plans for common patterns");
    suggestions.push("Consider updating anti-pattern detection rules");
  }
  
  return suggestions;
}

function analyzeTrend(metrics: PlanMetrics[]): "improving" | "stable" | "declining" {
  if (metrics.length < 5) return "stable";
  
  const recent = metrics.slice(-5);
  const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
  const secondHalf = recent.slice(Math.floor(recent.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, m) => sum + m.plan_accuracy, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, m) => sum + m.plan_accuracy, 0) / secondHalf.length;
  
  if (secondAvg > firstAvg + 5) return "improving";
  if (secondAvg < firstAvg - 5) return "declining";
  return "stable";
}

function performPatternAnalysis(metrics: PlanMetrics[]): PatternAnalysis {
  const antiPatterns = detectAntiPatterns(metrics);
  const mistakes = identifyRepeatedMistakes(metrics);
  const suggestions = generateImprovementSuggestions(antiPatterns, mistakes);
  const trend = analyzeTrend(metrics);
  
  return {
    detectedPatterns: antiPatterns,
    repeatedMistakes: mistakes,
    improvementSuggestions: suggestions,
    trendDirection: trend
  };
}

// Load existing metrics
let allMetrics: PlanMetrics[] = [];
if (existsSync(METRICS_FILE)) {
  try {
    const content = readFileSync(METRICS_FILE, "utf-8");
    allMetrics = JSON.parse(content);
  } catch (error) {
    console.error("[Plan Tracker] Error loading metrics:", error);
    allMetrics = [];
  }
}

// Load the current turn from the transcript; skip turns without tool use (plain Q&A)
const turn = loadCurrentTurn(input.transcript_path);
if (!turn || turn.toolUses.length === 0) done();

const toolCalls = extractToolCalls(turn);
const parallelSubagents = countParallelSubagents(turn);
const planType = detectPlanType(turn);

// Track MCP usage and effectiveness
const mcpUsage: Record<string, number> = {};
const mcpToolsUsed: string[] = [];
const failedTools: string[] = [];

for (const tool of toolCalls) {
  if (tool.mcp_server) {
    mcpUsage[tool.mcp_server] = (mcpUsage[tool.mcp_server] || 0) + 1;
    if (!mcpToolsUsed.includes(tool.name)) {
      mcpToolsUsed.push(tool.name);
    }
  }
  
  if (!tool.success) {
    failedTools.push(tool.name);
  }
}

// MCP Effectiveness Analysis
if (Object.keys(mcpUsage).length > 0) {
  const mcpServers = Object.keys(mcpUsage).join(', ');
  console.error(`[Plan Tracker] MCP servers used: ${mcpServers}`);
  
  // Track MCP effectiveness per server
  const mcpEffectiveness: Record<string, { usage: number; success: number }> = {};
  toolCalls.forEach(tool => {
    if (tool.mcp_server) {
      if (!mcpEffectiveness[tool.mcp_server]) {
        mcpEffectiveness[tool.mcp_server] = { usage: 0, success: 0 };
      }
      mcpEffectiveness[tool.mcp_server].usage++;
      if (tool.success) mcpEffectiveness[tool.mcp_server].success++;
    }
  });
  
  // Report effectiveness
  Object.entries(mcpEffectiveness).forEach(([server, data]) => {
    const successRate = Math.round((data.success / data.usage) * 100);
    console.error(`[Plan Tracker] ${server}: ${data.usage} calls, ${successRate}% success rate`);
    
    if (successRate < 50) {
      console.error(`[Plan Tracker] ⚠ ${server} has low success rate (<50%). Consider disabling or reviewing usage.`);
    }
  });
}

// Track general tool usage
const toolUsage: Record<string, number> = {};
for (const tool of toolCalls) {
  toolUsage[tool.name] = (toolUsage[tool.name] || 0) + 1;
}

// Estimate cost
const estimatedCost = planTrackingConfig.enableCostTracking ? estimateCost(toolCalls) : undefined;

// Perform pattern analysis (if enabled)
let detectedAntiPatterns: string[] = [];
let repeatedMistakes: string[] = [];

if (planTrackingConfig.enablePatternAnalysis && allMetrics.length >= 3) {
  const analysis = performPatternAnalysis(allMetrics);
  detectedAntiPatterns = analysis.detectedPatterns.map(p => p.id);
  repeatedMistakes = analysis.repeatedMistakes;
  
  if (analysis.detectedPatterns.length > 0) {
    console.error(`[Plan Tracker] ⚠ Detected ${analysis.detectedPatterns.length} anti-pattern(s):`);
    for (const pattern of analysis.detectedPatterns) {
      console.error(`  - [${pattern.severity.toUpperCase()}] ${pattern.name}: ${pattern.suggestion}`);
    }
  }
  
  if (analysis.repeatedMistakes.length > 0) {
    console.error(`[Plan Tracker] ⚠ Repeated mistakes detected:`);
    for (const mistake of analysis.repeatedMistakes) {
      console.error(`  - ${mistake}`);
    }
  }
  
  console.error(`[Plan Tracker] Trend: ${analysis.trendDirection}`);
}

// Create metric entry (used whether tracking is enabled or not)
const iterations = failedTools.length;
const currentAccuracy = calculatePlanAccuracy(iterations);

const newMetric: PlanMetrics = {
  plan_accuracy: currentAccuracy,
  time_variance: 0,
  tool_usage: toolUsage,
  iteration_count: iterations,
  blocker_count: 0,
  timestamp: new Date().toISOString(),
  plan_type: planType,
  mcp_usage: mcpUsage,
  tool_efficiency: calculateToolEfficiency(toolCalls),
  parallel_subagents: parallelSubagents,
  mcp_tools_used: mcpToolsUsed,
  failed_tools: failedTools,
  conversation_duration_ms: undefined,
  cost_estimate: estimatedCost,
  anti_patterns_detected: detectedAntiPatterns,
  repeated_mistakes: repeatedMistakes,
  session_id: input.session_id,
  turn_id: turn.id
};

// Save metric entry if tracking is enabled
if (planTrackingConfig.trackMetrics) {
  // Add to metrics; a Stop after a stop-hook continuation updates the same turn's entry
  const last = allMetrics[allMetrics.length - 1];
  if (last && last.session_id === input.session_id && last.turn_id === turn.id) {
    allMetrics[allMetrics.length - 1] = newMetric;
  } else {
    allMetrics.push(newMetric);
  }

  // Save updated metrics
  try {
    writeFileSync(METRICS_FILE, JSON.stringify(allMetrics, null, 2));
    console.error("[Plan Tracker] ✓ Metrics saved");
  } catch (error) {
    console.error("[Plan Tracker] Error saving metrics:", error);
  }
} else {
  console.error("[Plan Tracker] ⚠ Metrics tracking disabled in config");
}

// Calculate rolling averages (only if tracking is enabled)
let avgAccuracy = 75;
let avgToolEfficiency = 75;
let avgCost = 0;

if (planTrackingConfig.trackMetrics && allMetrics.length > 0) {
  const recentMetrics = allMetrics.slice(-10);
  avgAccuracy = recentMetrics.reduce((sum, m) => sum + m.plan_accuracy, 0) / recentMetrics.length;
  const avgIterations = recentMetrics.reduce((sum, m) => sum + m.iteration_count, 0) / recentMetrics.length;
  avgToolEfficiency = recentMetrics.reduce((sum, m) => sum + (m.tool_efficiency || 75), 0) / recentMetrics.length;
  const avgParallelSubagents = recentMetrics.reduce((sum, m) => sum + (m.parallel_subagents || 0), 0) / recentMetrics.length;
  
  if (planTrackingConfig.enableCostTracking) {
    avgCost = recentMetrics.reduce((sum, m) => sum + (m.cost_estimate || 0), 0) / recentMetrics.length;
  }

  console.error(`[Plan Tracker] Rolling averages (last 10 plans):`);
  console.error(`  - Accuracy: ${avgAccuracy.toFixed(1)}%`);
  console.error(`  - Avg iterations: ${avgIterations.toFixed(1)}`);
  console.error(`  - Tool efficiency: ${avgToolEfficiency.toFixed(1)}`);
  console.error(`  - Avg parallel subagents: ${avgParallelSubagents.toFixed(1)}`);
  if (planTrackingConfig.enableCostTracking) {
    console.error(`  - Avg estimated cost: ${avgCost.toFixed(0)} tokens`);
  }
}

// Analyze MCP effectiveness

if (Object.keys(mcpUsage).length > 0) {
  console.error(`[Plan Tracker] MCP tools used in this session: ${mcpToolsUsed.join(', ')}`);
  
  // Check correlation with success
  if (currentAccuracy > 85 && Object.keys(mcpUsage).length > 0) {
    console.error("[Plan Tracker] ✓ High accuracy with MCP tools - good tool selection");
  }
}

// Analyze parallel subagent usage
if (parallelSubagents > 0) {
  console.error(`[Plan Tracker] Used ${parallelSubagents} parallel subagent(s)`);
  
  if (parallelSubagents > 2 && currentAccuracy > 80) {
    console.error("[Plan Tracker] ✓ Parallel exploration appears effective");
  }
}

// Provide feedback based on metrics (if enabled) — advisory, shown to the user
if (planTrackingConfig.provideFeedback) {
  if (iterations === 0) {
    console.error("[Plan Tracker] ✓ Perfect execution (no iterations needed)");
  } else if (iterations <= 2) {
    console.error("[Plan Tracker] ✓ Good execution (minimal iterations)");
  } else if (iterations > planTrackingConfig.maxIterations) {
    console.error("[Plan Tracker] ⚠ High iteration count - plan accuracy may need improvement");
  }
  
  // Suggest improvements if accuracy is low
  if (avgAccuracy < planTrackingConfig.accuracyThreshold) {
    notify(`Plan accuracy has been below ${planTrackingConfig.accuracyThreshold}% recently. Consider:\n1. More thorough pre-plan research\n2. Better validation before execution\n3. More specific tool selection`);
    process.exit(0);
  }
  
  // Suggest tool efficiency improvements
  if (avgToolEfficiency < planTrackingConfig.efficiencyThreshold) {
    notify("Tool efficiency has been low. Consider:\n1. Using simpler tools when possible (Tier 1: Bash, Read, Edit, Grep)\n2. Avoiding expensive MCP calls for simple tasks\n3. Using `model: haiku` for Explore subagents");
    process.exit(0);
  }
} else {
  console.error("[Plan Tracker] ⚠ Feedback disabled in config");
}

// Default: stop without followup
done();
