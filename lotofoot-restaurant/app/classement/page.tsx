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
                <Link href={'/profil/' + r.user_id} className="flex items-center gap-3 p-3 w-full">
                  <span className="w-8 text-center font-mono font-bold text-lg shrink-0">
                    {r.rang === 1 ? String.fromCodePoint(0x1F947) : r.rang === 2 ? String.fromCodePoint(0x1F948) : r.rang === 3 ? String.fromCodePoint(0x1F949) : '#' + r.rang}
                  </span>
                  <Avatar avatarUrl={r.avatar_url} pseudo={r.pseudo} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate flex items-center gap-1.5">
                      {r.rang === 1 && <Crown size={20} />}
                      <span className="font-graff text-xl tracking-wide truncate">{r.pseudo}</span>
                    </p>
                    {mesBadges.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {mesBadges.map((t) => (
                          <img
                            key={t}
                            src={BADGE_INFOS[t].img}
                            alt={BADGE_INFOS[t].label}
                            title={BADGE_INFOS[t].label + ' - ' + BADGE_INFOS[t].desc}
                            className="w-12 h-12 md:w-28 md:h-28 object-contain shrink-0"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-xs text-chalk/60 shrink-0">{r.exact_scores} exacts</span>
                  <span className="font-mono text-lg font-bold text-sang-vif shrink-0">{r.total_points}</span>
                  <span className="text-chalk/30 text-xs shrink-0">{String.fromCharCode(8594)}</span>
                </Link>
              </PodiumRow>
            </li>
          );
        })}
        {!rows?.length && (
          <p className="rounded-2xl border border-ligne bg-ardoise p-6 text-center text-sm text-chalk/60">
            Le classement apparaitra apres le premier match termine.
          </p>
        )}
      </ol>
      <div className="rounded-2xl border border-ligne bg-ardoise p-4">
        <h2 className="font-display text-xs text-chalk/50 mb-3">LES BADGES</h2>
        <div className="grid grid-cols-2 gap-4">
          {BADGE_ORDRE.map((t) => (
            <div key={t} className="flex items-center gap-3">
              <img
                src={BADGE_INFOS[t].img}
                alt={BADGE_INFOS[t].label}
                className="w-16 h-16 md:w-24 md:h-24 object-contain shrink-0"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{BADGE_INFOS[t].label}</p>
                <p className="text-xs text-chalk/50">{BADGE_INFOS[t].desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
