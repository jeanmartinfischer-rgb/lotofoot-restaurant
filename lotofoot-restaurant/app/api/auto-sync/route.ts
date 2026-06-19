import { NextRequest, NextResponse } from 'next/server';
import { createAdmin } from '@/lib/supabase-server';

const WORLD_CUP_ID = 1;
const SEASONS = [2026, 2025];

const PAYS_FR: Record<string, string> = {
  'Algeria': 'Algérie', 'Argentina': 'Argentine', 'Australia': 'Australie',
  'Austria': 'Autriche', 'Belgium': 'Belgique', 'Bosnia & Herzegovina': 'Bosnie-Herzégovine',
  'Brazil': 'Brésil', 'Canada': 'Canada', 'Cape Verde Islands': 'Cap-Vert',
  'Colombia': 'Colombie', 'Congo DR': 'RD Congo', 'Croatia': 'Croatie',
  'Curaçao': 'Curaçao', 'Czechia': 'Tchéquie', 'Ecuador': 'Équateur',
  'Egypt': 'Égypte', 'England': 'Angleterre', 'France': 'France',
  'Germany': 'Allemagne', 'Ghana': 'Ghana', 'Haiti': 'Haïti',
  'Iran': 'Iran', 'Iraq': 'Irak', 'Ivory Coast': "Côte d'Ivoire",
  'Japan': 'Japon', 'Jordan': 'Jordanie', 'Mexico': 'Mexique',
  'Morocco': 'Maroc', 'Netherlands': 'Pays-Bas', 'New Zealand': 'Nouvelle-Zélande',
  'Norway': 'Norvège', 'Panama': 'Panama', 'Paraguay': 'Paraguay',
  'Portugal': 'Portugal', 'Qatar': 'Qatar', 'Saudi Arabia': 'Arabie saoudite',
  'Scotland': 'Écosse', 'Senegal': 'Sénégal', 'South Africa': 'Afrique du Sud',
  'South Korea': 'Corée du Sud', 'Spain': 'Espagne', 'Sweden': 'Suède',
  'Switzerland': 'Suisse', 'Tunisia': 'Tunisie', 'Türkiye': 'Turquie',
  'Uruguay': 'Uruguay', 'USA': 'États-Unis', 'Uzbekistan': 'Ouzbékistan',
};

