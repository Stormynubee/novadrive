#!/usr/bin/env node
/**
 * Judge / release debug APK — no expo-dev-client (avoids expo-dev-menu Kotlin failures).
 */
const { execSync } = require('node:child_process');
const { existsSync, rmSync } = require('node:fs');
const path = require('node:path');

const mobileRoot = path.resolve(__dirname, '..');
const androidDir = path.join(mobileRoot, 'android');
const isWin = process.platform === 'win32';
const gradle = isWin ? 'gradlew.bat' : './gradlew';

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: opts.cwd ?? mobileRoot, env: process.env });
}

if (existsSync(androidDir)) {
  console.log('Removing stale android/ (may include expo-dev-menu from old prebuild)...');
  rmSync(androidDir, { recursive: true, force: true });
}

run('npx expo prebuild --platform android --non-interactive');
run(`${gradle} assembleDebug --no-daemon`, { cwd: androidDir });

const apk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
console.log(`\nAPK ready: ${apk}`);
console.log('Copy to margi-debug.apk for judges if uploading to GitHub Releases.');
