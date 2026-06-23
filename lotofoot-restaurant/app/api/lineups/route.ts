import { NextRequest, NextResponse } from 'next/server';
import { createAdmin } from '@/lib/supabase-server';

// Renvoie les compositions (lineups) d'un match donne.
// Appel : /api/lineups?match=ID_DU_MATCH_EN_BASE
// La cle API reste cote serveur, jamais exposee au navigateur.

export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get('match');
  if (!matchId) {
    return NextResponse.json({ error: 'Parametre match manquant' }, { status: 400 });
  }

  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Cle API manquante' }, { status: 500 });
  }

  const admin = createAdmin();

  // Retrouver l'api_fixture_id a partir de l'id du match en base
  const { data: match, error } = await admin
    .from('matches')
    .select('api_fixture_id')
    .eq('id', matchId)
    .maybeSingle();

  if (error || !match || !match.api_fixture_id) {
    return NextResponse.json({ error: 'Match introuvable' }, { status: 404 });
  }

  try {
    const res = await fetch(
      'https://v3.football.api-sports.io/fixtures/lineups?fixture=' + match.api_fixture_id,
      { headers: { 'x-apisports-key': key }, cache: 'no-store' }
    );
    const json = await res.json();
    const lineups = json.response ?? [];

    // Pas encore de compos (l'API les publie ~20-40 min avant le coup d'envoi)
    if (lineups.length === 0) {
      return NextResponse.json({ available: false, teams: [] });
    }

    // On ne garde que ce dont l'affichage a besoin, et on construit les URLs de photos
    const teams = lineups.map((lu: any) => ({
      teamName: lu.team?.name ?? '',
      teamLogo: lu.team?.logo ?? null,
      formation: lu.formation ?? null,
      coach: lu.coach
        ? {
            name: lu.coach.name ?? null,
            photo: lu.coach.id
              ? 'https://media.api-sports.io/football/coachs/' + lu.coach.id + '.png'
              : null,
          }
        : null,
      startXI: (lu.startXI ?? []).map((it: any) => ({
        id: it.player?.id ?? null,
        name: it.player?.name ?? '',
        number: it.player?.number ?? null,
        pos: it.player?.pos ?? null,
        grid: it.player?.grid ?? null,
        photo: it.player?.id
          ? 'https://media.api-sports.io/football/players/' + it.player.id + '.png'
          : null,
      })),
      substitutes: (lu.substitutes ?? []).map((it: any) => ({
        id: it.player?.id ?? null,
        name: it.player?.name ?? '',
        number: it.player?.number ?? null,
        pos: it.player?.pos ?? null,
        photo: it.player?.id
          ? 'https://media.api-sports.io/football/players/' + it.player.id + '.png'
          : null,
      })),
    }));

    return NextResponse.json({ available: true, teams });
  } catch (err) {
    return NextResponse.json(
      { available: false, teams: [], error: String(err) },
      { status: 500 }
    );
  }
}
