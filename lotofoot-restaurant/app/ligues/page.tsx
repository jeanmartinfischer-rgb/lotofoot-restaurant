import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import LiguesClient from './ligues-client';

export const dynamic = 'force-dynamic';

export default async function Ligues() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: memberships } = await supabase
    .from('league_members')
    .select('league_id, leagues!inner(id, name, code, owner_id)')
    .eq('user_id', user.id);

  const mesLigues = (memberships ?? []).map((m: any) => ({
    id: m.leagues.id,
    name: m.leagues.name,
    code: m.leagues.code,
    isOwner: m.leagues.owner_id === user.id,
  }));

  return <LiguesClient userId={user.id} mesLigues={mesLigues} />;
}
