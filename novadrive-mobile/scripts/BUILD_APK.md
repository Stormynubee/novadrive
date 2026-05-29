# Build Margi debug APK (judges / CI)

Margi ships **without `expo-dev-client`**. The previously pinned `expo-dev-client@56` was incompatible with Expo SDK 54 and broke Android builds (`expo-dev-menu` Kotlin errors).

## Fastest: GitHub Actions

1. [Android debug APK workflow](https://github.com/Stormynubee/Margi/actions/workflows/android-apk.yml) → **Run workflow**
2. Download artifact **`margi-debug-apk`** → rename/use as **`margi-debug.apk`**

## Local build (one command)

```bash
cd novadrive-mobile
npm install --legacy-peer-deps
npm run android:apk
```

**Windows (PowerShell):** same commands.

Output:

`novadrive-mobile/android/app/build/outputs/apk/debug/app-debug.apk`

The script deletes stale `android/` first so an old prebuild cannot reintroduce `expo-dev-menu`.

## Manual steps

```bash
cd novadrive-mobile
npm install --legacy-peer-deps
rm -rf android   # or Remove-Item -Recurse -Force android on Windows
npx expo prebuild --platform android --clean
cd android
./gradlew assembleDebug   # gradlew.bat on Windows
```

## Optional: custom dev client (developers only)

If you need Expo dev menu for day-to-day native debugging:

```bash
npx expo install expo-dev-client@~6.0.21
```

Add `"expo-dev-client"` back to `app.json` plugins temporarily. **Do not** use that config for judge/release APK builds.

## Requirements

- JDK 17+
- Android SDK (`ANDROID_HOME`)
- ~4 GB free disk for Gradle caches
