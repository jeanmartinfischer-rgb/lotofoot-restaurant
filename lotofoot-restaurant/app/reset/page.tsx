'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Image from 'next/image';

export default function Reset() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  async function save() {
    setError('');
    setInfo('');
    if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caracteres.'); return; }
    if (password !== password2) { setError('Les deux mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setInfo('Mot de passe modifie ! Redirection...');
    setTimeout(() => { router.push('/'); router.refresh(); }, 1500);
  }

  return (
    <div className="mx-auto mt-6 max-w-sm space-y-4">
      <div className="flex flex-col items-center gap-3 mb-2">
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <Image src="/logo.png" alt="L'Arpege" width={180} height={100} style={{ objectFit: 'contain' }} />
        </div>
        <h1 className="font-display text-2xl">
          NOUVEAU <span className="text-sang-vif">MOT DE PASSE</span>
        </h1>
      </div>

      {!ready && (
        <p className="text-center text-sm text-chalk/60">
          Verification du lien... Si rien ne se passe, reclique sur le lien recu par email.
        </p>
      )}

      {ready && (
        <>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <input
            type={showPwd ? 'text' : 'password'}
            placeholder="Confirme le mot de passe"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="w-full rounded-xl border border-ligne bg-ardoise px-4 py-3"
          />

          {error && <p className="text-center text-sm text-sang-vif">{error}</p>}
          {info && <p className="text-center text-sm text-green-400">{info}</p>}

          <button
            onClick={save}
            disabled={loading}
            className="w-full rounded-xl bg-sang py-3 font-display text-sm disabled:opacity-50"
          >
            {loading ? '...' : 'ENREGISTRER'}
          </button>
        </>
      )}
    </div>
  );
}
