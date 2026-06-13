import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const TZ = 'Europe/Paris';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const { data: rangs } = await supabase.from('leaderboard_season').select('*');
  const me = rangs?.find((r) => r.user_id === user.id);

  const now = new Date().toISOString();
  const in24h = new Date(Date.now() + 24 * 3600000).toISOString();
  const { data: prochains } = await supabase
    .from('matches').select('*')
    .gte('kickoff', now).lte('kickoff', in24h)
    .order('kickoff').limit(8);

  return (
    <div className="space-y-6">
      <section>
        <p className="font-mono text-xs uppercase tracking-widest text-chalk/50">Bonjour</p>
        <h1 className="font-display text-3xl">{profile?.pseudo ?? 'Joueur'}</h1>
      </section>

      <section className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold text-sang-vif">{me?.total_points ?? 0}</p>
          <p className="text-xs text-chalk/60">points</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold">{me?.rang ? `#${me.rang}` : '-'}</p>
          <p className="text-xs text-chalk/60">rang</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold">{me?.exact_scores ?? 0}</p>
          <p className="text-xs text-chalk/60">exacts</p>
        </div>
      </section>

      <section className="rounded-2xl border border-sang bg-sang/10 p-4">
        <h2 className="mb-1 font-display text-sm">BAREME LOTO FOOT</h2>
        <ul className="space-y-1 font-mono text-sm">
          <li>Score exact <b className="float-right">3 pts</b></li>
          <li>Bon resultat (1/N/2) <b className="float-right">1 pt</b></li>
          <li>Mauvais <b className="float-right text-chalk/50">0 pt</b></li>
        </ul>
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-display text-sm">MATCHS DANS LES 24 H</h2>
          <Link href="/matchs" className="text-xs font-semibold text-sang-vif">Tout voir</Link>
        </div>
        {!prochains?.length && (
          <p className="rounded-2xl border border-ligne bg-ardoise p-4 text-sm text-chalk/60">
            Aucun match dans les prochaines 24 heures.
          </p>
        )}
        <ul className="space-y-2">
          {prochains?.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-2xl border border-ligne bg-ardoise p-3 text-sm">
              <span className="font-semibold">{m.home_team} <span className="text-chalk/40">vs</span> {m.away_team}</span>
              <time className="font-mono text-xs text-chalk/60">
                {new Date(m.kickoff).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TZ })}
              </time>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
