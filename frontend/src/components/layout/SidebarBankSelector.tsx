// ¿Qué? Selector de banco global con dropdown personalizado.
// ¿Para qué? Cambiar el filtro de banco activo que afecta a todo el sistema vía BankContext.
// ¿Impacto? Accesible 100% por teclado (Enter, Espacio, Escape) y adaptable al colapso del sidebar.

import { useRef, useState } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useClickOutside } from '@hooks/useClickOutside';
import { BankBadge } from '@components/shared/BankBadge';
import { Tooltip } from '@components/ui/Tooltip';

// ==============================================================================
// TYPES
// ==============================================================================

export interface SidebarBankSelectorProps {
  collapsed: boolean;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function SidebarBankSelector({ collapsed }: SidebarBankSelectorProps) {
  const { banksWithAll, selectedBank, selectedBankInfo, setSelectedBank, loading } = useBank();

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setOpen(false), {
    enabled: open,
    additionalRefs: [triggerRef],
  });

  // ==============================================================================
  // HANDLERS — Navegación y Teclado (Día 6 A11y)
  // ==============================================================================

  const handleSelectBank = (bankId: string): void => {
    setSelectedBank(bankId);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  // ==============================================================================
  // MODO COLAPSADO — Solo dot del banco actual
  // ==============================================================================

  if (collapsed) {
    return (
      <div className="sidebar-bank-selector sidebar-bank-selector-collapsed relative font-sans px-3 py-2">
        <Tooltip content={selectedBankInfo?.name ?? 'Sin banco seleccionado'} position="right">
          <div className="flex items-center justify-center w-full py-2">
            <BankBadge bank={selectedBankInfo} dotOnly size="md" />
          </div>
        </Tooltip>
      </div>
    );
  }

  // ==============================================================================
  // MODO EXPANDIDO — Botón con dropdown
  // ==============================================================================

  return (
    <div
      className="sidebar-bank-selector relative px-3 py-2.5 font-sans"
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Banco seleccionado: ${selectedBankInfo?.name ?? 'Ninguno'}. Click para cambiar.`}
        className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition-all duration-150 outline-none focus-visible:shadow-[var(--focus-ring)] ${
          open
            ? 'border-[var(--color-primary)] bg-[var(--bg-tertiary)]'
            : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'
        }`}
      >
        <Building2 size={13} className="shrink-0 text-[var(--text-tertiary)]" strokeWidth={1.8} />

        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{
              backgroundColor: selectedBankInfo?.color ?? '#6366F1',
              boxShadow: `0 0 0 2px ${selectedBankInfo?.color ?? '#6366F1'}20`,
            }}
            aria-hidden="true"
          />
          <span className="truncate text-left font-semibold text-[var(--text-primary)]">
            {selectedBankInfo?.name ?? 'Cargando...'}
          </span>
        </div>

        <ChevronDown
          size={13}
          className={`shrink-0 text-[var(--text-tertiary)] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown de opciones */}
      {open && (
        <div
          ref={dropdownRef as React.RefObject<HTMLDivElement>}
          role="listbox"
          aria-label="Lista de bancos disponibles"
          className="absolute left-3 right-3 top-[calc(100%+4px)] z-50 flex max-h-[340px] flex-col gap-0.5 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-1 shadow-glow-md animate-dropdown-in"
        >
          {loading && (
            <div className="p-3 text-center text-[11px] italic text-[var(--text-tertiary)]">
              Cargando bancos...
            </div>
          )}

          {!loading &&
            banksWithAll.map((bank) => {
              const isSelected = bank.id === selectedBank;

              return (
                <button
                  key={bank.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectBank(bank.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left font-sans text-xs font-medium text-[var(--text-primary)] transition-colors duration-150 outline-none hover:bg-[var(--bg-tertiary)] focus-visible:bg-[var(--bg-tertiary)] ${
                    isSelected ? 'bg-[var(--bg-tertiary)] font-bold' : 'bg-transparent'
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: bank.color,
                      boxShadow: `0 0 0 2px ${bank.color}20`,
                    }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate">{bank.name}</span>
                  {isSelected && <Check size={13} className="shrink-0 text-indigo-light" />}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}