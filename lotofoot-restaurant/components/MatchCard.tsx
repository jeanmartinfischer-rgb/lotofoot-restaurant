'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { isLocked, msUntilLock, outcomeFromScore, type Outcome } from '@/lib/scoring';

export interface MatchRow {
  id: number;
  home_team: string;
  away_team: string;
  kickoff: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
}

export interface PredictionRow {
  match_id: number;
  pred_home: number;
  pred_away: number;
  points: number | null;
  is_exact_score: boolean | null;
  is_correct_result: boolean | null;
}

const TZ = 'Europe/Paris';

function Countdown({ kickoff }: { kickoff: Date }) {
  const [ms, setMs] = useState(() => msUntilLock(kickoff));
  useEffect(() => {
    const t = setInterval(() => setMs(msUntilLock(kickoff)), 1000);
    return () => clearInterval(t);
  }, [kickoff]);

  if (ms <= 0) return <span className="font-mono text-xs font-bold text-sang-vif">PARIS CLÔTURÉS</span>;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const txt = h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return (
    <span className="font-mono text-xs text-chalk/60">
      Paris clôturés dans <span className={ms < 10 * 60_000 ? 'font-bold text-sang-vif' : 'font-bold text-chalk'}>{txt}</span>
    </span>
  );
}

export default function MatchCard({ match, prediction, userId }: {
  match: MatchRow;
  prediction: PredictionRow | null;
  userId: string;
}) {
  const kickoff = new Date(match.kickoff);
  const locked = isLocked(kickoff) || match.status !== 'scheduled';
  const [home, setHome] = useState<number | ''>(prediction?.pred_home ?? '');
  const [away, setAway] = useState<number | ''>(prediction?.pred_away ?? '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const myOutcome: Outcome | null =
    home !== '' && away !== '' ? outcomeFromScore(Number(home), Number(away)) : null;

  async function save(h: number, a: number) {
    setError('');
    const supabase = createClient();
    const { error } = await supabase
      .from('predictions')
      .upsert({ user_id: userId, match_id: match.id, pred_home: h, pred_away: a }, { onConflict: 'user_id,match_id' });
    if (error) setError(error.message.includes('clôturés') ? 'Trop tard, paris clôturés.' : 'Enregistrement impossible. Réessayez.');
    else { setSaved(true); setTimeout(() => setSaved(false), 1500); }
  }

  function pickOutcome(o: Outcome) {
    const presets: Record<Outcome, [number, number]> = { '1': [2, 1], 'N': [1, 1], '2': [1, 2] };
    const [h, a] = presets[o];
    setHome(h); setAway(a);
    save(h, a);
  }

  function onScoreBlur() {
    if (home === '' || away === '') return;
    save(Number(home), Number(away));
  }

  const isLive = match.status === 'live' || match.status === 'halftime';
  const isOver = match.status === 'finished';

  return (
    <article className="rounded-2xl border border-ligne bg-ardoise p-4">
      <div className="mb-3 flex items-center justify-between">
        <time className="font-mono text-xs text-chalk/60">
          {kickoff.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ })} · {kickoff.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TZ })}
        </time>
        {isLive && <span className="rounded-full bg-sang-vif px-2 py-0.5 font-mono text-xs font-bold animate-pulse">● LIVE</span>}
        {isOver && <span className="rounded-full border border-ligne px-2 py-0.5 font-mono text-xs text-chalk/60">TERMINÉ</span>}
        {!isLive && !isOver && <Countdown kickoff={kickoff} />}
      </div>

      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="flex-1 truncate font-semibold">{match.home_team}</span>
        <span className="font-mono text-xl font-bold">
          {match.home_score !== null ? `${match.home_score} – ${match.away_score}` : 'vs'}
        </span>
        <span className="flex-1 truncate text-right font-semibold">{match.away_team}</span>
      </div>

      <div className="mb-3 flex items-center justify-center gap-4">
        {(['1', 'N', '2'] as Outcome[]).map((o) => (
          <button
            key={o}
            disabled={locked}
            onClick={() => pickOutcome(o)}
            className={`pick ${myOutcome === o ? 'pick--on' : ''}`}
            aria-label={o === '1' ? 'Victoire domicile' : o === 'N' ? 'Match nul' : 'Victoire extérieur'}
          >
            {o}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        <label className="font-mono text-xs text-chalk/60">Score exact (3 pts) :</label>
        <input
          type="number" min={0} max={20}
