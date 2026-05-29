const isJudgeApkBuild =
  process.env.CI === 'true' || process.env.MARGI_JUDGE_APK === '1';

/** @type {import('@react-native-community/cli-types').Config} */
module.exports = {
  dependencies: isJudgeApkBuild
    ? {
        'expo-dev-client': { platforms: { android: null, ios: null } },
        'expo-dev-menu': { platforms: { android: null, ios: null } },
        'expo-dev-launcher': { platforms: { android: null, ios: null } },
      }
    : {},
};
