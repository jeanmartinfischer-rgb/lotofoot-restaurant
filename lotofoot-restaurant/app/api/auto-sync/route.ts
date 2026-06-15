import { NextRequest, NextResponse } from 'next/server';
import { createAdmin } from '@/lib/supabase-server';

const WORLD_CUP_ID = 1;
const SEASONS = [2026, 2025];

function mapStatus(short: string): string {
  if (['1H', '2H', 'ET', 'LIVE', 'P', 'BT'].includes(short)) return 'live';
  if (short === 'HT') return 'halftime';
  if (['FT', 'AET', 'PEN'].includes(short)) return 'finished';
  if (['PST', 'CANC', 'ABD', 'SUSP', 'INT'].includes(short)) return 'postponed';
  return 'scheduled';
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const admin = createAdmin();
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Cle API manquante' }, { status: 500 });
  }

  const results = {
    matchs_importes: 0,
    matchs_termines: 0,
    events_importes: 0,
    points_calcules: 0,
    errors: [] as string[],
  };

  // ============================================================
  // ETAPE 1 : Importer et mettre a jour tous les matchs
  // ============================================================
  for (const season of SEASONS) {
    try {
      const res = await fetch(
        'https://v3.football.api-sports.io/fixtures?league=' + WORLD_CUP_ID + '&season=' + season,
        { headers: { 'x-apisports-key': key }, cache: 'no-store' }
      );
      const json = await res.json();
      const hasError = json.errors && Object.keys(json.errors).length > 0;
      if (hasError) { results.errors.push(JSON.stringify(json.errors)); break; }
      const fixtures = json.response ?? [];
      if (fixtures.length === 0) continue;

      for (const f of fixtures) {
        const home = f.score?.fulltime?.home ?? f.goals?.home ?? null;
        const away = f.score?.fulltime?.away ?? f.goals?.away ?? null;
        const status = mapStatus(f.fixture.status.short);
        await admin.from('matches').upsert(
          {
            api_fixture_id: f.fixture.id,
            home_team: f.teams.home.name ?? 'A determiner',
            away_team: f.teams.away.name ?? 'A determiner',
            home_logo: f.teams.home.logo,
            away_logo: f.teams.away.logo,
            kickoff: f.fixture.date,
            status,
            home_score: home,
            away_score: away,
          },
          { onConflict: 'api_fixture_id' }
        );
        results.matchs_importes++;
        if (status === 'finished') results.matchs_termines++;
      }
      break;
    } catch (err) {
      results.errors.push('Erreur matchs: ' + String(err));
    }
  }

  // ============================================================
  // ETAPE 2 : Importer les evenements des matchs termines
  // ============================================================
  const { data: finishedMatches } = await admin
    .from('matches')
    .select('id, api_fixture_id')
    .eq('status', 'finished')
    .not('api_fixture_id', 'is', null);

  for (const match of finishedMatches ?? []) {
    const { count } = await admin
      .from('match_events')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', match.id);
    if (count && count > 0) continue;

    try {
      const res = await fetch(
        'https://v3.football.api-sports.io/fixtures/events?fixture=' + match.api_fixture_id,
        { headers: { 'x-apisports-key': key }, cache: 'no-store' }
      );
      const json = await res.json();
      for (const e of json.response ?? []) {
        await admin.from('match_events').insert({
          match_id: match.id,
          minute: e.time?.elapsed ?? null,
          extra_minute: e.time?.extra ?? null,
          team: e.team?.name ?? null,
          player: e.player?.name ?? null,
          assist: e.assist?.name ?? null,
          event_type: e.type ?? null,
          detail: e.detail ?? null,
        });
        results.events_importes++;
      }
    } catch (err) {
      results.errors.push('Erreur events match ' + match.id + ': ' + String(err));
    }
  }

  // ============================================================
  // ETAPE 3 : Calculer les points pour tous les matchs termines
  // ============================================================
  try {
    const { data: predsToUpdate } = await admin
      .from('predictions')
      .select('id, user_id, match_id, pred_home, pred_away, matches!inner(home_score, away_score, status)')
      .eq('matches.status', 'finished')
      .is('points', null);

    for (const p of predsToUpdate ?? []) {
      const m = (p as any).matches;
      if (m.home_score === null) continue;
      const isExact = p.pred_home === m.home_score && p.pred_away === m.away_score;
      const predSign = Math.sign(p.pred_home - p.pred_away);
      const realSign = Math.sign(m.home_score - m.away_score);
      const isCorrect = predSign === realSign;
      const points = isExact ? 3 : isCorrect ? 1 : 0;

      await admin.from('predictions').update({
        points,
        is_exact_score: isExact,
        is_correct_result: isCorrect,
        updated_at: new Date().toISOString(),
      }).eq('id', p.id);
      results.points_calcules++;
    }
  } catch (err) {
    results.errors.push('Erreur calcul points: ' + String(err));
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    ...results,
  });
}
