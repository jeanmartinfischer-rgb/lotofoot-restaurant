'use client';
import { useState } from 'react';
import MatchCard, { type MatchRow, type PredictionRow } from '@/components/MatchCard';

type Onglet = 'avenir' | 'live' | 'termines';

export default function MatchsClient({ matches, preds, userId }: {
  matches: MatchRow[];
  preds: PredictionRow[];
  userId: string;
}) {
  const [onglet, setOnglet] = useState<Onglet>('avenir');
  const predByMatch = new Map<number, PredictionRow>(preds.map((p) => [p.match_id, p]));

  const avenir = matches.filter((m) => m.status === 'scheduled');
  const live = matches.filter((m) => m.status === 'live' || m.status === 'halftime');
  const termines = matches.filter((m) => m.status === 'finished').reverse();

  const listes: Record<Onglet, MatchRow[]> = { avenir, live, termines };
  const liste = listes[onglet];

  const vide: Record<Onglet, string> = {
    avenir: 'Aucun match a venir pour le moment.',
    live: 'Aucun match en direct en ce moment.',
    termines: 'Aucun match termine pour le moment.',
  };

  function Tab({ id, label, count }: { id: Onglet; label: string; count: number }) {
    const actif = onglet === id;
    return (
      <button onClick={() => setOnglet(id)} className={'flex-1 rounded-lg py-2 px-1 font-mono text-xs sm:text-sm transition-colors ' + (actif ? 'bg-sang font-bold text-chalk' : 'text-chalk/60 hover:text-chalk')}>
        {label}{count > 0 ? ' (' + count + ')' : ''}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">MES PARIS</h1>
      <p className="font-mono text-xs text-chalk/60">
        {String.fromCodePoint(0x1F3AF)} Score exact = 3 pts {String.fromCharCode(183)} {String.fromCharCode(10003)} Bon resultat = 1 pt {String.fromCharCode(183)} {String.fromCharCode(10007)} Mauvais = 0 pt
      </p>

      {!matches.length && (
        <p className="rounded-2xl border border-ligne bg-ardoise p-6 text-center text-sm text-chalk/60">
          Aucun match importe pour l'instant. L'administrateur peut lancer l'import depuis l'espace Admin.
        </p>
      )}

      {matches.length > 0 && (
        <>
          <div className="flex gap-1 rounded-xl border border-ligne p-1">
            <Tab id="avenir" label="A venir" count={avenir.length} />
            <Tab id="live" label="En direct" count={live.length} />
            <Tab id="termines" label="Termines" count={termines.length} />
          </div>

          {liste.length === 0 ? (
            <p className="rounded-2xl border border-ligne bg-ardoise p-6 text-center text-sm text-chalk/60">{vide[onglet]}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
              {liste.map((m) => (
                <MatchCard key={m.id} match={m} prediction={predByMatch.get(m.id) ?? null} userId={userId} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
