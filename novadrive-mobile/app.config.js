/** @type {import('expo/config').ExpoConfig} */
const appJson = require('./app.json');

const isJudgeApkBuild =
  process.env.CI === 'true' || process.env.MARGI_JUDGE_APK === '1';

const plugins = (appJson.expo.plugins ?? []).filter((plugin) => {
  if (!isJudgeApkBuild) return true;
  const name = Array.isArray(plugin) ? plugin[0] : plugin;
  return name !== 'expo-dev-client';
});

module.exports = {
  expo: {
    ...appJson.expo,
    plugins,
    ...(isJudgeApkBuild && {
      autolinking: {
        exclude: ['expo-dev-client', 'expo-dev-menu'],
      },
    }),
  },
};
