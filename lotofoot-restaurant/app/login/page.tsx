'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Image from 'next/image';
export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    setInfo('');
    setLoading(true);
    const supabase = createClient();
    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { pseudo } } });
    setLoading(false);
    if (error) setError(error.message);
    else { router.push('/'); router.refresh(); }
  }

  async function sendReset() {
    setError('');
    setInfo('');
    if (!email) { setError('Entre ton email d\'abord.'); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset',
    });
    setLoading(false);
    if (error) setError(error.message);
    else setInfo('Email envoye ! Regarde ta boite mail (et les spams) pour reinitialiser ton mot de passe.');
  }

  return (
    <div className="mx-auto mt-6 max-w-sm space-y-4">
      <div className="flex flex-col items-center gap-3 mb-2">
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <Image src="/logo.png" alt="L'Arpege" width={180} height={100} style={{ objectFit: 'contain' }} />
        </div>
        <h1 className="font-display text-2xl">
          LOTO<span className="text-sang-vif">FOOT</span>
        </h1>
        <p className="text-center text-sm text-chalk/60">Le concours de pronos de l'equipe</p>
      </div>

      {mode !== 'forgot' && (
        <div className="flex rounded-xl border border-ligne p-1 font-semibold text-sm">
          <button
            onClick={() => { setMode('login'); setError(''); setInfo(''); }}
            className={`flex-1 rounded-lg py-2 ${mode === 'login' ? 'bg-sang' : 'text-chalk/60'}`}
          >
            Se connecter
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); setInfo(''); }}
            className={`flex-1 rounded-lg py-2 ${mode === 'signup' ? 'bg-sang' : 'text-chalk/60'}`}
          >
            Creer un compte
          </button>
        </div>
      )}

      {mode === 'signup' && (
        <input
          placeholder="Pseudo (affiche au classement)"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          autoComplete="nickname"
          className="w-full rounded-xl border border-ligne bg-ardoise px-4 py-3"
        />
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        className="w-full rounded-xl border border-ligne bg-ardoise px-4 py-3"
      />

      {mode !== 'forgot' && (
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-xl border border-ligne bg-ardoise px-4 py-3 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-chalk/50 hover:text-chalk text-lg"
          >
            {showPwd ? String.fromCodePoint(0x1F648) : String.fromCodePoint(0x1F441)}
          </button>
        </div>
      )}

      {error && <p className="text-center text-sm text-sang-vif">{error}</p>}
      {info && <p className="text-center text-sm text-green-400">{info}</p>}

      {mode === 'forgot' ? (
        <>
          <button
            onClick={sendReset}
            disabled={loading}
            className="w-full rounded-xl bg-sang py-3 font-display text-sm disabled:opacity-50"
          >
            {loading ? '...' : 'ENVOYER LE LIEN'}
          </button>
          <button
            onClick={() => { setMode('login'); setError(''); setInfo(''); }}
            className="w-full text-center text-sm text-chalk/60 hover:text-chalk"
          >
            Retour a la connexion
          </button>
        </>
      ) : (
        <>
          <button
            onClick={submit}
            disabled={loading}
            className="w-full rounded-xl bg-sang py-3 font-display text-sm disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'SE CONNECTER' : 'CREER MON COMPTE'}
          </button>
          {mode === 'login' && (
            <button
              onClick={() => { setMode('forgot'); setError(''); setInfo(''); }}
              className="w-full text-center text-sm text-chalk/50 hover:text-chalk"
            >
              Mot de passe oublie ?
            </button>
          )}
        </>
      )}
    </div>
  );
}
