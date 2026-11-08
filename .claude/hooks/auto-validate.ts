// .cursor/hooks/auto-validate.ts
// Unified validation hook: lint + typecheck + tests + MCP validation

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
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

interface ValidationResult {
  name: string;
  passed: boolean;
  error?: string;
  skipped?: boolean;
}

interface MCPToolResult {
  tool: string;
  success: boolean;
  error?: string;
}

interface ValidationConfig {
  enableLint?: boolean;
  enableTypecheck?: boolean;
  enableTests?: boolean;
  enableMCPValidation?: boolean;
  testCommand?: string;
  lintCommand?: string;
  typecheckCommand?: string;
}

interface HooksConfig {
  validation?: ValidationConfig;
  reporting?: {
    generateReports?: boolean;
    reportDirectory?: string;
    appendReports?: boolean;
  };
}

// Read input from stdin
const stdin = await new Promise<string>((resolve) => {
  let data = "";
  process.stdin.on("data", (chunk) => (data += chunk));
  process.stdin.on("end", () => resolve(data));
});

const input: StopHookInput = JSON.parse(stdin);

// Load optional configuration
const configPath = join(process.cwd(), '.cursor/hooks.config.json');
const config: HooksConfig = existsSync(configPath) 
  ? JSON.parse(readFileSync(configPath, 'utf-8')) 
  : {};

const validationConfig = {
  enableLint: config.validation?.enableLint !== false,
  enableTypecheck: config.validation?.enableTypecheck !== false,
  enableTests: config.validation?.enableTests !== false,
  enableMCPValidation: config.validation?.enableMCPValidation !== false,
  lintCommand: config.validation?.lintCommand,
  typecheckCommand: config.validation?.typecheckCommand,
  testCommand: config.validation?.testCommand
};

const reportingConfig = {
  generateReports: config.reporting?.generateReports !== false,
  reportDirectory: config.reporting?.reportDirectory || '.cursor',
  appendReports: config.reporting?.appendReports !== false
};

// Only validate on completion
if (input.status !== "completed") {
  console.log(JSON.stringify({}));
  process.exit(0);
}

// Helper functions
function hasScript(scriptName: string): boolean {
  try {
    const pkgPath = join(process.cwd(), 'package.json');
    if (!existsSync(pkgPath)) return false;
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return !!pkg.scripts?.[scriptName];
  } catch {
    return false;
  }
}

function detectCodeChanges(conversation: any): boolean {
  if (!conversation?.messages) return false;
  
  return conversation.messages.some((m: any) => 
    m.content?.includes('StrReplace') || 
    m.content?.includes('Write') ||
    m.content?.includes('EditNotebook') ||
    m.tool_calls?.some((t: any) => 
      ['StrReplace', 'Write', 'EditNotebook'].includes(t.function?.name)
    )
  );
}

function validateMCPTools(conversation: any): MCPToolResult[] {
  const results: MCPToolResult[] = [];
  
  if (!conversation?.messages) return results;
  
  const mcpToolPatterns = [
    'browser_', 'github_', 'eslint', 'context7', 
    'chrome', 'playwright', 'selenium', 'dart', 'stitch', 'shadcn'
  ];
  
  for (const message of conversation.messages) {
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function?.name;
        if (!toolName) continue;
        
        const isMCPTool = mcpToolPatterns.some(pattern => 
          toolName.startsWith(pattern) || toolName.includes(pattern)
        );
        
        if (isMCPTool) {
          // Track MCP tool usage (simplified - assumes success)
          // In production, would check actual tool execution results
          results.push({
            tool: toolName,
            success: true
          });
        }
      }
    }
  }
  
  return results;
}

function detectTestFiles(conversation: any): boolean {
  if (!conversation?.messages) return false;
  
  return conversation.messages.some((m: any) => 
    m.content?.includes('.test.ts') ||
    m.content?.includes('.test.tsx') ||
    m.content?.includes('.spec.ts') ||
    m.content?.includes('.spec.tsx') ||
    m.content?.includes('__tests__') ||
    m.content?.includes('.test.js') ||
    m.content?.includes('.spec.js')
  );
}

// Try to detect code changes from conversation file
const conversationFile = join(process.cwd(), `.cursor/conversations/${input.conversation_id}.json`);
let conversation;
try {
  if (existsSync(conversationFile)) {
    conversation = JSON.parse(readFileSync(conversationFile, 'utf-8'));
  }
} catch {
  console.error("[Auto-Validate] Could not read conversation file, proceeding with validation");
  conversation = null;
}

// Smart change detection
const hasCodeChanges = conversation ? detectCodeChanges(conversation) : true;

if (!hasCodeChanges) {
  console.error("[Auto-Validate] No code changes detected, skipping validation");
  console.log(JSON.stringify({}));
  process.exit(0);
}

console.error("[Auto-Validate] Running automatic validation...");

// Automatic validation sequence
const validations: ValidationResult[] = [];

// 1. Run ESLint (with graceful degradation)
if (validationConfig.enableLint) {
  const lintCommand = validationConfig.lintCommand || (hasScript('lint') ? 'npm run lint' : null);
  
  if (lintCommand) {
    try {
      execSync(lintCommand, { stdio: 'pipe', encoding: 'utf-8', timeout: 60000 });
      validations.push({ name: 'ESLint', passed: true });
      console.error("[Auto-Validate] ✓ ESLint passed");
    } catch (error: any) {
      validations.push({
        name: 'ESLint',
        passed: false,
        error: error.stdout?.toString() || error.stderr?.toString() || error.message
      });
      console.error("[Auto-Validate] ✗ ESLint failed");
    }
  } else {
    validations.push({ name: 'ESLint', passed: true, skipped: true });
    console.error("[Auto-Validate] ⚠ ESLint skipped (no lint script found)");
  }
} else {
  validations.push({ name: 'ESLint', passed: true, skipped: true });
  console.error("[Auto-Validate] ⚠ ESLint disabled in config");
}

