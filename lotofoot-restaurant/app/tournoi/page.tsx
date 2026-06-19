import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const DEADLINE = new Date('2026-06-20T23:59:00+02:00');

const EQUIPES = [
  'France', 'Bresil', 'Argentine', 'Angleterre', 'Espagne',
  'Allemagne', 'Portugal', 'Pays-Bas', 'Belgique', 'Uruguay',
  'USA', 'Mexique', 'Canada', 'Maroc', 'Senegal',
  'Japon', 'Coree du Sud', 'Australie', 'Croatie', 'Suisse',
  'Danemark', 'Pologne', 'Serbie', 'Ghana', 'Cameroun',
  'Nigeria', 'Egypte', 'Algerie', 'Tunisie', 'Cote d Ivoire',
  'Qatar', 'Arabie Saoudite',
];

export default async function Tournoi({ searchParams }: { searchParams: { msg?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: moi } = await supabase.from('profiles').select('is_guest').eq('id', user.id).single();
  const isGuest = moi?.is_guest ?? false;

  const isClosed = new Date() >= DEADLINE;

  const { data: myPred } = await supabase
    .from('tournament_predictions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Les pronostics de toute l'equipe ne sont charges que pour les membres (pas les invites)
  const { data: allPreds } = isGuest
    ? { data: [] as any[] }
    : await supabase
        .from('tournament_predictions')
        .select('*, profiles(pseudo)')
        .order('created_at');

  const winnerCount: Record<string, number> = {};
  for (const p of allPreds ?? []) {
    winnerCount[p.predicted_winner] = (winnerCount[p.predicted_winner] ?? 0) + 1;
  }
  const sortedWinners = Object.entries(winnerCount).sort((a, b) => b[1] - a[1]);
  const totalVotes = allPreds?.length ?? 0;

  async function savePred(formData: FormData) {
    'use server';
    const now = new Date();
    if (now >= DEADLINE) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const winner = formData.get('winner') as string;
    if (!winner) return;
    await supabase.from('tournament_predictions').upsert(
      { user_id: user.id, predicted_winner: winner, updated_at: now.toISOString() },
      { onConflict: 'user_id' }
    );
    revalidatePath('/tournoi');
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl">VAINQUEUR CdM 2026</h1>
        <p className="text-xs text-chalk/50 mt-1">
          Predit le champion du monde et gagne +10 pts bonus si tu as raison !
        </p>
      </div>

      {isClosed ? (
        <div className="rounded-2xl border border-sang bg-sang/10 p-4 text-center">
          <p className="font-display text-lg text-sang-vif">PARIS CLOTURES</p>
          <p className="font-mono text-xs text-chalk/50 mt-1">
            Les pronostics etaient ouverts jusqu'au 20 juin 2026.
          </p>
          <p className="font-mono text-xs text-chalk/40 mt-1">
            Bonne chance a tous ! Le champion sera connu le 19 juillet.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-ligne bg-ardoise p-3 text-center">
          <p className="font-mono text-xs text-chalk/50">
            Paris ouverts jusqu'au <b className="text-chalk">20 juin 2026 a minuit</b>
          </p>
        </div>
      )}

      {searchParams.msg && (
        <p className="rounded-xl border border-sang bg-sang p-3 text-center font-mono text-sm text-chalk">
          {searchParams.msg}
        </p>
      )}

      {myPred && (
        <div className="rounded-2xl border border-sang bg-sang/10 p-4 text-center">
          <p className="font-mono text-xs text-chalk/50 mb-1">TON PRONOSTIC</p>
          <p className="font-display text-2xl text-sang-vif">{myPred.predicted_winner}</p>
          {myPred.bonus_points > 0 && (
            <p className="font-mono text-sm font-bold text-yellow-400 mt-1">
              +{myPred.bonus_points} pts bonus gagnes !
            </p>
          )}
          {!isClosed && (
            <p className="text-xs text-chalk/40 mt-2">
              Tu peux changer ton choix jusqu'au 20 juin.
            </p>
          )}
        </div>
      )}

      {!isClosed && (
        <form action={savePred} className="space-y-3">
          <p className="font-display text-sm">CHOISIR LE VAINQUEUR</p>
          <div className="grid grid-cols-2 gap-2">
            {EQUIPES.map((equipe) => (
              <label
                key={equipe}
                className={'flex items-center gap-2 rounded-xl border p-2 cursor-pointer transition-colors ' +
                  (myPred?.predicted_winner === equipe
                    ? 'border-sang bg-sang/10'
                    : 'border-ligne bg-ardoise hover:border-chalk/40')}
              >
                <input
                  type="radio"
                  name="winner"
                  value={equipe}
                  defaultChecked={myPred?.predicted_winner === equipe}
                  className="accent-red-600"
                />
                <span className="text-sm font-semibold">{equipe}</span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-sang py-3 font-display text-sm text-chalk"
          >
            VALIDER MON PRONOSTIC
          </button>
        </form>
      )}

      {!isGuest && sortedWinners.length > 0 && (
        <section className="rounded-2xl border border-ligne bg-ardoise p-4 space-y-3">
          <h2 className="font-display text-sm">PALMARES DE L'EQUIPE</h2>
          <p className="font-mono text-xs text-chalk/40">{totalVotes} pronostic(s)</p>
          {sortedWinners.map(([equipe, count]) => (
            <div key={equipe}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold">{equipe}</span>
                <span className="font-mono text-xs text-chalk/60">
                  {count} vote{count > 1 ? 's' : ''} ({Math.round((count / totalVotes) * 100)}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-ligne overflow-hidden">
                <div
                  className="h-full rounded-full bg-sang"
                  style={{ width: Math.round((count / totalVotes) * 100) + '%' }}
                />
              </div>
            </div>
          ))}
        </section>
      )}

      {!isGuest && allPreds && allPreds.length > 0 && (
        <section className="rounded-2xl border border-ligne bg-ardoise p-4">
          <h2 className="font-display text-sm mb-3">QUI MISE SUR QUOI</h2>
          <div className="space-y-1">
            {allPreds.map((p: any) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-chalk/70">{p.profiles?.pseudo}</span>
                <span className="font-semibold">{p.predicted_winner}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
