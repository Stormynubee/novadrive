'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';

export default function SettingsPage() {
  const [largeText, setLargeText] = useState(false);
  const [batterySaver, setBatterySaver] = useState(false);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    setLargeText(localStorage.getItem('novadrive-large') === '1');
    setBatterySaver(localStorage.getItem('novadrive-battery') === '1');
    setLang(localStorage.getItem('novadrive-lang') ?? 'en');
    document.documentElement.style.setProperty(
      '--font-scale',
      localStorage.getItem('novadrive-large') === '1' ? '1.15' : '1'
    );
  }, []);

  function toggleLarge(v: boolean) {
    setLargeText(v);
    localStorage.setItem('novadrive-large', v ? '1' : '0');
    document.documentElement.style.setProperty('--font-scale', v ? '1.15' : '1');
  }

  function toggleBattery(v: boolean) {
    setBatterySaver(v);
    localStorage.setItem('novadrive-battery', v ? '1' : '0');
  }

  return (
    <AppShell backHref="/" title="Settings">
      <h2 className="mb-6 text-xl font-semibold font-[family-name:var(--font-display)]">
        Accessibility & battery
      </h2>

      <div className="nova-card divide-y divide-[var(--nova-border)]">
        <label className="flex items-center justify-between p-4">
          <span className="text-sm font-medium">Large text</span>
          <input
            type="checkbox"
            checked={largeText}
            onChange={(e) => toggleLarge(e.target.checked)}
            className="h-5 w-5 accent-[var(--nova-amber)]"
          />
        </label>
        <label className="flex items-center justify-between p-4">
          <span className="text-sm font-medium">Battery saver</span>
          <input
            type="checkbox"
            checked={batterySaver}
            onChange={(e) => toggleBattery(e.target.checked)}
            className="h-5 w-5 accent-[var(--nova-amber)]"
          />
        </label>
        <div className="p-4">
          <span className="text-sm font-medium">Language</span>
          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
              localStorage.setItem('novadrive-lang', e.target.value);
            }}
            className="mt-2 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-bg)] px-3 py-3 text-sm"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>
      </div>

      <p className="mt-4 text-xs text-[var(--nova-muted)]">
        Battery saver: single GPS read, no live map, text-first triage.
      </p>
      <Link href="/" className="nova-btn-ghost mt-8 block text-center">
        Back to home
      </Link>
    </AppShell>
  );
}
