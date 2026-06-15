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
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!profile) redirect('/classement');

  const { data: rang } = await supabase
    .from('leaderboard_season')
    .select('rang, total_points, exact_scores, correct_results')
    .eq('user_id', params.id)
    .single();

  const { data: badges } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', params.id);

  const { data: preds } = await supabase
    .from('predictions')
    .select('*, matches!inner(home_team, away_team, kickoff, home_score, away_score, status)')
    .eq('user_id', params.id)
    .not('points', 'is', null)
    .order('matches(kickoff)', { ascending: false });

  const { data: tournoi } = await supabase
    .from('tournament_predictions')
    .select('predicted_winner, bonus_points')
    .eq('user_id', params.id)
    .single();

  const { data: allPlayers } = await supabase
    .from('leaderboard_season').select('total_points');

  const totalParis = preds?.length ?? 0;
  const bonsResultats = preds?.filter((p) => p.is_correct_result).length ?? 0;
  const scoresExacts = preds?.filter((p) => p.is_exact_score).length ?? 0;
  const tauxReussite = totalParis > 0 ? Math.round((bonsResultats / totalParis) * 100) : 0;
  const moyenneEquipe = allPlayers && allPlayers.length > 0
    ? Math.round(allPlayers.reduce((sum, p) => sum + (p.total_points ?? 0), 0) / allPlayers.length)
    : 0;

  const isMe = user.id === params.id;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <a href="/classement" className="text-xs text-chalk/50 hover:text-chalk">
          Retour au classement
        </a>
      </div>

      <div className="glass-gold rounded-2xl p-5 text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-sang flex items-center justify-center mx-auto font-display text-2xl text-chalk">
          {profile.pseudo.charAt(0).toUpperCase()}
        </div>
        <h1 className="font-display text-2xl">{profile.pseudo}</h1>
        {isMe && <p className="font-mono text-xs text-chalk/40">C'est toi !</p>}
        {rang?.rang && (
          <p className="font-mono text-lg font-bold text-sang-vif">
            #{rang.rang} au classement
          </p>
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
            {badges.map((b) => (
              <span
                key={b.id}
                className="rounded-full border border-sang bg-sang/10 px-3 py-1 font-mono text-xs text-chalk"
              >
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
            <p className="font-mono text-sm text-yellow-400 mt-1">
              +{tournoi.bonus_points} pts bonus gagnes !
            </p>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-ligne bg-ardoise p-4">
        <h2 className="font-display text-sm mb-3">
          HISTORIQUE ({totalParis} paris)
        </h2>
        {totalParis === 0 && (
          <p className="text-xs text-chalk/40 text-center">Aucun pari enregistre.</p>
        )}
        <div className="space-y-2">
          {preds?.map((p: any) => (
            <div
              key={p.id}
              className={'flex items-center gap-2 rounded-xl p-2 border ' +
                (p.points === 3 ? 'border-yellow-400/30 bg-yellow-400/5' :
                 p.points === 1 ? 'border-green-400/30 bg-green-400/5' :
                 'border-ligne bg-pitch/50')}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">
                  {p.matches.home_team} vs {p.matches.away_team}
                </p>
                <p className="font-mono text-xs text-chalk/40">
                  {new Date(p.matches.kickoff).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short', timeZone: TZ
                  })}
                </p>
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-chalk/50">
                  {p.pred_home}-{p.pred_away}
                </p>
                <p className="font-mono text-xs text-chalk/30">
                  {p.matches.home_score !== null
                    ? p.matches.home_score + '-' + p.matches.away_score
                    : '-'}
                </p>
              </div>
              <span className={'font-mono text-sm font-bold w-8 text-right ' +
                (p.points === 3 ? 'text-yellow-400' :
                 p.points === 1 ? 'text-green-400' : 'text-chalk/30')}>
                {p.points === 3 ? '+3' : p.points === 1 ? '+1' : '0'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
