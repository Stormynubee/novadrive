# Build Margi debug APK (judges / CI)

## One-time setup

- JDK 17+
- Android SDK (Android Studio or command-line tools)
- `ANDROID_HOME` set

## CI / judge builds (no dev client)

GitHub Actions sets `CI=true` and `MARGI_JUDGE_APK=1` so `app.config.js` omits `expo-dev-client` and avoids `expo-dev-menu` compile failures. Locally:

```bash
set MARGI_JUDGE_APK=1
npx expo prebuild --platform android --clean
```

## Build

```bash
cd novadrive-mobile
npm install --legacy-peer-deps
npx expo prebuild --platform android --clean
cd android
./gradlew assembleDebug
```

**Windows (PowerShell):**

```powershell
cd novadrive-mobile
npx expo prebuild --platform android --clean
cd android
.\gradlew.bat assembleDebug
```

Output APK:

`novadrive-mobile/android/app/build/outputs/apk/debug/app-debug.apk`

Copy to release artifact name:

```bash
cp android/app/build/outputs/apk/debug/app-debug.apk ../margi-debug.apk
```

## GitHub Release

Upload `margi-debug.apk` to release **`v2.0.0-production`** (or latest). Link from [JUDGE_START_HERE.md](../../JUDGE_START_HERE.md).

CI: see [.github/workflows/android-apk.yml](../../.github/workflows/android-apk.yml) on `workflow_dispatch` or release publish.
