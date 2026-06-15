import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import MatchCard from '@/components/MatchCard';

export const dynamic = 'force-dynamic';

const TZ = 'Europe/Paris';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const { data: rangs } = await supabase.from('leaderboard_season').select('*');
  const me = rangs?.find((r: any) => r.user_id === user.id);

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

  return (
    <div className="space-y-6">
      <section>
        <p className="font-mono text-xs uppercase tracking-widest text-chalk/50">Bonjour</p>
        <h1 className="font-display text-3xl">{profile?.pseudo ?? 'Joueur'}</h1>
      </section>

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
                    <p className="font-mono text-2xl font-bold text-sang-vif">
                      {m.home_score ?? 0} - {m.away_score ?? 0}
                    </p>
                    <span className="font-mono text-xs font-bold text-sang-vif animate-pulse">
                      {m.status === 'halftime' ? 'MI-TEMPS' : 'LIVE'}
                    </span>
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
            <MatchCard
              key={m.id}
              match={m}
              prediction={predByMatch.get(m.id) ?? null}
              userId={user.id}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
