#!/usr/bin/env node

/**
 * Multi-Language Auto-Validate Hook
 * Supports TypeScript/JS, Go, and Solidity (Foundry/Hardhat)
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('⚡ Running Claudify Multi-Language Verification Pipeline...\n');

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

// 1. Golang Pipeline
if (existsSync('go.mod')) {
  console.log('🐹 Detected Go Project');
  runStep('Go Vet Static Analysis', 'go vet ./...');
  try {
    execSync('golangci-lint --version', { stdio: 'ignore' });
    runStep('GolangCI-Lint', 'golangci-lint run ./...');
  } catch {
    // Optional if not installed
  }
}

// 2. Solidity / Smart Contract Pipeline
if (existsSync('foundry.toml')) {
  console.log('⛓️ Detected Foundry Smart Contract Project');
  runStep('Foundry Build & Compilation', 'forge build');
  runStep('Foundry Tests', 'forge test');
} else if (existsSync('hardhat.config.js') || existsSync('hardhat.config.ts')) {
  console.log('⛓️ Detected Hardhat Smart Contract Project');
  runStep('Hardhat Compile', 'npx hardhat compile');
  runStep('Hardhat Test', 'npx hardhat test');
}

// 3. Node.js / TypeScript Pipeline
if (existsSync('package.json')) {
  if (existsSync('eslint.config.js') || existsSync('.eslintrc.json')) {
    runStep('ESLint Syntax & Formatting', 'npm run lint');
  }
  if (existsSync('tsconfig.json')) {
    runStep('TypeScript Type Check', 'npm run typecheck');
  }
}

console.log('\n----------------------------------------');
if (hasErrors) {
  console.error('❌ Verification failed. Fix issues before concluding the task.');
  process.exit(1);
} else {
  console.log('🎉 All language checks passed cleanly (0 LLM tokens spent)!');
  process.exit(0);
}
