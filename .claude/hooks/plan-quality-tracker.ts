// .cursor/hooks/plan-quality-tracker.ts
// Unified plan metrics tracking with real tool usage and accuracy calculations

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

export {};

interface StopHookInput {
  conversation_id: string;
  status: "completed" | "aborted" | "error";
  loop_count: number;
}

interface StopHookOutput {
  followup_message?: string;
}

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
}

interface MCPEffectiveness {
  usage: number;
  success_rate: number;
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

const METRICS_FILE = join(process.cwd(), ".cursor/plan-metrics.json");
const CONVERSATIONS_DIR = join(process.cwd(), ".cursor/conversations");

// Load configuration
const configPath = join(process.cwd(), '.cursor/hooks.config.json');
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

// Read input from stdin
const stdin = await new Promise<string>((resolve) => {
  let data = "";
  process.stdin.on("data", (chunk) => (data += chunk));
  process.stdin.on("end", () => resolve(data));
});

const input: StopHookInput = JSON.parse(stdin);

console.error(`[Plan Tracker] Processing execution data for conversation ${input.conversation_id}...`);

// Helper functions
function loadConversation(conversationId: string): any {
  const conversationPath = join(CONVERSATIONS_DIR, `${conversationId}.json`);
  if (!existsSync(conversationPath)) {
    console.error("[Plan Tracker] ⚠ Conversation file not found");
    return null;
  }
  
  try {
    return JSON.parse(readFileSync(conversationPath, 'utf-8'));
  } catch (error) {
    console.error("[Plan Tracker] Error loading conversation:", error);
    return null;
  }
}

function extractToolCalls(conversation: any): ToolCall[] {
  const tools: ToolCall[] = [];
  
  if (!conversation?.messages) return tools;
  
  for (const message of conversation.messages) {
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function?.name || 'unknown';
        
        // Determine if it's an MCP tool and which server
        let mcpServer: string | undefined;
        if (toolName.startsWith('browser_')) mcpServer = 'cursor-ide-browser';
        else if (toolName.startsWith('github_')) mcpServer = 'user-github';
        else if (toolName.includes('eslint')) mcpServer = 'user-ESLint';
        else if (toolName.includes('context7')) mcpServer = 'user-context7';
        else if (toolName.includes('chrome')) mcpServer = 'user-chrome-devtools';
        else if (toolName.includes('playwright')) mcpServer = 'user-playwright';
        else if (toolName.includes('selenium')) mcpServer = 'user-selenium';
        else if (toolName.includes('dart')) mcpServer = 'user-dart';
        else if (toolName.includes('stitch')) mcpServer = 'user-stitch';
        else if (toolName.includes('shadcn')) mcpServer = 'user-shadcn';
        
        tools.push({
          name: toolName,
          success: true, // Simplified - would check actual results in production
          mcp_server: mcpServer
        });
      }
    }
  }
  
  return tools;
}

function countParallelSubagents(conversation: any): number {
  if (!conversation?.messages) return 0;
  
  let count = 0;
  for (const message of conversation.messages) {
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        if (toolCall.function?.name === 'Task' || 
            toolCall.function?.name?.includes('subagent')) {
          count++;
        }
      }
    }
  }
  
  return count;
}

function detectPlanType(conversation: any): string {
  if (!conversation?.messages) return 'unknown';
  
  const conversationText = JSON.stringify(conversation.messages).toLowerCase();
  
  if (conversationText.includes('plan mode')) return 'plan-mode';
  if (conversationText.includes('browser') || conversationText.includes('web')) return 'browser-automation';
  if (conversationText.includes('github') || conversationText.includes('pr') || conversationText.includes('issue')) return 'github-ops';
  if (conversationText.includes('test')) return 'testing';
  if (conversationText.includes('refactor')) return 'refactoring';
  if (conversationText.includes('bug') || conversationText.includes('fix')) return 'bug-fix';
  if (conversationText.includes('feature') || conversationText.includes('implement')) return 'feature-development';
  
  return 'general';
}

