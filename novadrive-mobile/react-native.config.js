const isJudgeApkBuild =
  process.env.CI === 'true' || process.env.MARGI_JUDGE_APK === '1';

const disabledDevClient = {
  'expo-dev-client': { platforms: { android: null, ios: null } },
  'expo-dev-menu': { platforms: { android: null, ios: null } },
  'expo-dev-launcher': { platforms: { android: null, ios: null } },
};

module.exports = {
  dependencies: isJudgeApkBuild ? disabledDevClient : {},
};
