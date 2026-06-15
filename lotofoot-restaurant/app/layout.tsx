import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';
import './globals.css';
export const metadata: Metadata = {
  title: "LotoFoot - L'Arpege",
  description: "Le concours de pronostics foot de l'equipe.",
  manifest: '/manifest.json',
};
export const viewport: Viewport = { themeColor: '#0B0B0D' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh">
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
            <div className="flex min-w-max px-2 py-1 gap-1">
              <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-chalk/70 hover:text-chalk hover:bg-ardoise whitespace-nowrap transition-colors">
                Accueil
              </Link>
              <Link href="/matchs" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-chalk/70 hover:text-chalk hover:bg-ardoise whitespace-nowrap transition-colors">
                Mes paris
              </Link>
              <Link href="/classement" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-chalk/70 hover:text-chalk hover:bg-ardoise whitespace-nowrap transition-colors">
                Classement
              </Link>
              <Link href="/classement-pdf" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-chalk/70 hover:text-chalk hover:bg-ardoise whitespace-nowrap transition-colors">
                Export PDF
              </Link>
              <Link href="/stats" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-chalk/70 hover:text-chalk hover:bg-ardoise whitespace-nowrap transition-colors">
                Mes stats
              </Link>
              <Link href="/defi" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-chalk/70 hover:text-chalk hover:bg-ardoise whitespace-nowrap transition-colors">
                Défi 🔥
              </Link>
              <Link href="/ligues" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-chalk/70 hover:text-chalk hover:bg-ardoise whitespace-nowrap transition-colors">
                Ligues
              </Link>
              <Link href="/tournoi" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-chalk/70 hover:text-chalk hover:bg-ardoise whitespace-nowrap transition-colors">
                Vainqueur
              </Link>
              <Link href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-chalk/70 hover:text-chalk hover:bg-ardoise whitespace-nowrap transition-colors">
                Admin
              </Link>
              <LogoutButton />
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-lg px-4 py-5">{children}</main>
      </body>
    </html>
  );
}
