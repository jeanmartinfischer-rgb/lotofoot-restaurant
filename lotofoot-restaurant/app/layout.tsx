import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';
import Splash from '@/components/Splash';
import AutoRefresh from './auto-refresh';
import './globals.css';

export const metadata: Metadata = {
  title: "LotoFoot - L'Arpege",
  description: "Le concours de pronostics foot de l'equipe.",
  manifest: '/manifest.json',
};
export const viewport: Viewport = { themeColor: '#0B0B0D' };

const ICON = "h-5 w-5 mb-1";
const LINK = "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-chalk/70 hover:text-chalk hover:bg-ardoise whitespace-nowrap transition-colors";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh">
        <Splash />
        <AutoRefresh />
        <script dangerouslySetInnerHTML={{
          __html: "if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')"
        }} />
        <header className="sticky top-0 z-20 border-b border-ligne bg-pitch/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-2">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="bg-white rounded-lg p-1">
                <Image src="/logo.png" alt="L'Arpege" width={36} height={20} style={{ objectFit: 'contain' }} />
              </div>
              <span className="font-display text-sm tracking-tight">
                LOTO<span className="text-sang-vif">FOOT</span>
              </span>
            </Link>
          </div>
          <nav className="overflow-x-auto scrollbar-hide border-t border-ligne">
            <div className="flex min-w-max px-2 py-1 gap-1" style={{ color: '#D4AF37' }}>
              <Link href="/" className={LINK}>
                <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5 12 3l9 6.5" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></svg>
                Accueil
              </Link>
              <Link href="/matchs" className={LINK}>
                <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4Z" /><path d="m9 10 2 2 4-4" /></svg>
                Mes paris
              </Link>
              <Link href="/defi" className={LINK}>
                <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c1.5 3-1.5 5 0 8 1-1 2-3 1.5-5C16 8 18 11 18 14a6 6 0 0 1-12 0c0-2 1-4 3-6 .5 2 0 3 3 1-.5-3 0-5 0-6Z" /></svg>
                Défi
              </Link>
              <Link href="/tournoi" className={LINK}>
                <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l4 3 5-6 5 6 4-3-2 12H5Z" /><path d="M5 20h14" /></svg>
                Vainqueur
              </Link>
              <Link href="/classement" className={LINK}>
                <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v4a6 6 0 0 1-12 0Z" /><path d="M6 5H3v2a3 3 0 0 0 3 3" /><path d="M18 5h3v2a3 3 0 0 1-3 3" /><path d="M10 14h4l-.5 4h-3Z" /><path d="M8 20h8" /></svg>
                Classement
              </Link>
              <Link href="/ligues" className={LINK}>
                <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 6a3 3 0 0 1 0 6" /><path d="M18 14a6 6 0 0 1 3 6" /></svg>
                Ligues
              </Link>
              <Link href="/stats" className={LINK}>
                <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-8" /><path d="M22 20H2" /></svg>
                Mes stats
              </Link>
              <Link href="/mon-profil" className={LINK}>
                <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
                Mon profil
              </Link>
              <Link href="/admin" className={LINK}>
                <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></svg>
                Admin
              </Link>
              <LogoutButton />
            </div>
          </nav>
        </header>
        <main className="page-enter mx-auto w-full max-w-lg md:max-w-6xl px-4 py-5">{children}</main>
      </body>
    </html>
  );
}
