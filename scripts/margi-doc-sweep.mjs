import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.expo',
  'android',
  'ios',
  'dist',
  '.next',
]);

const SKIP_PATH_PREFIXES = [
  'docs/VERSION_HISTORY.md',
  'docs/design/refs/',
  'novadrive-mobile/src/lib/brand.ts',
  'novadrive-mobile/src/lib/brand.test.ts',
];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(repoRoot, full).replace(/\\/g, '/');
    if (SKIP_DIRS.has(name)) continue;
    if (SKIP_PATH_PREFIXES.some((p) => rel.startsWith(p))) continue;
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(md|html|yml|yaml|tsx|ts|svg|json|mjs|js)$/.test(name)) acc.push(full);
  }
  return acc;
}

function transform(body, rel) {
  let out = body;
  out = out.replace(/\bNovaDrive\b/g, 'Margi');
  out = out.replace(/NOVA DRIVE/g, 'MARGI');
  out = out.replace(/NOVADRIVE_MASTER_BRIEF/g, 'MARGI_MASTER_BRIEF');
  out = out.replace(/NOVADRIVE_FINAL_IMPLEMENTATION_PLAN/g, 'MARGI_FINAL_IMPLEMENTATION_PLAN');
  out = out.replace(/NOVADRIVE_REFINEMENT_PLAN/g, 'MARGI_REFINEMENT_PLAN');
  out = out.replace(/NOVADRIVE_STITCH_FINAL_IMPLEMENTATION_PLAN/g, 'MARGI_STITCH_FINAL_IMPLEMENTATION_PLAN');
  out = out.replace(/NOVADRIVE_V2_IMPLEMENTATION_PLAN/g, 'MARGI_V2_IMPLEMENTATION_PLAN');
  out = out.replace(/NOVADRIVE_MARGI_MASTER_ENCYCLOPEDIA/g, 'MARGI_MASTER_ENCYCLOPEDIA');
  out = out.replace(/NOVADRIVE_TEAM_GUIDE/g, 'MARGI_TEAM_GUIDE');
  out = out.replace(/NOVADRIVE_COMPLETE_UI_BRIEF/g, 'MARGI_COMPLETE_UI_BRIEF');
  out = out.replace(/NOVADRIVE_COMPLETE_PROJECT/g, 'MARGI_COMPLETE_PROJECT');
  out = out.replace(/novadrive-complete\.html/g, 'margi-complete.html');
  if (!rel.includes('VERSION_HISTORY') && !rel.includes('brand.ts') && !rel.includes('brand.test')) {
    out = out.replace(/NOVADRIVE GHP/g, 'MARGI GHP');
    out = out.replace(/\bNOVADRIVE\b/g, 'MARGI');
  }
  out = out.replace(/GovTech navy/gi, 'Care Path royal blue');
  out = out.replace(/com\.novadrive\.app/g, 'com.margi.app');
  out = out.replace(/novadrive:\/\//g, 'margi://');
  return out;
}

let changed = 0;
for (const file of walk(repoRoot)) {
  const rel = path.relative(repoRoot, file).replace(/\\/g, '/');
  if (rel === 'scripts/margi-doc-sweep.mjs') continue;
  if (rel === 'novadrive-mobile/scripts/verify-public-branding.mjs') continue;
  if (rel === 'novadrive-mobile/src/lib/publicBranding.ts') continue;
  const before = readFileSync(file, 'utf8');
  const after = transform(before, rel);
  if (after !== before) {
    writeFileSync(file, after, 'utf8');
    changed++;
  }
}

console.log(`Updated ${changed} files`);
