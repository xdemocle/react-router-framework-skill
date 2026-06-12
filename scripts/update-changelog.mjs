#!/usr/bin/env node
/**
 * update-changelog.mjs
 * Fetches the latest React Router CHANGELOG from GitHub and updates
 * references/changelog.md in-place. Safe to run from any working directory.
 * 
 * Run from skill root: node scripts/update-changelog.mjs
 * Or from anywhere: node /path/to/skILL/scripts/update-changelog.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// --- config ---
const SKILL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHANGELOG_URL = 'https://raw.githubusercontent.com/remix-run/react-router/main/CHANGELOG.md';
const OUTPUT_FILE = resolve(SKILL_ROOT, 'references/changelog.md');
const EMBEDDINGS_SCRIPT = resolve(SKILL_ROOT, 'scripts/build-embeddings.mjs');
const MAX_CHANGELOG_SIZE = 1024 * 512; // 512KB cap
// --------------

async function fetchChangelog() {
  const res = await fetch(CHANGELOG_URL);
  if (!res.ok) throw new Error(`Failed to fetch CHANGELOG: ${res.status} ${res.statusText}`);
  const text = await res.text();
  if (text.length > MAX_CHANGELOG_SIZE) {
    throw new Error(`CHANGELOG too large (${text.length} bytes, max ${MAX_CHANGELOG_SIZE})`);
  }
  return text;
}

function parseVersions(raw) {
  // Extract version headers and their content sections
  // Format: ## v7.x.y (on its own line) followed by "Date: YYYY-MM-DD" on next line
  const versionRe = /^##\s+(v?7\.\d+\.\d+)\s*$/gm;
  const dateRe = /^Date:\s*(\d{4}-\d{2}-\d{2}|\([^)]+\))/m;

  const versions = [];
  let match;
  let lastIndex = 0;
  while ((match = versionRe.exec(raw)) !== null) {
    // Look for Date: on the line(s) immediately after the version header
    const after = raw.slice(match.index, match.index + 200);
    const dateMatch = dateRe.exec(after);
    const date = dateMatch ? dateMatch[1] : '(unknown)';
    versions.push({ version: match[1], date, pos: match.index });
    if (versions.length >= 20) break;
  }

  const sections = [];
  for (let i = 0; i < versions.length; i++) {
    const { version, date, pos } = versions[i];
    const nextPos = i + 1 < versions.length ? versions[i + 1].pos : raw.length;
    const content = raw.slice(pos, nextPos).trim();
    sections.push({ version, date, content });
  }
  return sections.slice(0, 15); // keep last 15 versions
}

function buildOutput(sections) {
  const today = new Date().toISOString().split('T')[0];
  const latest = sections[0];

  const lines = [
    '# React Router Changelog Cache',
    `<!-- cached: ${today} -->`,
    `<!-- latest: ${latest ? latest.version + ' (' + latest.date + ')' : 'n/a'} -->`,
    '',
    ...sections.map(s => s.content),
  ];
  return lines.join('\n');
}

async function runEmbeddingsBuild() {
  try {
    const { spawn } = await import('child_process');
    return new Promise((resolve, reject) => {
      const proc = spawn('node', [EMBEDDINGS_SCRIPT], {
        cwd: SKILL_ROOT,
        stdio: 'pipe',
      });
      let stderr = '';
      proc.stderr.on('data', d => stderr += d.toString());
      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`embeddings build failed: ${stderr}`));
      });
      proc.on('error', reject);
    });
  } catch {
    // embeddings build is best-effort; log and continue
    console.warn('⚠ Could not run embeddings build (may be missing dependencies)');
  }
}

async function main() {
  console.log('📡 Fetching latest React Router CHANGELOG...');
  const raw = await fetchChangelog();
  
  console.log('📝 Parsing version sections...');
  const sections = parseVersions(raw);
  console.log(`   Found ${sections.length} version sections (keeping latest 15)`);
  
  const output = buildOutput(sections);
  writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log(`✅ Updated references/changelog.md (${output.length} bytes)`);
  
  // Rebuild embeddings incrementally
  console.log('🔍 Running incremental embeddings build...');
  await runEmbeddingsBuild();
  
  console.log('✅ Changelog sync complete');
}

main().catch(err => {
  console.error('❌ Changelog sync failed:', err.message);
  process.exit(1);
});
