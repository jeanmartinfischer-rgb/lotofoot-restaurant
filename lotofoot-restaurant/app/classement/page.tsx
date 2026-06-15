import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'week', label: 'Semaine', view: 'leaderboard_week' },
  { key: 'month', label: 'Mois', view: 'leaderboard_month' },
  { key: 'season', label: 'Saison', view: 'leaderboard_season' },
] as const;

const BADGE_ICONS: Record<string, string> = {
  sniper: '🎯',
  super_sniper: '🎯🎯',
  premiere_victoire: '🌟',
  leader: '👑',
  champion_semaine: '🏆',
};

export default async function Classement({ searchParams }: { searchParams: { t?: string } }) {
  const tab = TABS.find((t) => t.key === searchParams.t) ?? TABS[2];
  const supabase = createClient();
  const { data: rows } = await supabase.from(tab.view).select('*').order('rang').limit(100);
  const { data: badges } = await supabase.from('badges').select('*');

  const badgesByUser = new Map<string, string[]>();
  for (const b of badges ?? []) {
    if (!badgesByUser.has(b.user_id)) badgesByUser.set(b.user_id, []);
    badgesByUser.get(b.user_id)!.push(BADGE_ICONS[b.type] ?? '🏅');
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">CLASSEMENT</h1>

      <nav className="flex rounded-xl bg-ardoise border border-ligne p-1 text-sm font-semibold">
        {TABS.map((t) => (
          
            key={t.key}
            href={'/classement?t=' + t.key}
            className={'flex-1 rounded-lg py-2 text-center ' + (t.key === tab.key ? 'bg-sang text-chalk' : 'text-chalk/60 hover:text-chalk')}
          >
            {t.label}
          </a>
        ))}
      </nav>

      <ol className="space-y-2">
        {rows?.map((r) => (
          <li
            key={r.user_id}
            className={'flex items-center gap-3 rounded-2xl border p-3 ' + (r.rang <= 3 ? 'border-sang bg-pitch' : 'border-ligne bg-ardoise')}
          >
            <span className="w-8 text-center font-mono font-bold text-lg">
              {r.rang === 1 ? '🥇' : r.rang === 2 ? '🥈' : r.rang === 3 ? '🥉' : '#' + r.rang}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{r.pseudo}</p>
              {badgesByUser.get(r.user_id)?.length && (
                <p className="text-xs text-chalk/50 mt-0.5">
                  {badgesByUser.get(r.user_id)!.join(' ')}
                </p>
              )}
            </div>
            <span className="font-mono text-xs text-chalk/60">🎯 {r.exact_scores}</span>
            <span className="font-mono text-lg font-bold text-sang-vif">{r.total_points}</span>
          </li>
        ))}
        {!rows?.length && (
          <p className="rounded-2xl border border-ligne bg-ardoise p-6 text-center text-sm text-chalk/60">
            Le classement apparaitra apres le premier match termine.
          </p>
        )}
      </ol>

      <div className="glass rounded-2xl p-3">
        <h2 className="font-display text-xs text-chalk/50 mb-2">LEGENDE DES BADGES</h2>
        <div className="grid grid-cols-2 gap-1 text-xs text-chalk/60">
          <span>🎯 Sniper — 1 score exact</span>
          <span>🎯🎯 Super Sniper — 3 exacts</span>
          <span>🌟 Premiere victoire</span>
          <span>👑 Leader — 1er saison</span>
          <span>🏆 Champion semaine</span>
        </div>
      </div>
    </div>
  );
}
