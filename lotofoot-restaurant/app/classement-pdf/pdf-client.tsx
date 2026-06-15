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

  function ligneHTML(p: Row) {
    const surligne = p.user_id === currentUserId ? 'background:rgba(194,39,47,0.22);' : '';
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 10px;border-radius:4px;${surligne}">
        <span style="display:flex;align-items:center;gap:12px;">
          <span style="font-family:monospace;font-size:15px;color:rgba(212,175,55,0.85);width:28px;">#${p.rang}</span>
          <span style="font-size:16px;color:#fff;">${p.pseudo}</span>
        </span>
        <span style="display:flex;align-items:center;gap:14px;">
          <span style="font-family:monospace;font-size:13px;color:#facc15;">${p.exact_scores} exacts</span>
          <span style="font-family:monospace;font-size:16px;font-weight:bold;color:#fff;width:60px;text-align:right;">${p.total_points} pts</span>
        </span>
      </div>`;
  }

  function podiumHTML(p: Row | undefined) {
    if (!p) return '';
    const isFirst = p.rang === 1;
    const hauteur = isFirst ? '70px' : p.rang === 2 ? '52px' : '40px';
    const medal = p.rang === 1 ? '🥇' : p.rang === 2 ? '🥈' : '🥉';
    const bord = isFirst ? '#D4AF37' : '#2a2a30';
    const bg = isFirst ? 'rgba(212,175,55,0.18)' : 'rgba(40,40,48,0.5)';
    return `
      <div style="display:flex;flex-direction:column;align-items:center;width:170px;">
        <span style="font-size:30px;">${medal}</span>
        <span style="font-family:monospace;font-size:17px;color:#fff;text-align:center;">${p.pseudo}</span>
        <span style="font-family:monospace;font-size:14px;color:#D4AF37;margin-bottom:6px;">${p.total_points} pts</span>
        <div style="width:100%;height:${hauteur};border-top:2px solid ${bord};border-left:1px solid ${bord};border-right:1px solid ${bord};border-top-left-radius:8px;border-top-right-radius:8px;background:${bg};"></div>
      </div>`;
  }

  function exporter() {
    const date = new Date().toLocaleDateString('fr-FR');
    const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>Classement LotoFoot</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; }
  html,body { margin:0; padding:0; }
  .diplome {
    width: 297mm; height: 210mm; position: relative;
    background-image: url('/bg.png'); background-size: cover; background-position: center;
    background-color: #0B0B0D; overflow: hidden;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .overlay { position:absolute; inset:0; background:linear-gradient(180deg,rgba(11,11,13,0.42),rgba(11,11,13,0.7) 60%,rgba(11,11,13,0.82)); }
  .cadre { position:absolute; inset:8mm; border:2px solid #D4AF37; border-radius:4px; }
  .contenu { position:relative; padding:14mm 18mm; height:100%; display:flex; flex-direction:column; }
  .btn { position:fixed; top:16px; right:16px; z-index:99;
    background:#C2272F; color:#fff; border:none; padding:12px 20px; border-radius:8px;
    font-family:sans-serif; font-size:15px; cursor:pointer; }
  @media print { .btn { display:none; } }
</style></head>
<body style="background:#0B0B0D;">
  <button class="btn" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
  <div class="diplome">
    <div class="overlay"></div>
    <div class="cadre"></div>
    <div class="contenu">
      <div style="text-align:center;">
        <p style="font-family:serif;font-size:13px;letter-spacing:4px;color:#D4AF37;margin:0;">L'ARPEGE — FIFA WORLD CUP 2026</p>
        <p style="font-family:sans-serif;font-weight:800;font-size:46px;color:#fff;margin:8px 0 0;letter-spacing:1px;">LOTO<span style="color:#C2272F;">FOOT</span></p>
        <div style="width:72px;height:2px;background:#D4AF37;margin:10px auto;"></div>
        <p style="font-family:serif;font-size:24px;color:#fff;letter-spacing:6px;margin:0;">CLASSEMENT FINAL</p>
      </div>
      <div style="display:flex;align-items:flex-end;justify-content:center;gap:24px;margin-top:22px;">
        ${ordrePodium.map(podiumHTML).join('')}
      </div>
      <div style="display:flex;gap:48px;margin-top:26px;flex:1;">
        <div style="flex:1;">${colG.map(ligneHTML).join('')}</div>
        <div style="flex:1;">${colD.map(ligneHTML).join('')}</div>
      </div>
      <p style="text-align:center;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.4);margin:0;">Genere le ${date} — lotofoot-restaurant</p>
    </div>
  </div>
</body></html>`;

    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">EXPORT PDF</h1>
      <p className="text-sm text-chalk/70">
        Genere une belle page A4 paysage du classement final, avec podium et fond doré.
      </p>
      <button
        onClick={exporter}
        className="w-full rounded-xl border border-sang bg-sang/15 px-4 py-4 font-mono text-sm text-chalk hover:border-sang-vif transition-colors"
      >
        Ouvrir le classement (PDF / impression)
      </button>
      <p className="text-xs text-chalk/40">
        Une nouvelle page s'ouvre avec le diplôme. Clique le bouton "Imprimer" en haut a droite, puis choisis "Enregistrer en PDF" (format A4 paysage).
      </p>

      <section className="rounded-2xl border border-ligne bg-ardoise p-4">
        <h2 className="font-display text-sm mb-3">APERCU CLASSEMENT</h2>
        <div className="space-y-1">
          {rows.slice(0, 5).map((p) => (
            <div key={p.user_id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs text-chalk/40 w-5">#{p.rang}</span>
                <span className="text-chalk/80">{p.pseudo}</span>
              </span>
              <span className="font-mono text-xs text-chalk">{p.total_points} pts</span>
            </div>
          ))}
          {rows.length > 5 && (
            <p className="font-mono text-xs text-chalk/30 pt-1">+ {rows.length - 5} autres joueurs</p>
          )}
        </div>
      </section>
    </div>
  );
}
