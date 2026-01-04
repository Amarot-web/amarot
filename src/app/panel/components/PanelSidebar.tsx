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

// Tipos para la navegación jerárquica
interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  permission?: PermissionName;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  permission?: PermissionName;
  items: NavItem[];
  defaultExpanded?: boolean;
}

// ============================================
// ICONOS SVG
// ============================================
const icons = {
  // Navegación principal
  dashboard: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
    </svg>
  ),
  // CRM
  crm: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  pipeline: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  alert: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  clients: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  messages: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  // Ventas
  sales: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  quotations: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  // Contenido
  content: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  blog: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  // Administración
  admin: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  team: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  analytics: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  ),
  // UI
  external: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  chevron: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
};

// ============================================
// CONFIGURACIÓN DE NAVEGACIÓN POR MÓDULOS
// ============================================
const navigationGroups: NavGroup[] = [
  {
    id: 'crm',
    label: 'CRM',
    icon: icons.crm,
    permission: 'quotations:view',
    defaultExpanded: true,
    items: [
      { name: 'Pipeline', href: '/panel/crm', icon: icons.pipeline, permission: 'quotations:view' },
      { name: 'Alertas', href: '/panel/crm/alertas', icon: icons.alert, permission: 'quotations:view' },
      { name: 'Clientes', href: '/panel/clientes', icon: icons.clients, permission: 'clients:view' },
      { name: 'Mensajes', href: '/panel/mensajes', icon: icons.messages, permission: 'clients:view' },
    ],
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: icons.sales,
    permission: 'quotations:view',
    items: [
      { name: 'Cotizaciones', href: '/panel/cotizador', icon: icons.quotations, permission: 'quotations:view' },
    ],
  },
  {
    id: 'contenido',
    label: 'Contenido',
    icon: icons.content,
    permission: 'blog:view',
    items: [
      { name: 'Blog', href: '/panel/blog', icon: icons.blog, permission: 'blog:view' },
    ],
  },
  {
    id: 'admin',
    label: 'Administración',
    icon: icons.admin,
    permission: 'team:view',
    items: [
      { name: 'Equipo', href: '/panel/equipo', icon: icons.team, permission: 'team:view' },
      { name: 'Analytics', href: '/panel/analytics', icon: icons.analytics, permission: 'analytics:view' },
      { name: 'Configuración', href: '/panel/configuracion', icon: icons.settings, permission: 'team:view' },
    ],
  },
];

