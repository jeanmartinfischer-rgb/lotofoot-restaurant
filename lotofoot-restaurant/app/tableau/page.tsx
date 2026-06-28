import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import BracketClient from './bracket-client';

export const dynamic = 'force-dynamic';

export default async function TableauPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <BracketClient />;
}
