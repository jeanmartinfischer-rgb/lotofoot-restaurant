import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const TZ = 'Europe/Paris';

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

function PastilleJoueur({ nom, playerId, taille = 36 }: { nom: string | null; playerId: number | null; taille?: number }) {
  const court = (nom ?? '?').split(' ').slice(-1)[0] ?? '?';
  const initiales = court.slice(0, 2).toUpperCase();
  const photo = playerId ? 'https://media.api-sports.io/football/players/' + playerId + '.png' : null;
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border border-chalk/30 bg-ardoise overflow-hidden shrink-0"
      style={{ width: taille, height: taille }}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={nom ?? ''} width={taille} height={taille} style={{ objectFit: 'cover', width: taille, height: taille }} />
      ) : (
        <span className="font-mono text-[10px] font-bold text-chalk/70">{initiales}</span>
      )}
    </span>
  );
}

function EventIcon({ type, detail }: { type: string; detail: string }) {
  if (type === 'Goal') {
    if (detail === 'Own Goal') return <>🥅</>;
    if (detail === 'Penalty') return <>⚽</>;
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

  // L'API renvoie les noms d'equipe en anglais dans match_events.team,
  // alors que match.home_team est en francais. On compare les noms traduits.
  const estDomicile = (teamName: string | null) => fr(teamName) === match.home_team;

  const homeEvents = events?.filter((e) => estDomicile(e.team)) ?? [];
  const awayEvents = events?.filter((e) => !estDomicile(e.team)) ?? [];

  const goals = events?.filter((e) => e.event_type === 'Goal') ?? [];

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
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 flex flex-col items-center gap-1">
            {match.home_logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={match.home_logo} alt="" width={32} height={32} style={{ width: 32, height: 32, objectFit: 'contain' }} />
            )}
            <p className="font-display text-sm leading-tight">{match.home_team}</p>
          </div>
          <div className="font-mono text-3xl font-bold px-2 shrink-0">
            {match.home_score ?? '-'} <span className="text-chalk/30">-</span> {match.away_score ?? '-'}
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            {match.away_logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={match.away_logo} alt="" width={32} height={32} style={{ width: 32, height: 32, objectFit: 'contain' }} />
            )}
            <p className="font-display text-sm leading-tight">{match.away_team}</p>
          </div>
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
              <div className="flex items-center justify-between px-2">
                <span className="font-mono text-lg font-bold text-sang-vif">{stats.homeGoals}</span>
                <span className="text-xs text-chalk/50">Buts</span>
                <span className="font-mono text-lg font-bold text-sang-vif">{stats.awayGoals}</span>
              </div>
            </div>
            <div className="glass rounded-xl p-2">
              <div className="flex items-center justify-between px-2">
                <span className="font-mono text-lg font-bold text-yellow-400">{stats.homeYellow}</span>
                <span className="text-xs text-chalk/50">🟨</span>
                <span className="font-mono text-lg font-bold text-yellow-400">{stats.awayYellow}</span>
              </div>
            </div>
            <div className="glass rounded-xl p-2">
              <div className="flex items-center justify-between px-2">
                <span className="font-mono text-lg font-bold">{stats.homeSubs}</span>
                <span className="text-xs text-chalk/50">🔄</span>
                <span className="font-mono text-lg font-bold">{stats.awaySubs}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-sm">CHRONOLOGIE</h2>

            <div className="flex items-center justify-between px-1 pb-1">
              <div className="flex items-center gap-1.5">
                {match.home_logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={match.home_logo} alt="" width={18} height={18} style={{ width: 18, height: 18, objectFit: 'contain' }} />
                )}
                <span className="font-mono text-[11px] text-chalk/60 truncate max-w-[120px]">{match.home_team}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-chalk/60 truncate max-w-[120px]">{match.away_team}</span>
                {match.away_logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={match.away_logo} alt="" width={18} height={18} style={{ width: 18, height: 18, objectFit: 'contain' }} />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              {events.map((e, i) => {
                const isGoal = e.event_type === 'Goal';
                const isHome = estDomicile(e.team);
                const logo = isHome ? match.home_logo : match.away_logo;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 rounded-xl p-2.5 ${
                      isGoal ? 'bg-sang/25 border-2 border-sang-vif' : 'glass'
                    } ${isHome ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    {logo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt="" width={22} height={22} style={{ width: 22, height: 22, objectFit: 'contain' }} className="shrink-0" />
                    )}

                    <PastilleJoueur nom={e.player} playerId={(e as any).player_id ?? null} taille={36} />

                    <div className={`flex-1 min-w-0 ${isHome ? 'text-left' : 'text-right'}`}>
                      <div className={`flex items-center gap-2 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
                        {isGoal && (
                          <span className="rounded-md bg-sang-vif px-2 py-0.5 font-display text-xs font-bold text-chalk shrink-0">
                            BUT
                          </span>
                        )}
                        <p className={`truncate ${isGoal ? 'font-bold text-base text-chalk' : 'font-semibold text-sm'}`}>
                          {e.player}
                        </p>
                      </div>
                      {e.assist && e.event_type === 'Goal' && (
                        <p className="text-xs text-chalk/60 truncate">Passe : {e.assist}</p>
                      )}
                      {e.event_type === 'subst' && (
                        <p className="text-xs text-chalk/50 truncate">Entre : {e.assist}</p>
                      )}
                      {e.detail === 'Penalty' && (
                        <p className="text-xs text-chalk/60 truncate">Sur penalty</p>
                      )}
                      {e.detail === 'Own Goal' && (
                        <p className="text-xs text-sang-vif truncate">Contre son camp</p>
                      )}
                      {!isGoal && <p className="text-xs text-chalk/40 truncate">{e.detail}</p>}
                    </div>

                    <div className="flex flex-col items-center w-9 shrink-0">
                      <span className="text-base leading-none"><EventIcon type={e.event_type} detail={e.detail} /></span>
                      <span className="font-mono text-[11px] text-chalk/60 mt-0.5">
                        {e.minute}{e.extra_minute ? '+' + e.extra_minute : ''}'
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {goals.length > 0 && (
            <div className="glass rounded-2xl p-3 space-y-2">
              <h3 className="font-display text-xs text-chalk/50">BUTEURS</h3>
              {goals.map((g, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <PastilleJoueur nom={g.player} playerId={(g as any).player_id ?? null} taille={28} />
                  <span className="font-semibold truncate">{g.player}</span>
                  <span className="font-mono text-xs text-chalk/50">{g.minute}'</span>
                  <span className="text-xs text-chalk/40 truncate">({fr(g.team)})</span>
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
