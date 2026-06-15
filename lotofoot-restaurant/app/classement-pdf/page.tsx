import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import PdfClient from './pdf-client';

export const dynamic = 'force-dynamic';

export default async function ClassementPdf() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: classement } = await supabase
    .from('leaderboard_season')
    .select('user_id, pseudo, total_points, correct_results, exact_scores, rang')
    .order('rang', { ascending: true });

  const rows = (classement ?? []) as Array<{
    user_id: string;
    pseudo: string;
    total_points: number;
    correct_results: number;
    exact_scores: number;
    rang: number;
  }>;

  return <PdfClient rows={rows} currentUserId={user.id} />;
}
