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
        Espace reserve a l'administrateur.
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
      redirect('/admin?msg=' + encodeURIComponent('Cle API absente dans Vercel'));
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
        const errTxt = json.errors && Object.keys(json.errors).length
          ? JSON.stringify(json.errors) : '';
        const fixtures = json.response ?? [];
        diag = `saison ${season}: HTTP ${res.status}, ${fixtures.length} matchs` + (errTxt ? `, erreur: ${errTxt}` : '');
        if (errTxt) break;
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
      } catch (e) {
        diag = 'Erreur reseau: ' + String(e);
