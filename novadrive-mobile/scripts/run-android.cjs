#!/usr/bin/env node
/**
 * expo run:android with JDK 17+ (Windows often has Java 8 on PATH).
 */
const { execSync } = require('node:child_process');
const path = require('node:path');
const { resolveJdkHome } = require('./resolve-jdk.cjs');

const mobileRoot = path.resolve(__dirname, '..');
const androidDir = path.join(mobileRoot, 'android');
const isWin = process.platform === 'win32';
const gradle = isWin ? 'gradlew.bat' : './gradlew';

const jdk = resolveJdkHome();
if (!jdk) {
  console.error(`
Margi Android build requires JDK 17 or newer. Your PATH java is too old (Java 8 JRE is common on Windows).

Fix options:
  1. Install Android Studio (includes JBR) — usually at:
     C:\\Program Files\\Android\\Android Studio\\jbr
  2. Or install Temurin 17: https://adoptium.net/
  3. Then run:
     npm run android

Or build an APK without USB:
     npm run android:apk
`);
  process.exit(1);
}

const env = {
  ...process.env,
  JAVA_HOME: jdk.home,
  PATH: `${path.join(jdk.home, 'bin')}${path.delimiter}${process.env.PATH || ''}`,
};

console.log(`Using JDK ${jdk.major} at ${jdk.home}`);

try {
  execSync(`${gradle} --stop`, { cwd: androidDir, env, stdio: 'ignore' });
} catch {
  /* android/ may not exist yet */
}

const args = process.argv.slice(2);
const expoArgs = ['expo', 'run:android', ...args].join(' ');
execSync(`npx ${expoArgs}`, { cwd: mobileRoot, env, stdio: 'inherit' });
