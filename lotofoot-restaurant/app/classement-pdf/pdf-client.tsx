'use client';

import { useRef, useState } from 'react';

type Row = {
  user_id: string;
  pseudo: string;
  total_points: number;
  correct_results: number;
  exact_scores: number;
  rang: number;
};

export default function PdfClient({
  rows,
  currentUserId,
}: {
  rows: Row[];
  currentUserId: string;
}) {
  const diplomeRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const podium = rows.slice(0, 3);
  const ordrePodium = [podium[1], podium[0], podium[2]].filter(Boolean);
  const moitie = Math.ceil(rows.length / 2);
  const colG = rows.slice(0, moitie);
  const colD = rows.slice(moitie);

  async function telecharger() {
    if (!diplomeRef.current || busy) return;
    setBusy(true);
    try {
      const html2canvas = (await import(
        // @ts-ignore
        'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.js'
      )).default;

      const canvas = await html2canvas(diplomeRef.current, {
        backgroundColor: '#0B0B0D',
        scale: 2,
        useCORS: true,
        logging: false,
        width: 900,
        height: 636,
      });

      const link = document.createElement('a');
      link.download = 'classement-lotofoot.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert("Erreur lors de la generation de l'image. Reessaie.");
    }
    setBusy(false);
  }

  const ligne = (p: Row) => (
    <div
      key={p.user_id}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '5px 10px',
        borderRadius: '4px',
        background: p.user_id === currentUserId ? 'rgba(194,39,47,0.22)' : 'transparent',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '15px', color: 'rgba(212,175,55,0.85)', width: '28px' }}>#{p.rang}</span>
        <span style={{ fontSize: '16px', color: '#fff' }}>{p.pseudo}</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#facc15' }}>{p.exact_scores} exacts</span>
        <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold', color: '#fff', width: '60px', textAlign: 'right' }}>{p.total_points} pts</span>
      </span>
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">EXPORT IMAGE</h1>
        <button
          onClick={telecharger}
          disabled={busy}
          className="rounded-xl border border-sang bg-sang/15 px-4 py-2 font-mono text-sm text-chalk hover:border-sang-vif transition-colors disabled:opacity-40"
        >
          {busy ? 'Generation...' : 'Telecharger l\'image'}
        </button>
      </div>

      <p className="mb-4 text-xs text-chalk/50">
        Le classement est telecharge en image, que tu peux partager ou imprimer depuis n'importe quel appareil.
      </p>

      <div style={{ width: '100%', aspectRatio: '900 / 636', position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '900px',
            height: '636px',
            transform: 'scale(var(--diplome-scale))',
            transformOrigin: 'top left',
          }}
          ref={(el) => {
            if (el && el.parentElement) {
              const w = el.parentElement.clientWidth;
              el.style.setProperty('--diplome-scale', String(w / 900));
            }
          }}
        >
          <div
            ref={diplomeRef}
            style={{
              width: '900px',
              height: '636px',
              position: 'relative',
              backgroundImage: "url('/bg.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#0B0B0D',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(11,11,13,0.4) 0%, rgba(11,11,13,0.68) 60%, rgba(11,11,13,0.8) 100%)',
            }} />
            <div style={{
              position: 'absolute', inset: '24px',
              border: '2px solid #D4AF37', borderRadius: '4px',
            }} />

            <div style={{ position: 'relative', padding: '34px 60px', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'serif', fontSize: '12px', letterSpacing: '4px', color: '#D4AF37', margin: 0 }}>
                  L'ARPEGE — FIFA WORLD CUP 2026
                </p>
                <p className="font-display" style={{ fontSize: '44px', color: '#fff', margin: '6px 0 0', letterSpacing: '1px', lineHeight: 1 }}>
                  LOTO<span style={{ color: '#C2272F' }}>FOOT</span>
                </p>
                <div style={{ width: '70px', height: '2px', background: '#D4AF37', margin: '10px auto' }} />
                <p style={{ fontFamily: 'serif', fontSize: '22px', color: '#fff', letterSpacing: '5px', margin: 0 }}>
                  CLASSEMENT FINAL
                </p>
              </div>

              {ordrePodium.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '20px', marginTop: '18px' }}>
                  {ordrePodium.map((p) => {
                    const isFirst = p.rang === 1;
                    const hauteur = isFirst ? '56px' : p.rang === 2 ? '42px' : '32px';
                    const medal = p.rang === 1 ? '🥇' : p.rang === 2 ? '🥈' : '🥉';
                    return (
                      <div key={p.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '150px' }}>
                        <span style={{ fontSize: '28px' }}>{medal}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '16px', color: '#fff', textAlign: 'center' }}>{p.pseudo}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#D4AF37', marginBottom: '5px' }}>{p.total_points} pts</span>
                        <div style={{
                          width: '100%', height: hauteur,
                          borderTop: isFirst ? '2px solid #D4AF37' : '1px solid #2a2a30',
                          borderLeft: isFirst ? '1px solid #D4AF37' : '1px solid #2a2a30',
                          borderRight: isFirst ? '1px solid #D4AF37' : '1px solid #2a2a30',
                          borderTopLeftRadius: '8px', borderTopRightRadius: '8px',
                          background: isFirst ? 'rgba(212,175,55,0.18)' : 'rgba(40,40,48,0.5)',
                        }} />
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ display: 'flex', gap: '40px', marginTop: '18px', flex: 1 }}>
                <div style={{ flex: 1 }}>{colG.map(ligne)}</div>
                <div style={{ flex: 1 }}>{colD.map(ligne)}</div>
              </div>

              <p style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Genere le {new Date().toLocaleDateString('fr-FR')} — lotofoot-restaurant
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
