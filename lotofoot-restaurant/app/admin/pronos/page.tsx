import { redirect } from 'next/navigation';
import { createClient, createAdmin } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminPronos({
  searchParams,
}: {
  searchParams: { view?: string; match_id?: string; user_id?: string; msg?: string };
}) {
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

  const { data: matches } = await admin
    .from('matches')
    .select('*')
    .order('kickoff');

  const { data: players } = await admin
    .from('profiles')
    .select('*')
    .eq('is_suspended', false)
    .order('pseudo');

  const view = searchParams.view ?? 'match';
  const selectedMatchId = searchParams.match_id ? parseInt(searchParams.match_id) : null;
  const selectedUserId = searchParams.user_id ?? null;

  let predictions: any[] = [];

  if (view === 'match' && selectedMatchId) {
    const { data } = await admin
      .from('predictions')
      .select('*, profiles(pseudo)')
      .eq('match_id', selectedMatchId);
    predictions = data ?? [];
  }

  if (view === 'player' && selectedUserId) {
    const { data } = await admin
      .from('predictions')
      .select('*, matches(home_team, away_team, kickoff, home_score, away_score, status)')
      .eq('user_id', selectedUserId)
      .order('match_id');
    predictions = data ?? [];
  }

  async function savePrediction(formData: FormData) {
    'use server';
    const admin = createAdmin();
    const userId = formData.get('user_id') as string;
    const matchId = parseInt(formData.get('match_id') as string);
    const predHome = parseInt(formData.get('pred_home') as string);
    const predAway = parseInt(formData.get('pred_away') as string);

    const { data: match } = await admin
      .from('matches')
      .select('home_score, away_score, status')
      .eq('id', matchId)
      .single();

    let points = null;
    let isExact = null;
    let isCorrect = null;

    if (match && match.home_score !== null && match.status === 'finished') {
      isExact = predHome === match.home_score && predAway === match.away_score;
      const predSign = Math.sign(predHome - predAway);
      const realSign = Math.sign(match.home_score - match.away_score);
      isCorrect = predSign === realSign;
      points = isExact ? 3 : isCorrect ? 1 : 0;
    }

    await admin.from('predictions').upsert(
      {
        user_id: userId,
        match_id: matchId,
        pred_home: predHome,
        pred_away: predAway,
        points,
        is_exact_score: isExact,
        is_correct_result: isCorrect,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,match_id' }
    );

    revalidatePath('/admin/pronos');
  }

  const selectedMatch = matches?.find((m) => m.id === selectedMatchId);
  const selectedPlayer = players?.find((p) => p.id === selectedUserId);

  const predMap = new Map(
    predictions.map((p) => [
      view === 'match' ? p.user_id : p.match_id,
      p,
    ])
  );

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">GESTION DES PRONOSTICS</h1>

      {searchParams.msg && (
        <p className="rounded-xl border border-sang bg-sang/10 p-3 text-center font-mono text-sm">
          {searchParams.msg}
        </p>
      )}

      <div className="flex rounded-xl border border-ligne p-1 text-sm font-semibold">
        <a
          href="/admin/pronos?view=match"
          className={`flex-1 rounded-lg py-2 text-center ${view === 'match' ? 'bg-sang' : 'text-chalk/60'}`}
        >
          Par match
        </a>
        <a
          href="/admin/pronos?view=player"
          className={`flex-1 rounded-lg py-2 text-center ${view === 'player' ? 'bg-sang' : 'text-chalk/60'}`}
        >
          Par joueur
        </a>
      </div>

      {view === 'match' && (
        <div className="space-y-4">
          <select
            onChange={(e) => {
              if (typeof window !== 'undefined') {
                window.location.href = '/admin/pronos?view=match&match_id=' + e.target.value;
              }
            }}
            defaultValue={selectedMatchId ?? ''}
            className="w-full rounded-xl border border-ligne bg-ardoise px-4 py-3 text-sm"
          >
            <option value="">Selectionnez un match...</option>
            {matches?.map((m) => (
              <option key={m.id} value={m.id}>
                {new Date(m.kickoff).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Europe/Paris' })}
                {' - '}
                {m.home_team} vs {m.away_team}
                {m.home_score !== null ? ` (${m.home_score}-${m.away_score})` : ''}
              </option>
            ))}
          </select>

          {selectedMatch && (
            <div className="space-y-3">
              <div className="glass-gold rounded-2xl p-3 text-center">
                <p className="font-display text-lg">{selectedMatch.home_team} vs {selectedMatch.away_team}</p>
                {selectedMatch.home_score !== null && (
                  <p className="font-mono text-sang-vif font-bold">Score reel: {selectedMatch.home_score}-{selectedMatch.away_score}</p>
                )}
              </div>

              {players?.map((player) => {
                const pred = predMap.get(player.id) as any;
                return (
                  <form key={player.id} action={savePrediction} className="glass rounded-2xl p-3">
                    <input type="hidden" name="user_id" value={player.id} />
                    <input type="hidden" name="match_id" value={selectedMatch.id} />
                    <div className="flex items-center gap-3">
                      <span className="flex-1 font-semibold text-sm">{player.pseudo}</span>
                      {pred?.points !== null && pred?.points !== undefined && (
                        <span className={`font-mono text-xs font-bold ${pred.points === 3 ? 'text-yellow-400' : pred.points === 1 ? 'text-green-400' : 'text-chalk/40'}`}>
                          {pred.points === 3 ? '🎯 3pts' : pred.points === 1 ? '✓ 1pt' : '✗ 0pt'}
                        </span>
                      )}
                      <input
                        type="number" name="pred_home" min={0} max={20}
                        defaultValue={pred?.pred_home ?? ''}
                        placeholder="0"
                        className="w-12 rounded-lg border border-ligne bg-pitch px-2 py-1 text-center font-mono font-bold text-sm"
                      />
                      <span className="text-chalk/40">-</span>
                      <input
                        type="number" name="pred_away" min={0} max={20}
                        defaultValue={pred?.pred_away ?? ''}
                        placeholder="0"
                        className="w-12 rounded-lg border border-ligne bg-pitch px-2 py-1 text-center font-mono font-bold text-sm"
                      />
                      <button type="submit" className="rounded-lg bg-sang px-3 py-1 text-xs font-bold">
                        OK
                      </button>
                    </div>
                  </form>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === 'player' && (
        <div className="space-y-4">
          <select
            onChange={(e) => {
              if (typeof window !== 'undefined') {
                window.location.href = '/admin/pronos?view=player&user_id=' + e.target.value;
              }
            }}
            defaultValue={selectedUserId ?? ''}
            className="w-full rounded-xl border border-ligne bg-ardoise px-4 py-3 text-sm"
          >
            <option value="">Selectionnez un joueur...</option>
            {players?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.pseudo}
              </option>
            ))}
          </select>

          {selectedPlayer && (
            <div className="space-y-2">
              <p className="font-display text-lg text-center">{selectedPlayer.pseudo}</p>
              {matches?.map((match) => {
                const pred = predMap.get(match.id) as any;
                return (
                  <form key={match.id} action={savePrediction} className="glass rounded-2xl p-3">
                    <input type="hidden" name="user_id" value={selectedPlayer.id} />
                    <input type="hidden" name="match_id" value={match.id} />
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{match.home_team} vs {match.away_team}</p>
                        <p className="font-mono text-xs text-chalk/50">
                          {new Date(match.kickoff).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Europe/Paris' })}
                          {match.home_score !== null ? ` | Reel: ${match.home_score}-${match.away_score}` : ''}
                        </p>
                      </div>
                      {pred?.points !== null && pred?.points !== undefined && (
                        <span className={`font-mono text-xs font-bold ${pred.points === 3 ? 'text-yellow-400' : pred.points === 1 ? 'text-green-400' : 'text-chalk/40'}`}>
                          {pred.points === 3 ? '🎯' : pred.points === 1 ? '✓' : '✗'}
                        </span>
                      )}
                      <input
                        type="number" name="pred_home" min={0} max={20}
                        defaultValue={pred?.pred_home ?? ''}
                        placeholder="0"
                        className="w-10 rounded-lg border border-ligne bg-pitch px-1 py-1 text-center font-mono font-bold text-sm"
                      />
                      <span className="text-chalk/40 text-xs">-</span>
                      <input
                        type="number" name="pred_away" min={0} max={20}
                        defaultValue={pred?.pred_away ?? ''}
                        placeholder="0"
                        className="w-10 rounded-lg border border-ligne bg-pitch px-1 py-1 text-center font-mono font-bold text-sm"
                      />
                      <button type="submit" className="rounded-lg bg-sang px-2 py-1 text-xs font-bold">
                        OK
                      </button>
                    </div>
                  </form>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