// Items de configuración CRM (aparecen al final del grupo CRM cuando está expandido)
const crmConfigItems: NavItem[] = [
  { name: 'Asignación', href: '/panel/crm/configuracion/asignacion', icon: icons.settings, permission: 'team:view' },
  { name: 'Plantillas Email', href: '/panel/crm/configuracion/plantillas', icon: icons.settings, permission: 'team:view' },
  { name: 'Config. Alertas', href: '/panel/crm/configuracion/alertas', icon: icons.settings, permission: 'team:view' },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function PanelSidebar({ user }: PanelSidebarProps) {
  const pathname = usePathname();
  const { hasPermission, isAdmin } = usePermissions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['crm']));

  // Detectar si estamos en desktop
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Expandir automáticamente el grupo que contiene la ruta actual
  useEffect(() => {
    const currentGroup = navigationGroups.find((group) =>
      group.items.some((item) => pathname.startsWith(item.href))
    );
    if (currentGroup) {
      setExpandedGroups((prev) => new Set([...prev, currentGroup.id]));
    }
    // También verificar si es config CRM
    if (pathname.startsWith('/panel/crm/configuracion')) {
      setExpandedGroups((prev) => new Set([...prev, 'crm']));
    }
  }, [pathname]);

  const showCollapsed = isCollapsed && isDesktop;

  const isActive = (href: string) => {
    if (href === '/panel/dashboard') {
      return pathname === '/panel/dashboard' || pathname === '/panel';
    }
    if (href === '/panel/crm') {
      return pathname === '/panel/crm' || pathname === '/panel/crm/leads';
    }
    return pathname.startsWith(href);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const canAccessItem = (item: NavItem) => {
    if (!item.permission) return true;
    return isAdmin || hasPermission(item.permission);
  };

  const canAccessGroup = (group: NavGroup) => {
    if (!group.permission) return true;
    if (isAdmin) return true;
    return hasPermission(group.permission) || group.items.some(canAccessItem);
  };

  const roleLabel = user.role ? ROLE_LABELS[user.role] : 'Miembro';

  // Renderizar item de navegación
  const renderNavItem = (item: NavItem, isNested = false) => {
    if (!canAccessItem(item)) return null;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileMenuOpen(false)}
        title={showCollapsed ? item.name : undefined}
        className={`
          flex items-center gap-3 rounded-md transition-all duration-150 relative group
          ${showCollapsed ? 'px-3 py-2.5 justify-center' : isNested ? 'px-3 py-2 ml-7' : 'px-3 py-2.5'}
          ${isActive(item.href)
            ? 'bg-white/10 text-white'
            : 'text-white/60 hover:bg-white/5 hover:text-white/90'
          }
        `}
      >
        <span className={`${isActive(item.href) ? 'text-[#DC2626]' : ''}`}>
          {item.icon}
        </span>
        {!showCollapsed && (
          <span className={`text-sm ${isNested ? 'text-[13px]' : 'font-medium'}`}>
            {item.name}
          </span>
        )}
        {item.badge && item.badge > 0 && (
          <span className="ml-auto bg-[#DC2626] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {item.badge}
          </span>
        )}
        {/* Tooltip para modo colapsado */}
        {showCollapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
            {item.name}
          </div>
        )}
      </Link>
    );
  };

  // Renderizar item del flyout (modo colapsado)
  const renderFlyoutItem = (item: NavItem) => {
    if (!canAccessItem(item)) return null;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileMenuOpen(false)}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150
          ${isActive(item.href)
            ? 'bg-white/10 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
          }
        `}
      >
        <span className={`${isActive(item.href) ? 'text-[#DC2626]' : ''}`}>
          {item.icon}
        </span>
        <span className="text-sm">{item.name}</span>
      </Link>
    );
  };

  // Renderizar grupo de navegación
  const renderNavGroup = (group: NavGroup) => {
    if (!canAccessGroup(group)) return null;

    const isExpanded = expandedGroups.has(group.id);
    const hasActiveItem = group.items.some((item) => isActive(item.href)) ||
      (group.id === 'crm' && crmConfigItems.some((item) => isActive(item.href)));
    const visibleItems = group.items.filter(canAccessItem);
    const visibleConfigItems = group.id === 'crm' ? crmConfigItems.filter(canAccessItem) : [];

    if (visibleItems.length === 0) return null;

    return (
      <div key={group.id} className="mb-1 relative group/nav">
        {/* Header del grupo */}
        <button
          onClick={() => !showCollapsed && toggleGroup(group.id)}
          className={`
            w-full flex items-center gap-3 rounded-md transition-all duration-150
            ${showCollapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2.5'}
            ${hasActiveItem
              ? 'bg-white/10 text-white'
              : 'text-white/70 hover:bg-white/5 hover:text-white'
            }
          `}
        >
          <span className={hasActiveItem ? 'text-[#DC2626]' : ''}>
            {group.icon}
          </span>
          {!showCollapsed && (
            <>
              <span className="font-semibold text-sm tracking-wide">{group.label}</span>
              <span
                className={`ml-auto transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              >
                {icons.chevron}
              </span>
            </>
          )}
        </button>

        {/* Flyout menu para modo colapsado */}
        {showCollapsed && (
          <div className="absolute left-full top-0 ml-2 py-2 bg-[#1e293b] rounded-lg shadow-xl border border-white/10 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-150 z-50 min-w-[200px]">
            {/* Header del flyout */}
            <div className="px-3 pb-2 mb-1 border-b border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                {group.label}
              </span>
            </div>
            {/* Items */}
            <div className="space-y-0.5 px-1">
              {visibleItems.map(renderFlyoutItem)}

              {/* Configuración CRM en flyout */}
              {visibleConfigItems.length > 0 && (
                <>
                  <div className="mx-2 my-2 border-t border-white/10" />
                  <div className="px-2 py-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Configuración
                    </span>
                  </div>
                  {visibleConfigItems.map(renderFlyoutItem)}
                </>
              )}
            </div>
          </div>
        )}

        {/* Items del grupo (expandidos - modo normal) */}
        {!showCollapsed && (
          <div
            className={`overflow-hidden transition-all duration-200 ${
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="pt-1 space-y-0.5">
              {visibleItems.map((item) => renderNavItem(item, true))}

              {/* Configuración CRM (separada visualmente) */}
              {visibleConfigItems.length > 0 && (
                <>
                  <div className="mx-3 my-2 border-t border-white/10" />
                  <div className="px-3 py-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Configuración
                    </span>
                  </div>
                  {visibleConfigItems.map((item) => renderNavItem(item, true))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Image src="/images/logo.png" alt="AMAROT" width={120} height={40} />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
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

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full bg-[#0f172a] transform transition-all duration-300 ease-out
          lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
          ${showCollapsed ? 'lg:w-[72px] overflow-visible' : 'lg:w-64'}
        `}
      >
        {/* Toggle button */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 z-50 w-6 h-6 bg-[#1e293b] border border-white/10 rounded-full items-center justify-center text-white/50 hover:text-white hover:bg-[#334155] transition-all"
          title={isCollapsed ? 'Expandir' : 'Colapsar'}
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-300 ${showCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className={`flex flex-col h-full ${showCollapsed ? 'overflow-visible' : ''}`}>
          {/* Logo */}
          <div className={`border-b border-white/10 ${showCollapsed ? 'p-3' : 'p-5'}`}>
            <Link href="/" className="block">
              {showCollapsed ? (
                <div className="w-11 h-11 mx-auto bg-gradient-to-br from-[#DC2626] to-[#991b1b] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-900/20">
                  A
                </div>
              ) : (
                <Image
                  src="/images/logo-blanco.png"
                  alt="AMAROT"
                  width={160}
                  height={50}
                  className="mx-auto"
                />
              )}
            </Link>
          </div>

          {/* Dashboard (siempre visible arriba) */}
          <div className={`${showCollapsed ? 'px-2 pt-3' : 'px-3 pt-4'}`}>
            {renderNavItem({
              name: 'Dashboard',
              href: '/panel/dashboard',
              icon: icons.dashboard,
            })}
          </div>

          {/* Separador */}
          {!showCollapsed && (
            <div className="px-5 py-3">
              <div className="border-t border-white/10" />
            </div>
          )}

          {/* Grupos de navegación */}
          <nav className={`flex-1 ${showCollapsed ? 'px-2 overflow-visible' : 'px-3 overflow-y-auto'} space-y-1`}>
            {navigationGroups.map(renderNavGroup)}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10">
            {/* Link externo */}
            <div className={showCollapsed ? 'px-2 py-2' : 'px-3 py-2'}>
              <Link
                href="/"
                target="_blank"
                title={showCollapsed ? 'Ver sitio web' : undefined}
                className={`
                  flex items-center gap-3 rounded-md text-white/50 hover:bg-white/5 hover:text-white/80 transition-all relative group
                  ${showCollapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2'}
                `}
              >
                {icons.external}
                {!showCollapsed && <span className="text-sm">Ver sitio web</span>}
                {showCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                    Ver sitio web
                  </div>
                )}
              </Link>
            </div>

            {/* Usuario */}
            <div className={`border-t border-white/10 ${showCollapsed ? 'p-2' : 'p-3'}`}>
              <div className={`flex items-center gap-3 ${showCollapsed ? 'justify-center' : 'px-2 py-2'}`}>
                <div
                  className="w-9 h-9 bg-gradient-to-br from-[#DC2626] to-[#991b1b] rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-lg shadow-red-900/20"
                  title={showCollapsed ? `${user.profile?.fullName || user.email} - ${roleLabel}` : undefined}
                >
                  {user.profile?.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                {!showCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {user.profile?.fullName || user.email}
                    </p>
                    <p className="text-white/40 text-xs">{roleLabel}</p>
                  </div>
                )}
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  title={showCollapsed ? 'Cerrar sesión' : undefined}
                  className={`
                    w-full mt-2 flex items-center gap-2 rounded-md text-white/50 hover:bg-white/5 hover:text-white/80 transition-all relative group
                    ${showCollapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2 justify-center'}
                  `}
                >
                  {icons.logout}
                  {!showCollapsed && <span className="text-sm">Cerrar sesión</span>}
                  {showCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                      Cerrar sesión
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  );
}
