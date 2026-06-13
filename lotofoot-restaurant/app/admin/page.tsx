import { redirect } from 'next/navigation';
import { createClient, createAdmin } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const LEAGUES = const LEAGUES = [1];

function mapStatus(short: string): string {
  if (['1H', '2H', 'ET', 'LIVE'].includes(short)) return 'live';
  if (short === 'HT') return 'halftime';
  if (['FT', 'AET', 'PEN'].includes(short)) return 'finished';
  if (['PST', 'CANC', 'ABD'].includes(short)) return 'postponed';
  return 'scheduled';
}

export default async function Admin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) {
    return <p className="rounded-2xl border border-ligne bg-ardoise p-6 text-center text-sm text-chalk/60">
      Espace réservé à l’administrateur.
    </p>;
  }

  const admin = createAdmin();
  const { data: users } = await admin.from('profiles').select('*').order('created_at');
  const { count: nbMatchs } = await admin.from('matches').select('*', { count: 'exact', head: true });
  const { count: nbParis } = await admin.from('predictions').select('*', { count: 'exact', head: true });

  async function toggleSuspend(formData: FormData) {
    'use server';
    const admin = createAdmin();
    const id = formData.get('id') as string;
    const current = formData.get('suspended') === 'true';
    await admin.from('profiles').update({ is_suspended: !current }).eq('id', id);
    revalidatePath('/admin');
  }

  async function syncNow() {
    'use server';
    const admin = createAdmin();
    const season = new Date().getMonth() >= 6 ? new Date().getFullYear() : new Date().getFullYear() - 1;
    const key = process.env.API_FOOTBALL_KEY;
    if (!key) { revalidatePath('/admin'); return; }

    for (const league of LEAGUES) {
      try {
        const res = await fetch(
          `https://v3.football.api-sports.io/fixtures?league=${league}&season=2026`,
          { headers: { 'x-apisports-key': key }, cache: 'no-store' }
        );
        if (!res.ok) continue;
        const json = await res.json();
        for (const f of json.response ?? []) {
          const home = f.score?.fulltime?.home ?? f.goals?.home ?? null;
          const away = f.score?.fulltime?.away ?? f.goals?.away ?? null;
          await admin.from('matches').upsert(
            {
              api_fixture_id: f.fixture.id,
              home_team: f.teams.home.name,
              away_team: f.teams.away.name,
              home_logo: f.teams.home.logo,
              away_logo: f.teams.away.logo,
              kickoff: f.fixture.date,
              status: mapStatus(f.fixture.status.short),
              home_score: home,
              away_score: away,
            },
            { onConflict: 'api_fixture_id' }
          );
        }
      } catch {}
    }
    revalidatePath('/admin');
    revalidatePath('/matchs');
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">ADMIN</h1>

      <section className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold">{users?.length ?? 0}</p>
          <p className="text-xs text-chalk/60">joueurs</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold">{nbMatchs ?? 0}</p>
          <p className="text-xs text-chalk/60">matchs</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold">{nbParis ?? 0}</p>
          <p className="text-xs text-chalk/60">paris</p>
        </div>
      </section>

      <form action={syncNow}>
        <button className="w-full rounded-xl bg-sang py-3 font-display text-sm">
          IMPORTER / METTRE À JOUR LES MATCHS
        </button>
      </form>

      <section>
        <h2 className="mb-2 font-display text-sm">JOUEURS</h2>
        <ul className="space-y-2">
          {users?.map((u) => (
            <li key={u.id} className="flex items-center justify-between rounded-2xl border border-ligne bg-ardoise p-3 text-sm">
              <span className="font-semibold">
                {u.pseudo} {u.is_admin && '⭐'} {u.is_suspended && <span className="text-sang-vif">(suspendu)</span>}
              </span>
              <form action={toggleSuspend}>
                <input type="hidden" name="id" value={u.id} />
                <input type="hidden" name="suspended" value={String(u.is_suspended)} />
                <button className="rounded-lg border border-ligne px-3 py-1 text-xs font-semibold">
                  {u.is_suspended ? 'Réactiver' : 'Suspendre'}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
