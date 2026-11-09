// .claude/hooks/auto-validate.ts
// Stop hook — unified validation: lint + typecheck + tests + MCP validation

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import {
  readHookInput,
  loadCurrentTurn,
  editedFiles,
  stateDir,
  blockOrNotify,
  done,
  type ToolUse,
  type ExecError,
} from "./lib/claude-hook.ts";

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

const input = await readHookInput();
const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();

// Load optional configuration
const configPath = join(stateDir(input), 'hooks.config.json');
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
  reportDirectory: config.reporting?.reportDirectory || '.claude',
  appendReports: config.reporting?.appendReports !== false
};

// Helper functions
function hasScript(scriptName: string): boolean {
  try {
    const pkgPath = join(projectDir, 'package.json');
    if (!existsSync(pkgPath)) return false;
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return !!pkg.scripts?.[scriptName];
  } catch {
    return false;
  }
}

function validateMCPTools(toolUses: ToolUse[]): MCPToolResult[] {
  return toolUses
    .filter(t => t.name.startsWith('mcp__'))
    .map(t => ({ tool: t.name, success: !t.isError }));
}

const TEST_FILE = /(\.(test|spec)\.[cm]?[jt]sx?$)|__tests__|_test\.go$|\.t\.sol$/;

// Only validate turns in which Claude edited files
const turn = loadCurrentTurn(input.transcript_path);
// Docs, specs and claudify's own files are not project code: editing them never breaks lint/tests
const NON_CODE = /(^|\/)(\.claude|spec|openspec|docs)\/|\.(md|mdx|txt|ya?ml)$/;
const changedFiles = (turn ? editedFiles(turn.toolUses) : []).filter(f => !NON_CODE.test(f));

if (changedFiles.length === 0) {
  console.error("[Auto-Validate] No code changes detected, skipping validation");
  done();
}

console.error("[Auto-Validate] Running automatic validation...");

// Automatic validation sequence
const validations: ValidationResult[] = [];

// Run one check; a tool that isn't installed (exit 127) is skipped, not failed
function runCheck(name: string, command: string, timeout: number): void {
  try {
    execSync(command, { cwd: projectDir, stdio: 'pipe', encoding: 'utf-8', timeout });
    validations.push({ name, passed: true });
    console.error(`[Auto-Validate] ✓ ${name} passed`);
  } catch (err) {
    const error = err as ExecError;
    if (error.status === 127) {
      validations.push({ name, passed: true, skipped: true });
      console.error(`[Auto-Validate] ⚠ ${name} skipped (command not found — is it installed?)`);
      return;
    }
    const output = [error.stdout?.toString(), error.stderr?.toString()].filter(Boolean).join('\n').trim();
    validations.push({ name, passed: false, error: output || error.message });
    console.error(`[Auto-Validate] ✗ ${name} failed`);
  }
}

// 1. Run ESLint (with graceful degradation)
if (validationConfig.enableLint) {
  const lintCommand = validationConfig.lintCommand || (hasScript('lint') ? 'npm run lint' : null);
  
  if (lintCommand) {
    runCheck('ESLint', lintCommand, 60000);
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
    runCheck('Typecheck', typecheckCommand, 60000);
  } else {
    validations.push({ name: 'Typecheck', passed: true, skipped: true });
    console.error("[Auto-Validate] ⚠ Typecheck skipped (no typecheck script found)");
  }
} else {
  validations.push({ name: 'Typecheck', passed: true, skipped: true });
  console.error("[Auto-Validate] ⚠ Typecheck disabled in config");
}

// 3. Run tests (if test files detected or configured)
const hasTestFiles = changedFiles.some(f => TEST_FILE.test(f));
const shouldRunTests = validationConfig.enableTests && (hasTestFiles || hasScript('test'));

if (shouldRunTests) {
  const testCommand = validationConfig.testCommand || 'npm run test';
  
  if (hasScript('test') || validationConfig.testCommand) {
    runCheck('Tests', testCommand, 120000); // 120s timeout for test suites
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
if (validationConfig.enableMCPValidation && turn) {
  const mcpResults = validateMCPTools(turn.toolUses);
  
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

const reportPath = join(projectDir, reportingConfig.reportDirectory, 'auto-validation-report.md');

if (reportingConfig.generateReports) {
  const validationReport = `## Auto-Validation Report

Generated: ${new Date().toISOString()}
Session: ${input.session_id}
Changed files: ${changedFiles.join(", ")}

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
  const details = failedValidations.map(v => `### ${v.name}\n${(v.error || '').slice(0, 2000)}`).join('\n\n');
  blockOrNotify(input, `⚠️ Validation failed: ${failedValidations.map(v => v.name).join(', ')}. Fix these before finishing (full report: ${reportPath}).\n\n${details}`);
} else {
  console.error("[Auto-Validate] ✓ All validations passed");
  done();
}
