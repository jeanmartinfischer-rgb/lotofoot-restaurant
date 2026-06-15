'use client';

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
  const podium = rows.slice(0, 3);
  const ordrePodium = [podium[1], podium[0], podium[2]].filter(Boolean);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 0; size: A4 portrait; }
          html, body { margin: 0 !important; padding: 0 !important; background: #0B0B0D !important; }
          .diplome {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            width: 210mm !important;
            height: 297mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
        .diplome {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          position: relative;
          background-image: url('/bg.png');
          background-size: cover;
          background-position: center;
          background-color: #0B0B0D;
          overflow: hidden;
        }
        .diplome-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(11,11,13,0.55) 0%, rgba(11,11,13,0.78) 60%, rgba(11,11,13,0.9) 100%);
        }
        .cadre-dore {
          position: absolute;
          inset: 10mm;
          border: 2px solid #D4AF37;
          border-radius: 4px;
          box-shadow: inset 0 0 0 1px rgba(212,175,55,0.4);
        }
      `}</style>

      <div className="no-print mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">EXPORT PDF</h1>
        <button
          onClick={() => window.print()}
          className="rounded-xl border border-sang bg-sang/15 px-4 py-2 font-mono text-sm text-chalk hover:border-sang-vif transition-colors"
        >
          Telecharger / Imprimer
        </button>
      </div>

      <p className="no-print mb-4 text-xs text-chalk/50">
        Astuce : dans la fenetre d'impression, choisis "Enregistrer en PDF", format A4, sans marges.
      </p>

      <div className="diplome shadow-2xl">
        <div className="diplome-overlay" />
        <div className="cadre-dore" />

        <div style={{ position: 'relative', padding: '20mm 18mm', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* En-tete */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'serif', fontSize: '11px', letterSpacing: '3px', color: '#D4AF37' }}>
              L'ARPEGE — FIFA WORLD CUP 2026
            </p>
            <p className="font-display" style={{ fontSize: '38px', color: '#fff', marginTop: '10px', letterSpacing: '1px' }}>
              LOTO<span style={{ color: '#C2272F' }}>FOOT</span>
            </p>
            <div style={{ width: '60px', height: '2px', background: '#D4AF37', margin: '14px auto' }} />
            <p style={{ fontFamily: 'serif', fontSize: '20px', color: '#fff', letterSpacing: '4px' }}>
              CLASSEMENT FINAL
            </p>
          </div>

          {/* Podium */}
          {ordrePodium.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '10px', marginTop: '28px' }}>
              {ordrePodium.map((p) => {
                const isFirst = p.rang === 1;
                const hauteur = isFirst ? '90px' : p.rang === 2 ? '68px' : '52px';
                const medal = p.rang === 1 ? '🥇' : p.rang === 2 ? '🥈' : '🥉';
                return (
                  <div key={p.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                    <span style={{ fontSize: '28px', marginBottom: '4px' }}>{medal}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#fff', textAlign: 'center' }}>
                      {p.pseudo}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#D4AF37', marginBottom: '6px' }}>
                      {p.total_points} pts
                    </span>
                    <div style={{
                      width: '100%',
                      height: hauteur,
                      borderTop: isFirst ? '2px solid #D4AF37' : '1px solid #2a2a30',
                      borderLeft: isFirst ? '1px solid #D4AF37' : '1px solid #2a2a30',
                      borderRight: isFirst ? '1px solid #D4AF37' : '1px solid #2a2a30',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                      background: isFirst ? 'rgba(212,175,55,0.18)' : 'rgba(40,40,48,0.5)',
                    }} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Tableau */}
          <div style={{ marginTop: '24px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(212,175,55,0.4)', paddingBottom: '4px', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>RANG / JOUEUR</span>
              <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>EXACTS / PTS</span>
            </div>
            {rows.map((p) => (
              <div
                key={p.user_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  background: p.user_id === currentUserId ? 'rgba(194,39,47,0.18)' : 'transparent',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(212,175,55,0.7)', width: '22px' }}>#{p.rang}</span>
                  <span style={{ fontSize: '12px', color: '#fff' }}>{p.pseudo}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#facc15' }}>{p.exact_scores}🎯</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold', color: '#fff', width: '52px', textAlign: 'right' }}>{p.total_points} pts</span>
                </span>
              </div>
            ))}
          </div>

          {/* Pied */}
          <p style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '12px' }}>
            Genere le {new Date().toLocaleDateString('fr-FR')} — lotofoot-restaurant
          </p>
        </div>
      </div>
    </>
  );
}
