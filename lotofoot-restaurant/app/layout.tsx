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
      <body className="min-h-dvh pb-20">
        <header className="sticky top-0 z-20 border-b border-ligne bg-pitch/90 px-4 py-2 backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-1">
              <Image src="/logo.png" alt="L'Arpege" width={40} height={22} style={{ objectFit: 'contain' }} />
            </div>
            <span className="font-display text-base tracking-tight">
              LOTO<span className="text-sang-vif">FOOT</span>
            </span>
          </Link>
        </header>
        <main className="mx-auto max-w-lg px-4 py-5">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-ligne bg-pitch/95 backdrop-blur">
          <div className="mx-auto flex max-w-lg justify-around py-2 text-xs font-semibold">
            <Link href="/" className="flex flex-col items-center gap-1 px-4 py-1 text-chalk/80 hover:text-chalk">⚽<span>Accueil</span></Link>
            <Link href="/matchs" className="flex flex-col items-center gap-1 px-4 py-1 text-chalk/80 hover:text-chalk">🎯<span>Mes paris</span></Link>
            <Link href="/classement" className="flex flex-col items-center gap-1 px-4 py-1 text-chalk/80 hover:text-chalk">🏆<span>Classement</span></Link>
            <Link href="/admin" className="flex flex-col items-center gap-1 px-4 py-1 text-chalk/80 hover:text-chalk">⚙️<span>Admin</span></Link>
            <LogoutButton />
          </div>
        </nav>
      </body>
    </html>
  );
}
