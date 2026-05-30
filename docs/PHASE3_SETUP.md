# Margi Phase 3 — Production setup guide

Use this after cloning **v2.0.0-production** (integration milestone tag). Secrets stay in local `.env` files — never commit them. **Not clinical production** — see [CANON.md](CANON.md).

---

## 1. Supabase (auth, NGO, dispatch audit)

**Project:** `Projectmargi` · ID `yllcmksndrhlektbjvcu`  
**URL:** `https://yllcmksndrhlektbjvcu.supabase.co`

### Already done if you ran the migration

Tables with RLS: `profiles`, `volunteer_providers`, `dispatch_events`.

### Mobile env (`novadrive-mobile/.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=https://yllcmksndrhlektbjvcu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...   # Settings → API Keys → Publishable
```

Use the **publishable** key (`sb_publishable_...`), not the secret key.

### Auth settings (Supabase Dashboard)

1. **Authentication → Providers → Email** — enabled.
2. For hackathon demos, you can disable **Confirm email** so sign-up works instantly.
3. Test: Create account → Sign out → Sign in.

### NGO demo row

After registering in the app, in **Table Editor → volunteer_providers**, set `verified = true`, or run:

```sql
insert into volunteer_providers (org_name, contact_name, phone, service_area, lat, lng, verified)
values ('Chennai Community Ambulance', 'Demo Contact', '+911080000000', 'Chennai Central', 13.0827, 80.2707, true);
```

---

## 2. Sarthi BFF on Vercel (Gemini online)

The mobile app calls your **Next.js BFF** in `novadrive/` — not Google directly. Gemini key stays on the server.

### What you need

| Item | Where |
|------|--------|
| Google AI key | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| Vercel account | [vercel.com](https://vercel.com) linked to GitHub |

### Option A — Deploy from GitHub (recommended)

1. Open [vercel.com/new](https://vercel.com/new).
2. Import **Stormynubee/Margi** (or your fork).
3. **Root Directory:** click Edit → set to **`novadrive`** (not repo root).
4. Framework: **Next.js** (auto-detected).
5. **Build settings (critical for monorepo):** expand **Build and Output Settings** before first deploy:
   - **Install Command:** `npm install` (override ON)
   - **Build Command:** `npm run build` (override ON)
   - **Output Directory:** **leave blank** (override ON, delete any `docs/site` value)
   
   The repo root `vercel.json` is for the static **brief site** only. If Output Directory is `docs/site`, the Sarthi BFF build will fail even though `next build` succeeds.
6. **Environment variables** (Production + Preview):

   | Name | Value |
   |------|--------|
   | `GOOGLE_GENERATIVE_AI_API_KEY` | your Google AI Studio key |

6. Deploy. Note the URL, e.g. `https://margi-sarthi-xxx.vercel.app`.

### Option B — Deploy from CLI

```powershell
cd C:\Users\storm\roadsafetyhackathon\novadrive
npm install
npx vercel login
npx vercel --prod
# When prompted, link project; set GOOGLE_GENERATIVE_AI_API_KEY in Vercel dashboard after first deploy
```

### Verify BFF

```powershell
curl https://YOUR-APP.vercel.app/api/sarthi/health
```

Expected:

```json
{ "ok": true, "service": "sarthi-bff", "model": "gemini-2.0-flash", "geminiConfigured": true }
```

If `ok` is false, add or fix `GOOGLE_GENERATIVE_AI_API_KEY` in Vercel → Project → Settings → Environment Variables, then **Redeploy**.

### Point mobile app at Vercel

In `novadrive-mobile/.env`:

```env
EXPO_PUBLIC_SARTHI_API_URL=https://YOUR-APP.vercel.app
```

No trailing slash. **Restart Expo** after changing `.env`:

```powershell
cd novadrive-mobile
npx expo start --clear
```

### In-app check

Open **Sarthi** → status chip should say **Gemini BFF online**. Ask a non-KB question; reply should come from Gemini (not only offline rules).

### Do not use the team brief URL for Sarthi

These hosts serve the **static** brief site from repo-root `vercel.json` — they return **404** for `/api/sarthi/health`:

- `https://margi-tau.vercel.app`
- `https://roadsafetyhackathon-six.vercel.app`

Sarthi requires a **separate Vercel project** with **Root Directory = `novadrive`**, or local `npm run dev:lan` in `novadrive/`.

Verify from your machine:

```powershell
cd novadrive-mobile
node scripts/check-sarthi-bff.cjs https://YOUR-NOVADRIVE-BFF.vercel.app
```

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| Chip says “BFF not configured” | Set `EXPO_PUBLIC_SARTHI_API_URL` and restart Expo |
| Chip says “BFF unreachable” | URL points at brief site (404), BFF not deployed, or phone cannot reach LAN IP |
| Health returns 503 | Missing `GOOGLE_GENERATIVE_AI_API_KEY` on Vercel |
| Works on emulator, not phone | LAN URL (`192.168.x.x`) only works on same Wi‑Fi — use Vercel URL on physical devices |
| Build: *No Next.js version detected* | Install Command was static-site echo — set `npm install` |
| Build: *output directory docs/site not found* | **Clear Output Directory** in Vercel → Settings → Build (must be empty for Next.js) |
| CORS errors | BFF already sends CORS headers; ensure you hit `/api/sarthi/chat` via the deployed domain |

---

## 3. HTTP dispatch (optional for full emergency demo)

Set real POST endpoints that return:

```json
{
  "center": { "name": "Trauma Center", "phone": "108", "etaMinutes": 8 },
  "unit": { "name": "Police PCR", "phone": "112", "etaMinutes": 6 }
}
```

```env
EXPO_PUBLIC_TRAUMA_DISPATCH_URL=https://your-api.example.com/trauma
EXPO_PUBLIC_POLICE_DISPATCH_URL=https://your-api.example.com/police
```

Without these, emergency response shows an inline “configure dispatch URLs” card (fail-closed by design).

---

## 4. Run on device

```powershell
cd novadrive-mobile
npm install
npx expo run:android    # Phase 3 native crash needs dev build, not Expo Go
```

Smoke tests: `novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md` rows **27–32**.

---

## Quick checklist

- [ ] Supabase migration applied
- [ ] `novadrive-mobile/.env` has Supabase URL + publishable key
- [ ] Vercel deploy of `novadrive/` with `GOOGLE_GENERATIVE_AI_API_KEY`
- [ ] `/api/sarthi/health` returns `"ok": true`
- [ ] `EXPO_PUBLIC_SARTHI_API_URL` = Vercel URL
- [ ] Sarthi chip shows **Gemini BFF online**
- [ ] (Optional) Dispatch URLs + verified NGO row
