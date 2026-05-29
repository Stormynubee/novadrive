# Margi Web (prototype + Sarthi BFF)

Next.js app with two roles:

1. **Sarthi BFF** (Phase 3) — Gemini chat + health check for the mobile app  
   - `POST /api/sarthi/chat`  
   - `GET /api/sarthi/health`
2. **Web prototype** — emergency flow mirror for team demos

**Judges should use `novadrive-mobile/`** for APK, sensors, camera, and SMS.

## Local dev

```bash
npm install
cp .env.example .env   # add GOOGLE_GENERATIVE_AI_API_KEY
npm run dev            # http://localhost:3000
```

## Deploy to Vercel (for mobile Sarthi)

See **[docs/PHASE3_SETUP.md](../docs/PHASE3_SETUP.md)** — set **Root Directory** to `novadrive` and add `GOOGLE_GENERATIVE_AI_API_KEY`.

Shared logic lives in `src/lib/` (START FSM, GHP, facilities). Mobile port: `../novadrive-mobile/src/lib/`.
