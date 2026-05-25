# NovaDrive — version & commit history

Complete timeline for [Stormynubee/novadrive](https://github.com/Stormynubee/novadrive) on branch **`master`**.

**Fork this repo:** [github.com/Stormynubee/novadrive/fork](https://github.com/Stormynubee/novadrive/fork) — use GitHub **Fork** to copy under your account, then clone your fork.

**Compare any two versions:**

```text
https://github.com/Stormynubee/novadrive/compare/<older>...<newer>
```

---

## Release tags (milestones)

| Tag | Commit | Date | Summary |
|-----|--------|------|---------|
| [`v0.1.0-p0`](https://github.com/Stormynubee/novadrive/releases/tag/v0.1.0-p0) | `7b5b25a` | 2026-05-22 | Expo P0 app, triage FSM, GHP/QR, monorepo CI |
| [`v1.0.0-govtech-ui`](https://github.com/Stormynubee/novadrive/releases/tag/v1.0.0-govtech-ui) | `108e716` | 2026-05-25 | GovTech tabs, Plan Corridor, calibration, SOS HUD |
| [`v1.1.0-stabilization`](https://github.com/Stormynubee/novadrive/releases/tag/v1.1.0-stabilization) | `bdd5a04` | 2026-05-25 | Journey lifecycle, voice/impact gating, 32 unit tests |
| [`v1.2.0-hackathon-publish`](https://github.com/Stormynubee/novadrive/releases/tag/v1.2.0-hackathon-publish) | `fb1b176` | 2026-05-25 | README/CHANGELOG, CI typecheck, docs (current **master**) |

---

## All commits (oldest → newest)

### 1. `1ee8d75` — 2026-05-20

**Add RelaySaathi team brief site and Vercel deployment config**

- Initial team brief static site under `docs/site/`
- Vercel config for hackathon brief hosting

[View commit](https://github.com/Stormynubee/novadrive/commit/1ee8d75)

---

### 2. `0d9dcad` — 2026-05-20

**Fix broken diagrams and code blocks in brief site renderer**

- Brief site markdown/HTML rendering fixes

[View commit](https://github.com/Stormynubee/novadrive/commit/0d9dcad)

---

### 3. `7b5b25a` — 2026-05-22 · tag `v0.1.0-p0`

**NovaDrive: Expo P0 app, monorepo docs, CI, and full rebrand**

- `novadrive-mobile/` Expo SDK 54 — guest onboarding, journey HUD, START triage, SQLite routing
- Golden Hour Packet, QR relay, airplane-mode demo path
- `novadrive/` web prototype mirror
- Root CI: mobile tests, web build, docs site build
- Rebrand from RelaySaathi → NovaDrive

[View commit](https://github.com/Stormynubee/novadrive/commit/7b5b25a)

---

### 4. `108e716` — 2026-05-25 · tag `v1.0.0-govtech-ui`

**feat(mobile): GovTech UI, tabs, Plan Corridor, calibration and SOS HUD**

- Tab shell: Home, Trip, Community, Profile + `/settings`
- `PlanCorridorScreen`, route cards, **Start Driving** → `journey/depart` → live HUD
- Stitch-aligned components: `DrivingHudBackdrop`, `HoldSOSButton`, `RouteCalibrationPath`
- Profile photo, `DashboardHeader`, GovTech design tokens
- Trip offline briefing (`trip/plan`, `trip/discover`)

[View commit](https://github.com/Stormynubee/novadrive/commit/108e716) · [Compare from P0](https://github.com/Stormynubee/novadrive/compare/v0.1.0-p0...108e716)

---

### 5. `bdd5a04` — 2026-05-25 · tag `v1.1.0-stabilization`

**fix(mobile): stabilization, journey lifecycle, voice gating, and unit tests**

- `AppContext`: `IDLE` reset on end journey, location alert, `sosSensitivity` → crash thresholds
- Voice mic only when `voiceCrashDetection` on; impact + voice gated to foreground active journey
- `CrashCandidateModal`: no backdrop dismiss; calibration cancel race fix
- `journeyMonitoring.ts` + tests: `parseEmergencyText`, `ghp`, `storage`, expanded FSM/crash suites (**32 tests**)
- `package.json`: `typecheck`, `test:coverage`, `test:watch`

[View commit](https://github.com/Stormynubee/novadrive/commit/bdd5a04) · [Compare from GovTech UI](https://github.com/Stormynubee/novadrive/compare/v1.0.0-govtech-ui...bdd5a04)

---

### 6. `e819032` — 2026-05-25

**docs: hackathon README, CHANGELOG, CI typecheck, agent guide, and team docs**

- Root README: Team Vortex, IIT Madras RoadSoS, architecture + drive-flow diagrams, CI badge
- `CHANGELOG.md`, `CONTRIBUTING.md`, `docs/AGENTS.md`
- CI: `npm run typecheck` in mobile job
- Stitch design refs, team guide HTML, superpowers specs/plans
- Issue template links (team guide, smoke matrix)

[View commit](https://github.com/Stormynubee/novadrive/commit/e819032)

---

### 7. `fb1b176` — 2026-05-25 · tag `v1.2.0-hackathon-publish` (HEAD)

**chore: remove .cursor from repo and gitignore IDE metadata**

- Removed `.cursor/agents` from public tree (local IDE only via `.gitignore`)
- Trimmed `docs/AGENTS.md` subagent path reference

[View commit](https://github.com/Stormynubee/novadrive/commit/fb1b176)

---

## Related repos (profile & publish)

| Repo | Branch | Commits (this effort) |
|------|--------|------------------------|
| [Stormynubee/novadrive](https://github.com/Stormynubee/novadrive) | `master` | Table above |
| [Stormynubee/Stormynubee](https://github.com/Stormynubee/Stormynubee) | `main` | Profile README: NovaDrive sandbox card (`bbbf72c`, `52ed9eb`, `3070b2c`) |

---

## Checkout a specific version locally

```bash
git clone https://github.com/Stormynubee/novadrive.git
cd novadrive

# P0 only
git checkout v0.1.0-p0

# GovTech UI (before stabilization tests)
git checkout v1.0.0-govtech-ui

# Stabilization + tests
git checkout v1.1.0-stabilization

# Current hackathon publish (recommended for judges)
git checkout v1.2.0-hackathon-publish
# or: git checkout master
```

---

## Full diff: project start → now

[Compare `1ee8d75`…`fb1b176`](https://github.com/Stormynubee/novadrive/compare/1ee8d75...fb1b176)
