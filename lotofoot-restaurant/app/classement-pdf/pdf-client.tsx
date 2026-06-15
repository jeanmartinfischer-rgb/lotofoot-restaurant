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

  const moitie = Math.ceil(rows.length / 2);
  const colG = rows.slice(0, moitie);
  const colD = rows.slice(moitie);

  const ligne = (p: Row) => (
    <div
      key={p.user_id}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.6% 1.5%',
        borderRadius: '4px',
        background: p.user_id === currentUserId ? 'rgba(194,39,47,0.22)' : 'transparent',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '2%' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '1.6vh', color: 'rgba(212,175,55,0.8)', minWidth: '4%' }}>#{p.rang}</span>
        <span style={{ fontSize: '1.7vh', color: '#fff' }}>{p.pseudo}</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '6%' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '1.4vh', color: '#facc15' }}>{p.exact_scores}🎯</span>
        <span style={{ fontFamily: 'monospace', fontSize: '1.7vh', fontWeight: 'bold', color: '#fff' }}>{p.total_points} pts</span>
      </span>
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 0; size: A4 landscape; }
          html, body { margin: 0 !important; padding: 0 !important; background: #0B0B0D !important; }
          .diplome {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            box-shadow: none !important;
            width: 100vw !important;
            height: 100vh !important;
          }
        }
        .diplome {
          position: relative;
          width: 100%;
          aspect-ratio: 297 / 210;
          background-image: url('/bg.png');
          background-size: cover;
          background-position: center;
          background-color: #0B0B0D;
          overflow: hidden;
        }
        .diplome-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(11,11,13,0.4) 0%, rgba(11,11,13,0.68) 60%, rgba(11,11,13,0.8) 100%);
        }
        .cadre-dore {
          position: absolute; inset: 3%;
          border: 2px solid #D4AF37; border-radius: 4px;
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
        Dans la fenetre d'impression : format A4, orientation <b>Paysage</b>, marges <b>Aucune</b>.
      </p>

      <div className="diplome shadow-2xl">
        <div className="diplome-overlay" />
        <div className="cadre-dore" />

        <div style={{ position: 'relative', padding: '5% 7%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'serif', fontSize: '1.3vh', letterSpacing: '0.4vh', color: '#D4AF37' }}>
              L'ARPEGE — FIFA WORLD CUP 2026
            </p>
            <p className="font-display" style={{ fontSize: '5vh', color: '#fff', marginTop: '1vh', letterSpacing: '0.1vh', lineHeight: 1 }}>
              LOTO<span style={{ color: '#C2272F' }}>FOOT</span>
            </p>
            <div style={{ width: '7vh', height: '2px', background: '#D4AF37', margin: '1.2vh auto' }} />
            <p style={{ fontFamily: 'serif', fontSize: '2.6vh', color: '#fff', letterSpacing: '0.6vh' }}>
              CLASSEMENT FINAL
            </p>
          </div>

          {ordrePodium.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3%', marginTop: '2.5vh' }}>
              {ordrePodium.map((p) => {
                const isFirst = p.rang === 1;
                const hauteur = isFirst ? '9vh' : p.rang === 2 ? '6.5vh' : '5vh';
                const medal = p.rang === 1 ? '🥇' : p.rang === 2 ? '🥈' : '🥉';
                return (
                  <div key={p.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '18%' }}>
                    <span style={{ fontSize: '3.2vh' }}>{medal}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.8vh', color: '#fff', textAlign: 'center' }}>
                      {p.pseudo}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.5vh', color: '#D4AF37', marginBottom: '0.6vh' }}>
                      {p.total_points} pts
                    </span>
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

          <div style={{ display: 'flex', gap: '6%', marginTop: '2.5vh', flex: 1 }}>
            <div style={{ flex: 1 }}>{colG.map(ligne)}</div>
            <div style={{ flex: 1 }}>{colD.map(ligne)}</div>
          </div>

          <p style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '1.2vh', color: 'rgba(255,255,255,0.4)' }}>
            Genere le {new Date().toLocaleDateString('fr-FR')} — lotofoot-restaurant
          </p>
        </div>
      </div>
    </>
  );
}
