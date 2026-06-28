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
};

type ToursData = Record<string, Match[]>;

const TOURS: { cle: string; label: string; court: string; cases: number }[] = [
  { cle: 'Round of 32', label: 'Seizièmes', court: '16es', cases: 16 },
  { cle: 'Round of 16', label: 'Huitièmes', court: '8es', cases: 8 },
  { cle: 'Quarter-finals', label: 'Quarts', court: 'Quarts', cases: 4 },
  { cle: 'Semi-finals', label: 'Demies', court: 'Demies', cases: 2 },
  { cle: 'Final', label: 'Finale', court: 'Finale', cases: 1 },
];

const TZ = 'Europe/Paris';

function heureMatch(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: TZ });
  const heure = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
  return date + ' · ' + heure;
}

function Drapeau({ src }: { src: string | null }) {
  if (!src) {
    return (
      <span
        style={{
          width: 20, height: 20, borderRadius: 3, flexShrink: 0,
          background: 'var(--ligne, #2a2f36)', display: 'inline-block',
        }}
      />
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={20}
      height={20}
      style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
      loading="lazy"
    />
  );
}

function CaseEquipe({
  nom, logo, score, gagnant, vide,
}: {
  nom: string; logo: string | null; score: number | null; gagnant: boolean | null; vide: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 7, padding: '7px 9px',
        background: gagnant ? 'rgba(34,197,94,0.16)' : 'transparent',
      }}
    >
      {vide ? (
        <span style={{ fontSize: 12.5, color: 'var(--chalk-40, #8a9099)', fontStyle: 'italic' }}>
          à déterminer
        </span>
      ) : (
        <>
          <Drapeau src={logo} />
          <span
            style={{
              flex: 1, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: gagnant ? '#fff' : 'var(--chalk-70, #c4c9d0)',
              fontWeight: gagnant ? 700 : 400,
            }}
          >
            {nom}
          </span>
          {score !== null && (
            <span
              style={{
                fontSize: 13, fontWeight: 700,
                color: gagnant ? '#fff' : 'var(--chalk-50, #9aa0a8)',
              }}
            >
              {score}
            </span>
          )}
        </>
      )}
    </div>
  );
}

function CarteMatch({ m }: { m: Match | null }) {
  const vide = !m || (!m.home && !m.away);
  return (
    <div
      style={{
        width: 150, flexShrink: 0,
        border: '1px solid var(--ligne, #2a2f36)',
        borderRadius: 10, overflow: 'hidden',
        background: 'var(--ardoise, #161a20)',
      }}
    >
      <CaseEquipe
        nom={m?.home ?? ''} logo={m?.home_logo ?? null}
        score={m?.fini ? m?.home_score ?? null : (m?.enCours ? m?.home_score ?? null : null)}
        gagnant={m?.home_winner ?? null} vide={vide}
      />
      <div style={{ height: 1, background: 'var(--ligne, #2a2f36)' }} />
      <CaseEquipe
        nom={m?.away ?? ''} logo={m?.away_logo ?? null}
        score={m?.fini ? m?.away_score ?? null : (m?.enCours ? m?.away_score ?? null : null)}
        gagnant={m?.away_winner ?? null} vide={vide}
      />
      <div
        style={{
          textAlign: 'center', fontSize: 10, padding: '3px 0 5px',
          color: m?.enCours ? '#ff5a4d' : 'var(--chalk-40, #8a9099)',
          fontWeight: m?.enCours ? 700 : 400,
          borderTop: '1px solid var(--ligne, #2a2f36)',
        }}
      >
        {!m || vide ? 'à venir' : m.fini ? 'terminé' : m.enCours ? 'EN DIRECT' : heureMatch(m.kickoff)}
      </div>
    </div>
  );
}

export default function BracketClient() {
  const [tours, setTours] = useState<ToursData | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [actif, setActif] = useState('Round of 32');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const colRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetch('/api/bracket')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setErreur(d.error);
        else setTours(d.tours ?? {});
      })
      .catch((e) => setErreur(String(e)));
  }, []);

  function allerAuTour(cle: string) {
    setActif(cle);
    const col = colRefs.current[cle];
    const box = scrollRef.current;
    if (col && box) {
      box.scrollTo({ left: col.offsetLeft - 12, behavior: 'smooth' });
    }
  }

  if (erreur) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl">TABLEAU FINAL</h1>
        <p className="rounded-2xl border border-ligne bg-ardoise p-6 text-center text-sm text-chalk/60">
          Impossible de charger le tableau pour le moment.
        </p>
      </div>
    );
  }

  if (!tours) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl">TABLEAU FINAL</h1>
        <p className="rounded-2xl border border-ligne bg-ardoise p-6 text-center text-sm text-chalk/60">
          Chargement du tableau...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">TABLEAU FINAL</h1>

      <div
        className="sticky top-0 z-10 flex gap-2 overflow-x-auto py-2"
        style={{ background: 'var(--pitch, #0f1216)' }}
      >
        {TOURS.map((t) => (
          <button
            key={t.cle}
            onClick={() => allerAuTour(t.cle)}
            className="whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-xs transition-colors"
            style={{
              flexShrink: 0,
              border: '1px solid ' + (actif === t.cle ? '#ff5a4d' : 'var(--ligne, #2a2f36)'),
              background: actif === t.cle ? 'rgba(255,90,77,0.15)' : 'transparent',
              color: actif === t.cle ? '#ff5a4d' : 'var(--chalk-60, #a8aeb6)',
              fontWeight: actif === t.cle ? 700 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        ref={scrollRef}
        style={{ overflowX: 'auto', paddingBottom: 12 }}
      >
        <div style={{ display: 'flex', gap: 18, alignItems: 'stretch', minWidth: 'min-content' }}>
          {TOURS.map((t) => {
            const matchs = tours[t.cle] ?? [];
            const cases: (Match | null)[] = [];
            for (let i = 0; i < t.cases; i++) {
              cases.push(matchs[i] ?? null);
            }
            return (
              <div
                key={t.cle}
                ref={(el) => { colRefs.current[t.cle] = el; }}
                style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-around',
                  gap: 12, minWidth: 150,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11, fontWeight: 700, textAlign: 'center', marginBottom: 2,
                    color: actif === t.cle ? '#ff5a4d' : 'var(--chalk-60, #a8aeb6)',
                  }}
                >
                  {t.court}
                </div>
                {cases.map((m, i) => (
                  <CarteMatch key={m?.id ?? (t.cle + '-' + i)} m={m} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center font-mono text-xs text-chalk/40">
        Les vainqueurs s'afficheront automatiquement au fil des matchs.
      </p>
    </div>
  );
}
