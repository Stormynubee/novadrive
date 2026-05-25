# NovaDrive — AI agent guide

For **Team Vortex** and judges using Cursor (or similar) on this repo.

## Repository focus

| Priority | Path | Work here when… |
|----------|------|------------------|
| P0 | `novadrive-mobile/` | Mobile UX, journey safety, triage, GHP |
| P1 | `docs/` | Plans, submission, brief site |
| Optional | `novadrive/` | Web prototype mirror |

**Canonical drive flow:** Home → Trip (Plan Corridor) → Start Driving → Calibration → Live SOS HUD → Complete → Home.

## Rules for agents

1. **Safety-critical logic** in `novadrive-mobile/src/lib/` — use TDD: failing test first, minimal fix, green suite.
2. **Do not change** START triage FSM outcomes or GHP wire format without updating tests.
3. **Never commit** `.env`, API keys, or `data/*.db`.
4. Before claiming “done” on mobile: `npm run typecheck` and `npm test` in `novadrive-mobile`.
5. Optional device check: [DEVICE_SMOKE_MATRIX.md](../novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md).

## Recommended Cursor skills (install locally)

Search and install with the Skills CLI:

```bash
npx skills find react native testing
npx skills find github actions
npx skills find expo
```

Example installs (verify package names from search output):

```bash
npx skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y
```

Browse: [skills.sh](https://skills.sh/)

## Key docs

- [Stabilization design](../novadrive-mobile/docs/superpowers/specs/2026-05-23-novadrive-stabilization-design.md)
- [CHANGELOG.md](../CHANGELOG.md)
- [SUBMISSION.md](SUBMISSION.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
