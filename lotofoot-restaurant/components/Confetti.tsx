'use client';

import { useEffect, useState } from 'react';

const COLORS = ['#F5C542', '#C2272F', '#FFFFFF', '#D4AF37', '#4ADE80', '#3B82F6'];

type Piece = { id: number; left: number; delay: number; color: string; rot: number; dur: number; size: number };

export default function Confetti({ fire }: { fire: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (fire === 0) return;
    const next: Piece[] = Array.from({ length: 140 }, (_, i) => ({
      id: fire * 1000 + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * 360,
      dur: 1.8 + Math.random() * 1.4,
      size: 7 + Math.random() * 8,
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 3600);
    return () => clearTimeout(t);
  }, [fire]);

  if (pieces.length === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 9999 }}>
      <style>{`
        @keyframes confettiFallFs {
          0% { transform: translateY(-15vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(900deg); opacity: 0.9; }
        }
      `}</style>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: p.left + 'vw',
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            borderRadius: 2,
            transform: 'rotate(' + p.rot + 'deg)',
            animation: 'confettiFallFs ' + p.dur + 's ease-in ' + p.delay + 's forwards',
          }}
        />
      ))}
    </div>
  );
}
