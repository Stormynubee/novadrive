## v1.5.0 — Margi rebrand

### Highlights

- **New identity:** Margi (Care Path) — royal blue and orange design system from the heart/path logo.
- **Native app:** `com.margi.app`, URL scheme `margi://`, white splash, Margi wordmark across tabs and onboarding.
- **Golden Hour packets:** SMS header `MARGI GHP`, hash prefix `mg-`; QR format unchanged (`ND1:`).

### Upgrade notes

- Install as a **new app** on device (package ID changed to `com.margi.app`).
- Run `npx expo prebuild --clean` before building APK.
- Optional: replace `novadrive-mobile/assets/icon.png` from `margi-logo-source.png` (see `assets/MARGI_ASSETS.md`).

### Verification

```bash
cd novadrive-mobile && npm test && npm run typecheck
```
