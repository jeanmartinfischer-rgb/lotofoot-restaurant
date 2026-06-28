import { NextRequest, NextResponse } from 'next/server';

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
  if (!name) return '';
  return PAYS_FR[name] ?? name;
}

const TOURS = ['Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'];

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

      const parTour: Record<string, any[]> = {};
      for (const t of TOURS) parTour[t] = [];

      for (const f of fixtures) {
        const round = f.league?.round ?? '';
        if (!TOURS.includes(round)) continue;

        const status = f.fixture?.status?.short ?? '';
        const fini = ['FT', 'AET', 'PEN'].includes(status);
        const enCours = ['1H', '2H', 'ET', 'P', 'BT', 'LIVE', 'HT'].includes(status);

        const homeScore = f.score?.fulltime?.home ?? f.goals?.home ?? null;
        const awayScore = f.score?.fulltime?.away ?? f.goals?.away ?? null;

        parTour[round].push({
          id: f.fixture.id,
          kickoff: f.fixture.date,
          status,
          fini,
          enCours,
          home: fr(f.teams?.home?.name),
          away: fr(f.teams?.away?.name),
          home_logo: f.teams?.home?.logo ?? null,
          away_logo: f.teams?.away?.logo ?? null,
          home_score: homeScore,
          away_score: awayScore,
          home_winner: f.teams?.home?.winner ?? null,
          away_winner: f.teams?.away?.winner ?? null,
        });
      }

      for (const t of TOURS) {
        parTour[t].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
      }

      return NextResponse.json({ saison: season, tours: parTour });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  return NextResponse.json({ saison: null, tours: {} });
}
