import { redirect } from 'next/navigation';
import { createClient, createAdmin } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function Admin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) {
    return <p className="rounded-2xl border border-ligne bg-ardoise p-6 text-center text-sm text-chalk/60">
      Espace réservé à l’administrateur.
    </p>;
  }

  const admin = createAdmin();
  const { data: users } = await admin.from('profiles').select('*').order('created_at');
  const { count: nbMatchs } = await admin.from('matches').select('*', { count: 'exact', head: true });
  const { count: nbParis } = await admin.from('predictions').select('*', { count: 'exact', head: true });

  async function toggleSuspend(formData: FormData) {
    'use server';
    const admin = createAdmin();
    const id = formData.get('id') as string;
    const current = formData.get('suspended') === 'true';
    await admin.from('profiles').update({ is_suspended: !current }).eq('id', id);
    revalidatePath('/admin');
  }

  async function syncNow() {
    'use server';
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/sync-matches`, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    });
    revalidatePath('/admin');
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">ADMIN</h1>

      <section className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold">{users?.length ?? 0}</p>
          <p className="text-xs text-chalk/60">joueurs</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold">{nbMatchs ?? 0}</p>
          <p className="text-xs text-chalk/60">matchs</p>
        </div>
        <div className="rounded-2xl border border-ligne bg-ardoise p-3">
          <p className="font-mono text-2xl font-bold">{nbParis ?? 0}</p>
          <p className="text-xs text-chalk/60">paris</p>
        </div>
      </section>

      <form action={syncNow}>
        <button className="w-full rounded-xl bg-sang py-3 font-display text-sm">
          IMPORTER / METTRE À JOUR LES MATCHS
        </button>
      </form>

      <section>
        <h2 className="mb-2 font-display text-sm">JOUEURS</h2>
        <ul className="space-y-2">
          {users?.map((u) => (
            <li key={u.id} className="flex items-center justify-between rounded-2xl border border-ligne bg-ardoise p-3 text-sm">
              <span className="font-semibold">
                {u.pseudo} {u.is_admin && '⭐'} {u.is_suspended && <span className="text-sang-vif">(suspendu)</span>}
              </span>
              <form action={toggleSuspend}>
                <input type="hidden" name="id" value={u.id} />
                <input type="hidden" name="suspended" value={String(u.is_suspended)} />
                <button className="rounded-lg border border-ligne px-3 py-1 text-xs font-semibold">
                  {u.is_suspended ? 'Réactiver' : 'Suspendre'}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
