// ¿Qué? Cabecera del sidebar con logo, nombre del sistema y botón de colapsar.
// ¿Para qué? Mostrar la marca e identidad visual de TriDa y permitir colapsar/expandir el sidebar.
// ¿Impacto? Se usa exclusivamente dentro de Sidebar.tsx. Soporta teclado y responsive.

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Tooltip } from '@components/ui/Tooltip';

// ==============================================================================
// TYPES
// ==============================================================================

export interface SidebarBrandProps {
  collapsed: boolean;
  onToggle: () => void;
  logoSrc?: string;
  brandName?: string;
  tagline?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function SidebarBrand({
  collapsed,
  onToggle,
  logoSrc = '/logo.png',
  brandName = 'TriDa',
  tagline = 'Fraud Detection AI',
}: SidebarBrandProps) {
  return (
    <div
      className={`sidebar-brand relative flex min-h-[68px] items-center border-b border-[var(--border)] font-sans ${
        collapsed ? 'justify-center p-3' : 'justify-between gap-2.5 p-4'
      }`}
    >
      {/* Modo expandido: logo + textos */}
      {!collapsed && (
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <img
            src={logoSrc}
            alt={brandName}
            className="h-8 w-8 shrink-0 object-contain rounded-lg"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-base font-extrabold leading-none tracking-tight text-[var(--text-primary)]">
              {brandName}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              {tagline}
            </span>
          </div>
        </div>
      )}

      {/* Modo colapsado: solo logo */}
      {collapsed && (
        <img
          src={logoSrc}
          alt={brandName}
          className="h-7 w-7 shrink-0 object-contain rounded-lg"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      {/* Botón de colapsar/expandir con tooltip */}
      <Tooltip
        content={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        position={collapsed ? 'right' : 'bottom'}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          aria-expanded={!collapsed}
          className={`flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-tertiary)] transition-colors duration-150 outline-none hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] focus-visible:shadow-[var(--focus-ring)] ${
            collapsed
              ? 'absolute -bottom-3.5 right-1/2 z-10 h-7 w-7 translate-x-1/2 bg-[var(--bg-secondary)]'
              : 'h-7 w-7 shrink-0 bg-transparent'
          }`}
        >
          {collapsed ? <PanelLeftOpen size={14} aria-hidden="true" /> : <PanelLeftClose size={14} aria-hidden="true" />}
        </button>
      </Tooltip>
    </div>
  );
}