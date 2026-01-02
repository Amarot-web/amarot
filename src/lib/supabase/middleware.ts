// Middleware de Supabase para refrescar sesiones y manejar subdominio
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Detectar si estamos en el subdominio app.*
function isAppSubdomain(hostname: string): boolean {
  return hostname === 'app.amarotperu.com' ||
         hostname === 'app.localhost' ||
         hostname.startsWith('app.localhost:');
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refrescar la sesión si ha expirado - requerido para Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // ==================== MANEJO DEL SUBDOMINIO APP ====================
  if (isAppSubdomain(hostname)) {
    // Si no hay usuario autenticado, redirigir a login en el dominio principal
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      const isDev = hostname.includes('localhost');

      if (isDev) {
        // En desarrollo, redirigir a localhost:3000/login
        return NextResponse.redirect(
          new URL(`/login?redirectTo=/panel${pathname === '/' ? '/dashboard' : pathname}`, 'http://localhost:3000')
        );
      } else {
        // En producción, redirigir al dominio principal
        return NextResponse.redirect(
          new URL(`/login?redirectTo=https://${hostname}${pathname}`, 'https://amarotperu.com')
        );
      }
    }

    // Usuario autenticado: Reescribir la URL internamente a /panel/*
    const url = request.nextUrl.clone();

    // Si está en la raíz del subdominio, ir a dashboard
    if (pathname === '/' || pathname === '') {
      url.pathname = '/panel/dashboard';
    } else if (!pathname.startsWith('/panel')) {
      url.pathname = `/panel${pathname}`;
    }

    // Reescribir la URL (el usuario sigue viendo app.amarotperu.com/dashboard)
    return NextResponse.rewrite(url);
  }

  // ==================== RUTAS LEGACY (temporales, hasta migración completa) ====================
  const isLegacyInternalRoute = pathname.startsWith('/cotizador') ||
                                pathname.startsWith('/clientes') ||
                                pathname.startsWith('/dashboard');

  if (isLegacyInternalRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // ==================== RUTAS DEL PANEL (acceso directo vía /panel/*) ====================
  const isPanelRoute = pathname.startsWith('/panel');

  if (isPanelRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // ==================== LOGIN ====================
  if (pathname === '/login' && user) {
    // Si ya está autenticado, redirigir al panel
    // En producción, redirigir al subdominio app.*
    const isDev = hostname.includes('localhost');
    if (isDev) {
      const url = request.nextUrl.clone();
      url.pathname = '/panel/dashboard';
      return NextResponse.redirect(url);
    } else {
      // Redirigir al subdominio
      return NextResponse.redirect('https://app.amarotperu.com/dashboard');
    }
  }

  return supabaseResponse;
}