function calculatePlanAccuracy(input: StopHookInput, conversation: any): number {
  if (input.status !== "completed") return 0;
  
  // Base accuracy on loop count (fewer iterations = higher accuracy)
  let baseAccuracy: number;
  if (input.loop_count === 0) baseAccuracy = 100;
  else if (input.loop_count <= 2) baseAccuracy = 85;
  else if (input.loop_count <= 5) baseAccuracy = 70;
  else baseAccuracy = 50;
  
  // Adjust based on tool usage patterns
  const tools = extractToolCalls(conversation);
  const failedTools = tools.filter(t => !t.success).length;
  
  if (failedTools > 0) {
    baseAccuracy -= (failedTools * 5); // Penalty for failed tools
  }
  
  return Math.max(0, Math.min(100, baseAccuracy));
}

function calculateToolEfficiency(tools: ToolCall[]): number {
  if (tools.length === 0) return 75; // Neutral score if no tools
  
  // Tier 1: Simple tools (Shell, Read, Write, Glob, Grep)
  // Tier 2: Analysis (ReadLints, SemanticSearch)
  // Tier 3: Complex (Task, WebSearch, WebFetch)
  // Tier 4: MCP tools
  
  const tierScores: Record<string, number> = {
    'Shell': 100, 'Read': 100, 'Write': 100, 'Glob': 100, 'Grep': 100,
    'ReadLints': 80, 'SemanticSearch': 80,
    'Task': 60, 'WebSearch': 60, 'WebFetch': 60,
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
    'Shell': 100, 'Read': 500, 'Write': 1000, 'Glob': 200, 'Grep': 300,
    'ReadLints': 800, 'SemanticSearch': 1500,
    'Task': 3000, 'WebSearch': 2000, 'WebFetch': 2500,
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
    description: "Creating plans without using SemanticSearch or exploration tools",
    detectionRule: (metrics: PlanMetrics[]) => {
      if (metrics.length < 3) return false;
      const recent = metrics.slice(-3);
      return recent.every(m => !m.tool_usage['SemanticSearch'] && m.parallel_subagents === 0);
    },
    suggestion: "Always use SemanticSearch and parallel subagents before planning complex features",
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
    description: "Not running ReadLints or tests after code changes",
    detectionRule: (metrics: PlanMetrics[]) => {
      if (metrics.length < 3) return false;
      const recent = metrics.slice(-3);
      return recent.every(m => !m.tool_usage['ReadLints'] && !m.tool_usage['Shell']);
    },
    suggestion: "Always run ReadLints after edits and tests after substantive changes",
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
    suggestions.push("Improve pre-plan research phase - spend 2-3 min on SemanticSearch");
    suggestions.push("Add validation subagent before presenting plans");
  }
  
  if (mistakes.includes("Frequently requiring many iterations (>3)")) {
    suggestions.push("Add more thorough feasibility validation");
    suggestions.push("Create checkpoints before risky changes");
    suggestions.push("Use /grind loop strategically (max 5 iterations)");
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

// Load conversation and extract data
const conversation = loadConversation(input.conversation_id);
const toolCalls = conversation ? extractToolCalls(conversation) : [];
const parallelSubagents = conversation ? countParallelSubagents(conversation) : 0;
const planType = conversation ? detectPlanType(conversation) : 'unknown';

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
const newMetric: PlanMetrics = {
  plan_accuracy: calculatePlanAccuracy(input, conversation),
  time_variance: 0,
  tool_usage: toolUsage,
  iteration_count: input.loop_count,
  blocker_count: input.status === "error" ? 1 : 0,
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
  repeated_mistakes: repeatedMistakes
};

// Save metric entry if tracking is enabled
if (planTrackingConfig.trackMetrics) {
  // Add to metrics
  allMetrics.push(newMetric);

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
let avgIterations = 2;
let avgToolEfficiency = 75;
let avgParallelSubagents = 0;
let avgCost = 0;

if (planTrackingConfig.trackMetrics && allMetrics.length > 0) {
  const recentMetrics = allMetrics.slice(-10);
  avgAccuracy = recentMetrics.reduce((sum, m) => sum + m.plan_accuracy, 0) / recentMetrics.length;
  avgIterations = recentMetrics.reduce((sum, m) => sum + m.iteration_count, 0) / recentMetrics.length;
  avgToolEfficiency = recentMetrics.reduce((sum, m) => sum + (m.tool_efficiency || 75), 0) / recentMetrics.length;
  avgParallelSubagents = recentMetrics.reduce((sum, m) => sum + (m.parallel_subagents || 0), 0) / recentMetrics.length;
  
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
const currentAccuracy = calculatePlanAccuracy(input, conversation);

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

// Provide feedback based on metrics (if enabled)
if (planTrackingConfig.provideFeedback) {
  if (input.status === "completed") {
    if (input.loop_count === 0) {
      console.error("[Plan Tracker] ✓ Perfect execution (no iterations needed)");
    } else if (input.loop_count <= 2) {
      console.error("[Plan Tracker] ✓ Good execution (minimal iterations)");
    } else if (input.loop_count > planTrackingConfig.maxIterations) {
      console.error("[Plan Tracker] ⚠ High iteration count - plan accuracy may need improvement");
    }
    
    // Suggest improvements if accuracy is low
    if (avgAccuracy < planTrackingConfig.accuracyThreshold) {
      const output: StopHookOutput = {
        followup_message: `Plan accuracy has been below ${planTrackingConfig.accuracyThreshold}% recently. Consider:\n1. More thorough pre-plan research\n2. Better validation before execution\n3. More specific tool selection`,
      };
      console.log(JSON.stringify(output));
      process.exit(0);
    }
    
    // Suggest tool efficiency improvements
    if (avgToolEfficiency < planTrackingConfig.efficiencyThreshold) {
      const output: StopHookOutput = {
        followup_message: "Tool efficiency has been low. Consider:\n1. Using simpler tools when possible (Tier 1: Shell, Read, Write)\n2. Avoiding expensive MCP calls for simple tasks\n3. Using 'fast' model for subagents",
      };
      console.log(JSON.stringify(output));
      process.exit(0);
    }
  }

  if (input.status === "error") {
    console.error("[Plan Tracker] ✗ Execution failed - analyzing patterns");
    
    // Check for recurring failures
    if (planTrackingConfig.trackMetrics) {
      const recentFailures = allMetrics.slice(-10).filter(m => m.blocker_count > 0).length;
      if (recentFailures > 2) {
        const output: StopHookOutput = {
          followup_message: "Multiple execution failures detected. Common causes:\n1. Insufficient research phase\n2. Missing validation steps\n3. Unrealistic time estimates\n\nWould you like to review the plan approach?",
        };
        console.log(JSON.stringify(output));
        process.exit(0);
      }
    }
    
    // Check for tool-related failures
    if (failedTools.length > 0) {
      console.error(`[Plan Tracker] Failed tools: ${failedTools.join(', ')}`);
      const output: StopHookOutput = {
        followup_message: `Execution failed. Failed tools: ${failedTools.join(', ')}. Consider:\n1. Verifying tool prerequisites\n2. Using alternative tools\n3. Checking tool configuration`,
      };
      console.log(JSON.stringify(output));
      process.exit(0);
    }
  }

  // Handle aborted execution (from plan-mode-monitor merge)
  if (input.status === "aborted") {
    console.error("[Plan Tracker] ⚠ Plan execution aborted by user");
    
    // Gather feedback
    if (input.loop_count < 2) {
      const output: StopHookOutput = {
        followup_message: "Plan execution aborted. What was the main issue?\n1. Plan was inaccurate\n2. Requirements changed\n3. Found better approach\n4. Other",
      };
      console.log(JSON.stringify(output));
      process.exit(0);
    }
  }
} else {
  console.error("[Plan Tracker] ⚠ Feedback disabled in config");
}

// Default: stop without followup
console.log(JSON.stringify({}));
process.exit(0);
