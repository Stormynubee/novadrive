# Margi rebrand — implementation plan index

> **Status:** Implemented 2026-05-28  
> **Design spec:** [../specs/2026-05-28-margi-rebrand-design.md](../specs/2026-05-28-margi-rebrand-design.md)

## Summary

Full product rebrand from NovaDrive to **Margi** with Care Path tokens, `com.margi.app`, brand module (TDD), component rename `Nova*` → `Margi*`, splash revamp, monorepo doc updates, and GitHub-facing doc/banner sweep.

## Verification

```bash
cd novadrive-mobile
npm run typecheck
npm test
npm run verify:docs
npm run verify:branding
```

## Doc sweep (2026-05-28)

- [x] `NOVADRIVE_*` judge docs → `MARGI_*` with redirect stubs
- [x] Banners (`banner.svg`, `banner-light.svg`) + PNG render
- [x] `docs/site` build pipeline + `margi-complete.html` + redirect from `novadrive-complete.html`
- [x] `verify-public-branding.mjs` + CI hook
- [x] [MARGI_MASTER_ENCYCLOPEDIA.md](../../MARGI_MASTER_ENCYCLOPEDIA.md) index

Native rebuild: `npx expo prebuild --clean` then `npx expo run:android`.
