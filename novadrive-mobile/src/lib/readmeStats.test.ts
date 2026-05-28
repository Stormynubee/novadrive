import { execSync } from 'child_process';
import path from 'path';
import {
  assertMobileReadmeStats,
  countUnitTestsInSource,
  parseReadmeUnitTestCount,
} from './readmeStats';

const mobileRoot = path.join(__dirname, '../..');

describe('readmeStats', () => {
  it('counts unit tests in src/**/*.test.ts', () => {
    expect(countUnitTestsInSource(mobileRoot)).toBeGreaterThan(50);
  });

  it('mobile README unit test count matches source', () => {
    const expected = countUnitTestsInSource(mobileRoot);
    const claimed = parseReadmeUnitTestCount(path.join(mobileRoot, 'README.md'));
    expect(claimed).not.toBeNull();
    expect(claimed).toBe(expected);
  });

  it('verify:docs script exits zero', () => {
    const out = execSync('node scripts/verify-readme-stats.mjs', {
      cwd: mobileRoot,
      encoding: 'utf8',
    });
    expect(out).toMatch(/README test count OK/);
    expect(assertMobileReadmeStats(mobileRoot)).toBe(countUnitTestsInSource(mobileRoot));
  });
});
