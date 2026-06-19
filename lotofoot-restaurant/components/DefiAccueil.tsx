'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';

type Challenge = {
  id: number;
  question: string;
  options: string[];
  correct_answer: string | null;
  resolved: boolean;
  locks_at: string;
};

function Countdown({ locksAt }: { locksAt: string }) {
  const [ms, setMs] = useState(() => new Date(locksAt).getTime() - Date.now());
  useEffect(() => {
    const t = setInterval(() => setMs(new Date(locksAt).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [locksAt]);

  if (ms <= 0) return <span className="font-mono text-xs font-bold text-yellow-400">VERROUILLE</span>;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const txt = h > 0 ? h + 'h ' + String(m).padStart(2, '0') + 'm' : String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  return (
    <span className="font-mono text-xs text-chalk/70">
      Ferme dans <span className={ms < 600000 ? 'font-bold text-sang-vif' : 'font-bold text-chalk'}>{txt}</span>
    </span>
  );
}

export default function DefiAccueil({
  userId,
  challenge,
  initialAnswer,
  isLocked,
}: {
  userId: string;
  challenge: Challenge | null;
  initialAnswer: string | null;
  isLocked: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [answer, setAnswer] = useState<string | null>(initialAnswer);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!challenge) return null;

  const locked = isLocked || challenge.resolved;

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
    <section className="rounded-2xl border border-sang bg-pitch p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-sm flex items-center gap-2">
          <span>{String.fromCodePoint(0x1F525)}</span> DEFI DU JOUR
        </h2>
        {challenge.resolved ? (
          <span className="font-mono text-xs text-chalk/40">termine</span>
        ) : locked ? (
          <span className="font-mono text-xs text-yellow-400">verrouille</span>
        ) : (
          <Countdown locksAt={challenge.locks_at} />
        )}
      </div>

      <p className="text-sm text-chalk mb-3">{challenge.question}</p>

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
              {isMine && !challenge.resolved && <span className="ml-2 text-xs text-chalk/50">(ton choix)</span>}
              {isCorrect && <span className="ml-2 text-xs">{String.fromCharCode(10003)}</span>}
            </button>
          );
        })}
      </div>

      {error && <p className="mt-3 text-xs text-sang-vif">{error}</p>}

      {!answer && !locked && (
        <p className="mt-3 text-center font-mono text-xs text-sang-vif">Reponds avant le coup d'envoi !</p>
      )}

      <Link href="/defi" className="mt-3 block text-center font-mono text-xs text-chalk/50 hover:text-chalk">
        Voir les series et le classement defi
      </Link>
    </section>
  );
}
