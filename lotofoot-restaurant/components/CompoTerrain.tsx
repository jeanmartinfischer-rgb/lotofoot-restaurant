'use client';
import { useEffect, useState } from 'react';

type Joueur = {
  id: number | null;
  name: string;
  number: number | null;
  pos: string | null;
  grid: string | null;
  photo: string | null;
};
type Equipe = {
  teamName: string;
  teamLogo: string | null;
  formation: string | null;
  coach: { name: string | null; photo: string | null } | null;
  startXI: Joueur[];
  substitutes: Joueur[];
};

function Pastille({ j }: { j: Joueur }) {
  const [src, setSrc] = useState(j.photo ?? '');
  const court = j.name?.split(' ').slice(-1)[0] ?? j.name;
  return (
    <div className="flex flex-col items-center gap-1 w-16">
      <div className="relative">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={j.name}
            onError={() => setSrc('')}
            className="h-10 w-10 rounded-full object-cover border-2 border-chalk bg-ardoise"
          />
        ) : (
          <div className="h-10 w-10 rounded-full border-2 border-chalk bg-ardoise flex items-center justify-center text-[10px] font-bold text-chalk/70">
            {court.slice(0, 3).toUpperCase()}
          </div>
        )}
        {j.number != null && (
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-sang text-chalk text-[9px] font-bold flex items-center justify-center border border-chalk">
            {j.number}
          </span>
        )}
      </div>
      <span className="text-[9px] leading-tight text-center text-chalk font-mono truncate w-full">
        {court}
      </span>
    </div>
  );
}

function TerrainEquipe({ eq }: { eq: Equipe }) {
  const lignes = new Map<number, Joueur[]>();
  for (const j of eq.startXI) {
    const ligne = j.grid ? parseInt(j.grid.split(':')[0], 10) : 99;
    if (!lignes.has(ligne)) lignes.set(ligne, []);
    lignes.get(ligne)!.push(j);
  }
  const lignesTriees = [...lignes.entries()].sort((a, b) => a[0] - b[0]);
  for (const [, joueurs] of lignesTriees) {
    joueurs.sort((a, b) => {
      const ya = a.grid ? parseInt(a.grid.split(':')[1], 10) : 0;
      const yb = b.grid ? parseInt(b.grid.split(':')[1], 10) : 0;
      return ya - yb;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        {eq.teamLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={eq.teamLogo} alt="" className="h-5 w-5 object-contain" />
        )}
        <span className="font-display text-sm">{eq.teamName}</span>
        {eq.formation && (
          <span className="font-mono text-xs text-chalk/60">{eq.formation}</span>
        )}
      </div>

      <div
        className="rounded-xl border border-chalk/30 p-3 space-y-4"
        style={{
          background:
            'repeating-linear-gradient(0deg, #1f6b3a 0px, #1f6b3a 28px, #1d6537 28px, #1d6537 56px)',
        }}
      >
        {lignesTriees.map(([ligne, joueurs]) => (
          <div key={ligne} className="flex justify-around">
            {joueurs.map((j, i) => (
              <Pastille key={(j.id ?? 0) + '-' + i} j={j} />
            ))}
          </div>
        ))}
      </div>

      {eq.substitutes.length > 0 && (
        <div>
          <p className="font-mono text-[10px] text-chalk/60 mb-2">REMPLACANTS</p>
          <div className="flex flex-wrap gap-2">
            {eq.substitutes.map((j, i) => (
              <Pastille key={(j.id ?? 0) + '-sub-' + i} j={j} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompoTerrain({ matchId }: { matchId: number }) {
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);
  const [teams, setTeams] = useState<Equipe[]>([]);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    let actif = true;
    setLoading(true);
    fetch('/api/lineups?match=' + matchId)
      .then((r) => r.json())
      .then((data) => {
        if (!actif) return;
        setAvailable(data.available ?? false);
        setTeams(data.teams ?? []);
      })
      .catch(() => actif && setErreur(true))
      .finally(() => actif && setLoading(false));
    return () => {
      actif = false;
    };
  }, [matchId]);

  if (loading) {
    return <p className="text-center text-xs text-chalk/60 py-4">Chargement des compos...</p>;
  }
  if (erreur) {
    return <p className="text-center text-xs text-chalk/60 py-4">Erreur de chargement.</p>;
  }
  if (!available || teams.length === 0) {
    return (
      <p className="text-center text-xs text-chalk/60 py-4">
        Compos pas encore disponibles. Reviens environ 30 min avant le coup d'envoi.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {teams.map((eq, i) => (
        <TerrainEquipe key={i} eq={eq} />
      ))}
    </div>
  );
}
