'use client';

import { useEffect, useRef, useState } from 'react';

type Match = {
  id: number;
  kickoff: string;
  status: string;
  fini: boolean;
  enCours: boolean;
  home: string;
  away: string;
  home_logo: string | null;
  away_logo: string | null;
  home_score: number | null;
  away_score: number | null;
  home_winner: boolean | null;
  away_winner: boolean | null;
  venue?: string | null;
};

type ToursData = Record<string, Match[]>;

const TOURS: { cle: string; label: string; cases: number }[] = [
  { cle: 'Round of 32', label: '16es de finale', cases: 16 },
  { cle: 'Round of 16', label: 'Huitiemes de finale', cases: 8 },
  { cle: 'Quarter-finals', label: 'Quarts de finale', cases: 4 },
  { cle: 'Semi-finals', label: 'Demi-finales', cases: 2 },
  { cle: 'Final', label: 'Finale', cases: 1 },
];

const TZ = 'Europe/Paris';

const CARD_H = 88;
const CARD_W = 210;
const COL_GAP = 54;
const PAD = 20;

function dateMatch(iso: string): string {
  const d = new Date(iso);
  const jour = d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: TZ });
  const heure = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
  return jour + ', ' + heure;
}

function Ecusson() {
  return (
    <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: '4px 4px 8px 8px', background: 'var(--ligne, #3a4049)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ width: 10, height: 12, background: 'var(--chalk-40, #6b7280)', borderRadius: '2px 2px 5px 5px' }} />
    </span>
  );
}

function Drapeau({ src }: { src: string | null }) {
  if (!src) return <Ecusson />;
  return <img src={src} alt="" width={22} height={22} style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} loading="lazy" />;
}

function LigneEquipe({ nom, logo, score, gagnant, montrerScore }: { nom: string; logo: string | null; score: number | null; gagnant: boolean | null; montrerScore: boolean; }) {
  const connu = !!nom;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 26 }}>
      {connu ? <Drapeau src={logo} /> : <Ecusson />}
      <span style={{ flex: 1, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: connu ? (gagnant ? '#fff' : 'var(--chalk, #e8eaed)') : 'var(--chalk-40, #9aa0a8)', fontWeight: gagnant ? 700 : 400 }}>
        {connu ? nom : 'A definir'}
      </span>
      {montrerScore && score !== null && (
        <span style={{ fontSize: 14, fontWeight: 700, color: gagnant ? '#fff' : 'var(--chalk-60, #a8aeb6)' }}>{score}</span>
      )}
    </div>
  );
}

