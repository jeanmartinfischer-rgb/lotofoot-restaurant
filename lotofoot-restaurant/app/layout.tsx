import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'LotoFoot Restaurant',
  description: 'Le concours de pronostics foot de l’équipe. Score exact 3 pts, bon résultat 1 pt.',
  manifest: '/manifest.json',
};
export const viewport: Viewport = { themeColor: '#0B0B0D' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh pb-20">
        <header className="sticky top-0 z-20 border-b border-ligne bg-pitch/90 px-4 py-3 backdrop-blur">
          <Link href="/" className="font-display text-lg tracking-tight">
            LOTO<span className="text-sang-vif">FOOT</span> <span className="text-chalk/50 text-sm font-body font-semibold">Restaurant</span>
          </Link>
        </header>
        <main className="mx-auto max-w-lg px-4 py-5">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-ligne bg-pitch/95 backdrop-blur">
          <div className="mx-auto flex max-w-lg justify-around py-2 text-xs font-semibold">
            <Link href="/" className="flex flex-col items-center gap-1 px-4 py-1 text-chalk/80 hover:text-chalk">⚽<span>Accueil</span></Link>
            <Link href="/matchs" className="flex flex-col items-center gap-1 px-4 py-1 text-chalk/80 hover:text-chalk">🎯<span>Mes paris</span></Link>
            <Link href="/classement" className="flex flex-col items-center gap-1 px-4 py-1 text-chalk/80 hover:text-chalk">🏆<span>Classement</span></Link>
            <Link href="/admin" className="flex flex-col items-center gap-1 px-4 py-1 text-chalk/80 hover:text-chalk">⚙️<span>Admin</span></Link>
          </div>
        </nav>
      </body>
    </html>
  );
}
