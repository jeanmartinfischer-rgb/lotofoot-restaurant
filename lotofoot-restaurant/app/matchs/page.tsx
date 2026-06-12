import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import MatchCard, { type MatchRow, type PredictionRow } from '@/components/MatchCard';

export const dynamic = 'force-dynamic';

export default async function Matchs() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const since = new Date(Date.now() - 3 * 24 * 3600_000).toISOString();
  const { data: matches } = await supabase
    .from('matches').select('*')
    .gte('kickoff', since)
    .order('kickoff')
    .limit(60);

  const { data: preds } = await supabase
    .from('predictions').select('*')
    .eq('user_id', user.id);

  const predByMatch = new Map<number, PredictionRow>((preds ?? []).map((p) => [p.match_id, p]));

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">MES PARIS</h1>
      <p className="font-mono text-xs text-chalk/60">
        🎯 Score exact = 3 pts · ✓ Bon résultat = 1 pt · ✗ Mauvais = 0 pt
      </p>
      {!matches?.length && (
        <p className="rounded-2xl border border-ligne bg-ardoise p-6 text-center text-sm text-chalk/60">
          Aucun match importé pour l’instant. L’administrateur peut lancer l’import depuis l’espace Admin.
        </p>
      )}
      {(matches as MatchRow[] | null)?.map((m) => (
        <MatchCard key={m.id} match={m} prediction={predByMatch.get(m.id) ?? null} userId={user.id} />
      ))}
    </div>
  );
}
