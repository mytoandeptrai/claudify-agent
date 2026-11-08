#!/usr/bin/env node

/**
 * Security & Secret Leak Scanner
 * Scans local workspace for hardcoded secrets before committing or sending to LLMs.
 */

import { execSync } from 'child_process';

console.log('🛡️ Running Claudify Security & Secret Scanner...\n');

const DANGEROUS_PATTERNS = [
  { name: 'AWS Access Key', regex: 'AKIA[0-9A-Z]{16}' },
  { name: 'Generic API Secret', regex: 'api_secret[\\s]*=[\\s]*["\'][a-zA-Z0-9_-]{16,}["\']' },
  { name: 'Private Key Block', regex: '-----BEGIN [A-Z ]+ PRIVATE KEY-----' },
  { name: 'Hardcoded Password Assignment', regex: 'password[\\s]*=[\\s]*["\'][^"\']{6,}["\']' },
  { name: 'GitHub Personal Token', regex: 'ghp_[0-9a-zA-Z]{36}' }
];

let leakFound = false;

for (const pattern of DANGEROUS_PATTERNS) {
  try {
    // Search in git-tracked or current files, excluding node_modules and .git
    const grepCmd = process.platform === 'win32'
      ? `git grep -E -I -i "${pattern.regex}" 2>$null`
      : `git grep -E -I -i "${pattern.regex}" 2>/dev/null`;

    const result = execSync(grepCmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (result) {
      console.warn(`⚠️ Potential secret detected (${pattern.name}):\n${result}\n`);
      leakFound = true;
    }
  } catch {
    // Exit code 1 means pattern not found (safe)
  }
}

if (leakFound) {
  console.error('❌ SECURITY ALERT: Potential secrets detected in local code! Move them to .env before continuing.');
  process.exit(1);
} else {
  console.log('✅ Clean! No leaked secrets or dangerous credentials found.');
  process.exit(0);
}
