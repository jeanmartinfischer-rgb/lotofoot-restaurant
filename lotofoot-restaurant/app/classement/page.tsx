import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'week', label: 'Semaine', view: 'leaderboard_week' },
  { key: 'month', label: 'Mois', view: 'leaderboard_month' },
  { key: 'season', label: 'Saison', view: 'leaderboard_season' },
] as const;

export default async function Classement({ searchParams }: { searchParams: { t?: string } }) {
  const tab = TABS.find((t) => t.key === searchParams.t) ?? TABS[2];
  const supabase = createClient();
  const { data: rows } = await supabase.from(tab.view).select('*').order('rang').limit(100);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">CLASSEMENT</h1>

      <nav className="flex rounded-xl bg-ardoise border border-ligne p-1 text-sm font-semibold">
        {TABS.map((t) => (
          <a
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
            <span className="flex-1 truncate font-semibold">{r.pseudo}</span>
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
    </div>
  );
}
