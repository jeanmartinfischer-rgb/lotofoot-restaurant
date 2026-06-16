'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { isLocked, msUntilLock, outcomeFromScore, type Outcome } from '@/lib/scoring';
import MatchReactions from './MatchReactions';
import Confetti from './Confetti';
import SamePredictions from './SamePredictions';

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

  if (ms <= 0) return <span className="font-mono text-xs font-bold text-sang-vif">PARIS CLOTURES</span>;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const txt = h > 0 ? h + 'h ' + String(m).padStart(2, '0') + 'm' : String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  return (
    <span className="font-mono text-xs text-chalk/60">
      Dans <span className={ms < 600000 ? 'font-bold text-sang-vif' : 'font-bold text-chalk'}>{txt}</span>
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
  const [open, setOpen] = useState(false);
  const [confetti, setConfetti] = useState(0);

  const myOutcome: Outcome | null = home !== '' && away !== '' ? outcomeFromScore(Number(home), Number(away)) : null;
  const aParie = prediction !== null;

  async function save(h: number, a: number, refermer = false) {
    setError('');
    const supabase = createClient();
    const { error } = await supabase
      .from('predictions')
      .upsert({ user_id: userId, match_id: match.id, pred_home: h, pred_away: a }, { onConflict: 'user_id,match_id' });
    if (error) {
      setError('Enregistrement impossible. Reessayez.');
    } else {
      setSaved(true);
      setConfetti((c) => c + 1);
      setTimeout(() => setSaved(false), 2000);
      if (refermer) setOpen(false);
    }
  }

  function pickOutcome(o: Outcome) {
    const presets: Record<Outcome, [number, number]> = { '1': [2, 1], 'N': [1, 1], '2': [1, 2] };
    const [h, a] = presets[o];
    setHome(h);
    setAway(a);
  }

  function valider() {
    if (home === '' || away === '') {
      setError('Choisis un pronostic avant de valider.');
      return;
    }
    save(Number(home), Number(away), true);
  }

  const isLive = match.status === 'live' || match.status === 'halftime';
  const isOver = match.status === 'finished';

  const dateLabel = kickoff.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ });
  const timeLabel = kickoff.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TZ });

  return (
    <article className="glass-gold rounded-2xl p-4 relative overflow-hidden">
      <Confetti fire={confetti} />
      <div className="mb-3 flex items-center justify-between">
        <time className="font-mono text-xs text-chalk/60">{dateLabel} - {timeLabel}</time>
        {isLive && <span className="rounded-full bg-sang-vif px-2 py-0.5 font-mono text-xs font-bold animate-pulse">LIVE</span>}
        {isOver && <span className="rounded-full border border-ligne px-2 py-0.5 font-mono text-xs text-chalk/60">TERMINE</span>}
        {!isLive && !isOver && <Countdown kickoff={kickoff} />}
      </div>

      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="flex-1 truncate font-semibold">{match.home_team}</span>
        <span className="font-mono text-xl font-bold">
          {match.home_score !== null ? match.home_score + ' - ' + match.away_score : 'vs'}
        </span>
        <span className="flex-1 truncate text-right font-semibold">{match.away_team}</span>
      </div>

      {!locked && !open && (
        <button onClick={() => setOpen(true)} className={'block w-full rounded-xl border py-3 text-center font-mono text-sm transition-colors ' + (aParie ? 'border-ligne text-chalk/70 hover:text-chalk hover:border-chalk/40' : 'border-sang bg-sang/15 text-chalk hover:border-sang-vif')}>
          {aParie ? 'Mon pari : ' + prediction!.pred_home + ' - ' + prediction!.pred_away + ' (modifier)' : 'Parier'}
        </button>
      )}

      {!locked && open && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-4">
            {(['1', 'N', '2'] as Outcome[]).map((o) => (
              <button key={o} onClick={() => pickOutcome(o)} className={'pick' + (myOutcome === o ? ' pick--on' : '')}>{o}</button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <label className="font-mono text-xs text-chalk/60">Score exact (3 pts) :</label>
            <input type="number" min={0} max={20} inputMode="numeric" value={home} onChange={(e) => setHome(e.target.value === '' ? '' : Number(e.target.value))} className="w-12 rounded-lg border border-ligne bg-pitch px-2 py-1 text-center font-mono font-bold" />
            <span className="text-chalk/40">-</span>
            <input type="number" min={0} max={20} inputMode="numeric" value={away} onChange={(e) => setAway(e.target.value === '' ? '' : Number(e.target.value))} className="w-12 rounded-lg border border-ligne bg-pitch px-2 py-1 text-center font-mono font-bold" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-ligne py-2.5 font-mono text-sm text-chalk/60 hover:text-chalk transition-colors">Annuler</button>
            <button onClick={valider} className="flex-[2] rounded-xl border border-sang bg-sang/15 py-2.5 font-mono text-sm font-bold text-chalk hover:border-sang-vif transition-colors">Valider mon pari</button>
          </div>
        </div>
      )}

      {locked && aParie && !isOver && (
        <p className="rounded-xl border border-ligne bg-pitch p-2 text-center font-mono text-sm text-chalk/70">
          Ton pari : <b className="text-chalk">{prediction!.pred_home} - {prediction!.pred_away}</b>
        </p>
      )}
      {locked && !aParie && !isOver && (
        <p className="rounded-xl border border-ligne bg-pitch p-2 text-center font-mono text-xs text-chalk/40">Paris clotures</p>
      )}

      {saved && <p className="mt-2 text-center font-mono text-xs font-bold text-green-400">Pronostic enregistre</p>}
      {error && <p className="mt-2 text-center font-mono text-xs text-sang-vif">{error}</p>}

      {isOver && (
        <div className="rounded-xl border border-ligne bg-pitch p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-chalk/50">Score final</span>
            <span className="font-mono text-lg font-bold text-chalk">{match.home_score} - {match.away_score}</span>
          </div>
          {aParie ? (
            <>
              <div className="flex items-center justify-between border-t border-ligne pt-2">
                <span className="font-mono text-xs text-chalk/50">Ton prono</span>
                <span className="font-mono text-sm font-bold text-chalk/80">{prediction!.pred_home} - {prediction!.pred_away}</span>
              </div>
              <div className="flex items-center justify-center pt-1">
                {prediction!.is_exact_score && <span className="rounded-full bg-sang-vif px-3 py-1 font-mono text-xs font-bold text-chalk">Score exact ! +3 pts</span>}
                {!prediction!.is_exact_score && prediction!.is_correct_result && <span className="rounded-full border border-green-500 bg-green-500/15 px-3 py-1 font-mono text-xs font-bold text-green-300">Bon resultat +1 pt</span>}
                {!prediction!.is_correct_result && <span className="rounded-full border border-ligne px-3 py-1 font-mono text-xs text-chalk/50">Rate 0 pt</span>}
              </div>
            </>
          ) : (
            <p className="border-t border-ligne pt-2 text-center font-mono text-xs text-chalk/40">Tu n'avais pas parie sur ce match</p>
          )}
        </div>
      )}

      {isOver && (
        <a href={'/matchs/' + match.id} className="mt-3 block w-full rounded-xl border border-ligne py-2 text-center font-mono text-xs text-chalk/60 hover:text-chalk hover:border-chalk/40">Voir le resume du match</a>
      )}

      {(isLive || isOver) && aParie && (
        <SamePredictions matchId={match.id} userId={userId} predHome={prediction!.pred_home} predAway={prediction!.pred_away} />
      )}

      <MatchReactions matchId={match.id} userId={userId} />
    </article>
  );
}
