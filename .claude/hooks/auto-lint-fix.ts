import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

interface StopHookInput {
  conversation_id: string;
  status: "completed" | "aborted" | "error";
  loop_count: number;
}

interface StopHookOutput {
  followup_message?: string;
}

const LINT_REPORT_PATH = join(process.cwd(), ".cursor/lint-report.md");

// Read input from stdin
const stdin = await new Promise<string>((resolve) => {
  let data = "";
  process.stdin.on("data", (chunk) => (data += chunk));
  process.stdin.on("end", () => resolve(data));
});

const input: StopHookInput = JSON.parse(stdin);

// Only lint on completion
if (input.status !== "completed") {
  console.log(JSON.stringify({}));
  process.exit(0);
}

// Check if any code changes were made (simplified check)
// In real implementation, would track file changes in conversation
const codeChanged = true; // Assume code changed for now

if (!codeChanged) {
  console.log(JSON.stringify({}));
  process.exit(0);
}

// Run ESLint on changed files
try {
  // Try to run ESLint with auto-fix
  console.log("Running ESLint with auto-fix...");
  
  let lintOutput = "";
  let hasErrors = false;
  let hasWarnings = false;
  
  try {
    // First try auto-fix
    lintOutput = execSync("npm run lint -- --fix", { 
      encoding: "utf-8",
      stdio: "pipe",
      timeout: 60000 // 60s timeout
    }).toString();
  } catch (error: any) {
    lintOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
    hasErrors = true;
  }
  
  // Check for remaining issues
  if (lintOutput.includes("error")) {
    hasErrors = true;
  }
  if (lintOutput.includes("warning")) {
    hasWarnings = true;
  }
  
  // Generate lint report
  const timestamp = new Date().toISOString();
  const report = `## ${timestamp}\n\n### ESLint Results\n\n${lintOutput}\n\n`;
  
  if (existsSync(LINT_REPORT_PATH)) {
    writeFileSync(LINT_REPORT_PATH, report, { flag: 'a' });
  } else {
    writeFileSync(LINT_REPORT_PATH, `# ESLint Report\n\n${report}`);
  }
  
  // Return appropriate message
  if (hasErrors) {
    const output: StopHookOutput = {
      followup_message: `⚠️ ESLint found errors that couldn't be auto-fixed. Please review and fix manually.`,
    };
    console.log(JSON.stringify(output));
  } else if (hasWarnings) {
    const output: StopHookOutput = {
      followup_message: `✅ ESLint auto-fixed issues. Some warnings remain (check ${LINT_REPORT_PATH}).`,
    };
    console.log(JSON.stringify(output));
  } else {
    const output: StopHookOutput = {
      followup_message: `✅ ESLint passed with no issues.`,
    };
    console.log(JSON.stringify(output));
  }
  
} catch (error: any) {
  // ESLint not available or failed
  const output: StopHookOutput = {
    followup_message: `⚠️ ESLint check failed: ${error.message}. Continuing without linting.`,
  };
  console.log(JSON.stringify(output));
}
