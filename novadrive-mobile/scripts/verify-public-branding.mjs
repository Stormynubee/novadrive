import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mobileRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.join(mobileRoot, '..');

/** @type {RegExp[]} */
export const FORBIDDEN_PATTERNS = [
  /\bNovaDrive\b/,
  /NOVA DRIVE/,
  /\bNOVADRIVE\b/,
];

const PUBLIC_PATHS = [
  'README.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'LICENSE',
  'docs/SUBMISSION.md',
  'docs/ARCHITECTURE.md',
  'docs/assets/banner.svg',
  'docs/assets/banner-light.svg',
  'docs/site/index.html',
  'novadrive/README.md',
];

const SKIP_PREFIXES = [
  'docs/VERSION_HISTORY.md',
  'docs/design/refs/',
  'docs/superpowers/specs/2026-05-22',
  'docs/superpowers/specs/2026-05-26',
  'docs/superpowers/specs/2026-05-28-github-banner',
];

function collectGithubFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      collectGithubFiles(full, acc);
    } else if (/\.(yml|yaml|md)$/.test(name)) {
      acc.push(full);
    }
  }
  return acc;
}

function relativeFromRepo(absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

function shouldSkipFile(rel) {
  return SKIP_PREFIXES.some((p) => rel.startsWith(p) || rel === p);
}

function allowsLegacySection(body) {
  const legacyIdx = body.search(/legacy compatibility/i);
  if (legacyIdx === -1) return false;
  const tail = body.slice(legacyIdx);
  const beforeLegacy = body.slice(0, legacyIdx);
  for (const re of FORBIDDEN_PATTERNS) {
    if (re.test(beforeLegacy)) return false;
  }
  return true;
}

/**
 * @param {string} body
 * @returns {{ pattern: string; match: string } | null}
 */
export function findBrandingViolation(body) {
  if (allowsLegacySection(body)) return null;
  for (const re of FORBIDDEN_PATTERNS) {
    const m = body.match(re);
    if (m) return { pattern: re.source, match: m[0] };
  }
  return null;
}

/**
 * @param {string} relPath
 * @param {string} body
 * @returns {{ relPath: string; pattern: string; match: string } | null}
 */
export function checkFile(relPath, body) {
  if (shouldSkipFile(relPath)) return null;
  const hit = findBrandingViolation(body);
  if (!hit) return null;
  return { relPath, ...hit };
}

function resolvePublicFiles() {
  const files = PUBLIC_PATHS.map((p) => path.join(repoRoot, p));
  const githubDir = path.join(repoRoot, '.github');
  if (statSync(githubDir).isDirectory()) {
    files.push(...collectGithubFiles(githubDir));
  }
  return [...new Set(files)];
}

function main() {
  const violations = [];
  for (const abs of resolvePublicFiles()) {
    const rel = relativeFromRepo(abs);
    if (shouldSkipFile(rel)) continue;
    let body;
    try {
      body = readFileSync(abs, 'utf8');
    } catch {
      violations.push({ relPath: rel, pattern: 'missing', match: '(file not found)' });
      continue;
    }
    const hit = checkFile(rel, body);
    if (hit) violations.push(hit);
  }

  if (violations.length > 0) {
    console.error('Public branding check failed:\n');
    for (const v of violations) {
      console.error(`  ${v.relPath}: found "${v.match}" (${v.pattern})`);
    }
    process.exit(1);
  }
  console.log('Public branding check passed.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
