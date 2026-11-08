#!/usr/bin/env node

/**
 * Spec ↔ Test Traceability Check
 * Every acceptance criterion `<capability>/AC-<n>` must be named by at least one test.
 *
 * Usage:
 *   node .claude/scripts/spec-check.mjs                       # all of spec/specs/
 *   node .claude/scripts/spec-check.mjs spec/changes/x.md     # one change (before archive)
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

const AC_LINE = /\bAC-(\d+)\b/g;
const TEST_REF = /([\w-]+)\/AC-(\d+)(?!\d)/g;

// Acceptance criteria declared in a spec file. In a change file the capability
// comes from the enclosing `### <capability> (new|modified)` heading.
function declaredAcs(file, capability) {
  const ids = new Set();
  let current = capability;
  let removed = false;
  for (const line of readFileSync(file, 'utf-8').split('\n')) {
    const cap = line.match(/^###\s+([\w-]+)\s+\((new|modified)\)/);
    if (cap) current = cap[1];
    if (/^####\s/.test(line)) removed = /^####\s+REMOVED\b/.test(line);
    if (!current || removed || !/^\s*[-*]\s*AC-\d+/.test(line)) continue;
    for (const m of line.matchAll(AC_LINE)) ids.add(`${current}/AC-${m[1]}`);
  }
  return ids;
}

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', 'vendor', 'target', '.next']);

// Multi-repo workspaces have no git repo at the root: walk the tree instead
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name), out);
    } else {
      out.push(dir === '.' ? entry.name : join(dir, entry.name));
    }
  }
  return out;
}

// AC references found in code/test files (everything except specs and docs)
function referencedAcs() {
  let files;
  try {
    files = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).split('\n');
  } catch {
    files = walk('.');
  }
  const refs = new Set();
  for (const file of files) {
    if (!file || file.startsWith('spec/') || /\.(md|lock)$/.test(file) || !existsSync(file)) continue;
    let text;
    try {
      text = readFileSync(file, 'utf-8');
    } catch {
      continue;
    }
    for (const m of text.matchAll(TEST_REF)) refs.add(`${m[1]}/AC-${m[2]}`);
  }
  return refs;
}

const target = process.argv[2];
const declared = new Set();
if (target) {
  for (const id of declaredAcs(target)) declared.add(id);
} else if (existsSync('spec/specs')) {
  for (const f of readdirSync('spec/specs').filter((f) => f.endsWith('.md'))) {
    for (const id of declaredAcs(join('spec/specs', f), basename(f, '.md'))) declared.add(id);
  }
}

if (declared.size === 0) {
  console.log('ℹ️  No acceptance criteria (AC-<n>) found.');
  process.exit(0);
}

const refs = referencedAcs();
const missing = [...declared].filter((id) => !refs.has(id)).sort();
const covered = declared.size - missing.length;

console.log(`📋 AC coverage: ${covered}/${declared.size}`);
if (missing.length) {
  console.log('❌ No test references:');
  for (const id of missing) console.log(`   - ${id}`);
  process.exit(1);
}
console.log('✅ Every AC is covered by a test.');
