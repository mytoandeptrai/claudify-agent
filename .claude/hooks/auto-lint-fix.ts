// .claude/hooks/auto-lint-fix.ts
// PostToolUse (Edit|Write|MultiEdit): auto-fix ESLint issues in the edited file

import { execFileSync } from "child_process";
import { writeFileSync, existsSync } from "fs";
import { join } from "path";
import { readHookInput, stateDir, done, type ExecError } from "./lib/claude-hook.ts";

const LINTABLE = /\.(c|m)?(j|t)sx?$/;

const input = await readHookInput();
const file = input.tool_input?.file_path as string | undefined;

const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
// Only use the project's own ESLint, never download one
const eslintBin = join(projectDir, "node_modules", ".bin", process.platform === "win32" ? "eslint.cmd" : "eslint");

if (!file || !LINTABLE.test(file) || !existsSync(file) || !existsSync(eslintBin)) done();

const LINT_REPORT_PATH = join(stateDir(input), "lint-report.md");

let lintOutput: string;
let hasErrors = false;

try {
  lintOutput = execFileSync(eslintBin, ["--fix", file], {
    cwd: projectDir,
    encoding: "utf-8",
    stdio: "pipe",
    timeout: 60000,
  });
} catch (err) {
  const error = err as ExecError;
  lintOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
  // ESLint exits 1 on remaining errors; 2 = config error/crash → skip silently
  if (error.status !== 1) done();
  hasErrors = true;
}

if (!hasErrors) {
  if (lintOutput.includes("warning")) {
    console.error(`[Auto Lint Fix] ✓ ${file} auto-fixed, warnings remain`);
  }
  done();
}

const report = `## ${new Date().toISOString()}\n\n### ESLint Results: ${file}\n\n${lintOutput}\n\n`;
writeFileSync(LINT_REPORT_PATH, existsSync(LINT_REPORT_PATH) ? report : `# ESLint Report\n\n${report}`, {
  flag: existsSync(LINT_REPORT_PATH) ? "a" : "w",
});

// Feed remaining errors back to Claude so it fixes them right away
console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: `⚠️ ESLint found errors in ${file} that couldn't be auto-fixed:\n${lintOutput.slice(0, 4000)}`,
    },
  }),
);
