import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const TZ = 'Europe/Paris';

const BADGE_LABELS: Record<string, string> = {
  sniper: 'Sniper',
  super_sniper: 'Super Sniper',
  premiere_victoire: 'Premiere victoire',
  leader: 'Leader',
  champion_semaine: 'Champion semaine',
};

export default async function Profil({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', params.id).single();
  if (!profile) redirect('/classement');

  const { data: rang } = await supabase
    .from('leaderboard_season')
    .select('rang, total_points, exact_scores, correct_results')
    .eq('user_id', params.id).single();

  const { data: badges } = await supabase
    .from('badges').select('*').eq('user_id', params.id);

  const { data: tournoi } = await supabase
    .from('tournament_predictions')
    .select('predicted_winner, bonus_points')
    .eq('user_id', params.id).single();

  const { data: allPlayers } = await supabase
    .from('leaderboard_season').select('total_points');

  const { data: allMatches } = await supabase
    .from('matches').select('*').order('kickoff');

  const { data: preds } = await supabase
    .from('predictions').select('*').eq('user_id', params.id);

  const predByMatch = new Map((preds ?? []).map((p: any) => [p.match_id, p]));

  const now = new Date();
  const matchesFinished = (allMatches ?? []).filter((m: any) => m.status === 'finished');
  const matchesLive = (allMatches ?? []).filter((m: any) => m.status === 'live' || m.status === 'halftime');
  const matchesUpcoming = (allMatches ?? []).filter((m: any) =>
    m.status === 'scheduled' && new Date(m.kickoff) > now
  );

  const totalParis = preds?.length ?? 0;
  const bonsResultats = preds?.filter((p: any) => p.is_correct_result).length ?? 0;
  const scoresExacts = preds?.filter((p: any) => p.is_exact_score).length ?? 0;
  const tauxReussite = totalParis > 0 ? Math.round((bonsResultats / totalParis) * 100) : 0;
  const moyenneEquipe = allPlayers && allPlayers.length > 0
    ? Math.round(allPlayers.reduce((sum, p) => sum + (p.total_points ?? 0), 0) / allPlayers.length)
    : 0;

  const isMe = user.id === params.id;

  function MatchLine({ match }: { match: any }) {
    const pred = predByMatch.get(match.id);
    const isFinished = match.status === 'finished';
    const isLive = match.status === 'live' || match.status === 'halftime';

    return (
      <div className={'flex items-center gap-2 rounded-xl p-2 border ' +
        (pred?.points === 3 ? 'border-yellow-400/30 bg-yellow-400/5' :
         pred?.points === 1 ? 'border-green-400/30 bg-green-400/5' :
         isFinished && pred ? 'border-ligne bg-pitch/30' :
         isLive ? 'border-sang-vif/30 bg-sang-vif/5' :
         'border-ligne bg-ardoise')}>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">
            {match.home_team} vs {match.away_team}
          </p>
          <p className="font-mono text-xs text-chalk/40">
            {new Date(match.kickoff).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'short', timeZone: TZ
            })} {new Date(match.kickoff).toLocaleTimeString('fr-FR', {
              hour: '2-digit', minute: '2-digit', timeZone: TZ
            })}
          </p>
        </div>

        <div className="text-center min-w-[60px]">
          {pred ? (
            <p className="font-mono text-xs font-bold text-chalk">
              {pred.pred_home}-{pred.pred_away}
            </p>
          ) : (
            <p className="font-mono text-xs text-chalk/30">pas de paris</p>
          )}
          {isFinished && match.home_score !== null && (
            <p className="font-mono text-xs text-chalk/40">
              reel: {match.home_score}-{match.away_score}
            </p>
          )}
          {isLive && match.home_score !== null && (
            <p className="font-mono text-xs text-sang-vif font-bold animate-pulse">
              live: {match.home_score}-{match.away_score}
            </p>
          )}
        </div>

        <div className="w-10 text-right">
          {pred?.points !== null && pred?.points !== undefined && isFinished ? (
            <span className={'font-mono text-sm font-bold ' +
              (pred.points === 3 ? 'text-yellow-400' :
               pred.points === 1 ? 'text-green-400' : 'text-chalk/30')}>
              {pred.points === 3 ? '+3' : pred.points === 1 ? '+1' : '0'}
            </span>
          ) : isLive ? (
            <span className="font-mono text-xs text-sang-vif font-bold">LIVE</span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <a href="/classement" className="text-xs text-chalk/50 hover:text-chalk block">
        Retour au classement
      </a>

      <div className="glass-gold rounded-2xl p-5 text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-sang flex items-center justify-center mx-auto font-display text-2xl text-chalk">
          {profile.pseudo.charAt(0).toUpperCase()}
        </div>
        <h1 className="font-display text-2xl">{profile.pseudo}</h1>
        {isMe && <p className="font-mono text-xs text-chalk/40">C'est toi !</p>}
        {rang?.rang && (
          <p className="font-mono text-lg font-bold text-sang-vif">#{rang.rang} au classement</p>
        )}
      </div>

      <section className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold text-sang-vif">{rang?.total_points ?? 0}</p>
          <p className="text-xs text-chalk/60">points</p>
          <p className="font-mono text-xs text-chalk/30">moy. {moyenneEquipe}</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold text-green-400">{tauxReussite}%</p>
          <p className="text-xs text-chalk/60">reussite</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold text-yellow-400">{scoresExacts}</p>
          <p className="text-xs text-chalk/60">exacts</p>
        </div>
      </section>

      {badges && badges.length > 0 && (
        <section className="rounded-2xl border border-ligne bg-ardoise p-4">
          <h2 className="font-display text-sm mb-3">BADGES</h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b: any) => (
              <span key={b.id} className="rounded-full border border-sang bg-sang/10 px-3 py-1 font-mono text-xs text-chalk">
                {BADGE_LABELS[b.type] ?? b.label}
              </span>
            ))}
          </div>
        </section>
      )}

      {tournoi && (
        <section className="rounded-2xl border border-ligne bg-ardoise p-4 text-center">
          <h2 className="font-display text-sm mb-2">PRONOSTIC VAINQUEUR CdM</h2>
          <p className="font-display text-xl text-sang-vif">{tournoi.predicted_winner}</p>
          {tournoi.bonus_points > 0 && (
            <p className="font-mono text-sm text-yellow-400 mt-1">+{tournoi.bonus_points} pts bonus !</p>
          )}
        </section>
      )}

      {matchesLive.length > 0 && (
        <section className="rounded-2xl border border-sang-vif bg-ardoise p-4">
          <h2 className="font-display text-sm mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-sang-vif animate-pulse"></span>
            EN DIRECT
          </h2>
          <div className="space-y-2">
            {matchesLive.map((m: any) => <MatchLine key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {matchesFinished.length > 0 && (
        <section className="rounded-2xl border border-ligne bg-ardoise p-4">
          <h2 className="font-display text-sm mb-3">
            MATCHS TERMINES ({matchesFinished.length})
          </h2>
          <div className="space-y-2">
            {[...matchesFinished].reverse().map((m: any) => <MatchLine key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {matchesUpcoming.length > 0 && (
        <section className="rounded-2xl border border-ligne bg-ardoise p-4">
          <h2 className="font-display text-sm mb-3">
            A VENIR — {matchesUpcoming.filter((m: any) => predByMatch.has(m.id)).length}/{matchesUpcoming.length} paris faits
          </h2>
          <div className="space-y-2">
            {matchesUpcoming.map((m: any) => <MatchLine key={m.id} match={m} />)}
          </div>
        </section>
      )}
    </div>
  );
}
