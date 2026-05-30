#!/usr/bin/env node
/**
 * Judge / release debug APK — no expo-dev-client (avoids expo-dev-menu Kotlin failures).
 */
const { execSync } = require('node:child_process');
const { existsSync, rmSync } = require('node:fs');
const path = require('node:path');
const { setTimeout: sleep } = require('node:timers/promises');
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
  3. Then set for this PowerShell session:
     $env:JAVA_HOME = "C:\\Program Files\\Android\\Android Studio\\jbr"
     npm run android:apk

Or download margi-debug.apk from GitHub Actions (no local JDK needed):
  https://github.com/Stormynubee/Margi/actions/workflows/android-apk.yml
`);
  process.exit(1);
}

const env = {
  ...process.env,
  JAVA_HOME: jdk.home,
  PATH: `${path.join(jdk.home, 'bin')}${path.delimiter}${process.env.PATH || ''}`,
  CI: '1',
};

console.log(`Using JDK ${jdk.major} at ${jdk.home}`);

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  execSync(cmd, {
    stdio: 'inherit',
    cwd: opts.cwd ?? mobileRoot,
    env: opts.env ?? env,
  });
}

function runQuiet(cmd, opts = {}) {
  try {
    execSync(cmd, {
      stdio: 'ignore',
      cwd: opts.cwd ?? mobileRoot,
      env: opts.env ?? env,
    });
    return true;
  } catch {
    return false;
  }
}

async function removeAndroidDir() {
  if (!existsSync(androidDir)) return;

  const gradlew = path.join(androidDir, gradle);
  if (existsSync(gradlew)) {
    console.log('Stopping Gradle daemons (releases file locks on Windows)...');
    runQuiet(`${gradle} --stop`, { cwd: androidDir });
    await sleep(1500);
  }

  console.log('Removing stale android/ (may include expo-dev-menu from old prebuild)...');
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      rmSync(androidDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
      return;
    } catch (err) {
      if (attempt === maxAttempts) {
        console.warn(`
Could not delete android/ (${err.code || err.message}).
Common causes on Windows:
  - Android Studio has this project open
  - A terminal is cd'd into novadrive-mobile/android
  - Gradle or Java still holding files

Try:
  1. Close Android Studio and any File Explorer window in android/
  2. cd novadrive-mobile/android && .\\gradlew.bat --stop
  3. npm run android:apk

Continuing with expo prebuild --clean (may succeed or show the same lock)...
`);
        return;
      }
      console.log(`Delete attempt ${attempt}/${maxAttempts} failed; retrying in 2s...`);
      await sleep(2000);
    }
  }
}

(async () => {
  await removeAndroidDir();

  run('npx expo prebuild --platform android --clean');
  run(`${gradle} assembleDebug --no-daemon`, { cwd: androidDir });

  const apk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  console.log(`\nAPK ready: ${apk}`);
  console.log('Copy to margi-debug.apk for judges if uploading to GitHub Releases.');
})().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