function CarteMatch({ m, top, left }: { m: Match | null; top: number; left: number }) {
  const montrerScore = !!m && (m.fini || m.enCours);
  return (
    <div style={{ position: 'absolute', top, left, width: CARD_W, height: CARD_H, boxSizing: 'border-box', padding: '8px 11px', border: '1px solid var(--ligne, #3a4049)', borderRadius: 12, background: 'var(--ardoise, #20252c)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
      <div style={{ fontSize: 11, color: m?.enCours ? '#ff5a4d' : 'var(--chalk-50, #9aa0a8)', fontWeight: m?.enCours ? 700 : 400 }}>
        {!m ? 'a venir' : m.enCours ? 'EN DIRECT' : m.fini ? 'Termine' : dateMatch(m.kickoff)}
      </div>
      <LigneEquipe nom={m?.home ?? ''} logo={m?.home_logo ?? null} score={m?.home_score ?? null} gagnant={m?.home_winner ?? null} montrerScore={montrerScore} />
      <LigneEquipe nom={m?.away ?? ''} logo={m?.away_logo ?? null} score={m?.away_score ?? null} gagnant={m?.away_winner ?? null} montrerScore={montrerScore} />
    </div>
  );
}

export default function BracketClient() {
  const [tours, setTours] = useState<ToursData | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/bracket')
      .then((r) => r.json())
      .then((d) => { if (d.error) setErreur(d.error); else setTours(d.tours ?? {}); })
      .catch((e) => setErreur(String(e)));
  }, []);

  if (erreur || !tours) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl">TABLEAU FINAL</h1>
        <p className="rounded-2xl border border-ligne bg-ardoise p-6 text-center text-sm text-chalk/60">
          {erreur ? 'Impossible de charger le tableau.' : 'Chargement du tableau...'}
        </p>
      </div>
    );
  }

  const totalCases = TOURS[0].cases;
  const SLOT = CARD_H + 16;
  const hauteurTotale = totalCases * SLOT + PAD * 2;

  function positionsTour(indexTour: number): number[] {
    const n = TOURS[indexTour].cases;
    const pas = (totalCases * SLOT) / n;
    const tops: number[] = [];
    for (let i = 0; i < n; i++) tops.push(PAD + i * pas + pas / 2 - CARD_H / 2);
    return tops;
  }

  const colonneX = (i: number) => PAD + i * (CARD_W + COL_GAP);
  const largeurTotale = colonneX(TOURS.length - 1) + CARD_W + PAD;

  function allerAuTour(ti: number) {
    const box = scrollRef.current;
    if (box) box.scrollTo({ left: colonneX(ti) - PAD, behavior: 'smooth' });
  }

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl">TABLEAU FINAL</h1>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {TOURS.map((t, ti) => (
          <button key={t.cle} onClick={() => allerAuTour(ti)} className="whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-xs"
            style={{ flexShrink: 0, border: '1px solid var(--ligne, #3a4049)', background: 'transparent', color: 'var(--chalk-60, #a8aeb6)' }}>
            {t.label}
          </button>
        ))}
      </div>

      <p className="font-mono text-xs text-chalk/40" style={{ margin: 0 }}>
        Glisse dans tous les sens. Pince pour zoomer (comme une photo).
      </p>

      <div ref={scrollRef} style={{ overflow: 'auto', border: '1px solid var(--ligne, #3a4049)', borderRadius: 16, background: 'var(--pitch, #0f1216)', maxHeight: '70vh', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y pinch-zoom' }}>
        <div style={{ position: 'relative', width: largeurTotale, height: hauteurTotale }}>
          <svg width={largeurTotale} height={hauteurTotale} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            {TOURS.slice(0, -1).map((t, ti) => {
              const tA = positionsTour(ti);
              const tB = positionsTour(ti + 1);
              const x1 = colonneX(ti) + CARD_W;
              const x2 = colonneX(ti + 1);
              const xm = (x1 + x2) / 2;
              const lignes: JSX.Element[] = [];
              for (let j = 0; j < tB.length; j++) {
                const a = tA[j * 2] + CARD_H / 2;
                const b = tA[j * 2 + 1] + CARD_H / 2;
                const c = tB[j] + CARD_H / 2;
                lignes.push(
                  <path key={ti + '-' + j} d={'M ' + x1 + ' ' + a + ' H ' + xm + ' M ' + x1 + ' ' + b + ' H ' + xm + ' M ' + xm + ' ' + a + ' V ' + b + ' M ' + xm + ' ' + c + ' H ' + x2} fill="none" stroke="var(--ligne, #3a4049)" strokeWidth="1.5" />
                );
              }
              return <g key={ti}>{lignes}</g>;
            })}
          </svg>

          {TOURS.map((t, ti) => {
            const tA = positionsTour(ti);
            const matchs = tours[t.cle] ?? [];
            return (
              <div key={t.cle}>
                <div style={{ position: 'absolute', top: 2, left: colonneX(ti), width: CARD_W, textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#ff5a4d' }} className="font-mono">
                  {t.label}
                </div>
                {Array.from({ length: t.cases }).map((_, i) => (
                  <CarteMatch key={i} m={matchs[i] ?? null} top={tA[i]} left={colonneX(ti)} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center font-mono text-xs text-chalk/40">
        Les vainqueurs s'inscriront automatiquement au fil des matchs.
      </p>
    </div>
  );
}
