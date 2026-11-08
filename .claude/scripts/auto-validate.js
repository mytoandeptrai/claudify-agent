#!/usr/bin/env node

/**
 * Auto-Validate Script
 * Runs local verification commands to ensure zero-token error detection.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('⚡ Running Claudify Local Verification Pipeline...\n');

let hasErrors = false;

function runStep(name, command) {
  process.stdout.write(`⏳ [Check] ${name}... `);
  try {
    execSync(command, { stdio: 'pipe' });
    console.log('✅ PASSED');
    return true;
  } catch (error) {
    console.log('❌ FAILED');
    console.error(`\nError Output for ${name}:\n`, error.stdout?.toString() || error.message);
    hasErrors = true;
    return false;
  }
}

// 1. Lint check
if (existsSync('eslint.config.js') || existsSync('.eslintrc.json')) {
  runStep('ESLint Syntax & Formatting', 'npm run lint');
} else {
  console.log('ℹ️ [Skip] ESLint configuration not found');
}

// 2. TypeScript typecheck
if (existsSync('tsconfig.json')) {
  runStep('TypeScript Type Check', 'npm run typecheck');
} else {
  console.log('ℹ️ [Skip] tsconfig.json not found');
}

console.log('\n----------------------------------------');
if (hasErrors) {
  console.error('❌ Verification failed. Please address the issues listed above.');
  process.exit(1);
} else {
  console.log('🎉 All local checks passed cleanly (0 LLM tokens spent)!');
  process.exit(0);
}
