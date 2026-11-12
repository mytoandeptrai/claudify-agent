#!/usr/bin/env node

/**
 * Claudify CLI Tool
 * Installs CLAUDE.md and .claude configuration into target projects.
 */

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { cp, readFile, writeFile, readdir, rm, rmdir } from 'fs/promises';
import { existsSync } from 'fs';
import { createInterface } from 'readline/promises';

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
} else if (command === 'uninstall') {
  const targetDir = process.cwd();
  const withContent = args.includes('--all');
  console.log(`🧹 Removing Claudify from: ${targetDir}`);
  console.log('   Removes: the files claudify installed in .claude/, its CLAUDE.md block, its hook entries in settings.json.');
  console.log(`   ${withContent ? 'Also removes BACKBONE.md and spec/ (--all).' : 'Keeps BACKBONE.md and spec/ (your content). Add --all to remove them too.'}`);

  try {
    if (!args.includes('--yes')) {
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      const answer = (await rl.question('Continue? [y/N] ')).trim().toLowerCase();
      rl.close();
      if (answer !== 'y' && answer !== 'yes') {
        console.log('Cancelled, nothing changed.');
        process.exit(0);
      }
    }

    // 1. .claude/: delete only the files claudify ships; your own commands/skills stay
    const shipped = async (dir) => {
      const out = [];
      for (const e of await readdir(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) out.push(...(await shipped(p)));
        else out.push(p);
      }
      return out;
    };
    const srcClaude = join(packageRoot, '.claude');
    const dstClaude = join(targetDir, '.claude');
    let removed = 0;
    for (const file of await shipped(srcClaude)) {
      const rel = file.slice(srcClaude.length + 1);
      if (rel === 'settings.json') continue;
      const dest = join(dstClaude, rel);
      if (existsSync(dest)) {
        await rm(dest);
        removed++;
      }
    }
    // prune directories that are now empty (deepest first)
    const dirs = (await shipped(srcClaude)).map((f) => dirname(f).slice(srcClaude.length + 1));
    for (const d of [...new Set(dirs)].filter(Boolean).sort((a, b) => b.length - a.length)) {
      let dir = join(dstClaude, d);
      while (dir.startsWith(dstClaude) && dir !== dstClaude && existsSync(dir) && (await readdir(dir)).length === 0) {
        await rmdir(dir);
        dir = dirname(dir);
      }
    }
    console.log(`  ✅ Removed ${removed} claudify files from .claude/`);

    // 2. settings.json: drop only the hook entries that point at .claude/hooks/
    const settingsPath = join(dstClaude, 'settings.json');
    if (existsSync(settingsPath)) {
      const settings = JSON.parse(await readFile(settingsPath, 'utf-8'));
      const ours = (h) => typeof h.command === 'string' && h.command.includes('.claude/hooks/');
      for (const [event, groups] of Object.entries(settings.hooks ?? {})) {
        const kept = groups
          .map((g) => ({ ...g, hooks: (g.hooks ?? []).filter((h) => !ours(h)) }))
          .filter((g) => g.hooks.length > 0);
        if (kept.length > 0) settings.hooks[event] = kept;
        else delete settings.hooks[event];
      }
      if (settings.hooks && Object.keys(settings.hooks).length === 0) delete settings.hooks;
      if (Object.keys(settings).filter((k) => k !== '$schema').length === 0) {
        await rm(settingsPath);
        console.log('  ✅ Removed .claude/settings.json (it held only claudify hooks)');
      } else {
        await writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
        console.log('  ✅ Removed claudify hooks from .claude/settings.json (your other settings kept)');
      }
    }
    if (existsSync(dstClaude) && (await readdir(dstClaude)).length === 0) await rmdir(dstClaude);

    // 3. CLAUDE.md: drop only the managed block
    const claudeMd = join(targetDir, 'CLAUDE.md');
    if (existsSync(claudeMd)) {
      const current = await readFile(claudeMd, 'utf-8');
      const start = current.indexOf(BLOCK_START);
      const end = current.indexOf(BLOCK_END);
      if (start !== -1 && end > start) {
        const rest = (current.slice(0, start) + current.slice(end + BLOCK_END.length)).trim();
        if (rest) {
          await writeFile(claudeMd, `${rest}\n`);
          console.log('  ✅ Removed the Claudify block from CLAUDE.md (your own content kept)');
        } else {
          await rm(claudeMd);
          console.log('  ✅ Removed CLAUDE.md (it held only the Claudify block)');
        }
      }
    }

    // 4. Optional: your project map and specs
    if (withContent) {
      await rm(join(targetDir, 'BACKBONE.md'), { force: true });
      await rm(join(targetDir, 'spec'), { recursive: true, force: true });
      console.log('  ✅ Removed BACKBONE.md and spec/');
    }

    console.log('\n✅ Done. To install again: npx claudify-agent@latest init');
  } catch (err) {
    console.error('❌ Failed to uninstall:', err.message);
    process.exit(1);
  }
} else {
  console.log(`
Usage:
  npx claudify init                       - Set up CLAUDE.md and .claude skills in current project
  npx claudify uninstall [--all] [--yes]  - Remove what init installed (--all also removes BACKBONE.md and spec/)
  npx claudify --help                     - Show help options
`);
}
