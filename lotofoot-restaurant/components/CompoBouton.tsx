'use client';
import { useState } from 'react';
import CompoTerrain from './CompoTerrain';

export default function CompoBouton({ matchId }: { matchId: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="block w-full rounded-xl border border-ligne py-2 text-center font-mono text-xs text-chalk/60 hover:text-chalk hover:border-chalk/40 transition-colors"
      >
        {open ? 'Masquer la compo' : 'Compo'}
      </button>
      {open && (
        <div className="mt-3">
          <CompoTerrain matchId={matchId} />
        </div>
      )}
    </div>
  );
}
