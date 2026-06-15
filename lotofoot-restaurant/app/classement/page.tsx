import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import Crown from '@/components/Crown';
export const dynamic = 'force-dynamic';
const TABS = [
  { key: 'week', label: 'Semaine', view: 'leaderboard_week' },
  { key: 'month', label: 'Mois', view: 'leaderboard_month' },
  { key: 'season', label: 'Saison', view: 'leaderboard_season' },
] as const;
const BADGE_LABELS: Record<string, string> = {
  sniper: 'Sniper',
  super_sniper: 'Super Sniper',
  premiere_victoire: 'Premiere victoire',
  leader: 'Leader',
  champion_semaine: 'Champion semaine',
};
export default async function Classement({ searchParams }: { searchParams: { t?: string } }) {
  const tab = TABS.find((t) => t.key === searchParams.t) ?? TABS[2];
  const supabase = createClient();
  const { data: rows } = await supabase.from(tab.view).select('*').order('rang').limit(100);
  const { data: badges } = await supabase.from('badges').select('*');
  const badgesByUser = new Map<string, string[]>();
  for (const b of badges ?? []) {
    if (!badgesByUser.has(b.user_id)) badgesByUser.set(b.user_id, []);
    badgesByUser.get(b.user_id)!.push(BADGE_LABELS[b.type] ?? b.label);
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
          <li key={r.user_id}>
            <Link
              href={'/profil/' + r.user_id}
              className={'flex items-center gap-3 rounded-2xl border p-3 transition-colors hover:border-chalk/40 ' +
                (r.rang <= 3 ? 'border-sang bg-pitch' : 'border-ligne bg-ardoise')}
            >
              <span className="w-8 text-center font-mono font-bold text-lg">
                {r.rang === 1 ? String.fromCodePoint(0x1F947) :
                 r.rang === 2 ? String.fromCodePoint(0x1F948) :
                 r.rang === 3 ? String.fromCodePoint(0x1F949) :
                 '#' + r.rang}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate flex items-center gap-1.5">
                  {r.rang === 1 && <Crown size={20} />}
                  <span className="truncate">{r.pseudo}</span>
                </p>
                {badgesByUser.get(r.user_id) && (
                  <p className="text-xs text-chalk/50 mt-0.5">
                    {badgesByUser.get(r.user_id)!.join(' | ')}
                  </p>
                )}
              </div>
              <span className="font-mono text-xs text-chalk/60">{r.exact_scores} exacts</span>
              <span className="font-mono text-lg font-bold text-sang-vif">{r.total_points}</span>
              <span className="text-chalk/30 text-xs">→</span>
            </Link>
          </li>
        ))}
        {!rows?.length && (
          <p className="rounded-2xl border border-ligne bg-ardoise p-6 text-center text-sm text-chalk/60">
            Le classement apparaitra apres le premier match termine.
          </p>
        )}
      </ol>
      <div className="rounded-2xl border border-ligne bg-ardoise p-3">
        <h2 className="font-display text-xs text-chalk/50 mb-2">BADGES</h2>
        <div className="space-y-1 text-xs text-chalk/60">
          <p>Sniper — 1 score exact</p>
          <p>Super Sniper — 3 scores exacts</p>
          <p>Premiere victoire — 1er bon resultat</p>
          <p>Leader — 1er du classement saison</p>
          <p>Champion semaine — 1er du classement semaine</p>
        </div>
      </div>
    </div>
  );
}
