import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const mobileRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function collectTestFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      collectTestFiles(full, acc);
    } else if (name.endsWith('.test.ts')) {
      acc.push(full);
    }
  }
  return acc;
}

function countUnitTestsInSource(cwd) {
  const srcDir = path.join(cwd, 'src');
  let total = 0;
  for (const file of collectTestFiles(srcDir)) {
    const body = readFileSync(file, 'utf8');
    const matches = body.match(/^\s*(?:it|test)\s*\(/gm);
    total += matches?.length ?? 0;
  }
  return total;
}

const count = countUnitTestsInSource(mobileRoot);
const readmePath = path.join(mobileRoot, 'README.md');
const readme = readFileSync(readmePath, 'utf8');
const match = readme.match(/(\d+)\s+unit tests/);
if (!match) {
  console.error(`No "N unit tests" line found in ${readmePath}`);
  process.exit(1);
}

const claimed = Number(match[1]);
if (claimed !== count) {
  console.error(`${readmePath} claims ${claimed} unit tests but source has ${count}`);
  process.exit(1);
}

console.log(`README test count OK (${count} unit tests)`);
