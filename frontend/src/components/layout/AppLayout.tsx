// ¿Qué? Layout principal autenticado: Sidebar + contenido + menú móvil.
// ¿Para qué? Orquestar navegación persistente con Outlet y soporte responsive (<900px).
// ¿Impacto? Todas las rutas privadas; en móvil el sidebar es off-canvas con overlay.

import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';

// ==============================================================================
// TYPES
// ==============================================================================

export interface AppLayoutProps {
  showSidebar?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const MOBILE_BREAKPOINT = 900;

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function AppLayout({ showSidebar = true, children, className = '' }: AppLayoutProps) {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  // ==============================================================================
  // RESPONSIVE
  // ==============================================================================

  useEffect(() => {
    const onResize = (): void => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Cerrar drawer al cambiar de ruta (móvil)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Scroll al top al cambiar ruta
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Bloquear scroll del body con drawer abierto
  useEffect(() => {
    if (!isMobile || !mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);

  // Escape cierra el menú móvil
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeMobile();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, closeMobile]);

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`app-layout flex min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] ${className}`}
    >
      {/* Overlay móvil */}
      {showSidebar && isMobile && mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-pointer border-none bg-black/55 backdrop-blur-[2px] animate-fade-in"
          aria-label="Cerrar menú de navegación"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          isMobile={isMobile}
          mobileOpen={mobileOpen}
          onMobileClose={closeMobile}
        />
      )}

      {/* Contenido principal */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Top bar móvil */}
        {showSidebar && isMobile && (
          <div className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-secondary)] px-3">
            <button
              type="button"
              onClick={mobileOpen ? closeMobile : openMobile}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-elevated)] focus-visible:shadow-[var(--focus-ring)]"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
              aria-controls="app-sidebar"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              TriDa
            </span>
          </div>
        )}

        <main
          ref={mainRef}
          className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto"
          role="main"
          aria-label="Contenido principal"
        >
          <div className="flex min-h-0 flex-1 flex-col">{children ?? <Outlet />}</div>
        </main>
      </div>
    </div>
  );
}