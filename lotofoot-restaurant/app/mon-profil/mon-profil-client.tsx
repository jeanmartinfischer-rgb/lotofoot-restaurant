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
  const [showAvatars, setShowAvatars] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);

  // Suppression de compte
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

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

  async function deleteAccount() {
    if (deleting) return;
    setDeleteMsg(null);
    if (deleteConfirm.trim().toUpperCase() !== 'SUPPRIMER') {
      setDeleteMsg('Tape SUPPRIMER pour confirmer.');
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch('/api/delete-account', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setDeleting(false);
        setDeleteMsg(data?.error ?? 'Erreur lors de la suppression.');
        return;
      }
      // Compte supprime : on deconnecte et on renvoie vers la connexion
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch {
      setDeleting(false);
      setDeleteMsg('Erreur lors de la suppression.');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">MON PROFIL</h1>

      <section className="glass-gold rounded-2xl p-5 text-center space-y-3">
        <div className="relative w-24 h-24 mx-auto">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-sang bg-ardoise flex items-center justify-center">
            {hasAvatar ? (
              <img src={avatarSrc(avatar)} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-3xl text-chalk">{(pseudo || '?').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <button
            onClick={() => setShowAvatars((v) => !v)}
            aria-label="Changer d'avatar"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-sang border-2 border-pitch flex items-center justify-center text-chalk hover:bg-sang-vif transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {showAvatars ? <path d="M5 12h14" /> : <><path d="M12 5v14" /><path d="M5 12h14" /></>}
            </svg>
          </button>
        </div>
        <p className="font-graff text-3xl tracking-wide">{pseudo || 'Mon pseudo'}</p>
      </section>

      {showAvatars && (
        <section className="rounded-2xl border border-ligne bg-ardoise p-4">
          <h2 className="font-display text-sm mb-3">CHOISIR UN AVATAR</h2>
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-72 overflow-y-auto">
            {Array.from({ length: AVATAR_COUNT }, (_, i) => String(i + 1)).map((num) => (
              <button
                key={num}
                onClick={() => { setAvatar(num); setShowAvatars(false); }}
                className={'rounded-full overflow-hidden border-2 transition ' +
                  (avatar === num ? 'border-sang-vif scale-105' : 'border-transparent hover:border-chalk/30')}
              >
                <img src={'/avatar-' + num + '.png'} alt={'avatar ' + num} className="w-full aspect-square object-cover" />
              </button>
            ))}
          </div>
        </section>
      )}

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

      {/* Zone dangereuse : suppression du compte */}
      <section className="rounded-2xl border border-sang-vif/40 bg-pitch p-4 space-y-3">
        <h2 className="font-display text-sm text-sang-vif">ZONE DANGEREUSE</h2>
        {!showDelete ? (
          <button
            onClick={() => { setShowDelete(true); setDeleteMsg(null); }}
            className="w-full rounded-xl border border-sang-vif/60 bg-sang/10 py-3 font-mono text-sm font-bold text-sang-vif hover:bg-sang/20 transition-colors"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-xs text-chalk/80 leading-relaxed">
              Etes-vous sur de vouloir supprimer votre compte ? Cette action est
              <b className="text-sang-vif"> irreversible et definitive</b>. Toutes vos donnees
              (pronostics, badges, ligues, statistiques) seront <b className="text-sang-vif">perdues</b> et ne pourront pas etre recuperees.
            </p>
            <p className="font-mono text-xs text-chalk/60">
              Pour confirmer, tape <b className="text-chalk">SUPPRIMER</b> ci-dessous :
            </p>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Tape SUPPRIMER"
              className="w-full rounded-xl border border-sang-vif/60 bg-pitch px-4 py-3 text-sm text-chalk outline-none focus:border-sang-vif"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowDelete(false); setDeleteConfirm(''); setDeleteMsg(null); }}
                disabled={deleting}
                className="flex-1 rounded-xl border border-ligne bg-ardoise py-3 font-mono text-sm text-chalk/70 hover:text-chalk transition-colors disabled:opacity-40"
              >
                Annuler
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleting || deleteConfirm.trim().toUpperCase() !== 'SUPPRIMER'}
                className="flex-1 rounded-xl border border-sang-vif bg-sang-vif/20 py-3 font-mono text-sm font-bold text-sang-vif hover:bg-sang-vif/30 transition-colors disabled:opacity-40"
              >
                {deleting ? 'Suppression...' : 'Supprimer definitivement'}
              </button>
            </div>
            {deleteMsg && <p className="text-center font-mono text-xs text-sang-vif">{deleteMsg}</p>}
          </div>
        )}
      </section>
    </div>
  );
}
