/**
 * Gradle 9 removed JvmVendorSpec.IBM_SEMERU; foojay-resolver-convention 0.5.0 still references it.
 * @see https://github.com/facebook/react-native/issues/55781
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native',
  'gradle-plugin',
  'settings.gradle.kts',
);

if (!fs.existsSync(target)) {
  console.warn('[patch-foojay] skip: @react-native/gradle-plugin not installed');
  process.exit(0);
}

const before = fs.readFileSync(target, 'utf8');
const after = before.replace(
  'foojay-resolver-convention").version("0.5.0")',
  'foojay-resolver-convention").version("1.0.0")',
);

if (before === after) {
  if (before.includes('1.0.0')) {
    console.log('[patch-foojay] already on 1.0.0');
  } else {
    console.warn('[patch-foojay] pattern not found; check settings.gradle.kts');
  }
  process.exit(0);
}

fs.writeFileSync(target, after);
console.log('[patch-foojay] bumped foojay-resolver-convention 0.5.0 -> 1.0.0');
