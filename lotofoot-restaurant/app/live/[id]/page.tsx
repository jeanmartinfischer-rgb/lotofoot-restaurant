'use client';

import { useEffect, useState } from 'react';

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

type MatchInfo = {
  id: number;
  home_team: string;
  away_team: string;
  home_logo: string | null;
  away_logo: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string;
};
type Evt = {
  id: number;
  minute: number | null;
  extra_minute: number | null;
  team: string | null;
  player: string | null;
  player_id: number | null;
  assist: string | null;
  event_type: string | null;
  detail: string | null;
};

function PastilleJoueur({ nom, playerId, taille = 36 }: { nom: string | null; playerId: number | null; taille?: number }) {
  const court = (nom ?? '?').split(' ').slice(-1)[0] ?? '?';
  const initiales = court.slice(0, 2).toUpperCase();
  const [src, setSrc] = useState(playerId ? 'https://media.api-sports.io/football/players/' + playerId + '.png' : '');
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border border-chalk/30 bg-ardoise overflow-hidden shrink-0"
      style={{ width: taille, height: taille }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={nom ?? ''} width={taille} height={taille} onError={() => setSrc('')} style={{ objectFit: 'cover', width: taille, height: taille }} />
      ) : (
        <span className="font-mono text-[10px] font-bold text-chalk/70">{initiales}</span>
      )}
    </span>
  );
}

function iconFor(type: string | null, detail: string | null) {
  if (type === 'Goal') {
    if (detail === 'Own Goal') return '🥅';
    return '⚽';
  }
  if (type === 'Card') {
    if (detail === 'Red Card') return '🟥';
    if (detail === 'Yellow Card') return '🟨';
    if (detail === 'Yellow Red Card') return '🟨🟥';
  }
  if (type === 'subst') return '🔄';
  if (type === 'Var') return '📺';
  return '•';
}

export default function LiveMatch({ params }: { params: { id: string } }) {
  const id = params.id;
  const [match, setMatch] = useState<MatchInfo | null>(null);
  const [events, setEvents] = useState<Evt[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let actif = true;
    const charger = () => {
      fetch('/api/live?match=' + id)
        .then((r) => r.json())
        .then((data) => {
          if (!actif) return;
          if (!data || !data.match) { setNotFound(true); setLoading(false); return; }
          setMatch(data.match);
          setEvents(data.events ?? []);
          setLoading(false);
        })
        .catch(() => { if (actif) { setNotFound(true); setLoading(false); } });
    };
    charger();
    const t = setInterval(charger, 20000); // rafraichit toutes les 20 s
    return () => { actif = false; clearInterval(t); };
  }, [id]);

  if (loading) {
    return <p className="text-center text-sm text-chalk/60 py-8">Chargement du match...</p>;
  }
  if (notFound || !match) {
    return (
      <div className="space-y-4">
        <a href="/matchs" className="text-xs text-chalk/50 hover:text-chalk">← Retour aux matchs</a>
        <p className="glass rounded-2xl p-6 text-center text-sm text-chalk/60">Match introuvable.</p>
      </div>
    );
  }

  const isLive = match.status === 'live' || match.status === 'halftime';
  const estDomicile = (teamName: string | null) => fr(teamName) === match.home_team;
  const evtsTries = [...events].sort((a, b) => {
    const ma = (a.minute ?? 0) + (a.extra_minute ?? 0) / 100;
    const mb = (b.minute ?? 0) + (b.extra_minute ?? 0) / 100;
    return mb - ma; // plus recent en haut
  });

  return (
    <div className="space-y-4">
      <a href="/matchs" className="text-xs text-chalk/50 hover:text-chalk">← Retour aux matchs</a>

      <div className="glass-gold rounded-2xl p-4 text-center space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 flex flex-col items-center gap-1">
            {match.home_logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={match.home_logo} alt="" width={36} height={36} style={{ width: 36, height: 36, objectFit: 'contain' }} />
            )}
            <p className="font-display text-sm leading-tight">{match.home_team}</p>
          </div>
          <div className="font-mono text-4xl font-bold px-2 shrink-0 text-sang-vif">
            {match.home_score ?? 0} <span className="text-chalk/30">-</span> {match.away_score ?? 0}
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            {match.away_logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={match.away_logo} alt="" width={36} height={36} style={{ width: 36, height: 36, objectFit: 'contain' }} />
            )}
            <p className="font-display text-sm leading-tight">{match.away_team}</p>
          </div>
        </div>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sang-vif px-3 py-0.5 font-mono text-xs font-bold text-chalk animate-pulse">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-chalk"></span>
            {match.status === 'halftime' ? 'MI-TEMPS' : 'EN DIRECT'}
          </span>
        ) : (
          <span className="inline-block rounded-full bg-chalk/10 px-3 py-0.5 font-mono text-xs font-bold text-chalk/60">
            {match.status === 'finished' ? 'TERMINE' : 'A VENIR'}
          </span>
        )}
        {isLive && <p className="font-mono text-[10px] text-chalk/40">Mise a jour automatique</p>}
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-sm">DEROULE DU MATCH</h2>
        {evtsTries.length === 0 ? (
          <p className="glass rounded-2xl p-6 text-center text-sm text-chalk/60">
            Aucun evenement pour l'instant. Le match vient peut-etre de commencer.
          </p>
        ) : (
          <div className="space-y-1.5">
            {evtsTries.map((e) => {
              const isGoal = e.event_type === 'Goal';
              const isHome = estDomicile(e.team);
              const logo = isHome ? match.home_logo : match.away_logo;
              return (
                <div
                  key={e.id}
                  className={`flex items-center gap-2 rounded-xl p-2.5 ${
                    isGoal ? 'bg-sang/25 border-2 border-sang-vif' : 'glass'
                  } ${isHome ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" width={22} height={22} style={{ width: 22, height: 22, objectFit: 'contain' }} className="shrink-0" />
                  )}
                  <PastilleJoueur nom={e.player} playerId={e.player_id} taille={36} />
                  <div className={`flex-1 min-w-0 ${isHome ? 'text-left' : 'text-right'}`}>
                    <div className={`flex items-center gap-2 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
                      {isGoal && (
                        <span className="rounded-md bg-sang-vif px-2 py-0.5 font-display text-xs font-bold text-chalk shrink-0">BUT</span>
                      )}
                      <p className={`truncate ${isGoal ? 'font-bold text-base text-chalk' : 'font-semibold text-sm'}`}>{e.player}</p>
                    </div>
                    {e.assist && e.event_type === 'Goal' && (
                      <p className="text-xs text-chalk/60 truncate">Passe : {e.assist}</p>
                    )}
                    {e.event_type === 'subst' && (
                      <p className="text-xs text-chalk/50 truncate">Entre : {e.assist}</p>
                    )}
                    {e.detail === 'Penalty' && <p className="text-xs text-chalk/60 truncate">Sur penalty</p>}
                    {e.detail === 'Own Goal' && <p className="text-xs text-sang-vif truncate">Contre son camp</p>}
                    {!isGoal && <p className="text-xs text-chalk/40 truncate">{e.detail}</p>}
                  </div>
                  <div className="flex flex-col items-center w-9 shrink-0">
                    <span className="text-base leading-none">{iconFor(e.event_type, e.detail)}</span>
                    <span className="font-mono text-[11px] text-chalk/60 mt-0.5">
                      {e.minute}{e.extra_minute ? '+' + e.extra_minute : ''}'
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
