import { existsSync } from 'node:fs';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { resolveJdkHome } = require('../../scripts/resolve-jdk.cjs') as {
  resolveJdkHome: () => { home: string; major: number } | null;
};

describe('resolveJdkHome', () => {
  it('finds Android Studio JBR or JAVA_HOME when JDK 17+ is installed', () => {
    const studioJbr = path.join(
      process.env.ProgramFiles || 'C:\\Program Files',
      'Android',
      'Android Studio',
      'jbr'
    );
    const hit = resolveJdkHome();
    if (existsSync(studioJbr) || process.env.JAVA_HOME) {
      expect(hit).not.toBeNull();
      expect(hit!.major).toBeGreaterThanOrEqual(17);
    } else {
      expect(hit === null || hit.major >= 17).toBe(true);
    }
  });
});
