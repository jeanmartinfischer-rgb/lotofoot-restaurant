import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
export async function middleware(request: NextRequest) {
  // On transmet le chemin de la page courante au layout via un en-tete fiable.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  // Marquer l'activite du joueur (last_seen), au maximum une fois par minute.
  // Un cookie "seen_ping" sert de minuteur pour ne pas ecrire en base a chaque clic.
  if (user) {
    const dejaPinge = request.cookies.get('seen_ping');
    if (!dejaPinge) {
      try {
        await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
      } catch {}
      // Le cookie expire apres 60 s : prochaine mise a jour dans 1 min au plus tot
      response.cookies.set('seen_ping', '1', { maxAge: 60, path: '/' });
    }
  }

  return response;
}
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|js|css|ico)$).*)',
  ],
};
