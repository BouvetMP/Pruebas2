// ¿Qué? Sidebar principal que orquesta brand, banco, nav, perfil y footer.
// ¿Para qué? Navegación global con colapso en desktop y drawer en móvil (Día 6).
// ¿Impacto? Usado en AppLayout; conteos ligeros sin pageSize 1000.

import { useEffect, useState } from 'react';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { useAlerts } from '@hooks/useAlerts';
import { useBank } from '@context/BankContext';
import { getTransactionsCount } from '@api/Transacciones';
import { SidebarBrand } from './SidebarBrand';
import { SidebarBankSelector } from './SidebarBankSelector';
import { SidebarNav } from './SidebarNav';
import { SidebarUserProfile } from './SidebarUserProfile';
import { SidebarFooter } from './SidebarFooter';

// ==============================================================================
// TYPES
// ==============================================================================

export interface SidebarProps {
  defaultCollapsed?: boolean;
  persistCollapsedState?: boolean;
  className?: string;
  /** Día 6 — viewport móvil */
  isMobile?: boolean;
  /** Día 6 — drawer abierto */
  mobileOpen?: boolean;
  /** Día 6 — cerrar drawer (overlay / ruta / Escape) */
  onMobileClose?: () => void;
}

// ==============================================================================
// CONSTANTES
// ==============================================================================

const SIDEBAR_WIDTHS = {
  expanded: '240px',
  collapsed: '64px',
} as const;

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function Sidebar({
  defaultCollapsed = false,
  persistCollapsedState = true,
  className = '',
  isMobile = false,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const { selectedBank } = useBank();

  // ==============================================================================
  // ESTADO — Colapsado (desktop)
  // ==============================================================================

  const [collapsedLocal, setCollapsedLocal] = useState(defaultCollapsed);
  const [collapsedStored, setCollapsedStored] = useLocalStorage(
    'trida-sidebar-collapsed',
    defaultCollapsed,
  );

  const collapsedDesktop = persistCollapsedState ? collapsedStored : collapsedLocal;
  const setCollapsed = persistCollapsedState ? setCollapsedStored : setCollapsedLocal;

  // En móvil el drawer siempre se muestra expandido (labels visibles)
  const collapsed = isMobile ? false : collapsedDesktop;

  // ==============================================================================
  // ESTADO — LIVE
  // ==============================================================================

  const [isLive, setIsLive] = useLocalStorage('trida-sidebar-live', true);

  // ==============================================================================
  // DATOS — conteos ligeros (Día 6.4 / Día 4)
  // ==============================================================================

  const { counts: alertCounts } = useAlerts(selectedBank);
  const alertCount = (alertCounts.critical ?? 0) + (alertCounts.high ?? 0);

  const [totalTransactions, setTotalTransactions] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadCount = async (): Promise<void> => {
      try {
        const total = await getTransactionsCount(selectedBank);
        if (!cancelled) setTotalTransactions(total);
      } catch {
        if (!cancelled) setTotalTransactions(0);
      }
    };

    void loadCount();
    return () => {
      cancelled = true;
    };
  }, [selectedBank]);

  const transactionsPerSecond = isLive ? Math.floor(Math.random() * 8) + 3 : 0;

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleToggleCollapsed = (): void => {
    if (isMobile) {
      onMobileClose?.();
      return;
    }
    setCollapsed(!collapsedDesktop);
  };

  const handleToggleLive = (): void => {
    setIsLive(!isLive);
  };

  // ==============================================================================
  // CLASES / ANCHO
  // ==============================================================================

  const width = collapsed ? SIDEBAR_WIDTHS.collapsed : SIDEBAR_WIDTHS.expanded;

  const asideClass = [
    'sidebar flex h-screen shrink-0 flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--bg-secondary)] font-sans transition-[width,transform] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]',
    collapsed ? 'sidebar-collapsed' : 'sidebar-expanded',
    isMobile
      ? `fixed inset-y-0 left-0 z-50 w-[min(280px,85vw)] max-w-[280px] shadow-glow-lg ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`
      : 'sticky top-0 z-50',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <aside
      id="app-sidebar"
      className={asideClass}
      style={!isMobile ? { width } : undefined}
      aria-label="Barra lateral de navegación"
      aria-hidden={isMobile ? !mobileOpen : false}
    >
      <SidebarBrand collapsed={collapsed} onToggle={handleToggleCollapsed} />

      <SidebarBankSelector collapsed={collapsed} />

      <SidebarNav collapsed={collapsed} alertCount={alertCount} isLive={isLive} />

      <SidebarUserProfile collapsed={collapsed} />

      <SidebarFooter
        collapsed={collapsed}
        isLive={isLive}
        onToggleLive={handleToggleLive}
        totalTransactions={totalTransactions}
        transactionsPerSecond={transactionsPerSecond}
      />
    </aside>
  );
}