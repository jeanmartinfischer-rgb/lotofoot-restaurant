import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
export const dynamic = 'force-dynamic';
const PERIODES: Record<string, string> = {
  week: 'Semaine',
  month: 'Mois',
  season: 'Saison',
};
export default async function LigueClassement({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { p?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const ligueId = Number(params.id);
  if (Number.isNaN(ligueId)) notFound();
  const periode = ['week', 'month', 'season'].includes(searchParams.p ?? '')
    ? (searchParams.p as string)
    : 'season';
  const { data: ligue } = await supabase
    .from('leagues')
    .select('id, name, code')
    .eq('id', ligueId)
    .maybeSingle();
  if (!ligue) notFound();
  const { data: membership } = await supabase
    .from('league_members')
    .select('id')
    .eq('league_id', ligueId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!membership) notFound();
  const { data: classement } = await supabase.rpc('league_leaderboard', {
    p_league_id: ligueId,
    p_period: periode,
  });
  const rows = (classement ?? []) as Array<{
    user_id: string;
    pseudo: string;
    total_points: number;
    correct_results: number;
    exact_scores: number;
    rang: number;
  }>;
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl">{ligue.name}</h1>
        <Link href="/ligues" className="font-mono text-xs text-chalk/50 hover:text-chalk">
          retour
        </Link>
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-ligne bg-ardoise px-4 py-2">
        <span className="font-mono text-xs text-chalk/50">code a partager</span>
        <span className="font-mono text-sm text-sang-vif tracking-widest">{ligue.code}</span>
      </div>
      <div className="flex gap-2">
        {Object.entries(PERIODES).map(([key, label]) => (
          <Link
            key={key}
            href={'/ligues/' + ligueId + '?p=' + key}
            className={
              'flex-1 rounded-xl border px-3 py-2 text-center font-mono text-xs transition-colors ' +
              (periode === key
                ? 'border-sang-vif bg-sang/20 text-chalk'
                : 'border-ligne bg-ardoise text-chalk/60 hover:text-chalk')
            }
          >
            {label}
          </Link>
        ))}
      </div>
      <section className="rounded-2xl border border-ligne bg-ardoise p-4">
        {rows.length === 0 ? (
          <p className="text-sm text-chalk/50 text-center py-4">
            Aucun point sur cette periode.
          </p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div
                key={r.user_id}
                className={
                  'flex items-center justify-between rounded-xl px-3 py-2 ' +
                  (r.user_id === user.id ? 'bg-sang/15' : '')
                }
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-chalk/40 w-6">#{r.rang}</span>
                  <span className={'font-graff text-lg tracking-wide ' + (r.user_id === user.id ? 'text-sang-vif' : 'text-chalk/80')}>
                    {r.pseudo}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-yellow-400">{r.exact_scores}🎯</span>
                  <span className="font-mono text-sm font-bold text-chalk">{r.total_points} pts</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
