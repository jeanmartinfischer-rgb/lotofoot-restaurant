import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import MatchCard from '@/components/MatchCard';
import Crown from '@/components/Crown';
import Avatar from '@/components/Avatar';
import DefiAccueil from '@/components/DefiAccueil';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const isGuest = profile?.is_guest ?? false;

  const { data: rangs } = await supabase.from('leaderboard_season').select('*').order('rang');
  const me = rangs?.find((r: any) => r.user_id === user.id);
  const top3 = (rangs ?? []).slice(0, 3);

  const now = new Date().toISOString();
  const in48h = new Date(Date.now() + 48 * 3600000).toISOString();

  const { data: liveMatches } = await supabase
    .from('matches').select('*')
    .in('status', ['live', 'halftime'])
    .order('kickoff');

  const { data: prochains } = await supabase
    .from('matches').select('*')
    .gte('kickoff', now)
    .lte('kickoff', in48h)
    .order('kickoff')
    .limit(6);

  const { data: preds } = await supabase
    .from('predictions').select('*')
    .eq('user_id', user.id);

  const predByMatch = new Map((preds ?? []).map((p: any) => [p.match_id, p]));
  const streak = profile?.streak_current ?? 0;

  // Defi du jour
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });
  const { data: challenge } = await supabase
    .from('daily_challenges')
    .select('id, question, options, correct_answer, resolved, locks_at')
    .eq('challenge_date', today)
    .maybeSingle();
  let defiAnswer: string | null = null;
  if (challenge) {
    const { data: ans } = await supabase
      .from('daily_challenge_answers')
      .select('answer')
      .eq('challenge_id', challenge.id)
      .eq('user_id', user.id)
      .maybeSingle();
    defiAnswer = ans?.answer ?? null;
  }
  const defiLocked = challenge ? new Date(challenge.locks_at).getTime() <= Date.now() : false;

  return (
    <div className="space-y-6">
      <section className="text-center space-y-1">
        <p className="font-mono text-xs uppercase tracking-widest text-chalk/50">Bonjour</p>
        <h1 className="font-graff text-6xl tracking-wide">{profile?.pseudo ?? 'Joueur'}</h1>
        {streak > 0 && (
          <div className="inline-block rounded-2xl border border-sang bg-sang/10 px-3 py-1.5 mt-2">
            <p className="font-mono text-lg font-bold text-sang-vif">{String.fromCodePoint(0x1F525)} {streak}</p>
            <p className="text-[10px] text-chalk/60">serie en cours</p>
          </div>
        )}
      </section>

      <DefiAccueil userId={user.id} challenge={challenge ?? null} initialAnswer={defiAnswer} isLocked={defiLocked} />

      <section className="grid grid-cols-3 gap-3 text-center">
        <div className="glass rounded-2xl p-3">
          <p className="font-mono text-2xl font-bold text-sang-vif">{me?.total_points ?? 0}</p>
          <p className="text-xs text-chalk/60">points</p>
        </div>
        <div className="glass rounded-2xl p-3">
          <p className="font-mono text-2xl font-bold">{me?.rang ? '#' + me.rang : '-'}</p>
          <p className="text-xs text-chalk/60">rang</p>
        </div>
        <div className="glass rounded-2xl p-3">
          <p className="font-mono text-2xl font-bold">{me?.exact_scores ?? 0}</p>
          <p className="text-xs text-chalk/60">exacts</p>
        </div>
      </section>

      {!isGuest && top3.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-sm">PODIUM</h2>
            <Link href="/classement" className="text-xs font-semibold text-sang-vif">Classement complet</Link>
          </div>
          <div className="space-y-2">
            {top3.map((r: any) => (
              <Link key={r.user_id} href={'/profil/' + r.user_id} className="flex items-center gap-3 rounded-xl border border-ligne bg-ardoise p-2.5">
                <span className="w-7 text-center font-mono font-bold">
                  {r.rang === 1 ? String.fromCodePoint(0x1F947) : r.rang === 2 ? String.fromCodePoint(0x1F948) : String.fromCodePoint(0x1F949)}
                </span>
                <Avatar avatarUrl={r.avatar_url} pseudo={r.pseudo} size={36} />
                <span className="flex-1 min-w-0 truncate flex items-center gap-1.5">
                  {r.rang === 1 && <Crown size={18} />}
                  <span className="font-graff text-lg tracking-wide truncate">{r.pseudo}</span>
                </span>
                <span className="font-mono text-sm font-bold text-sang-vif">{r.total_points}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {liveMatches && liveMatches.length > 0 && (
        <section>
          <h2 className="font-display text-sm mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-sang-vif animate-pulse"></span>
            EN DIRECT
          </h2>
          <div className="space-y-3">
            {liveMatches.map((m: any) => (
              <div key={m.id} className="glass-gold rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex-1 truncate font-semibold text-sm">{m.home_team}</span>
                  <div className="text-center">
                    <p className="font-mono text-2xl font-bold text-sang-vif">{m.home_score ?? 0} - {m.away_score ?? 0}</p>
                    <span className="font-mono text-xs font-bold text-sang-vif animate-pulse">{m.status === 'halftime' ? 'MI-TEMPS' : 'LIVE'}</span>
                  </div>
                  <span className="flex-1 truncate text-right font-semibold text-sm">{m.away_team}</span>
                </div>
                {predByMatch.get(m.id) && (
                  <p className="mt-2 text-center font-mono text-xs text-chalk/50">
                    Mon prono : {(predByMatch.get(m.id) as any).pred_home}-{(predByMatch.get(m.id) as any).pred_away}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="glass-gold rounded-2xl p-4">
        <h2 className="mb-1 font-display text-sm">BAREME LOTO FOOT</h2>
        <ul className="space-y-1 font-mono text-sm">
          <li>Score exact <b className="float-right">3 pts</b></li>
          <li>Bon resultat (1/N/2) <b className="float-right">1 pt</b></li>
          <li>Mauvais <b className="float-right text-chalk/50">0 pt</b></li>
        </ul>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-sm">PROCHAINS MATCHS</h2>
          <Link href="/matchs" className="text-xs font-semibold text-sang-vif">Tout voir</Link>
        </div>
        {!prochains?.length && (
          <p className="glass rounded-2xl p-4 text-sm text-chalk/60 text-center">
            Aucun match dans les prochaines 48 heures.
          </p>
        )}
        <div className="space-y-4">
          {prochains?.map((m: any) => (
            <MatchCard key={m.id} match={m} prediction={predByMatch.get(m.id) ?? null} userId={user.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
