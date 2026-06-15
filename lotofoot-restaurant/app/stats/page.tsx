import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function Stats() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();

  const { data: preds } = await supabase
    .from('predictions')
    .select('*, matches!inner(home_team, away_team, kickoff, status, home_score, away_score)')
    .eq('user_id', user.id)
    .not('points', 'is', null)
    .order('matches(kickoff)');

  const { data: rang } = await supabase
    .from('leaderboard_season')
    .select('rang, total_points, exact_scores, correct_results')
    .eq('user_id', user.id)
    .single();

  const { data: badges } = await supabase
    .from('badges').select('*').eq('user_id', user.id);

  const { data: allPlayers } = await supabase
    .from('leaderboard_season').select('total_points');

  const totalParis = preds?.length ?? 0;
  const bonsResultats = preds?.filter((p) => p.is_correct_result).length ?? 0;
  const scoresExacts = preds?.filter((p) => p.is_exact_score).length ?? 0;
  const mauvais = preds?.filter((p) => !p.is_correct_result).length ?? 0;
  const tauxReussite = totalParis > 0 ? Math.round((bonsResultats / totalParis) * 100) : 0;
  const tauxExact = totalParis > 0 ? Math.round((scoresExacts / totalParis) * 100) : 0;

  const moyenneEquipe = allPlayers && allPlayers.length > 0
    ? Math.round(allPlayers.reduce((sum, p) => sum + (p.total_points ?? 0), 0) / allPlayers.length)
    : 0;

  const pointsCumules: number[] = [];
  let cumul = 0;
  for (const p of preds ?? []) {
    cumul += p.points ?? 0;
    pointsCumules.push(cumul);
  }

  const maxPoints = Math.max(...pointsCumules, 1);
  const graphWidth = 300;
  const graphHeight = 80;

  const points = pointsCumules.map((val, i) => {
    const x = totalParis > 1 ? (i / (totalParis - 1)) * graphWidth : graphWidth / 2;
    const y = graphHeight - (val / maxPoints) * graphHeight;
    return x + ',' + y;
  });

  const BADGE_ICONS: Record<string, string> = {
    sniper: 'Sniper',
    super_sniper: 'Super Sniper',
    premiere_victoire: 'Premiere victoire',
    leader: 'Leader',
    champion_semaine: 'Champion semaine',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl">MES STATS</h1>
        <p className="font-mono text-xs text-chalk/50">{profile?.pseudo}</p>
      </div>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-sang bg-pitch p-4 text-center">
          <p className="font-mono text-3xl font-bold text-sang-vif">{rang?.total_points ?? 0}</p>
          <p className="text-xs text-chalk/60 mt-1">points au total</p>
          <p className="font-mono text-xs text-chalk/40 mt-1">
            moy. equipe : {moyenneEquipe} pts
          </p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-4 text-center">
          <p className="font-mono text-3xl font-bold">
            {rang?.rang ? '#' + rang.rang : '-'}
          </p>
          <p className="text-xs text-chalk/60 mt-1">classement saison</p>
          <p className="font-mono text-xs text-chalk/40 mt-1">
            sur {allPlayers?.length ?? 0} joueurs
          </p>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold text-green-400">{tauxReussite}%</p>
          <p className="text-xs text-chalk/60">taux reussite</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold text-yellow-400">{tauxExact}%</p>
          <p className="text-xs text-chalk/60">scores exacts</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold">{totalParis}</p>
          <p className="text-xs text-chalk/60">paris joues</p>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-xl font-bold text-green-400">{bonsResultats}</p>
          <p className="text-xs text-chalk/60">bons resultats</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-xl font-bold text-yellow-400">{scoresExacts}</p>
          <p className="text-xs text-chalk/60">scores exacts</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-xl font-bold text-chalk/40">{mauvais}</p>
          <p className="text-xs text-chalk/60">rates</p>
        </div>
      </section>

      {pointsCumules.length > 1 && (
        <section className="rounded-2xl border border-ligne bg-ardoise p-4">
          <h2 className="font-display text-sm mb-3">PROGRESSION DES POINTS</h2>
          <svg viewBox={'0 0 ' + graphWidth + ' ' + graphHeight} className="w-full h-20">
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C2272F" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#C2272F" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              points={points.join(' ')}
              fill="none"
              stroke="#C2272F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {pointsCumules.map((val, i) => {
              const x = totalParis > 1 ? (i / (totalParis - 1)) * graphWidth : graphWidth / 2;
              const y = graphHeight - (val / maxPoints) * graphHeight;
              return (
                <circle key={i} cx={x} cy={y} r="3" fill="#C2272F" />
              );
            })}
          </svg>
          <div className="flex justify-between font-mono text-xs text-chalk/40 mt-1">
            <span>Match 1</span>
            <span>Match {totalParis}</span>
          </div>
        </section>
      )}

      {badges && badges.length > 0 && (
        <section className="rounded-2xl border border-ligne bg-ardoise p-4">
          <h2 className="font-display text-sm mb-3">MES BADGES</h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.id}
                className="rounded-full border border-sang bg-sang/10 px-3 py-1 font-mono text-xs text-chalk"
              >
                {BADGE_ICONS[b.type] ?? b.label}
              </span>
            ))}
          </div>
        </section>
      )}

      {preds && preds.length > 0 && (
        <section className="rounded-2xl border border-ligne bg-ardoise p-4">
          <h2 className="font-display text-sm mb-3">DERNIERS PARIS</h2>
          <div className="space-y-2">
            {[...(preds ?? [])].reverse().slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="flex-1 truncate text-xs text-chalk/70">
                  {p.matches.home_team} vs {p.matches.away_team}
                </span>
                <span className="font-mono text-xs mx-2 text-chalk/50">
                  {p.pred_home}-{p.pred_away}
                </span>
                <span className={
                  'font-mono text-xs font-bold ' +
                  (p.points === 3 ? 'text-yellow-400' :
                   p.points === 1 ? 'text-green-400' : 'text-chalk/30')
                }>
                  {p.points === 3 ? '+3' : p.points === 1 ? '+1' : '0'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