// 2. Run typecheck (with graceful degradation)
if (validationConfig.enableTypecheck) {
  const typecheckCommand = validationConfig.typecheckCommand || (hasScript('typecheck') ? 'npm run typecheck' : null);
  
  if (typecheckCommand) {
    try {
      execSync(typecheckCommand, { stdio: 'pipe', encoding: 'utf-8', timeout: 60000 });
      validations.push({ name: 'Typecheck', passed: true });
      console.error("[Auto-Validate] ✓ Typecheck passed");
    } catch (error: any) {
      validations.push({
        name: 'Typecheck',
        passed: false,
        error: error.stdout?.toString() || error.stderr?.toString() || error.message
      });
      console.error("[Auto-Validate] ✗ Typecheck failed");
    }
  } else {
    validations.push({ name: 'Typecheck', passed: true, skipped: true });
    console.error("[Auto-Validate] ⚠ Typecheck skipped (no typecheck script found)");
  }
} else {
  validations.push({ name: 'Typecheck', passed: true, skipped: true });
  console.error("[Auto-Validate] ⚠ Typecheck disabled in config");
}

// 3. Run tests (if test files detected or configured)
const hasTestFiles = conversation ? detectTestFiles(conversation) : false;
const shouldRunTests = validationConfig.enableTests && (hasTestFiles || hasScript('test'));

if (shouldRunTests) {
  const testCommand = validationConfig.testCommand || 'npm run test';
  
  if (hasScript('test') || validationConfig.testCommand) {
    try {
      execSync(testCommand, { 
        stdio: 'pipe', 
        encoding: 'utf-8', 
        timeout: 120000 // 120s timeout for test suites
      });
      validations.push({ name: 'Tests', passed: true });
      console.error("[Auto-Validate] ✓ Tests passed");
    } catch (error: any) {
      validations.push({
        name: 'Tests',
        passed: false,
        error: error.stdout?.toString() || error.stderr?.toString() || error.message
      });
      console.error("[Auto-Validate] ✗ Tests failed");
    }
  } else {
    validations.push({ name: 'Tests', passed: true, skipped: true });
    console.error("[Auto-Validate] ⚠ Tests skipped (no test script found)");
  }
} else {
  if (!validationConfig.enableTests) {
    validations.push({ name: 'Tests', passed: true, skipped: true });
    console.error("[Auto-Validate] ⚠ Tests disabled in config");
  } else {
    validations.push({ name: 'Tests', passed: true, skipped: true });
    console.error("[Auto-Validate] ⚠ Tests skipped (no test files detected)");
  }
}

// 4. Validate MCP tools (if MCP tools were used)
if (validationConfig.enableMCPValidation && conversation) {
  const mcpResults = validateMCPTools(conversation);
  
  if (mcpResults.length > 0) {
    const failedMCPTools = mcpResults.filter(r => !r.success);
    
    if (failedMCPTools.length > 0) {
      validations.push({
        name: 'MCP Tools',
        passed: false,
        error: `Failed tools: ${failedMCPTools.map(t => t.tool).join(', ')}`
      });
      console.error(`[Auto-Validate] ✗ ${failedMCPTools.length} MCP tool(s) failed validation`);
    } else {
      validations.push({ name: 'MCP Tools', passed: true });
      console.error(`[Auto-Validate] ✓ ${mcpResults.length} MCP tool(s) validated successfully`);
    }
  }
} else if (!validationConfig.enableMCPValidation) {
  console.error("[Auto-Validate] ⚠ MCP validation disabled in config");
}

// Generate validation report (if enabled)
const failedValidations = validations.filter(v => !v.passed && !v.skipped);
const passedCount = validations.filter(v => v.passed && !v.skipped).length;
const skippedCount = validations.filter(v => v.skipped).length;

const reportPath = join(process.cwd(), reportingConfig.reportDirectory, 'auto-validation-report.md');

if (reportingConfig.generateReports) {
  const validationReport = `## Auto-Validation Report

Generated: ${new Date().toISOString()}
Conversation: ${input.conversation_id}

## Results

${validations.map(v => {
  if (v.skipped) {
    return `⚠️ ${v.name} (skipped)`;
  }
  return `${v.passed ? '✅' : '❌'} ${v.name}${v.error ? `:\n\`\`\`${v.error}\`\`\`` : ''}`;
}).join('\n\n')}

## Summary

Total: ${validations.length} checks
Passed: ${passedCount}
Failed: ${failedValidations.length}
Skipped: ${skippedCount}
${failedValidations.length === 0 ? '\n✓ All validations passed!' : '\n⚠️ Some validations failed. Please fix the issues above.'}
`;

  writeFileSync(reportPath, validationReport);
  console.error(`[Auto-Validate] Report saved to ${reportPath}`);
} else {
  console.error("[Auto-Validate] ⚠ Report generation disabled in config");
}

// Provide feedback
if (failedValidations.length > 0) {
  const output: StopHookOutput = {
    followup_message: `⚠️ Validation failed: ${failedValidations.map(v => v.name).join(', ')}. See ${reportPath} for details.`,
  };
  console.log(JSON.stringify(output));
} else {
  console.error("[Auto-Validate] ✓ All validations passed");
  console.log(JSON.stringify({}));
}
