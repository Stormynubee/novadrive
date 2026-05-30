#!/usr/bin/env node
/**
 * Regenerate SEED + POI_COORDS + POI_DATA_VERIFIED in facilitiesDb.ts from SQLite.
 *
 * Usage (from repo root):
 *   node novadrive-mobile/scripts/generate-facilities-seed.mjs --db data/emergency_seed.db
 *   node novadrive-mobile/scripts/generate-facilities-seed.mjs --db data/emergency_seed.db --verified-date 2026-05-30
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(mobileRoot, '..');
const facilitiesPath = path.join(mobileRoot, 'src', 'lib', 'facilitiesDb.ts');
const readJsonScript = path.join(repoRoot, 'scripts', 'read_emergency_seed_json.py');

function parseArgs() {
  const args = process.argv.slice(2);
  let db = path.join(repoRoot, 'data', 'emergency_seed.db');
  let verifiedDate = new Date().toISOString().slice(0, 10);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--db' && args[i + 1]) db = path.resolve(args[++i]);
    if (args[i] === '--verified-date' && args[i + 1]) verifiedDate = args[++i];
  }
  return { db, verifiedDate };
}

function mapFacilityType(row) {
  if (row.trauma_tier === 3) return 'clinic';
  const name = row.name.toLowerCase();
  if (row.trauma_tier === 1 && /trauma|emergency|\ber\b|casualty/.test(name)) {
    return 'trauma';
  }
  return 'hospital';
}

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function buildSeedLines(rows) {
  return rows.map((row) => {
    const type = mapFacilityType(row);
    const phone = row.phone || '';
    const verified = row.verified && phone ? 'true' : 'false';
    return `  { id: '${esc(row.id)}', name: '${esc(row.name)}', type: '${type}', traumaTier: ${row.trauma_tier}, phone: '${esc(phone)}', verified: ${verified} },`;
  });
}

function buildCoordLines(rows) {
  return rows.map(
    (row) => `  '${esc(row.id)}': { lat: ${row.lat}, lng: ${row.lng} },`
  );
}

function patchFacilitiesTs(seedLines, coordLines, verifiedDate) {
  const src = fs.readFileSync(facilitiesPath, 'utf8');
  const seedBlock = `const SEED: Omit<Facility, 'distanceKm' | 'etaMinutes' | 'recommended'>[] = [\n${seedLines.join('\n')}\n];`;
  const coordBlock = `const POI_COORDS: Record<string, { lat: number; lng: number }> = {\n${coordLines.join('\n')}\n};`;

  let next = src.replace(
    /const SEED: Omit<Facility, 'distanceKm' \| 'etaMinutes' \| 'recommended'>\[\] = \[[\s\S]*?\];/,
    seedBlock
  );
  next = next.replace(
    /const POI_COORDS: Record<string, \{ lat: number; lng: number \}> = \{[\s\S]*?\};/,
    coordBlock
  );
  next = next.replace(
    /export const POI_DATA_VERIFIED = '[^']*';/,
    `export const POI_DATA_VERIFIED = '${verifiedDate}';`
  );

  if (next === src) {
    throw new Error('facilitiesDb.ts patch failed — SEED/POI_COORDS blocks not found');
  }
  fs.writeFileSync(facilitiesPath, next, 'utf8');
}

function main() {
  const { db, verifiedDate } = parseArgs();
  if (!fs.existsSync(db)) {
    console.error(`Missing DB: ${db}`);
    process.exit(1);
  }

  const json = execSync(`python "${readJsonScript}" --db "${db}"`, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const rows = JSON.parse(json);
  if (rows.length === 0) {
    console.error('No rows in emergency_nodes');
    process.exit(1);
  }

  patchFacilitiesTs(buildSeedLines(rows), buildCoordLines(rows), verifiedDate);
  const verifiedCount = rows.filter((r) => r.verified && r.phone).length;
  console.log(
    `Updated ${facilitiesPath}: ${rows.length} facilities, ${verifiedCount} verified-with-phone, POI_DATA_VERIFIED=${verifiedDate}`
  );
}

main();
