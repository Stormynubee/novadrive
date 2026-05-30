#!/usr/bin/env node
/**
 * Verify Sarthi BFF health for EXPO_PUBLIC_SARTHI_API_URL.
 * Usage: node scripts/check-sarthi-bff.cjs [baseUrl]
 * Default base: process.env.EXPO_PUBLIC_SARTHI_API_URL or .env in cwd
 */
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^EXPO_PUBLIC_SARTHI_API_URL=(.*)$/);
    if (m) out.url = m[1].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const base = (process.argv[2] || loadEnv().url || '').replace(/\/$/, '');
if (!base) {
  console.error('No URL. Pass as argument or set EXPO_PUBLIC_SARTHI_API_URL in novadrive-mobile/.env');
  console.error('Deploy novadrive/ (Next.js) — NOT the static brief site at repo root.');
  process.exit(1);
}

const healthUrl = `${base}/api/sarthi/health`;

(async () => {
  console.log(`Checking ${healthUrl}`);
  try {
    const res = await fetch(healthUrl);
    const body = await res.text();
    console.log(`HTTP ${res.status}`);
    console.log(body);
    if (res.status === 404) {
      console.error('\n404 = wrong host. Use a Next.js deploy of novadrive/ or local: npm run dev:lan in novadrive/');
    }
    process.exit(res.ok ? 0 : 1);
  } catch (err) {
    console.error('Fetch failed:', err.message);
    console.error('For phone testing, run: cd novadrive && npm run dev:lan');
    console.error('Then set EXPO_PUBLIC_SARTHI_API_URL=http://YOUR_LAN_IP:3000');
    process.exit(1);
  }
})();
