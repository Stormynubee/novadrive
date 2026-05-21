import type { Metadata, Viewport } from 'next';
import { Outfit, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const plexSans = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NovaDrive — Offline Emergency Co-Pilot',
  description:
    'START triage, trauma-tier routing, and dispatch packets when signal fails. Road Safety Hackathon 2026.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'NovaDrive' },
};

export const viewport: Viewport = {
  themeColor: '#0a0e14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plexSans.variable} ${plexMono.variable} font-sans antialiased`}
    >
      <body className="font-[family-name:var(--font-sans)]">{children}</body>
    </html>
  );
}
