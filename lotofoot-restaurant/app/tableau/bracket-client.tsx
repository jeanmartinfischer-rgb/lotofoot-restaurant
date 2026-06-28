'use client';

import { useEffect, useState } from 'react';

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

const TOURS: { cle: string; label: string; court: string; cases: number }[] = [
  { cle: 'Round of 32', label: '16es de finale', court: '16es', cases: 16 },
  { cle: 'Round of 16', label: 'Huitiemes de finale', court: '8es', cases: 8 },
  { cle: 'Quarter-finals', label: 'Quarts de finale', court: 'Quarts', cases: 4 },
  { cle: 'Semi-finals', label: 'Demi-finales', court: 'Demies', cases: 2 },
  { cle: 'Final', label: 'Finale', court: 'Finale', cases: 1 },
];

const TZ = 'Europe/Paris';

function dateMatch(iso: string): string {
  const d = new Date(iso);
  const jour = d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit', timeZone: TZ });
  const heure = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
  return jour + ' a ' + heure;
}

function Ecusson() {
  return (
    <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: '5px 5px 9px 9px', background: 'var(--ligne, #3a4049)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ width: 12, height: 14, background: 'var(--chalk-40, #6b7280)', borderRadius: '3px 3px 6px 6px' }} />
    </span>
  );
}

function Drapeau({ src }: { src: string | null }) {
  if (!src) return <Ecusson />;
  return <img src={src} alt="" width={26} height={26} style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} loading="lazy" />;
}

function LigneEquipe({ nom, logo, score, gagnant, montrerScore }: { nom: string; logo: string | null; score: number | null; gagnant: boolean | null; montrerScore: boolean; }) {
  const connu = !!nom;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
      {connu ? <Drapeau src={logo} /> : <Ecusson />}
      <span style={{ flex: 1, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: connu ? (gagnant ? '#fff' : 'var(--chalk, #e8eaed)') : 'var(--chalk-40, #9aa0a8)', fontWeight: gagnant ? 700 : 500 }}>
        {connu ? nom : 'A definir'}
      </span>
      {montrerScore && score !== null && (
        <span style={{ fontSize: 17, fontWeight: 700, color: gagnant ? '#fff' : 'var(--chalk-60, #a8aeb6)' }}>{score}</span>
      )}
    </div>
  );
}

function CarteMatch({ m }: { m: Match | null }) {
  const montrerScore = !!m && (m.fini || m.enCours);
  return (
    <div style={{ border: '1px solid var(--ligne, #3a4049)', borderRadius: 14, background: 'var(--ardoise, #20252c)', padding: '10px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <span style={{ fontSize: 12, color: m?.enCours ? '#ff5a4d' : 'var(--chalk-50, #9aa0a8)', fontWeight: m?.enCours ? 700 : 400 }} className="font-mono">
          {!m ? 'date a venir' : m.enCours ? 'EN DIRECT' : m.fini ? 'Termine' : dateMatch(m.kickoff)}
        </span>
      </div>
      <LigneEquipe nom={m?.home ?? ''} logo={m?.home_logo ?? null} score={m?.home_score ?? null} gagnant={m?.home_winner ?? null} montrerScore={montrerScore} />
      <div style={{ height: 1, background: 'var(--ligne, #3a4049)' }} />
      <LigneEquipe nom={m?.away ?? ''} logo={m?.away_logo ?? null} score={m?.away_score ?? null} gagnant={m?.away_winner ?? null} montrerScore={montrerScore} />
      {m?.venue && (
        <div style={{ fontSize: 11, color: 'var(--chalk-40, #8a9099)', marginTop: 4 }}>{m.venue}</div>
      )}
    </div>
  );
}

export default function BracketClient() {
  const [tours, setTours] = useState<ToursData | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [tourIndex, setTourIndex] = useState(0);

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

  const tour = TOURS[tourIndex];
  const matchs = tours[tour.cle] ?? [];
  const cases: (Match | null)[] = [];
  for (let i = 0; i < tour.cases; i++) cases.push(matchs[i] ?? null);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">TABLEAU FINAL</h1>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {TOURS.map((t, ti) => (
          <button key={t.cle} onClick={() => setTourIndex(ti)} className="whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-xs"
            style={{
              flexShrink: 0,
              border: '1px solid ' + (ti === tourIndex ? '#ff5a4d' : 'var(--ligne, #3a4049)'),
              background: ti === tourIndex ? 'rgba(255,90,77,0.15)' : 'transparent',
              color: ti === tourIndex ? '#ff5a4d' : 'var(--chalk-60, #a8aeb6)',
              fontWeight: ti === tourIndex ? 700 : 400,
            }}>
            {t.court}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <button onClick={() => setTourIndex((i) => Math.max(0, i - 1))} disabled={tourIndex === 0} aria-label="Tour precedent"
          style={{ width: 38, height: 38, flexShrink: 0, borderRadius: '50%', border: '1px solid var(--ligne, #3a4049)', background: 'var(--ardoise, #20252c)', color: tourIndex === 0 ? 'var(--chalk-40, #555)' : 'var(--chalk, #e8eaed)', fontSize: 20, cursor: tourIndex === 0 ? 'default' : 'pointer', padding: 0 }}>‹</button>
        <span className="font-display text-lg" style={{ flex: 1, textAlign: 'center' }}>{tour.label}</span>
        <button onClick={() => setTourIndex((i) => Math.min(TOURS.length - 1, i + 1))} disabled={tourIndex === TOURS.length - 1} aria-label="Tour suivant"
          style={{ width: 38, height: 38, flexShrink: 0, borderRadius: '50%', border: '1px solid var(--ligne, #3a4049)', background: 'var(--ardoise, #20252c)', color: tourIndex === TOURS.length - 1 ? 'var(--chalk-40, #555)' : 'var(--chalk, #e8eaed)', fontSize: 20, cursor: tourIndex === TOURS.length - 1 ? 'default' : 'pointer', padding: 0 }}>›</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cases.map((m, i) => (
          <CarteMatch key={m?.id ?? i} m={m} />
        ))}
      </div>

      <p className="text-center font-mono text-xs text-chalk/40">
        Les vainqueurs s'inscriront automatiquement au fil des matchs.
      </p>
    </div>
  );
}
