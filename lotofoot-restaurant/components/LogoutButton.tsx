'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="flex flex-col items-center gap-1 px-4 py-1 text-chalk/80 hover:text-sang-vif"
    >
      <span>🚪</span>
      <span className="text-xs font-semibold">Sortir</span>
    </button>
  );
}
