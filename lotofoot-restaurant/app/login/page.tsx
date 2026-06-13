'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Image from 'next/image';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(''); setLoading(true);
    const supabase = createClient();
    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { pseudo } } });
    setLoading(false);
    if (error) setError(error.message);
    else { router.push('/'); router.refresh(); }
  }

  return (
    <div className="mx-auto mt-6 max-w-sm space-y-4">

      <div className="flex flex-col items-center gap-3 mb-2">
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <Image src="/logo.png" alt="L'Arpège" width={180} height={100} style={{ objectFit: 'contain' }} />
        </div>
        <h1 className="font-display text-2xl">
          LOTO<span className="text-sang-vif">FOOT</span>
        </h1>
        <p className="text-center text-sm text-chalk/60">Le concours de pronos de l'équipe</p>
      </div>

      <div className="flex rounded-xl border border-ligne p-1 font-semibold text-sm">
        <button onClick={() => setMode('login')} className={`flex-1 rounded-lg py-2 ${mode === 'login' ? 'bg-sang' : 'text-chalk/60'}`}>Se connecter</button>
        <button onClick={() => setMode('signup')} className={`flex-1 rounded-lg py-2 ${mode === 'signup' ? 'bg-sang' : 'text-chalk/60'}`}>Creer un compte</button>
      </div>

      {mode === 'signup' && (
        <input placeholder="Pseudo (affiche au classement)" value={pseudo} onChange={(e) => setPseudo(e.target.value)}
          className="w-full rounded-xl border border-ligne bg-ardoise px-4 py-3" />
      )}
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-ligne bg-ardoise px-4 py-3" />
      <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-xl border border-ligne bg-ardoise px-4 py-3" />

      {error && <p className="text-center text-sm text-sang-vif">{error}</p>}

      <button onClick={submit} disabled={loading}
        className="w-full rounded-xl bg-sang py-3 font-display text-sm disabled:opacity-50">
        {loading ? '...' : mode === 'login' ? 'SE CONNECTER' : 'CREER MON COMPTE'}
      </button>
    </div>
  );
}
