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
3. Before opening, in `novadrive-mobile`:
   ```bash
   npm run typecheck
   npm test
   ```
4. Do not commit secrets, `.env`, or generated `data/*.db`
5. For journey/safety UI changes, run the [device smoke matrix](novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md) on a physical device when you can

## Test-driven development (`src/lib`)

For new behavior or bug fixes in `novadrive-mobile/src/lib/`:

1. Write a failing test in `*.test.ts`
2. Run `npm test` and confirm the failure is for the right reason
3. Implement the minimal fix
4. Confirm all tests pass

## Medical / safety changes

Changes to `startTriageFSM.ts`, `crashEngine.ts`, `ghp.ts`, or `parseEmergencyText.ts` **must** include or update unit tests. Follow START rules in [`docs/NOVADRIVE_FINAL_IMPLEMENTATION_PLAN.md`](docs/NOVADRIVE_FINAL_IMPLEMENTATION_PLAN.md) §8.

## AI assistants

See [docs/AGENTS.md](docs/AGENTS.md) for Cursor subagents and recommended skills.

### Git commits (no `cursoragent` on GitHub)

Cursor can append `Co-authored-by: Cursor <cursoragent@cursor.com>` to commits, which adds **cursoragent** to the repo Contributors sidebar.

1. **Turn off** in Cursor: **Settings → Agent → Attribution → Commit attribution** (off). Restart Cursor.
2. **Enable the repo hook** (strips co-author lines if Cursor still adds them):

   ```powershell
   .\scripts\setup-git-hooks.ps1
   ```

   Or: `git config core.hooksPath .githooks`

If **cursoragent** still appears in the sidebar after history was cleaned, that is GitHub’s cached contributor list (append-only). New commits will not add it if attribution is off and the hook is enabled. To clear the sidebar entirely, open [GitHub Support](https://support.github.com/request) and ask to **regenerate the contributor graph** for this repository.

## Scope guard (hackathon)

- **P0:** Airplane-mode demo path must keep working
- **P1/P2:** Trip cards, Rah-Veer log, offline maps — see implementation plan §15
