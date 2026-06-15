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

  // Ordre d'affichage du podium : 2e - 1er - 3e
  const ordrePodium = [podium[1], podium[0], podium[2]].filter(Boolean);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .pdf-page {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page { margin: 0; size: A4; }
        }
        .pdf-page {
          background-image: url('/bg.png');
          background-size: cover;
          background-position: center;
          background-color: #0B0B0D;
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
        Astuce : dans la fenetre d'impression, choisis "Enregistrer en PDF" comme destination.
      </p>

      {/* La page exportable */}
      <div className="pdf-page rounded-2xl overflow-hidden" style={{ minHeight: '1000px' }}>
        <div className="bg-pitch/80 backdrop-blur-sm p-6" style={{ minHeight: '1000px' }}>
          {/* En-tete */}
          <div className="text-center mb-8 pt-4">
            <p className="font-display text-3xl text-chalk tracking-tight">
              LOTO<span className="text-sang-vif">FOOT</span>
            </p>
            <p className="font-mono text-xs text-amber-300/80 mt-1">L'ARPEGE — COUPE DU MONDE 2026</p>
            <p className="font-display text-lg text-chalk mt-4">CLASSEMENT FINAL</p>
          </div>

          {/* Podium */}
          {ordrePodium.length > 0 && (
            <div className="flex items-end justify-center gap-3 mb-8">
              {ordrePodium.map((p) => {
                const isFirst = p.rang === 1;
                const h = isFirst ? 'h-32' : p.rang === 2 ? 'h-24' : 'h-20';
                const medal = p.rang === 1 ? '🥇' : p.rang === 2 ? '🥈' : '🥉';
                return (
                  <div key={p.user_id} className="flex flex-col items-center" style={{ width: '30%' }}>
                    <span className="text-2xl mb-1">{medal}</span>
                    <span className="font-mono text-sm text-chalk text-center truncate w-full px-1">
                      {p.pseudo}
                    </span>
                    <span className="font-mono text-xs text-amber-300 mb-2">{p.total_points} pts</span>
                    <div
                      className={
                        'w-full rounded-t-xl border-t border-x ' +
                        h +
                        (isFirst
                          ? ' border-amber-400 bg-amber-400/20'
                          : ' border-ligne bg-ardoise/60')
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Tableau complet */}
          <div className="space-y-1">
            <div className="flex items-center justify-between border-b border-ligne pb-2 mb-2 px-2">
              <span className="font-mono text-xs text-chalk/50">RANG / JOUEUR</span>
              <span className="font-mono text-xs text-chalk/50">EXACTS / PTS</span>
            </div>
            {rows.map((p) => (
              <div
                key={p.user_id}
                className={
                  'flex items-center justify-between rounded-lg px-2 py-1.5 ' +
                  (p.user_id === currentUserId ? 'bg-sang/15' : '')
                }
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-300/70 w-6">#{p.rang}</span>
                  <span className="text-sm text-chalk">{p.pseudo}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-yellow-400">{p.exact_scores}🎯</span>
                  <span className="font-mono text-sm font-bold text-chalk w-16 text-right">{p.total_points} pts</span>
                </span>
              </div>
            ))}
          </div>

          {/* Pied */}
          <p className="text-center font-mono text-xs text-chalk/30 mt-8 pb-4">
            Genere le {new Date().toLocaleDateString('fr-FR')} — lotofoot-restaurant
          </p>
        </div>
      </div>
    </>
  );
}
