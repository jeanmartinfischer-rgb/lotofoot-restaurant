'use client';

import { useEffect, useState } from 'react';

const COLORS = ['#F5C542', '#C2272F', '#FFFFFF', '#D4AF37', '#4ADE80'];

type Piece = { id: number; left: number; delay: number; color: string; rot: number; dur: number };

export default function Confetti({ fire }: { fire: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (fire === 0) return;
    const next: Piece[] = Array.from({ length: 40 }, (_, i) => ({
      id: fire * 1000 + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * 360,
      dur: 0.9 + Math.random() * 0.7,
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 1800);
    return () => clearTimeout(t);
  }, [fire]);

  if (pieces.length === 0) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 30 }}>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10%) rotate(0deg); opacity: 1; }
          100% { transform: translateY(420%) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: p.left + '%',
            width: 8,
            height: 12,
            background: p.color,
            borderRadius: 2,
            transform: 'rotate(' + p.rot + 'deg)',
            animation: 'confettiFall ' + p.dur + 's ease-in ' + p.delay + 's forwards',
          }}
        />
      ))}
    </div>
  );
}
