import { NextResponse } from 'next/server';
import { createClient, createAdmin } from '@/lib/supabase-server';

// Supprime le compte de l'UTILISATEUR CONNECTE (et lui seul) + toutes ses donnees.
// L'id vient de la session, jamais du navigateur : on ne peut pas viser un autre compte.

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecte' }, { status: 401 });
  }

  const id = user.id;
  const admin = createAdmin();

  // Securite : un admin ne peut pas se supprimer via cette route (evite les accidents)
  const { data: target } = await admin.from('profiles').select('is_admin').eq('id', id).single();
  if (target?.is_admin) {
    return NextResponse.json({ error: 'Un compte admin ne peut pas etre supprime ici.' }, { status: 403 });
  }

  try {
    // 1) Supprimer les ligues dont ce joueur est proprietaire (+ leurs membres)
    const { data: ownedLeagues } = await admin.from('leagues').select('id').eq('owner_id', id);
    for (const lg of ownedLeagues ?? []) {
      await admin.from('league_members').delete().eq('league_id', lg.id);
      await admin.from('leagues').delete().eq('id', lg.id);
    }

    // 2) Supprimer toutes les donnees liees au joueur
    await admin.from('daily_challenge_answers').delete().eq('user_id', id);
    await admin.from('predictions').delete().eq('user_id', id);
    await admin.from('badges').delete().eq('user_id', id);
    await admin.from('league_members').delete().eq('user_id', id);
    await admin.from('tournament_predictions').delete().eq('user_id', id);
    await admin.from('reactions').delete().eq('user_id', id);
    await admin.from('comments').delete().eq('user_id', id);
    await admin.from('messages').delete().eq('user_id', id);

    // 3) Supprimer le profil
    await admin.from('profiles').delete().eq('id', id);

    // 4) Supprimer le compte de connexion (Auth)
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      return NextResponse.json({ error: 'Profil supprime mais erreur Auth: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
