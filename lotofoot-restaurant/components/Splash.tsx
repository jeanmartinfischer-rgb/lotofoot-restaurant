'use client';

import { useEffect, useState } from 'react';

export default function Splash() {
  const [hidden, setHidden] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHidden(true), 2200);
    const t2 = setTimeout(() => setGone(true), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (gone) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: '#0B0B0D',
        opacity: hidden ? 0 : 1,
        transition: 'opacity 0.8s ease',
        pointerEvents: hidden ? 'none' : 'auto',
      }}
    >
      <div className="splash-logo">
        <img src="/icon-app.png.png" alt="LotoFoot" width={120} height={120} style={{ borderRadius: 28 }} />
      </div>
      <p className="mt-5 font-display text-xl tracking-tight" style={{ color: '#F5F5F0' }}>
        LOTO<span style={{ color: '#C2272F' }}>FOOT</span>
      </p>
      <div className="splash-bar" />
      <style>{`
        @keyframes splashPop {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .splash-logo { animation: splashPop 0.7s ease-out; }
        @keyframes splashLoad {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .splash-bar {
          margin-top: 22px;
          width: 140px;
          height: 3px;
          border-radius: 3px;
          background: linear-gradient(90deg, #C2272F, #D4AF37);
          animation: splashLoad 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
