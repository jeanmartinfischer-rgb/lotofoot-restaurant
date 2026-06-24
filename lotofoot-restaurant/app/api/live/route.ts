import { NextRequest, NextResponse } from 'next/server';
import { createAdmin } from '@/lib/supabase-server';

// Renvoie un match + ses evenements (pour le suivi en direct).
// Appel : /api/live?match=ID_DU_MATCH

export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get('match');
  if (!matchId) {
    return NextResponse.json({ error: 'Parametre match manquant' }, { status: 400 });
  }

  const admin = createAdmin();

  const { data: match, error } = await admin
    .from('matches')
    .select('id, home_team, away_team, home_logo, away_logo, home_score, away_score, status')
    .eq('id', matchId)
    .maybeSingle();

  if (error || !match) {
    return NextResponse.json({ match: null, events: [] }, { status: 404 });
  }

  const { data: events } = await admin
    .from('match_events')
    .select('id, minute, extra_minute, team, player, player_id, assist, event_type, detail')
    .eq('match_id', matchId)
    .order('minute')
    .order('extra_minute');

  return NextResponse.json({ match, events: events ?? [] });
}
