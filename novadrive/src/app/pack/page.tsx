'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Check } from 'lucide-react';
import { AppShell } from '@/components/AppShell';

export default function PackPage() {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  function download() {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDone(true);
      localStorage.setItem('novadrive-pack', 'nh48-v1');
    }, 1500);
  }

  return (
    <AppShell backHref="/" title="Offline pack">
      <h2 className="mb-2 text-xl font-semibold font-[family-name:var(--font-display)]">
        Corridor pack
      </h2>
      <p className="mb-6 text-sm text-[var(--nova-muted)]">
        Pre-built POI database for offline hospital routing. Required for airplane-mode demo.
      </p>

      <div className="nova-card space-y-4 p-5">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--nova-muted)]">Region</span>
          <span className="font-medium">NH48 · Tamil Nadu</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--nova-muted)]">POIs</span>
          <span className="font-medium">~14,200 (demo)</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--nova-muted)]">Size</span>
          <span className="font-medium">4.2 MB + sql-wasm</span>
        </div>
        <button
          type="button"
          onClick={download}
          disabled={downloading || done}
          className="nova-btn-primary"
        >
          {done ? (
            <>
              <Check className="h-5 w-5" aria-hidden />
              Pack ready
            </>
          ) : downloading ? (
            'Downloading…'
          ) : (
            <>
              <Download className="h-5 w-5" aria-hidden />
              Download pack
            </>
          )}
        </button>
      </div>

      <p className="mt-6 text-xs text-[var(--nova-muted)]">
        Production: ingestCorridors.py builds emergency_seed.db from OpenStreetMap + manual
        verification.
      </p>
      <Link href="/" className="nova-btn-ghost mt-6 block text-center">
        Back to home
      </Link>
    </AppShell>
  );
}
