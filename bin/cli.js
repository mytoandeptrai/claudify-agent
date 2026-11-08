#!/usr/bin/env node

/**
 * Claudify CLI Tool
 * Installs CLAUDE.md and .claude configuration into target projects.
 */

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { cp, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const BLOCK_START = '<!-- claudify:start (managed by `npx claudify init`, edits inside are overwritten) -->';
const BLOCK_END = '<!-- claudify:end -->';

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
    // 1. CLAUDE.md: keep the project's own content, manage only the Claudify block
    const claudeMd = join(targetDir, 'CLAUDE.md');
    const block = `${BLOCK_START}\n${(await readFile(join(packageRoot, 'CLAUDE.md'), 'utf-8')).trim()}\n${BLOCK_END}\n`;
    if (!existsSync(claudeMd)) {
      await writeFile(claudeMd, block);
      console.log('  ✅ Created CLAUDE.md (Root agent instruction guidelines)');
    } else {
      const current = await readFile(claudeMd, 'utf-8');
      const start = current.indexOf(BLOCK_START);
      const end = current.indexOf(BLOCK_END);
      if (start !== -1 && end > start) {
        await writeFile(claudeMd, current.slice(0, start) + block + current.slice(end + BLOCK_END.length).replace(/^\n/, ''));
        console.log('  ✅ Updated the Claudify block in CLAUDE.md (your own content untouched)');
      } else {
        await writeFile(claudeMd, `${current.trimEnd()}\n\n${block}`);
        console.log('  ✅ Appended the Claudify block to your existing CLAUDE.md');
      }
    }

    // 2. Copy .claude folder (never overwrite the project's own settings.json)
    const settingsSrc = join(packageRoot, '.claude', 'settings.json');
    const settingsDest = join(targetDir, '.claude', 'settings.json');
    const keepSettings = existsSync(settingsDest);
    await cp(join(packageRoot, '.claude'), join(targetDir, '.claude'), {
      recursive: true,
      filter: (src) => !(keepSettings && src === settingsSrc),
    });
    console.log('  ✅ Created .claude/ (Skills, rules and Claude Code hooks)');
    if (keepSettings) {
      console.log(`  ⚠️  Kept your existing .claude/settings.json — merge the "hooks" block from ${settingsSrc} manually.`);
    }

    // 3. Scaffold BACKBONE.md and spec/ (never overwrite existing files)
    const templates = [
      ['BACKBONE.md', 'project map loaded every session; run /backbone-init to fill it'],
      ['spec/config.md', 'rules for /spec-new'],
    ];
    for (const [file, purpose] of templates) {
      const dest = join(targetDir, file);
      if (existsSync(dest)) {
        console.log(`  ⚠️  Kept your existing ${file}`);
      } else {
        await cp(join(packageRoot, 'templates', file), dest);
        console.log(`  ✅ Created ${file} (${purpose})`);
      }
    }

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
