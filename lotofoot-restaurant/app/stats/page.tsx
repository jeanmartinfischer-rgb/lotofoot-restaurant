import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import StatBar from '@/components/StatBar';

export const dynamic = 'force-dynamic';

const BADGE_LABELS: Record<string, string> = {
  sniper: 'Sniper',
  super_sniper: 'Super Sniper',
  premiere_victoire: 'Premiere victoire',
  leader: 'Leader',
  champion_semaine: 'Champion semaine',
};

export default async function Stats() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();

  const { data: preds } = await supabase
    .from('predictions')
    .select('*, matches!inner(home_team, away_team, kickoff, status)')
    .eq('user_id', user.id)
    .not('points', 'is', null)
    .order('matches(kickoff)');

  const { data: rang } = await supabase
    .from('leaderboard_season')
    .select('rang, total_points, exact_scores')
    .eq('user_id', user.id)
    .single();

  const { data: badges } = await supabase
    .from('badges').select('*').eq('user_id', user.id);

  const { data: allPlayers } = await supabase
    .from('leaderboard_season').select('total_points');

  const totalParis = preds?.length ?? 0;
  const bonsResultats = preds?.filter((p) => p.is_correct_result).length ?? 0;
  const scoresExacts = preds?.filter((p) => p.is_exact_score).length ?? 0;
  const mauvais = totalParis - bonsResultats;
  const tauxReussite = totalParis > 0 ? Math.round((bonsResultats / totalParis) * 100) : 0;
  const tauxExact = totalParis > 0 ? Math.round((scoresExacts / totalParis) * 100) : 0;

  const mesPoints = rang?.total_points ?? 0;
  const moyenneEquipe = allPlayers && allPlayers.length > 0
    ? Math.round(allPlayers.reduce((sum, p) => sum + (p.total_points ?? 0), 0) / allPlayers.length)
    : 0;
  const ecart = mesPoints - moyenneEquipe;

  const pointsCumules: number[] = [];
  let cumul = 0;
  for (const p of preds ?? []) {
    cumul += p.points ?? 0;
    pointsCumules.push(cumul);
  }

  const maxPoints = Math.max(...pointsCumules, 1);
  const graphWidth = 300;
  const graphHeight = 80;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl">MES STATS</h1>
        <p className="font-mono text-xs text-chalk/50">{profile?.pseudo}</p>
      </div>

      <section className="rounded-2xl border border-sang bg-pitch p-5 text-center" style={{ boxShadow: '0 0 24px 0 rgba(212,175,55,0.15)' }}>
        <p className="font-mono text-5xl font-bold text-sang-vif">{mesPoints}</p>
        <p className="text-xs text-chalk/60 mt-1">points cette saison</p>
        <div className="mt-3 flex items-center justify-center gap-4 text-sm">
          <span className="font-mono">{rang?.rang ? '#' + rang.rang : '-'} <span className="text-chalk/50 text-xs">sur {allPlayers?.length ?? 0}</span></span>
          <span className="text-chalk/30">|</span>
          {ecart >= 0 ? (
            <span className="font-mono text-green-400">{String.fromCharCode(8593)} +{ecart} pts vs moyenne</span>
          ) : (
            <span className="font-mono text-chalk/50">{String.fromCharCode(8595)} {ecart} pts vs moyenne</span>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-ligne bg-ardoise p-4 space-y-3">
        <StatBar value={tauxReussite} label="Taux de reussite" color="#4ADE80" />
        <StatBar value={tauxExact} label="Scores exacts" color="#F5C542" />
      </section>

      <section className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-xl font-bold text-green-400">{bonsResultats}</p>
          <p className="text-xs text-chalk/60">bons</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-xl font-bold text-yellow-400">{scoresExacts}</p>
          <p className="text-xs text-chalk/60">exacts</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-xl font-bold text-chalk/40">{mauvais}</p>
          <p className="text-xs text-chalk/60">rates</p>
        </div>
      </section>

      {pointsCumules.length > 1 && (
        <section className="rounded-2xl border border-ligne bg-ardoise p-4">
          <h2 className="font-display text-sm mb-3">PROGRESSION</h2>
          <svg viewBox={'0 0 ' + graphWidth + ' ' + graphHeight} className="w-full h-20">
            <defs>
              <linearGradient id="progFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C2272F" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#C2272F" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              fill="url(#progFill)"
              points={'0,' + graphHeight + ' ' + pointsCumules.map((val, i) => {
                const x = totalParis > 1 ? (i / (totalParis - 1)) * graphWidth : graphWidth / 2;
                const y = graphHeight - (val / maxPoints) * graphHeight;
                return x + ',' + y;
              }).join(' ') + ' ' + graphWidth + ',' + graphHeight}
            />
            <polyline
              points={pointsCumules.map((val, i) => {
                const x = totalParis > 1 ? (i / (totalParis - 1)) * graphWidth : graphWidth / 2;
                const y = graphHeight - (val / maxPoints) * graphHeight;
                return x + ',' + y;
              }).join(' ')}
              fill="none"
              stroke="#C2272F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {pointsCumules.map((val, i) => {
              const x = totalParis > 1 ? (i / (totalParis - 1)) * graphWidth : graphWidth / 2;
              const y = graphHeight - (val / maxPoints) * graphHeight;
              return <circle key={i} cx={x} cy={y} r="3" fill="#C2272F" />;
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
              <span key={b.id} className="rounded-full border border-sang bg-sang/10 px-3 py-1 font-mono text-xs text-chalk">
                {BADGE_LABELS[b.type] ?? b.label}
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
                <span className={'font-mono text-xs font-bold ' + (p.points === 3 ? 'text-yellow-400' : p.points === 1 ? 'text-green-400' : 'text-chalk/30')}>
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
