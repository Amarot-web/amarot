'use client';

import { useState, useEffect } from 'react';
import { useSidebar } from './SidebarContext';

export default function PanelMain({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);

  // Detectar si estamos en desktop (lg breakpoint = 1024px)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Solo colapsar en desktop
  const showCollapsed = isCollapsed && isDesktop;

  return (
    <main
      className={`transition-all duration-300 ${
        showCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}
    >
      <div className="p-6">{children}</div>
    </main>
  );
}
