# Maestro smoke flows (Margi)

Optional **device/emulator** smoke tests complement Jest unit tests and [DEVICE_SMOKE_MATRIX.md](../novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md).

## Prerequisites

1. Install [Maestro CLI](https://maestro.mobile.dev/docs/getting-started/installation)
2. Install debug APK (`margi-debug.apk`) or `npm run android:apk`
3. App id: **`com.margi.app`**

## Run all flows

```bash
cd novadrive-mobile
maestro test .maestro/
```

## Flows

| File | Covers |
|------|--------|
| `01-guest-launch.yaml` | Auth → Guest → Home visible |
| `02-drive-mode-card.yaml` | ENTER DRIVE MODE card tappable |
| `03-explore-tab.yaml` | Explore tab + version footer |
| `04-scan-tab.yaml` | Scan tab opens |
| `05-naari-gate.yaml` | Naari screen redirects when not eligible |

These are **smoke** checks (navigation shell), not clinical validation. Record results in `DEVICE_SMOKE_MATRIX.md`.

## CI

Not wired in GitHub Actions (requires emulator + APK artifact). Run locally before demo day or after APK CI succeeds.
