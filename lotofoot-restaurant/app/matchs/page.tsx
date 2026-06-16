import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { type MatchRow, type PredictionRow } from '@/components/MatchCard';
import MatchsClient from './matchs-client';
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
  const predList = (preds ?? []) as PredictionRow[];
  return <MatchsClient matches={(matches ?? []) as MatchRow[]} preds={predList} userId={user.id} />;
}