function fr(name: string | null | undefined): string {
  if (!name) return 'A determiner';
  return PAYS_FR[name] ?? name;
}

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

  // ============================================================
  // ETAPE 0 : Y a-t-il une raison de travailler maintenant ?
  // ============================================================
  const force = req.nextUrl.searchParams.get('force') === '1';
  if (!force) {
    const now = Date.now();
    const soon = new Date(now + 30 * 60 * 1000).toISOString();
    const nowIso = new Date(now).toISOString();
    const threeHoursAgo = new Date(now - 3 * 60 * 60 * 1000).toISOString();

    const { data: liveMatches } = await admin
      .from('matches')
      .select('id')
      .in('status', ['live', 'halftime'])
      .limit(1);

    const { data: startingSoon } = await admin
      .from('matches')
      .select('id')
      .eq('status', 'scheduled')
      .gte('kickoff', nowIso)
      .lte('kickoff', soon)
      .limit(1);

    const { data: inProgress } = await admin
      .from('matches')
      .select('id')
      .neq('status', 'finished')
      .neq('status', 'postponed')
      .gte('kickoff', threeHoursAgo)
      .lte('kickoff', nowIso)
      .limit(1);

    const { data: justFinished } = await admin
      .from('matches')
      .select('id')
      .eq('status', 'finished')
      .gte('kickoff', threeHoursAgo)
      .limit(1);

    const busy =
      (liveMatches?.length ?? 0) > 0 ||
      (startingSoon?.length ?? 0) > 0 ||
      (inProgress?.length ?? 0) > 0 ||
      (justFinished?.length ?? 0) > 0;

    if (!busy) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'Aucun match en cours ou imminent, rien a faire.',
        timestamp: new Date().toISOString(),
      });
    }
  }

  const results = {
    matchs_importes: 0,
    matchs_termines: 0,
    events_importes: 0,
    points_calcules: 0,
    defi_genere: false,
    defis_resolus: 0,
    streaks_maj: 0,
    badges_maj: 0,
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
            home_team: fr(f.teams.home.name),
            away_team: fr(f.teams.away.name),
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
  // ETAPE 3 : Recalculer les points de TOUS les matchs termines
  // ============================================================
  try {
    const { data: predsToUpdate } = await admin
      .from('predictions')
      .select('id, pred_home, pred_away, points, is_exact_score, is_correct_result, matches!inner(home_score, away_score, status)')
      .eq('matches.status', 'finished');

    for (const p of predsToUpdate ?? []) {
      const m = (p as any).matches;
      if (m.home_score === null || m.away_score === null) continue;
      const isExact = p.pred_home === m.home_score && p.pred_away === m.away_score;
      const predSign = Math.sign(p.pred_home - p.pred_away);
      const realSign = Math.sign(m.home_score - m.away_score);
      const isCorrect = predSign === realSign;
      const points = isExact ? 3 : isCorrect ? 1 : 0;

      if (p.points === points && p.is_exact_score === isExact && p.is_correct_result === isCorrect) continue;

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

  // ============================================================
  // ETAPE 4 : Generer le defi express du jour (s'il n'existe pas)
  // ============================================================
  try {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });

    const { data: existing } = await admin
      .from('daily_challenges')
      .select('id')
      .eq('challenge_date', today)
      .maybeSingle();

    if (!existing) {
      const startOfDay = new Date(today + 'T00:00:00+02:00').toISOString();
      const endOfDay = new Date(today + 'T23:59:59+02:00').toISOString();

      const { data: candidate } = await admin
        .from('matches')
        .select('id, home_team, away_team, kickoff')
        .eq('status', 'scheduled')
        .gte('kickoff', startOfDay)
        .lte('kickoff', endOfDay)
        .order('kickoff', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (candidate) {
        const types = ['over25', 'goals_range', 'red_card'] as const;
        const type = types[Math.floor(Math.random() * types.length)];
        const affiche = candidate.home_team + ' - ' + candidate.away_team;

        let question = '';
        let options: string[] = [];
        if (type === 'over25') {
          question = '3 buts ou plus dans ' + affiche + ' ?';
          options = ['Oui', 'Non'];
        } else if (type === 'goals_range') {
          question = 'Combien de buts au total dans ' + affiche + ' ?';
          options = ['0-1', '2-3', '4+'];
        } else {
          question = 'Y aura-t-il un carton rouge dans ' + affiche + ' ?';
          options = ['Oui', 'Non'];
        }

        await admin.from('daily_challenges').insert({
          challenge_date: today,
          match_id: candidate.id,
          type,
          question,
          options,
          locks_at: candidate.kickoff,
        });
        results.defi_genere = true;
      }
    }
  } catch (err) {
    results.errors.push('Erreur generation defi: ' + String(err));
  }

  // ============================================================
  // ETAPE 5 : Resoudre les defis dont le match est termine
  //           + mettre a jour les streaks des joueurs
  // ============================================================
  try {
    const { data: toResolve } = await admin
      .from('daily_challenges')
      .select('id, type, match_id, matches!inner(home_score, away_score, status)')
      .eq('resolved', false)
      .eq('matches.status', 'finished');

    for (const ch of toResolve ?? []) {
      const m = (ch as any).matches;
      if (m.home_score === null || m.away_score === null) continue;

      const total = m.home_score + m.away_score;

      let correct = '';
      if (ch.type === 'over25') {
        correct = total > 2 ? 'Oui' : 'Non';
      } else if (ch.type === 'goals_range') {
        correct = total <= 1 ? '0-1' : total <= 3 ? '2-3' : '4+';
      } else if (ch.type === 'red_card') {
        const { count: redCount } = await admin
          .from('match_events')
          .select('*', { count: 'exact', head: true })
          .eq('match_id', ch.match_id)
          .ilike('detail', '%Red Card%');
        correct = (redCount ?? 0) > 0 ? 'Oui' : 'Non';
      }

      const { data: answers } = await admin
        .from('daily_challenge_answers')
        .select('id, user_id, answer')
        .eq('challenge_id', ch.id);

      for (const a of answers ?? []) {
        const ok = a.answer === correct;
        await admin
          .from('daily_challenge_answers')
          .update({ is_correct: ok })
          .eq('id', a.id);

        const { data: prof } = await admin
          .from('profiles')
          .select('streak_current, streak_best')
          .eq('id', a.user_id)
          .maybeSingle();

        if (prof) {
          const newCurrent = ok ? (prof.streak_current ?? 0) + 1 : 0;
          const newBest = Math.max(prof.streak_best ?? 0, newCurrent);
          await admin
            .from('profiles')
            .update({ streak_current: newCurrent, streak_best: newBest })
            .eq('id', a.user_id);
          results.streaks_maj++;
        }
      }

      await admin
        .from('daily_challenges')
        .update({ resolved: true, correct_answer: correct })
        .eq('id', ch.id);
      results.defis_resolus++;
    }
  } catch (err) {
    results.errors.push('Erreur resolution defi: ' + String(err));
  }

  // ============================================================
  // ETAPE 6 : Recalculer les badges de tous les joueurs
  //   Sniper           = au moins 1 score exact
  //   Super Sniper     = au moins 3 scores exacts
  //   Premiere victoire = au moins 1 bon resultat
  //   Leader           = 1er du classement general
  // ============================================================
  try {
    const { data: joueurs } = await admin
      .from('profiles')
      .select('id')
      .eq('is_guest', false);

    for (const j of joueurs ?? []) {
      const { count: exacts } = await admin
        .from('predictions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', j.id)
        .eq('is_exact_score', true);

      const { count: bons } = await admin
        .from('predictions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', j.id)
        .eq('is_correct_result', true);

      const aDroitA: { type: string; label: string }[] = [];
      if ((exacts ?? 0) >= 1) aDroitA.push({ type: 'sniper', label: 'Sniper' });
      if ((exacts ?? 0) >= 3) aDroitA.push({ type: 'super_sniper', label: 'Super Sniper' });
      if ((bons ?? 0) >= 1) aDroitA.push({ type: 'premiere_victoire', label: 'Premiere victoire' });

      for (const b of aDroitA) {
        // on verifie s'il l'a deja, sinon on l'ajoute
        const { count: existe } = await admin
          .from('badges')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', j.id)
          .eq('type', b.type);
        if (!existe) {
          await admin.from('badges').insert({ user_id: j.id, type: b.type, label: b.label });
          results.badges_maj++;
        }
      }
    }

    // Leader : on repart a zero et on donne au 1er du classement
    const { data: top } = await admin
      .from('leaderboard_season')
      .select('user_id')
      .eq('rang', 1)
      .maybeSingle();
    if (top) {
      await admin.from('badges').delete().eq('type', 'leader');
      await admin.from('badges').insert({ user_id: top.user_id, type: 'leader', label: 'Leader' });
      results.badges_maj++;
    }
  } catch (err) {
    results.errors.push('Erreur calcul badges: ' + String(err));
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    ...results,
  });
}
