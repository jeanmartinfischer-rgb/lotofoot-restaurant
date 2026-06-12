import { NextRequest, NextResponse } from 'next/server';
import { createAdmin } from '@/lib/supabase-server';

/**
 * Importe et met à jour les matchs depuis API-Football.
 * Appelée par le cron Vercel toutes les 5 minutes (voir vercel.json)
 * ou manuellement depuis l'espace Admin.
 *
 * Ligues importées (ids API-Football) :
 *  61 = Ligue 1 · 62 = Ligue 2 · 39 = Premier League · 140 = Liga
 *  78 = Bundesliga · 2 = Champions League · 3 = Europa League
 *  1 = Coupe du Monde · 4 = Euro
 */
const LEAGUES = [61, 62, 39, 140, 78, 2, 3, 1, 4];

function mapStatus(short: string): string {
  if (['1H', '2H', 'ET', 'LIVE'].includes(short)) return 'live';
  if (short === 'HT') return 'halftime';
  if (['FT', 'AET', 'PEN'].includes(short)) return 'finished';
  if (['PST', 'CANC', 'ABD'].includes(short)) return 'postponed';
  return 'scheduled';
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const admin = createAdmin();
  const season = new Date().getMonth() >= 6 ? new Date().getFullYear() : new Date().getFullYear() - 1;
  let imported = 0;

  for (const league of LEAGUES) {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${league}&season=${season}&next=20`,
      { headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! } }
    );
    if (!res.ok) continue;
    const json = await res.json();

    for (const f of json.response ?? []) {
      // Score temps réglementaire (90 min), sans prolongations
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
      imported++;
    }
  }

  return NextResponse.json({ ok: true, imported });
}
