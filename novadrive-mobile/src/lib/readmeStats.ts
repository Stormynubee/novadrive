import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';

const mobileRoot = path.join(__dirname, '../..');

function collectTestFiles(dir: string, acc: string[] = []): string[] {
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

/** Count top-level `it(` / `test(` blocks (matches Jest suite size in this repo). */
export function countUnitTestsInSource(cwd: string = mobileRoot): number {
  const srcDir = path.join(cwd, 'src');
  let total = 0;
  for (const file of collectTestFiles(srcDir)) {
    const body = readFileSync(file, 'utf8');
    const matches = body.match(/^\s*(?:it|test)\s*\(/gm);
    total += matches?.length ?? 0;
  }
  return total;
}

export function parseReadmeUnitTestCount(readmePath: string): number | null {
  const text = readFileSync(readmePath, 'utf8');
  const match = text.match(/(\d+)\s+unit tests/);
  if (!match) {
    return null;
  }
  return Number(match[1]);
}

export function assertReadmeTestCount(readmePath: string, expectedCount: number): void {
  const claimed = parseReadmeUnitTestCount(readmePath);
  if (claimed === null) {
    throw new Error(`No "N unit tests" line found in ${readmePath}`);
  }
  if (claimed !== expectedCount) {
    throw new Error(
      `${readmePath} claims ${claimed} unit tests but source has ${expectedCount}`
    );
  }
}

export function assertMobileReadmeStats(cwd: string = mobileRoot): number {
  const count = countUnitTestsInSource(cwd);
  assertReadmeTestCount(path.join(cwd, 'README.md'), count);
  return count;
}

/** @deprecated Alias for static source count (fast; used by verify:docs). */
export const getJestTestCount = countUnitTestsInSource;
