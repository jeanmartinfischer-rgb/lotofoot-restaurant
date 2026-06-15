'use client';

import { ReactNode } from 'react';

const PODIUM: Record<number, { color: string; glow: string }> = {
  1: { color: '#F5C542', glow: 'rgba(245,197,66,0.55)' },
  2: { color: '#C8D0DA', glow: 'rgba(200,208,218,0.5)' },
  3: { color: '#CD7F32', glow: 'rgba(205,127,50,0.5)' },
};

export default function PodiumRow({ rang, children }: { rang: number; children: ReactNode }) {
  const p = PODIUM[rang];
  return (
    <div
      className={'rounded-2xl border transition-colors hover:border-chalk/40 ' + (p ? 'bg-pitch podium-card' : 'border-ligne bg-ardoise')}
      style={p ? { borderColor: p.color, ['--g' as any]: p.glow } : undefined}
    >
      <style>{`
        @keyframes podiumPulse {
          0%, 100% { box-shadow: 0 0 6px 0 var(--g); }
          50% { box-shadow: 0 0 16px 3px var(--g); }
        }
        .podium-card { animation: podiumPulse 2.6s ease-in-out infinite; }
      `}</style>
      {children}
    </div>
  );
}
