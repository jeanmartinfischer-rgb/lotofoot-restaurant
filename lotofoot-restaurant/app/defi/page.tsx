import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import DefiClient from './defi-client';

export const dynamic = 'force-dynamic';

export default async function Defi() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('pseudo, streak_current, streak_best')
    .eq('id', user.id)
    .single();

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });

  const { data: challenge } = await supabase
    .from('daily_challenges')
    .select('*, matches!inner(home_team, away_team, home_logo, away_logo, kickoff, home_score, away_score, status)')
    .eq('challenge_date', today)
    .maybeSingle();

  let myAnswer: { answer: string; is_correct: boolean | null } | null = null;
  if (challenge) {
    const { data: ans } = await supabase
      .from('daily_challenge_answers')
      .select('answer, is_correct')
      .eq('challenge_id', challenge.id)
      .eq('user_id', user.id)
      .maybeSingle();
    myAnswer = ans ?? null;
  }

  const { data: ranking } = await supabase
    .from('profiles')
    .select('id, pseudo, streak_current, streak_best')
    .order('streak_current', { ascending: false })
    .order('streak_best', { ascending: false })
    .limit(10);

  const isLocked = challenge
    ? new Date(challenge.locks_at).getTime() <= Date.now()
    : false;

  return (
    <DefiClient
      userId={user.id}
      pseudo={profile?.pseudo ?? ''}
      streakCurrent={profile?.streak_current ?? 0}
      streakBest={profile?.streak_best ?? 0}
      challenge={challenge}
      myAnswer={myAnswer}
      isLocked={isLocked}
      ranking={ranking ?? []}
    />
  );
}
