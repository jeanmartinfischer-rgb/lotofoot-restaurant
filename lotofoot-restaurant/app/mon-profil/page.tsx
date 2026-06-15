import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import MonProfilClient from './mon-profil-client';

export const dynamic = 'force-dynamic';

export default async function MonProfil() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('pseudo, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <MonProfilClient
      userId={user.id}
      initialPseudo={profile?.pseudo ?? ''}
      initialAvatar={profile?.avatar_url ?? ''}
    />
  );
}
