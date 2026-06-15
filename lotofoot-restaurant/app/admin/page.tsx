import { redirect } from 'next/navigation';
import { createClient, createAdmin } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const WORLD_CUP_ID = 1;
const SEASONS = [2026, 2025];

function mapStatus(short: string): string {
  if (['1H', '2H', 'ET', 'LIVE', 'P', 'BT'].includes(short)) return 'live';
  if (short === 'HT') return 'halftime';
  if (['FT', 'AET', 'PEN'].includes(short)) return 'finished';
  if (['PST', 'CANC', 'ABD', 'SUSP', 'INT'].includes(short)) return 'postponed';
  return 'scheduled';
}

export default async function Admin({ searchParams }: { searchParams: { msg?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) {
    return (
      <p className="rounded-2xl border border-ligne bg-ardoise p-6 text-center text-sm text-chalk/60">
        Espace reserve a administrateur.
      </p>
    );
  }

  const admin = createAdmin();
  const { data: authUsers } = await admin.auth.admin.listUsers();
  const emailMap = new Map((authUsers?.users ?? []).map((u: any) => [u.id, u.email]));
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
    const key = process.env.API_FOOTBALL_KEY;
    if (!key) {
      redirect('/admin?msg=Cle+API+absente+dans+Vercel');
    }

    let totalImported = 0;
    let diag = '';
    for (const season of SEASONS) {
      try {
        const res = await fetch(
          `https://v3.football.api-sports.io/fixtures?league=${WORLD_CUP_ID}&season=${season}`,
          { headers: { 'x-apisports-key': key! }, cache: 'no-store' }
        );
        const json = await res.json();
        const hasError = json.errors && Object.keys(json.errors).length > 0;
        const errTxt = hasError ? JSON.stringify(json.errors) : '';
        const fixtures = json.response ?? [];
        diag = 'saison ' + season + ': HTTP ' + res.status + ', ' + fixtures.length + ' matchs' + (errTxt ? ', erreur: ' + errTxt : '');
        if (hasError) break;
        if (fixtures.length === 0) continue;
        for (const f of fixtures) {
          const home = f.score?.fulltime?.home ?? f.goals?.home ?? null;
          const away = f.score?.fulltime?.away ?? f.goals?.away ?? null;
          await admin.from('matches').upsert(
            {
              api_fixture_id: f.fixture.id,
              home_team: f.teams.home.name ?? 'A determiner',
              away_team: f.teams.away.name ?? 'A determiner',
              home_logo: f.teams.home.logo,
              away_logo: f.teams.away.logo,
              kickoff: f.fixture.date,
              status: mapStatus(f.fixture.status.short),
              home_score: home,
              away_score: away,
            },
            { onConflict: 'api_fixture_id' }
          );
          totalImported++;
        }
        break;
      } catch (err) {
        diag = 'Erreur reseau: ' + String(err);
      }
    }
    revalidatePath('/matchs');
    const msg = totalImported > 0
      ? totalImported + ' matchs importes !'
      : 'Aucun match. Detail: ' + diag;
    redirect('/admin?msg=' + encodeURIComponent(msg));
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">ADMIN</h1>

      {searchParams.msg && (
        <p className="rounded-xl border border-sang bg-sang/10 p-3 text-center font-mono text-sm">
          {searchParams.msg}
        </p>
      )}

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
          IMPORTER LES MATCHS (COUPE DU MONDE)
        </button>
      </form>href="/admin/pronos"
  className="block w-full rounded-xl border border-sang py-3 font-display text-sm text-center text-sang-vif hover:bg-sang hover:text-chalk transition-colors"
>
  GERER LES PRONOSTICS
</a>

      <section>
        <h2 className="mb-2 font-display text-sm">JOUEURS</h2>
        <ul className="space-y-2">
          {users?.map((u: any) => (
            <li key={u.id} className="rounded-2xl border border-ligne bg-ardoise p-3 text-sm space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {u.pseudo}
                    {u.is_admin && ' ADMIN'}
                    {u.is_suspended && <span className="text-sang-vif"> (suspendu)</span>}
                  </p>
                  <p className="font-mono text-xs text-chalk/50">
                    {emailMap.get(u.id) ?? 'Email non disponible'}
                  </p>
                  <p className="font-mono text-xs text-chalk/40">
                    Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <form action={toggleSuspend}>
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="suspended" value={String(u.is_suspended)} />
                  <button className="rounded-lg border border-ligne px-3 py-1 text-xs font-semibold">
                    {u.is_suspended ? 'Reactiver' : 'Suspendre'}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
