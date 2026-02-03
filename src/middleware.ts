import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Patrones de URLs legacy de WordPress que deben retornar 410 Gone
const WORDPRESS_LEGACY_PATTERNS = [
  /^\/wp-content\//,
  /^\/wp-admin/,
  /^\/wp-includes\//,
  /^\/wp-.*\.php$/,
  /^\/xmlrpc\.php$/,
  /^\/elementor-hf\//, // Elementor header/footer templates
  /^\/feed\/?$/, // RSS feed principal
  /^\/category\/.*\/feed\/?$/, // RSS feeds de categorías
  /^\/comments\/feed\/?$/, // RSS feed de comentarios
  /^\/author\/.*\/feed\/?$/, // RSS feeds de autores
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verificar si es una URL legacy de WordPress
  const isWordPressLegacy = WORDPRESS_LEGACY_PATTERNS.some(pattern =>
    pattern.test(pathname)
  );

  if (isWordPressLegacy) {
    // Retornar 410 Gone para indicar a Google que el contenido fue eliminado permanentemente
    return new NextResponse(null, {
      status: 410,
      statusText: 'Gone',
      headers: {
        'X-Robots-Tag': 'noindex',
      },
    });
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    // WordPress legacy URLs (para retornar 410 Gone)
    '/wp-content/:path*',
    '/wp-admin/:path*',
    '/wp-includes/:path*',
    '/elementor-hf/:path*',
  ],
};
