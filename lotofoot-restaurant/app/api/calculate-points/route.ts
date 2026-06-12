import { NextRequest, NextResponse } from 'next/server';
import { createAdmin } from '@/lib/supabase-server';

/**
 * Attribue les points pour tous les matchs terminés dont les
 * pronostics n'ont pas encore été réglés.
 *
 * Barème (fonction SQL calculate_points) :
 *   🎯 Score exact = 3 pts · ✓ Bon résultat = 1 pt · ✗ Mauvais = 0 pt
 *
 * Appelée par le cron Vercel toutes les 5 minutes.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const admin = createAdmin();

  const { data: matches } = await admin
    .from('matches')
    .select('id, predictions!inner(points)')
    .eq('status', 'finished')
    .is('predictions.points', null);

  const ids = Array.from(new Set((matches ?? []).map((m: any) => m.id)));
  for (const id of ids) {
    await admin.rpc('settle_match', { p_match_id: id });
  }

  return NextResponse.json({ ok: true, settled: ids.length });
}
