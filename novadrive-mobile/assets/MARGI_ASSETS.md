# Margi native assets

After adding your logo PNG as `margi-logo-source.png` in this folder, regenerate store icons:

1. Resize to 1024×1024 → `icon.png`
2. Resize to 512×512 centered → `splash-icon.png`
3. Android adaptive foreground (432×432 safe zone) → `android-icon-foreground.png`
4. White background → `android-icon-background.png`

Then run:

```bash
npx expo prebuild --clean
npx expo run:android
```

Until icons are replaced, the in-app `MargiLogo` SVG mark is used on splash and onboarding.
