import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { type MatchRow, type PredictionRow } from '@/components/MatchCard';
import MatchsClient from './matchs-client';
export const dynamic = 'force-dynamic';
export default async function Matchs() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: matches } = await supabase
    .from('matches').select('*')
    .order('kickoff')
    .limit(200);
  const { data: preds } = await supabase
    .from('predictions').select('*')
    .eq('user_id', user.id);
  const predList = (preds ?? []) as PredictionRow[];
  return <MatchsClient matches={(matches ?? []) as MatchRow[]} preds={predList} userId={user.id} />;
}
