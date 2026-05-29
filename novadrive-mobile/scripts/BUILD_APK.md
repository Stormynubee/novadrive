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

**Windows (PowerShell):** same commands. The script **auto-detects JDK 17+** (Android Studio JBR at `C:\Program Files\Android\Android Studio\jbr` is preferred over Java 8 on PATH).

If detection fails, set JDK explicitly for the session:

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
npm run android:apk
```

**Do not** rely on Java 8 (`java version "1.8..."`) — Gradle will fail on `foojay-resolver`.

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
