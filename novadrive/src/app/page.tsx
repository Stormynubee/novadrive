'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertTriangle, QrCode, Download, Settings } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { NovaLogo } from '@/components/NovaLogo';
import { StatusChips } from '@/components/StatusChips';
import { clearSession } from '@/lib/session-store';

export default function HomePage() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  function startEmergency() {
    clearSession();
    window.location.href = '/emergency/locate';
  }

  return (
    <AppShell>
      <div className="flex flex-1 flex-col">
        <div className="mb-8">
          <NovaLogo />
          <p className="mt-3 max-w-sm text-sm italic text-[var(--nova-muted)]">
            Signal drops. The critical minute doesn&apos;t.
          </p>
        </div>

        <StatusChips offline={offline} packReady />

        <div className="mt-8 flex flex-1 flex-col justify-center gap-4">
          <button type="button" onClick={startEmergency} className="nova-btn-primary">
            <AlertTriangle className="h-6 w-6" aria-hidden />
            Start emergency
          </button>

          <Link href="/scan" className="nova-btn-secondary">
            <QrCode className="h-5 w-5" aria-hidden />
            Scan distress QR
          </Link>

          <Link href="/pack" className="nova-btn-ghost text-center">
            <span className="inline-flex items-center gap-2">
              <Download className="h-4 w-4" aria-hidden />
              Download corridor pack
            </span>
          </Link>
        </div>

        <footer className="mt-10 space-y-3 border-t border-[var(--nova-border)] pt-6">
          <p className="text-center text-xs text-[var(--nova-muted)]">
            Decision support only — not a medical diagnosis. Call 108/112 when possible.
          </p>
          <Link
            href="/settings"
            className="mx-auto flex items-center justify-center gap-1 text-xs text-[var(--nova-muted)] hover:text-[var(--nova-cyan)]"
          >
            <Settings className="h-3.5 w-3.5" aria-hidden />
            Settings & accessibility
          </Link>
        </footer>
      </div>
    </AppShell>
  );
}
