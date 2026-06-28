import { NextRequest, NextResponse } from 'next/server';

const WORLD_CUP_ID = 1;
const SEASONS = [2026, 2025];

export async function GET(req: NextRequest) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Cle API manquante' }, { status: 500 });
  }

  for (const season of SEASONS) {
    try {
      const res = await fetch(
        'https://v3.football.api-sports.io/fixtures?league=' + WORLD_CUP_ID + '&season=' + season,
        { headers: { 'x-apisports-key': key }, cache: 'no-store' }
      );
      const json = await res.json();
      const fixtures = json.response ?? [];
      if (fixtures.length === 0) continue;

      // Compter les matchs par "round" (nom du tour)
      const tours: Record<string, number> = {};
      for (const f of fixtures) {
        const round = f.league?.round ?? '(inconnu)';
        tours[round] = (tours[round] ?? 0) + 1;
      }

      // Un exemple de match pour voir la structure
      const exemple = fixtures[0];

      return NextResponse.json({
        saison: season,
        nombre_total_matchs: fixtures.length,
        tours_trouves: tours,
        exemple_de_match: {
          round: exemple.league?.round,
          equipes: exemple.teams?.home?.name + ' vs ' + exemple.teams?.away?.name,
          statut: exemple.fixture?.status?.short,
          score_fulltime: exemple.score?.fulltime,
          score_extratime: exemple.score?.extratime,
          score_penalty: exemple.score?.penalty,
        },
      });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Aucun match trouve pour ces saisons.' });
}
