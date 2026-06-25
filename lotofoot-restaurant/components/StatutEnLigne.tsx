'use client';

// Affiche le statut d'un joueur a partir de son last_seen.
// - actif < 5 min  -> point vert + "En ligne"
// - sinon          -> point gris + "vu il y a X"
// - jamais vu (null) -> rien (on n'affiche pas "jamais vu")

function tempsEcoule(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return "a l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return 'il y a ' + min + ' min';
  const h = Math.floor(min / 60);
  if (h < 24) return 'il y a ' + h + ' h';
  const j = Math.floor(h / 24);
  if (j === 1) return 'hier';
  if (j < 7) return 'il y a ' + j + ' j';
  const sem = Math.floor(j / 7);
  if (sem < 5) return 'il y a ' + sem + ' sem';
  return 'il y a longtemps';
}

export default function StatutEnLigne({ lastSeen, taille = 'sm' }: { lastSeen: string | null; taille?: 'sm' | 'xs' }) {
  if (!lastSeen) return null;

  const date = new Date(lastSeen);
  const minutes = (Date.now() - date.getTime()) / 60000;
  const enLigne = minutes < 5;

  const texte = taille === 'xs' ? 'text-[9px]' : 'text-[10px]';
  const point = taille === 'xs' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`inline-block rounded-full ${point} ${enLigne ? 'bg-green-400' : 'bg-chalk/30'}`}
      />
      <span className={`font-mono ${texte} ${enLigne ? 'text-green-400' : 'text-chalk/40'}`}>
        {enLigne ? 'En ligne' : 'vu ' + tempsEcoule(date)}
      </span>
    </span>
  );
}
