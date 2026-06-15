'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

type Ligue = { id: number; name: string; code: string; isOwner: boolean };

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

export default function LiguesClient({
  userId,
  mesLigues,
}: {
  userId: string;
  mesLigues: Ligue[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [nom, setNom] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function creer() {
    if (!nom.trim() || busy) return;
    setBusy(true);
    setMsg(null);
    const newCode = genCode();
    const { data: league, error } = await supabase
      .from('leagues')
      .insert({ name: nom.trim(), code: newCode, owner_id: userId })
      .select('id')
      .single();
    if (error || !league) {
      setBusy(false);
      setMsg('Erreur lors de la creation.');
      return;
    }
    await supabase.from('league_members').insert({ league_id: league.id, user_id: userId });
    setBusy(false);
    setNom('');
    router.refresh();
  }

  async function rejoindre() {
    if (!code.trim() || busy) return;
    setBusy(true);
    setMsg(null);
    const { data: league, error } = await supabase
      .from('leagues')
      .select('id')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle();
    if (error || !league) {
      setBusy(false);
      setMsg('Code introuvable.');
      return;
    }
    const { error: joinErr } = await supabase
      .from('league_members')
      .insert({ league_id: league.id, user_id: userId });
    setBusy(false);
    if (joinErr) {
      setMsg('Tu es deja dans cette ligue (ou erreur).');
      return;
    }
    setCode('');
    router.refresh();
  }

  async function supprimer(ligue: Ligue) {
    if (busy) return;
    const ok = window.confirm('Supprimer la ligue "' + ligue.name + '" ? Cette action est definitive.');
    if (!ok) return;
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.from('leagues').delete().eq('id', ligue.id);
    setBusy(false);
    if (error) {
      setMsg('Suppression impossible.');
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">LIGUES PRIVEES</h1>

      {/* Mes ligues */}
      <section className="rounded-2xl border border-ligne bg-ardoise p-4">
        <h2 className="font-display text-sm mb-3">MES LIGUES</h2>
        {mesLigues.length === 0 ? (
          <p className="text-sm text-chalk/50">Tu n'es dans aucune ligue pour l'instant.</p>
        ) : (
          <div className="space-y-2">
            {mesLigues.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-xl border border-ligne bg-pitch px-4 py-3"
              >
                <Link href={'/ligues/' + l.id} className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80">
                  <span className="text-sm text-chalk truncate">{l.name}</span>
                  {l.isOwner && (
                    <span className="rounded-full border border-sang bg-sang/10 px-2 py-0.5 font-mono text-xs text-chalk/70 shrink-0">
                      proprio
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs text-chalk/40">{l.code}</span>
                  {l.isOwner && (
                    <button
                      onClick={() => supprimer(l)}
                      disabled={busy}
                      aria-label="Supprimer la ligue"
                      className="rounded-lg border border-ligne p-1.5 text-chalk/50 hover:text-sang-vif hover:border-sang transition-colors disabled:opacity-40"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" /><path d="M10 11v6M14 11v6" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Creer une ligue */}
      <section className="rounded-2xl border border-sang bg-pitch p-4">
        <h2 className="font-display text-sm mb-3">CREER UNE LIGUE</h2>
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom de la ligue"
          maxLength={30}
          className="w-full rounded-xl border border-ligne bg-ardoise px-4 py-3 text-sm text-chalk outline-none focus:border-sang-vif mb-2"
        />
        <button
          onClick={creer}
          disabled={busy || !nom.trim()}
          className="w-full rounded-xl border border-sang bg-sang/15 px-4 py-3 font-mono text-sm text-chalk hover:border-sang-vif transition-colors disabled:opacity-40"
        >
          Creer
        </button>
      </section>

      {/* Rejoindre une ligue */}
      <section className="rounded-2xl border border-ligne bg-ardoise p-4">
        <h2 className="font-display text-sm mb-3">REJOINDRE AVEC UN CODE</h2>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Code (ex: AB3D9K)"
          maxLength={6}
          className="w-full rounded-xl border border-ligne bg-pitch px-4 py-3 font-mono text-sm text-chalk outline-none focus:border-sang-vif mb-2 tracking-widest"
        />
        <button
          onClick={rejoindre}
          disabled={busy || !code.trim()}
          className="w-full rounded-xl border border-ligne bg-pitch px-4 py-3 font-mono text-sm text-chalk hover:border-sang-vif transition-colors disabled:opacity-40"
        >
          Rejoindre
        </button>
      </section>

      {msg && <p className="text-center text-xs text-sang-vif">{msg}</p>}
    </div>
  );
}
