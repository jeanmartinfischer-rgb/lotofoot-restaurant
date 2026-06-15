'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

const AVATAR_COUNT = 100;

function avatarSrc(val: string) {
  if (val === 'admin') return '/avatar-admin.png';
  return '/avatar-' + val + '.png';
}

export default function MonProfilClient({
  userId,
  initialPseudo,
  initialAvatar,
}: {
  userId: string;
  initialPseudo: string;
  initialAvatar: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [pseudo, setPseudo] = useState(initialPseudo);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);

  const hasAvatar = avatar && (avatar === 'admin' || /^[0-9]+$/.test(avatar));

  async function saveInfo() {
    if (savingInfo) return;
    setSavingInfo(true);
    setInfoMsg(null);
    const { error } = await supabase
      .from('profiles')
      .update({ pseudo: pseudo.trim(), avatar_url: avatar })
      .eq('id', userId);
    setSavingInfo(false);
    if (error) {
      setInfoMsg('Erreur lors de l\'enregistrement.');
      return;
    }
    setInfoMsg('Profil enregistre !');
    router.refresh();
    setTimeout(() => setInfoMsg(null), 2500);
  }

  async function changePassword() {
    if (savingPwd) return;
    setPwdMsg(null);
    if (pwd.length < 6) {
      setPwdMsg('Le mot de passe doit faire au moins 6 caracteres.');
      return;
    }
    if (pwd !== pwd2) {
      setPwdMsg('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSavingPwd(false);
    if (error) {
      setPwdMsg('Erreur : ' + error.message);
      return;
    }
    setPwd('');
    setPwd2('');
    setPwdMsg('Mot de passe modifie !');
    setTimeout(() => setPwdMsg(null), 2500);
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">MON PROFIL</h1>

      <section className="glass-gold rounded-2xl p-5 text-center space-y-3">
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-sang bg-ardoise flex items-center justify-center">
          {hasAvatar ? (
            <img src={avatarSrc(avatar)} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-3xl text-chalk">{(pseudo || '?').charAt(0).toUpperCase()}</span>
          )}
        </div>
        <p className="font-display text-xl">{pseudo || 'Mon pseudo'}</p>
      </section>

      <section className="rounded-2xl border border-ligne bg-ardoise p-4 space-y-2">
        <h2 className="font-display text-sm">MON PSEUDO</h2>
        <input
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          maxLength={20}
          placeholder="Ton pseudo"
          className="w-full rounded-xl border border-ligne bg-pitch px-4 py-3 text-sm text-chalk outline-none focus:border-sang-vif"
        />
      </section>

      <section className="rounded-2xl border border-ligne bg-ardoise p-4">
        <h2 className="font-display text-sm mb-3">CHOISIR UN AVATAR</h2>
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-72 overflow-y-auto">
          {Array.from({ length: AVATAR_COUNT }, (_, i) => String(i + 1)).map((num) => (
            <button
              key={num}
              onClick={() => setAvatar(num)}
              className={'rounded-full overflow-hidden border-2 transition ' +
                (avatar === num ? 'border-sang-vif scale-105' : 'border-transparent hover:border-chalk/30')}
            >
              <img src={'/avatar-' + num + '.png'} alt={'avatar ' + num} className="w-full aspect-square object-cover" />
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={saveInfo}
        disabled={savingInfo || !pseudo.trim()}
        className="w-full rounded-xl border border-sang bg-sang/15 py-3 font-mono text-sm font-bold text-chalk hover:border-sang-vif transition-colors disabled:opacity-40"
      >
        {savingInfo ? 'Enregistrement...' : 'Enregistrer mon profil'}
      </button>
      {infoMsg && <p className="text-center font-mono text-xs text-green-400">{infoMsg}</p>}

      <section className="rounded-2xl border border-ligne bg-ardoise p-4 space-y-2">
        <h2 className="font-display text-sm">CHANGER MON MOT DE PASSE</h2>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Nouveau mot de passe"
          className="w-full rounded-xl border border-ligne bg-pitch px-4 py-3 text-sm text-chalk outline-none focus:border-sang-vif"
        />
        <input
          type="password"
          value={pwd2}
          onChange={(e) => setPwd2(e.target.value)}
          placeholder="Confirme le mot de passe"
          className="w-full rounded-xl border border-ligne bg-pitch px-4 py-3 text-sm text-chalk outline-none focus:border-sang-vif"
        />
        <button
          onClick={changePassword}
          disabled={savingPwd || !pwd || !pwd2}
          className="w-full rounded-xl border border-ligne bg-pitch py-3 font-mono text-sm text-chalk hover:border-sang-vif transition-colors disabled:opacity-40"
        >
          {savingPwd ? 'Modification...' : 'Modifier le mot de passe'}
        </button>
        {pwdMsg && <p className="text-center font-mono text-xs text-chalk/70">{pwdMsg}</p>}
      </section>
    </div>
  );
}
