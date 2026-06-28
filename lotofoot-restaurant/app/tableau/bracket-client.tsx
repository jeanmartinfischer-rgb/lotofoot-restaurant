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

const CARD_H = 92;
const CARD_W = 220;
const GAP_Y = 16;
const COL_GAP = 60;

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

function CarteMatch({ m, top }: { m: Match | null; top: number }) {
  const montrerScore = !!m && (m.fini || m.enCours);
  return (
    <div style={{ position: 'absolute', top, left: 0, width: CARD_W, minHeight: CARD_H, boxSizing: 'border-box', padding: '9px 11px', border: '1px solid var(--ligne, #3a4049)', borderRadius: 12, background: 'var(--ardoise, #20252c)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
      <div style={{ fontSize: 11, color: m?.enCours ? '#ff5a4d' : 'var(--chalk-50, #9aa0a8)', fontWeight: m?.enCours ? 700 : 400 }}>
        {!m ? 'a venir' : m.enCours ? 'EN DIRECT' : m.fini ? 'Termine' : dateMatch(m.kickoff)}
      </div>
      <LigneEquipe nom={m?.home ?? ''} logo={m?.home_logo ?? null} score={m?.home_score ?? null} gagnant={m?.home_winner ?? null} montrerScore={montrerScore} />
      <LigneEquipe nom={m?.away ?? ''} logo={m?.away_logo ?? null} score={m?.away_score ?? null} gagnant={m?.away_winner ?? null} montrerScore={montrerScore} />
      {m?.venue && (
        <div style={{ fontSize: 10, color: 'var(--chalk-40, #8a9099)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.venue}</div>
      )}
    </div>
  );
}

export default function BracketClient() {
  const [tours, setTours] = useState<ToursData | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [tourIndex, setTourIndex] = useState(0);
  const [vueW, setVueW] = useState(360);
  const [vueH, setVueH] = useState(520);
  const vueRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/bracket')
      .then((r) => r.json())
      .then((d) => { if (d.error) setErreur(d.error); else setTours(d.tours ?? {}); })
      .catch((e) => setErreur(String(e)));
  }, []);

  useEffect(() => {
    function maj() {
      if (vueRef.current) setVueW(vueRef.current.clientWidth);
      setVueH(Math.max(420, Math.min(620, window.innerHeight - 220)));
    }
    maj();
    window.addEventListener('resize', maj);
    return () => window.removeEventListener('resize', maj);
  }, [tours]);

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
  const hauteurTotale = totalCases * CARD_H + (totalCases - 1) * GAP_Y;

  function positionsTour(indexTour: number): number[] {
    const n = TOURS[indexTour].cases;
    const pas = hauteurTotale / n;
    const tops: number[] = [];
    for (let i = 0; i < n; i++) tops.push(i * pas + pas / 2 - CARD_H / 2);
    return tops;
  }

  const colonneX = (i: number) => i * (CARD_W + COL_GAP);

  const nbCasesTour = TOURS[tourIndex].cases;
  const hauteurTourVisible = nbCasesTour * CARD_H + (nbCasesTour - 1) * GAP_Y;

  const scaleH = vueH / (hauteurTourVisible + 24);
  const scaleW = vueW / (CARD_W + 32);
  const scale = Math.max(0.42, Math.min(1, Math.min(scaleH, scaleW)));

  const tops = positionsTour(tourIndex);
  const centreTourY = (tops[0] + CARD_H / 2 + tops[tops.length - 1] + CARD_H / 2) / 2;
  const centreTourX = colonneX(tourIndex) + CARD_W / 2;

  const translateX = vueW / 2 - centreTourX * scale;
  const translateY = vueH / 2 - centreTourY * scale;

  const fleche = (actif: boolean) => ({
    width: 38, height: 38, flexShrink: 0, borderRadius: '50%',
    border: '1px solid var(--ligne, #3a4049)', background: 'var(--ardoise, #20252c)',
    color: actif ? 'var(--chalk, #e8eaed)' : 'var(--chalk-40, #555)',
    fontSize: 20, cursor: actif ? 'pointer' : 'default', padding: 0,
  } as React.CSSProperties);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">TABLEAU FINAL</h1>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <button onClick={() => setTourIndex((i) => Math.max(0, i - 1))} disabled={tourIndex === 0} aria-label="Tour precedent" style={fleche(tourIndex !== 0)}>‹</button>
        <span className="font-mono text-sm" style={{ color: '#ff5a4d', fontWeight: 700, textAlign: 'center', flex: 1 }}>{TOURS[tourIndex].label}</span>
        <button onClick={() => setTourIndex((i) => Math.min(TOURS.length - 1, i + 1))} disabled={tourIndex === TOURS.length - 1} aria-label="Tour suivant" style={fleche(tourIndex !== TOURS.length - 1)}>›</button>
      </div>

      <div ref={vueRef} style={{ overflow: 'hidden', position: 'relative', height: vueH, border: '1px solid var(--ligne, #3a4049)', borderRadius: 16, background: 'var(--pitch, #0f1216)' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: colonneX(TOURS.length - 1) + CARD_W, height: hauteurTotale,
          transformOrigin: '0 0',
          transform: 'translate(' + translateX + 'px,' + translateY + 'px) scale(' + scale + ')',
          transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)',
        }}>
          <svg width={colonneX(TOURS.length - 1) + CARD_W} height={hauteurTotale} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
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
            const estVisible = ti === tourIndex;
            return (
              <div key={t.cle} style={{ position: 'absolute', top: 0, left: colonneX(ti), width: CARD_W, height: hauteurTotale, opacity: estVisible ? 1 : 0.4, transition: 'opacity 0.5s' }}>
                {Array.from({ length: t.cases }).map((_, i) => (
                  <CarteMatch key={i} m={matchs[i] ?? null} top={tA[i]} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
        {TOURS.map((t, ti) => (
          <button key={t.cle} onClick={() => setTourIndex(ti)} aria-label={t.label} style={{
            width: ti === tourIndex ? 20 : 8, height: 8, borderRadius: 4, padding: 0,
            border: '1px solid var(--ligne, #3a4049)',
            background: ti === tourIndex ? '#ff5a4d' : 'transparent',
            cursor: 'pointer', transition: 'width 0.2s',
          }} />
        ))}
      </div>

      <p className="text-center font-mono text-xs text-chalk/40">
        Avance tour par tour : l'arbre zoome et se recentre jusqu'a la finale.
      </p>
    </div>
  );
}
