'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Avatar from '@/components/Avatar';

type Challenge = {
  id: number;
  type: string;
  question: string;
  options: string[];
  correct_answer: string | null;
  resolved: boolean;
  locks_at: string;
  matches: {
    home_team: string;
    away_team: string;
    home_logo: string | null;
    away_logo: string | null;
    kickoff: string;
    home_score: number | null;
    away_score: number | null;
    status: string;
  };
};

type RankRow = {
  id: string;
  pseudo: string;
  avatar_url: string | null;
  streak_current: number;
  streak_best: number;
};

const PODIUM: Record<number, { color: string; glow: string }> = {
  1: { color: '#F5C542', glow: 'rgba(245,197,66,0.45)' },
  2: { color: '#C8D0DA', glow: 'rgba(200,208,218,0.4)' },
  3: { color: '#CD7F32', glow: 'rgba(205,127,50,0.4)' },
};

export default function DefiClient({
  userId,
  pseudo,
  streakCurrent,
  streakBest,
  challenge,
  myAnswer,
  isLocked,
  ranking,
}: {
  userId: string;
  pseudo: string;
  streakCurrent: number;
  streakBest: number;
  challenge: Challenge | null;
  myAnswer: { answer: string; is_correct: boolean | null } | null;
  isLocked: boolean;
  ranking: RankRow[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [answer, setAnswer] = useState<string | null>(myAnswer?.answer ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locked = isLocked || (challenge?.resolved ?? false);

  async function choisir(option: string) {
    if (!challenge || locked || saving) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from('daily_challenge_answers')
      .upsert(
        { challenge_id: challenge.id, user_id: userId, answer: option },
        { onConflict: 'challenge_id,user_id' }
      );
    setSaving(false);
    if (error) {
      setError('Impossible d\'enregistrer (defi peut-etre verrouille).');
      return;
    }
    setAnswer(option);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <style>{`
        @keyframes streakPulse {
          0%, 100% { box-shadow: 0 0 8px 0 rgba(194,39,47,0.3); }
          50% { box-shadow: 0 0 20px 2px rgba(194,39,47,0.5); }
        }
        .streak-card { animation: streakPulse 2.4s ease-in-out infinite; }
        @keyframes flameWiggle {
          0%, 100% { transform: rotate(-6deg) scale(1); }
          50% { transform: rotate(6deg) scale(1.12); }
        }
        .flame { display: inline-block; animation: flameWiggle 1.4s ease-in-out infinite; }
      `}</style>

      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl">DEFI EXPRESS</h1>
        <p className="font-mono text-xs text-chalk/50">{pseudo}</p>
      </div>

      <section className="grid grid-cols-2 gap-3">
        <div className={'rounded-2xl border border-sang bg-pitch p-4 text-center ' + (streakCurrent > 0 ? 'streak-card' : '')}>
          <p className="font-mono text-3xl font-bold text-sang-vif">
            {streakCurrent} <span className="text-xl flame">{String.fromCodePoint(0x1F525)}</span>
          </p>
          <p className="text-xs text-chalk/60 mt-1">serie en cours</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-4 text-center">
          <p className="font-mono text-3xl font-bold">{streakBest}</p>
          <p className="text-xs text-chalk/60 mt-1">record perso</p>
        </div>
      </section>

      {!challenge && (
        <section className="rounded-2xl border border-ligne bg-ardoise p-6 text-center">
          <p className="text-3xl mb-2">{String.fromCodePoint(0x1F634)}</p>
          <p className="text-sm text-chalk/70">Aucun defi aujourd'hui.</p>
          <p className="text-xs text-chalk/40 mt-1">Reviens un jour de match !</p>
        </section>
      )}

      {challenge && (
        <section className="rounded-2xl border border-sang bg-pitch p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-sm">LE DEFI DU JOUR</h2>
            {challenge.resolved ? (
              <span className="font-mono text-xs text-chalk/40">termine</span>
            ) : locked ? (
              <span className="font-mono text-xs text-yellow-400">verrouille</span>
            ) : (
              <span className="font-mono text-xs text-green-400 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                ouvert
              </span>
            )}
          </div>

          <p className="text-sm text-chalk mb-4">{challenge.question}</p>

          <div className="grid grid-cols-1 gap-2">
            {challenge.options.map((opt) => {
              const isMine = answer === opt;
              const isCorrect = challenge.resolved && challenge.correct_answer === opt;
              const isWrongMine = challenge.resolved && isMine && challenge.correct_answer !== opt;

              let cls = 'border-ligne bg-ardoise text-chalk';
              if (isCorrect) cls = 'border-green-500 bg-green-500/15 text-green-300';
              else if (isWrongMine) cls = 'border-sang bg-sang/15 text-chalk/70 line-through';
              else if (isMine) cls = 'border-sang-vif bg-sang/20 text-chalk';

              return (
                <button
                  key={opt}
                  onClick={() => choisir(opt)}
                  disabled={locked || saving}
                  className={
                    'rounded-xl border px-4 py-3 font-mono text-sm transition ' +
                    cls +
                    (locked ? ' cursor-default' : ' hover:border-sang-vif active:scale-95')
                  }
                >
                  {opt}
                  {isMine && !challenge.resolved && (
                    <span className="ml-2 text-xs text-chalk/50">(ton choix)</span>
                  )}
                  {isCorrect && <span className="ml-2 text-xs">{String.fromCharCode(10003)}</span>}
                </button>
              );
            })}
          </div>

          {error && <p className="mt-3 text-xs text-sang-vif">{error}</p>}

          {challenge.resolved && myAnswer && (
            <div className="mt-4 rounded-xl border border-ligne bg-ardoise p-3 text-center">
              {myAnswer.is_correct ? (
                <p className="font-mono text-sm text-green-400">
                  Gagne ! Serie +1 <span className="flame inline-block">{String.fromCodePoint(0x1F525)}</span>
                </p>
              ) : (
                <p className="font-mono text-sm text-chalk/50">
                  Rate. Serie remise a zero.
                </p>
              )}
            </div>
          )}

          {challenge.matches.status === 'finished' &&
            challenge.matches.home_score !== null && (
              <p className="mt-3 text-center font-mono text-xs text-chalk/40">
                {challenge.matches.home_team} {challenge.matches.home_score} - {challenge.matches.away_score} {challenge.matches.away_team}
              </p>
            )}

          {!locked && (
            <p className="mt-3 text-center font-mono text-xs text-chalk/40">
              Verrouillage au coup d'envoi
            </p>
          )}
        </section>
      )}

      {ranking.length > 0 && (
        <section className="rounded-2xl border border-ligne bg-ardoise p-4">
          <h2 className="font-display text-sm mb-3">SERIES EN COURS <span className="flame inline-block">{String.fromCodePoint(0x1F525)}</span></h2>
          <div className="space-y-2">
            {ranking.map((r, i) => {
              const rank = i + 1;
              const p = PODIUM[rank];
              const isMe = r.id === userId;
              return (
                <div
                  key={r.id}
                  className={'flex items-center justify-between rounded-xl px-3 py-2 text-sm border ' + (p ? 'bg-pitch' : 'border-transparent') + (isMe ? ' text-sang-vif font-bold' : ' text-chalk/80')}
                  style={p ? { borderColor: p.color, boxShadow: '0 0 8px 0 ' + p.glow } : undefined}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs w-6 text-center">
                      {rank === 1 ? String.fromCodePoint(0x1F947) : rank === 2 ? String.fromCodePoint(0x1F948) : rank === 3 ? String.fromCodePoint(0x1F949) : '#' + rank}
                    </span>
                    <Avatar avatarUrl={r.avatar_url} pseudo={r.pseudo} size={32} />
                    <span className="truncate">{r.pseudo}</span>
                  </span>
                  <span className="font-mono text-xs shrink-0">
                    {r.streak_current} <span className="text-chalk/30">/ {r.streak_best}</span>
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 font-mono text-xs text-chalk/30 text-center">
            serie actuelle / record
          </p>
        </section>
      )}
    </div>
  );
}
