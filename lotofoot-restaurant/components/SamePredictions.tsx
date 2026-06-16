'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Avatar from './Avatar';

export default function SamePredictions({
  matchId,
  userId,
  predHome,
  predAway,
}: {
  matchId: number;
  userId: string;
  predHome: number;
  predAway: number;
}) {
  const [others, setOthers] = useState<{ id: string; pseudo: string; avatar_url: string | null }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('predictions')
        .select('user_id, profiles(pseudo, avatar_url)')
        .eq('match_id', matchId)
        .eq('pred_home', predHome)
        .eq('pred_away', predAway);

      if (!alive) return;
      const list = (data ?? [])
        .filter((r: any) => r.user_id !== userId && r.profiles)
        .map((r: any) => ({
          id: r.user_id,
          pseudo: r.profiles.pseudo,
          avatar_url: r.profiles.avatar_url,
        }));
      setOthers(list);
      setLoaded(true);
    })();
    return () => { alive = false; };
  }, [matchId, userId, predHome, predAway]);

  if (!loaded || others.length === 0) return null;

  return (
    <div className="mt-2 rounded-xl border border-ligne bg-pitch p-3">
      <p className="font-mono text-xs text-chalk/50 mb-2">
        {others.length === 1 ? '1 autre joueur a le meme prono' : others.length + ' autres ont le meme prono'}
      </p>
      <div className="flex flex-wrap gap-2">
        {others.map((o) => (
          <a key={o.id} href={'/profil/' + o.id} className="flex items-center gap-1.5 rounded-full border border-ligne bg-ardoise pl-1 pr-3 py-1 hover:border-sang-vif transition-colors">
            <Avatar avatarUrl={o.avatar_url} pseudo={o.pseudo} size={22} />
            <span className="font-mono text-xs text-chalk/80">{o.pseudo}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
