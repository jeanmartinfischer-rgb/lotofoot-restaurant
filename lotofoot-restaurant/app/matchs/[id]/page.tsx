import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const TZ = 'Europe/Paris';

function EventIcon({ type, detail }: { type: string; detail: string }) {
  if (type === 'Goal') {
    if (detail === 'Own Goal') return <>🥅</>;
    if (detail === 'Penalty') return <>⚽ P</>;
    return <>⚽</>;
  }
  if (type === 'Card') {
    if (detail === 'Red Card') return <>🟥</>;
    if (detail === 'Yellow Card') return <>🟨</>;
    if (detail === 'Yellow Red Card') return <>🟨🟥</>;
  }
  if (type === 'subst') return <>🔄</>;
  if (type === 'Var') return <>📺</>;
  return <>•</>;
}

export default async function MatchResume({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const matchId = parseInt(params.id);

  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();

  if (!match) redirect('/matchs');

  const { data: events } = await supabase
    .from('match_events')
    .select('*')
    .eq('match_id', matchId)
    .order('minute')
    .order('extra_minute');

  const { data: myPred } = await supabase
    .from('predictions')
    .select('*')
    .eq('match_id', matchId)
    .eq('user_id', user.id)
    .single();

  const homeEvents = events?.filter((e) => e.team === match.home_team) ?? [];
  const awayEvents = events?.filter((e) => e.team === match.away_team) ?? [];

  const goals = events?.filter((e) => e.event_type === 'Goal') ?? [];
  const cards = events?.filter((e) => e.event_type === 'Card') ?? [];
  const subs = events?.filter((e) => e.event_type === 'subst') ?? [];

  const stats = {
    homeGoals: homeEvents.filter((e) => e.event_type === 'Goal' && e.detail !== 'Own Goal').length,
    awayGoals: awayEvents.filter((e) => e.event_type === 'Goal' && e.detail !== 'Own Goal').length,
    homeYellow: homeEvents.filter((e) => e.event_type === 'Card' && e.detail === 'Yellow Card').length,
    awayYellow: awayEvents.filter((e) => e.event_type === 'Card' && e.detail === 'Yellow Card').length,
    homeRed: homeEvents.filter((e) => e.event_type === 'Card' && e.detail?.includes('Red')).length,
    awayRed: awayEvents.filter((e) => e.event_type === 'Card' && e.detail?.includes('Red')).length,
    homeSubs: homeEvents.filter((e) => e.event_type === 'subst').length,
    awaySubs: awayEvents.filter((e) => e.event_type === 'subst').length,
  };

  return (
    <div className="space-y-4">
      <a href="/matchs" className="text-xs text-chalk/50 hover:text-chalk">← Retour aux matchs</a>

      <div className="glass-gold rounded-2xl p-4 text-center space-y-2">
        <p className="font-mono text-xs text-chalk/50">
          {new Date(match.kickoff).toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ
          })}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="flex-1 text-right font-display text-lg leading-tight">{match.home_team}</p>
          <div className="font-mono text-3xl font-bold px-4">
            {match.home_score ?? '-'} <span className="text-chalk/30">-</span> {match.away_score ?? '-'}
          </div>
          <p className="flex-1 text-left font-display text-lg leading-tight">{match.away_team}</p>
        </div>
        <span className={`inline-block rounded-full px-3 py-0.5 font-mono text-xs font-bold ${
          match.status === 'finished' ? 'bg-chalk/10 text-chalk/60' :
          match.status === 'live' ? 'bg-sang-vif text-chalk animate-pulse' :
          'bg-ardoise text-chalk/50'
        }`}>
          {match.status === 'finished' ? 'TERMINE' :
           match.status === 'live' ? 'EN DIRECT' :
           match.status === 'halftime' ? 'MI-TEMPS' : 'A VENIR'}
        </span>
      </div>

      {myPred && (
        <div className="glass rounded-2xl p-3 text-center">
          <p className="font-mono text-xs text-chalk/50 mb-1">MON PRONOSTIC</p>
          <p className="font-mono text-lg font-bold">
            {myPred.pred_home} - {myPred.pred_away}
          </p>
          {myPred.points !== null && (
            <p className={`font-mono text-sm font-bold mt-1 ${
              myPred.points === 3 ? 'text-yellow-400' :
              myPred.points === 1 ? 'text-green-400' : 'text-chalk/40'
            }`}>
              {myPred.points === 3 ? '🎯 Score exact ! +3 pts' :
               myPred.points === 1 ? '✓ Bon resultat +1 pt' :
               '✗ Rate 0 pt'}
            </p>
          )}
        </div>
      )}

      {events && events.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="glass rounded-xl p-2">
              <p className="font-mono text-xl font-bold text-sang-vif">{stats.homeGoals}</p>
              <p className="text-xs text-chalk/50">Buts</p>
              <p className="font-mono text-xl font-bold text-sang-vif">{stats.awayGoals}</p>
            </div>
            <div className="glass rounded-xl p-2">
              <p className="font-mono text-xl font-bold text-yellow-400">{stats.homeYellow}</p>
              <p className="text-xs text-chalk/50">🟨</p>
              <p className="font-mono text-xl font-bold text-yellow-400">{stats.awayYellow}</p>
            </div>
            <div className="glass rounded-xl p-2">
              <p className="font-mono text-xl font-bold">{stats.homeSubs}</p>
              <p className="text-xs text-chalk/50">🔄 Rempl.</p>
              <p className="font-mono text-xl font-bold">{stats.awaySubs}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-sm">CHRONOLOGIE</h2>
            {events.map((e, i) => {
              const isHome = e.team === match.home_team;
              return (
                <div key={i} className={`flex items-center gap-3 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 glass rounded-xl p-2 ${isHome ? 'text-left' : 'text-right'}`}>
                    <p className="font-semibold text-sm">{e.player}</p>
                    {e.assist && e.event_type === 'Goal' && (
                      <p className="text-xs text-chalk/50">Passe : {e.assist}</p>
                    )}
                    {e.event_type === 'subst' && (
                      <p className="text-xs text-chalk/50">entre : {e.assist}</p>
                    )}
                    <p className="text-xs text-chalk/40">{e.detail}</p>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 w-14">
                    <span className="text-lg"><EventIcon type={e.event_type} detail={e.detail} /></span>
                    <span className="font-mono text-xs text-chalk/60">
                      {e.minute}{e.extra_minute ? '+' + e.extra_minute : ''}'
                    </span>
                  </div>
                  <div className="flex-1" />
                </div>
              );
            })}
          </div>

          {goals.length > 0 && (
            <div className="glass rounded-2xl p-3 space-y-1">
              <h3 className="font-display text-xs text-chalk/50">BUTEURS</h3>
              {goals.map((g, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span>⚽</span>
                  <span className="font-semibold">{g.player}</span>
                  <span className="font-mono text-xs text-chalk/50">{g.minute}'</span>
                  <span className="text-xs text-chalk/40">({g.team})</span>
                  {g.detail === 'Penalty' && <span className="text-xs text-chalk/40">pen.</span>}
                  {g.detail === 'Own Goal' && <span className="text-xs text-sang-vif">c.s.c.</span>}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-sm text-chalk/60">
            {match.status === 'finished'
              ? 'Resume pas encore charge. Cliquez sur Importer dans Admin pour recuperer les evenements.'
              : 'Le resume sera disponible apres le match.'}
          </p>
        </div>
      )}
    </div>
  );
}
