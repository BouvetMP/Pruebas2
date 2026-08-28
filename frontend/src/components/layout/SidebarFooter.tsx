// ¿Qué? Footer del sidebar con reloj, indicador LIVE, métricas y toggle de tema.
// ¿Para qué? Mostrar el estado operacional del sistema en tiempo real y controles rápidos.
// ¿Impacto? 100% Tailwind; animaciones mediante clases del theme sin bloques <style> inline.

import { Sun, Moon, Clock } from 'lucide-react';
import { useTheme } from '@context/ThemeContext';
import { useFormattedClock } from '@hooks/useClock';
import { Tooltip } from '@components/ui/Tooltip';

// ==============================================================================
// TYPES
// ==============================================================================

export interface SidebarFooterProps {
  collapsed: boolean;
  isLive: boolean;
  onToggleLive?: () => void;
  totalTransactions?: number;
  transactionsPerSecond?: number;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function SidebarFooter({
  collapsed,
  isLive,
  onToggleLive,
  totalTransactions = 0,
  transactionsPerSecond = 0,
}: SidebarFooterProps) {
  const { theme, toggleTheme } = useTheme();
  const { time } = useFormattedClock({ intervalMs: 1000 });

  // ==============================================================================
  // MODO COLAPSADO — Solo íconos verticalizados
  // ==============================================================================

  if (collapsed) {
    return (
      <div className="sidebar-footer sidebar-footer-collapsed flex flex-col gap-2 border-t border-[var(--border)] p-2 font-sans">
        {/* Indicador LIVE */}
        <Tooltip content={isLive ? 'Sistema en vivo' : 'Sistema pausado'} position="right">
          <button
            type="button"
            onClick={onToggleLive}
            aria-label={isLive ? 'Sistema en vivo' : 'Sistema pausado'}
            aria-pressed={isLive}
            className={`flex w-full cursor-pointer items-center justify-center rounded-md border p-2 transition-colors duration-150 outline-none focus-visible:shadow-[var(--focus-ring)] ${
              isLive
                ? 'border-[rgba(6,214,160,0.25)] bg-[rgba(6,214,160,0.1)] text-neon-green'
                : 'border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isLive
                  ? 'animate-pulse-slow bg-neon-green shadow-[0_0_0_3px_rgba(6,214,160,0.2)]'
                  : 'bg-[var(--text-disabled)]'
              }`}
            />
          </button>
        </Tooltip>

        {/* Toggle de tema */}
        <Tooltip
          content={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          position="right"
        >
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            className="flex w-full cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-transparent p-2 text-[var(--text-tertiary)] transition-colors duration-150 outline-none hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] focus-visible:shadow-[var(--focus-ring)]"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </Tooltip>
      </div>
    );
  }

  // ==============================================================================
  // MODO EXPANDIDO — Reloj, LIVE, Métricas y Selector de tema
  // ==============================================================================

  return (
    <div className="sidebar-footer flex flex-col gap-2 border-t border-[var(--border)] p-3 font-sans">
      {/* Fila 1: Reloj + LIVE */}
      <div className="flex items-center gap-1.5">
        <div className="flex flex-1 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-2.5 py-1.5 text-[11px] font-semibold tabular-nums text-[var(--text-secondary)]">
          <Clock size={10} strokeWidth={2} className="shrink-0" />
          <span className="truncate">{time}</span>
        </div>

        <button
          type="button"
          onClick={onToggleLive}
          disabled={!onToggleLive}
          aria-label={
            isLive ? 'Sistema en vivo. Click para pausar' : 'Sistema pausado. Click para reanudar'
          }
          aria-pressed={isLive}
          className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-sans text-[10px] font-bold tracking-wider transition-all duration-150 outline-none focus-visible:shadow-[var(--focus-ring)] ${
            isLive
              ? 'border-[rgba(6,214,160,0.25)] bg-[rgba(6,214,160,0.1)] text-neon-green'
              : 'border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full shrink-0 ${
              isLive
                ? 'animate-pulse-slow bg-neon-green shadow-[0_0_0_3px_rgba(6,214,160,0.2)]'
                : 'bg-[var(--text-disabled)]'
            }`}
          />
          <span>{isLive ? 'LIVE' : 'OFF'}</span>
        </button>
      </div>

      {/* Fila 2: Métricas de transacciones */}
      <div className="flex items-center justify-between px-1 py-1 text-[11px] tabular-nums text-[var(--text-tertiary)]">
        <span>
          <span className="font-bold text-[var(--text-secondary)]">
            {totalTransactions.toLocaleString('es-CO')}
          </span>{' '}
          TXN
        </span>
        <span>
          <span className="font-bold text-[var(--text-secondary)]">
            {isLive ? transactionsPerSecond : 0}
          </span>
          /s
        </span>
      </div>

      {/* Fila 3: Toggle de tema */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-transparent px-3 py-1.5 font-sans text-xs font-semibold text-[var(--text-secondary)] transition-colors duration-150 outline-none hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] focus-visible:shadow-[var(--focus-ring)]"
      >
        {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
        <span>Tema {theme === 'dark' ? 'claro' : 'oscuro'}</span>
      </button>
    </div>
  );
}