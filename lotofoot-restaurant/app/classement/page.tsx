import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import Crown from '@/components/Crown';
import PodiumRow from '@/components/PodiumRow';
import Avatar from '@/components/Avatar';
export const dynamic = 'force-dynamic';

const BADGE_INFOS: Record<string, { img: string; label: string; desc: string }> = {
  sniper: { img: '/badge-sniper.png', label: 'Sniper', desc: '1 score exact' },
  super_sniper: { img: '/badge-super-sniper.png', label: 'Super Sniper', desc: '3 scores exacts' },
  premiere_victoire: { img: '/badge-premiere-victoire.png', label: 'Premiere victoire', desc: '1er bon resultat' },
  leader: { img: '/badge-leader.png', label: 'Leader', desc: '1er du classement general' },
};
const BADGE_ORDRE = ['leader', 'super_sniper', 'sniper', 'premiere_victoire'];

export default async function Classement() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Protection : un invité ne voit pas le classement general de la team.
  const { data: moi } = await supabase.from('profiles').select('is_guest').eq('id', user.id).single();
  if (moi?.is_guest) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl">CLASSEMENT</h1>
        <div className="rounded-2xl border border-ligne bg-ardoise p-6 text-center space-y-3">
          <p className="text-3xl">{String.fromCodePoint(0x1F512)}</p>
          <p className="text-sm text-chalk/70">
            Le classement general est reserve aux membres. En tant qu'invite, retrouve ton classement dans tes ligues privees.
          </p>
          <Link href="/ligues" className="inline-block rounded-xl border border-sang bg-sang/15 px-4 py-2 font-mono text-sm text-chalk hover:border-sang-vif transition-colors">
            Voir mes ligues
          </Link>
        </div>
      </div>
    );
  }

  const { data: rows } = await supabase.from('leaderboard_season').select('*').order('rang').limit(100);
  const { data: badges } = await supabase.from('badges').select('*');
  const badgesByUser = new Map<string, string[]>();
  for (const b of badges ?? []) {
    if (!badgesByUser.has(b.user_id)) badgesByUser.set(b.user_id, []);
    badgesByUser.get(b.user_id)!.push(b.type);
  }
  function badgesTries(types: string[]): string[] {
    return BADGE_ORDRE.filter((t) => types.includes(t));
  }
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">CLASSEMENT</h1>
      <ol className="space-y-2">
        {rows?.map((r) => {
          const mesBadges = badgesTries(badgesByUser.get(r.user_id) ?? []);
          return (
            <li key={r.user_id}>
              <PodiumRow rang={r.rang}>
                <Link href={'/profil/' + r.user
