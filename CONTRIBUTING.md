# Contributing

Thanks for helping improve NovaDrive.

## Repository map

| Path | Purpose |
|------|---------|
| `novadrive-mobile/` | **Primary** — Expo Android/iOS app |
| `novadrive/` | Web UI prototype (Next.js) |
| `docs/` | Plans, team brief, static site source |
| `scripts/` | POI ingest (`ingestCorridors.py`) |

## Development setup

```bash
# Mobile (P0)
cd novadrive-mobile
npm install --legacy-peer-deps
npm test
npx expo start

# Web mirror
cd novadrive
npm install
npm run build

# Docs site
node docs/site/build-docs.js
```

## Pull requests

1. Branch from `master`: `feat/short-description` or `fix/short-description`
2. Keep PRs focused — one capability per PR when possible
3. Run `npm test` in `novadrive-mobile` before opening
4. Do not commit secrets, `.env`, or generated `data/*.db`

## Medical / safety changes

Changes to `startTriageFSM.ts` **must** include or update unit tests in `startTriageFSM.test.ts`. Follow START rules in [`docs/NOVADRIVE_FINAL_IMPLEMENTATION_PLAN.md`](docs/NOVADRIVE_FINAL_IMPLEMENTATION_PLAN.md) §8.

## Scope guard (hackathon)

- **P0:** Airplane-mode demo path must keep working
- **P1/P2:** Trip cards, Rah-Veer log, offline maps — see implementation plan §15
