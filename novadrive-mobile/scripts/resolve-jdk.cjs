/**
 * Resolve JDK 17+ for Gradle (Expo/RN require Java 17+; foojay-resolver 1.0.0 needs it).
 */
const { execSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

const isWin = process.platform === 'win32';
const javaBin = isWin ? 'java.exe' : 'java';

function javaMajor(javaExe) {
  try {
    const out = execSync(`"${javaExe}" -version 2>&1`, { encoding: 'utf8' });
    const m =
      out.match(/version "(\d+)/) ||
      out.match(/openjdk version "(\d+)/) ||
      out.match(/version "1\.(\d+)/);
    if (!m) return 0;
    const n = Number(m[1]);
    return n === 1 ? Number(out.match(/version "1\.(\d+)/)?.[1] ?? 0) : n;
  } catch {
    return 0;
  }
}

function checkHome(home) {
  if (!home || !existsSync(home)) return null;
  const javaExe = path.join(home, 'bin', javaBin);
  if (!existsSync(javaExe)) return null;
  const major = javaMajor(javaExe);
  return major >= 17 ? { home, major, javaExe } : null;
}

function defaultCandidates() {
  const local = process.env.LOCALAPPDATA || '';
  const prog = process.env.ProgramFiles || 'C:\\Program Files';
  const prog86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
  return [
    process.env.JAVA_HOME,
    path.join(prog, 'Android', 'Android Studio', 'jbr'),
    path.join(local, 'Programs', 'Android', 'Android Studio', 'jbr'),
    path.join(prog, 'Java', 'jdk-21'),
    path.join(prog, 'Java', 'jdk-17'),
    path.join(prog, 'Eclipse Adoptium', 'jdk-21.0.10.7-hotspot'),
    path.join(prog, 'Microsoft', 'jdk-17.0.13.11-hotspot'),
    path.join(prog86, 'Android', 'openjdk', 'jdk-17'),
  ].filter(Boolean);
}

function resolveJdkHome() {
  for (const candidate of defaultCandidates()) {
    const hit = checkHome(candidate);
    if (hit) return hit;
  }
  return null;
}

module.exports = { resolveJdkHome, javaMajor };
