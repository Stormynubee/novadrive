# Margi — master encyclopedia (judge & team index)

**Status:** v1.5.0-margi-rebrand shipped (2026-05-28)  
**Product:** **Margi** — offline-first Golden Hour co-pilot (IIT Madras RoadSoS 2026)  
**Repo:** [github.com/Stormynubee/novadrive](https://github.com/Stormynubee/novadrive) (slug unchanged)  
**Tagline:** *When signal drops, the path still holds.*

This file is the **navigation hub** for all judge-facing documentation after the Margi rebrand. Deep narrative lives in [MARGI_MASTER_BRIEF.md](./MARGI_MASTER_BRIEF.md).

---

## Quick links

| Resource | Path / URL |
|----------|------------|
| Root README | [README.md](../README.md) |
| Submission checklist | [SUBMISSION.md](./SUBMISSION.md) |
| Architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Live brief site | [roadsafetyhackathon-six.vercel.app](https://roadsafetyhackathon-six.vercel.app) |
| Complete UI brief (HTML) | [margi-complete.html](https://roadsafetyhackathon-six.vercel.app/margi-complete.html) |
| Mobile app README | [novadrive-mobile/README.md](../novadrive-mobile/README.md) |
| Design system | [novadrive-mobile/DESIGN.md](../novadrive-mobile/DESIGN.md) |
| Changelog | [CHANGELOG.md](../CHANGELOG.md) |
| Version history | [VERSION_HISTORY.md](./VERSION_HISTORY.md) |
| Rebrand release notes | [release-notes-margi-rebrand.md](../release-notes-margi-rebrand.md) |

---

## Brand & native identifiers

| Item | Value |
|------|--------|
| Display name | Margi |
| Care Path primary | Royal blue `#0056b3` |
| Care Path urgent | Orange `#ff8c00` |
| Android package | `com.margi.app` |
| URL scheme | `margi://` |
| GHP SMS header | `MARGI GHP` |
| GHP hash prefix | `mg-` |
| QR envelope | `ND1:` (unchanged for relay compatibility) |

## Legacy compatibility

Older packets and demos may still show `NOVADRIVE GHP` in SMS bodies. The mobile app accepts both `MARGI GHP` and `NOVADRIVE GHP` headers when parsing (`LEGACY_GHP_HEADERS` in `novadrive-mobile/src/lib/brand.ts`). Internal storage keys remain `nd_*` by design.

---

## Judge documentation map (renamed 2026-05-28)

| Document | Purpose |
|----------|---------|
| [MARGI_MASTER_BRIEF.md](./MARGI_MASTER_BRIEF.md) | Full team narrative, flows, demo script |
| [MARGI_FINAL_IMPLEMENTATION_PLAN.md](./MARGI_FINAL_IMPLEMENTATION_PLAN.md) | Build spec §1–20, TDD rules |
| [MARGI_REFINEMENT_PLAN.md](./MARGI_REFINEMENT_PLAN.md) | UI refinement phases R1–R9 |
| [MARGI_STITCH_FINAL_IMPLEMENTATION_PLAN.md](./MARGI_STITCH_FINAL_IMPLEMENTATION_PLAN.md) | Stitch → app integration |
| [MARGI_V2_IMPLEMENTATION_PLAN.md](./MARGI_V2_IMPLEMENTATION_PLAN.md) | Post-hackathon roadmap |
| [MARGI_TEAM_GUIDE.html](./MARGI_TEAM_GUIDE.html) | Printable team guide |
| [site/margi-complete.html](./site/margi-complete.html) | Complete UI + project brief (HTML) |
| [site/MARGI_COMPLETE_UI_BRIEF.html](./site/MARGI_COMPLETE_UI_BRIEF.html) | UI-focused brief export |

**Redirects:** Former `NOVADRIVE_*` paths have short stubs pointing here or to the `MARGI_*` files above.

---

## Monorepo layout

```
novadrive-mobile/     # P0 — Expo SDK 54, Margi Care Path UI
novadrive/            # Next.js web mirror (optional demo)
docs/                 # Plans, MARGI_* briefs, site → Vercel
scripts/              # Banner render, POI ingest, doc sweep
data/                 # Generated SQLite (gitignored)
```

---

## Safety lanes (product)

1. **Golden Hour** — Drive mode → trip → HUD → START triage → trauma routing → GHP → QR relay → 108 SMS when online.
2. **Naari Shakti** — Gender-gated women's portal → hold emergency → distress HUD + SMS composer.

Specs: [2026-05-23-naari-shakti-design.md](./superpowers/specs/2026-05-23-naari-shakti-design.md) · Stitch prompt [naari-shakti-portal.md](./design/stitch-prompts/naari-shakti-portal.md)

---

## Verification commands

```bash
cd novadrive-mobile
npm run typecheck
npm test
npm run verify:docs
npm run verify:branding
```

Public copy must not contain `NovaDrive` / `NOVADRIVE` except in [VERSION_HISTORY.md](./VERSION_HISTORY.md) commit archaeology and historical Stitch refs under `docs/design/refs/`.

---

## Assets & banners

| Asset | Path |
|-------|------|
| GitHub banner (dark) | `docs/assets/banner.svg` → `banner.png` |
| GitHub banner (light) | `docs/assets/banner-light.svg` → `banner-light.png` |
| Regenerate PNGs | `node scripts/render-banner.mjs` |
| Store icons | See `novadrive-mobile/assets/MARGI_ASSETS.md` |

---

## AI / agent workflow

See [AGENTS.md](./AGENTS.md). Rebrand implementation plan: [superpowers/plans/2026-05-28-margi-rebrand.md](./superpowers/plans/2026-05-28-margi-rebrand.md).

---

*Team Vortex · IIT Madras Road Safety Hackathon 2026 · Margi v1.5.0*
