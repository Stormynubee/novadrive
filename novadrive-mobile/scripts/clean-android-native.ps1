# Clears CMake caches and stops Gradle when native builds fail with "file is being used by another process".
$ErrorActionPreference = "SilentlyContinue"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

Write-Host "Stopping Gradle daemons..."
Set-Location "$root\android"
& .\gradlew.bat --stop | Out-Null

$paths = @(
  "$root\node_modules\react-native-reanimated\android\.cxx",
  "$root\node_modules\react-native-worklets\android\.cxx"
)
foreach ($p in $paths) {
  if (Test-Path $p) {
    Remove-Item -Recurse -Force $p
    Write-Host "Removed $p"
  }
}
Write-Host "Done. Wait 5s, then run: npx expo run:android (only one build at a time)"
