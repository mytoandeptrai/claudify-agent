#!/usr/bin/env node

/**
 * Claudify CLI Tool
 * Installs CLAUDE.md and .claude configuration into target projects.
 */

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { cp, access } from 'fs/promises';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = resolve(__dirname, '..');

const args = process.argv.slice(2);
const command = args[0];

console.log('⚡ Claudify - Claude Agent & Context Optimization Toolkit\n');

if (command === 'init') {
  const targetDir = process.cwd();
  console.log(`📦 Initializing Claudify in: ${targetDir}`);

  try {
    // 1. Copy CLAUDE.md
    await cp(join(packageRoot, 'CLAUDE.md'), join(targetDir, 'CLAUDE.md'));
    console.log('  ✅ Created CLAUDE.md (Root agent instruction guidelines)');

    // 2. Copy .claude folder
    await cp(join(packageRoot, '.claude'), join(targetDir, '.claude'), { recursive: true });
    console.log('  ✅ Created .claude/ (Skills and automated verification scripts)');

    console.log('\n🎉 Successfully initialized Claudify!');
    console.log('👉 Next Steps:');
    console.log('   - Review CLAUDE.md in your project root.');
    console.log('   - Run Claude Code CLI (or open Claude Desktop) in this directory.');
    console.log('   - Enjoy strict token minimization and deterministic local checks!');
  } catch (err) {
    console.error('❌ Failed to initialize:', err.message);
    process.exit(1);
  }
} else {
  console.log(`
Usage:
  npx claudify init       - Set up CLAUDE.md and .claude skills in current project
  npx claudify --help     - Show help options
`);
}
