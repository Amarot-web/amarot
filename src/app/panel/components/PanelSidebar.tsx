'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/auth/actions';
import { usePermissions } from '@/hooks/usePermissions';
import type { AuthUser, PermissionName } from '@/types/auth';
import { ROLE_LABELS } from '@/types/auth';
import { useSidebar } from './SidebarContext';

interface PanelSidebarProps {
  user: AuthUser;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  permission?: PermissionName;
  children?: NavItem[];
}

// Iconos como componentes para mejor legibilidad
const icons = {
  dashboard: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  quotations: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  clients: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  blog: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  team: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  analytics: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  external: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  plus: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  messages: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  crm: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  alert: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  email: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  collapse: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
  ),
  expand: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  ),
};

// Navegación con permisos
const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/panel/dashboard',
    icon: icons.dashboard,
  },
  {
    name: 'Pipeline CRM',
    href: '/panel/crm',
    icon: icons.crm,
    permission: 'quotations:view', // Mismo permiso que cotizaciones por ahora
  },
  {
    name: 'Alertas CRM',
    href: '/panel/crm/alertas',
    icon: icons.alert,
    permission: 'quotations:view',
  },
  {
    name: 'Config. Asignación',
    href: '/panel/crm/configuracion/asignacion',
    icon: icons.settings,
    permission: 'team:view',
  },
  {
    name: 'Plantillas Email',
    href: '/panel/crm/configuracion/plantillas',
    icon: icons.email,
    permission: 'team:view',
  },
  {
    name: 'Config. Alertas',
    href: '/panel/crm/configuracion/alertas',
    icon: icons.alert,
    permission: 'team:view',
  },
  {
    name: 'Cotizaciones',
    href: '/panel/cotizador',
    icon: icons.quotations,
    permission: 'quotations:view',
  },
  {
    name: 'Clientes',
    href: '/panel/clientes',
    icon: icons.clients,
    permission: 'clients:view',
  },
  {
    name: 'Mensajes',
    href: '/panel/mensajes',
    icon: icons.messages,
    permission: 'clients:view',
  },
  {
    name: 'Blog',
    href: '/panel/blog',
    icon: icons.blog,
    permission: 'blog:view',
  },
  {
    name: 'Equipo',
    href: '/panel/equipo',
    icon: icons.team,
    permission: 'team:view',
  },
  {
    name: 'Analytics',
    href: '/panel/analytics',
    icon: icons.analytics,
    permission: 'analytics:view',
  },
  {
    name: 'Configuración',
    href: '/panel/configuracion',
    icon: icons.settings,
    permission: 'team:view',
  },
];

export default function PanelSidebar({ user }: PanelSidebarProps) {
  const pathname = usePathname();
  const { hasPermission, isAdmin } = usePermissions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);

  // Detectar si estamos en desktop (lg breakpoint = 1024px)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Solo colapsar en desktop, nunca en mobile
  const showCollapsed = isCollapsed && isDesktop;

  const isActive = (href: string) => {
    if (href === '/panel/dashboard') {
      return pathname === '/panel/dashboard' || pathname === '/panel';
    }
    return pathname.startsWith(href);
  };

  // Filtrar navegación por permisos
  const filteredNavigation = navigation.filter((item) => {
    if (!item.permission) return true;
    return isAdmin || hasPermission(item.permission);
  });

  const roleLabel = user.role ? ROLE_LABELS[user.role] : 'Miembro';

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Image
          src="/images/logo.png"
          alt="AMAROT"
          width={140}
          height={45}
        />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full bg-[#0f172a] transform transition-all duration-300
          lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
          ${showCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Toggle button - solo visible en desktop */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 z-50 w-6 h-6 bg-[#0f172a] border border-white/20 rounded-full items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition-colors"
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${showCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`border-b border-white/10 ${showCollapsed ? 'p-4' : 'p-6'}`}>
            <Link href="/" className="block">
              {showCollapsed ? (
                <div className="w-10 h-10 mx-auto bg-[#DC2626] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
              ) : (
                <Image
                  src="/images/logo-blanco.png"
                  alt="AMAROT"
                  width={180}
                  height={60}
                  className="mx-auto"
                />
              )}
            </Link>
            {!showCollapsed && (
              <p className="text-white/80 text-sm font-medium mt-3 text-center">
                Sistema de Gestión
              </p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                title={showCollapsed ? item.name : undefined}
                className={`
                  flex items-center gap-3 rounded-lg transition-colors relative group
                  ${showCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'}
                  ${
                    isActive(item.href)
                      ? 'bg-[#DC2626] text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                {item.icon}
                {!showCollapsed && <span className="font-medium">{item.name}</span>}

                {/* Tooltip para modo colapsado */}
                {showCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="border-t border-white/10 mx-4" />

          {/* Quick link to public site */}
          <div className="p-4">
            <Link
              href="/"
              target="_blank"
              title={showCollapsed ? 'Ver sitio público' : undefined}
              className={`
                flex items-center gap-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors relative group
                ${showCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'}
              `}
            >
              {icons.external}
              {!showCollapsed && <span className="font-medium">Ver sitio público</span>}

              {/* Tooltip para modo colapsado */}
              {showCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  Ver sitio público
                </div>
              )}
            </Link>
          </div>

          {/* User section */}
          <div className="p-4 border-t border-white/10">
            <div className={`flex items-center gap-3 ${showCollapsed ? 'justify-center' : 'px-4 py-3'}`}>
              <div
                className="w-10 h-10 bg-[#DC2626] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                title={showCollapsed ? `${user.profile?.fullName || user.email} - ${roleLabel}` : undefined}
              >
                {user.profile?.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              {!showCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {user.profile?.fullName || user.email}
                  </p>
                  <p className="text-white/60 text-xs">{roleLabel}</p>
                </div>
              )}
            </div>
            <form action={signOut}>
              <button
                type="submit"
                title={showCollapsed ? 'Cerrar sesión' : undefined}
                className={`
                  w-full mt-2 flex items-center gap-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors relative group
                  ${showCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-2 justify-center'}
                `}
              >
                {icons.logout}
                {!showCollapsed && <span>Cerrar sesión</span>}

                {/* Tooltip para modo colapsado */}
                {showCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    Cerrar sesión
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  );
}
