// ¿Qué? Componente de paginación con navegación, info de rango y números de página.
// ¿Para qué? Paginación consistente en todas las tablas y listados del sistema.
// ¿Impacto? Todas las tablas y listados paginados usan este componente.

import { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Modos de visualización de la paginación. */
export type PaginationMode = 'compact' | 'full' | 'numbers';

/** Props del componente Pagination. */
export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  mode?: PaginationMode;
  maxVisiblePages?: number;
  showFirstLast?: boolean;
  showRangeInfo?: boolean;
  centered?: boolean;
  className?: string;
}

// ==============================================================================
// HELPERS
// ==============================================================================

/**
 * Genera el rango de números de página con ellipsis.
 */
function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number
): (number | 'ellipsis')[] {
  if (totalPages <= maxVisible + 2) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: (number | 'ellipsis')[] = [];
  const half = Math.floor(maxVisible / 2);

  pages.push(0);

  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages - 2, currentPage + half);

  if (currentPage <= half) {
    end = maxVisible - 1;
  }
  if (currentPage >= totalPages - 1 - half) {
    start = totalPages - maxVisible;
  }

  if (start > 1) pages.push('ellipsis');

  for (let i = start; i <= end; i++) {
    if (i > 0 && i < totalPages - 1) pages.push(i);
  }

  if (end < totalPages - 2) pages.push('ellipsis');

  if (totalPages > 1) pages.push(totalPages - 1);

  return pages;
}

/**
 * Calcula el rango de items visibles.
 */
function getRangeText(page: number, pageSize: number, totalItems: number): string {
  if (totalItems === 0) return 'Sin resultados';
  const start = page * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalItems);
  return `Mostrando ${start.toLocaleString('es-CO')}-${end.toLocaleString('es-CO')} de ${totalItems.toLocaleString('es-CO')}`;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function Pagination({
  page,
  totalPages,
  totalItems = 0,
  pageSize = 30,
  onPageChange,
  mode = 'full',
  maxVisiblePages = 5,
  showFirstLast = true,
  showRangeInfo = true,
  centered = false,
  className = '',
}: PaginationProps) {
  const hasNextPage = page < totalPages - 1;
  const hasPreviousPage = page > 0;
  const isFirstPage = page === 0;
  const isLastPage = page === totalPages - 1;

  const pageNumbers = useMemo(
    () => getPageNumbers(page, totalPages, maxVisiblePages),
    [page, totalPages, maxVisiblePages]
  );

  const rangeText = useMemo(
    () => getRangeText(page, pageSize, totalItems),
    [page, pageSize, totalItems]
  );

  // Handlers
  const goToPage = (newPage: number): void => {
    const clamped = Math.max(0, Math.min(newPage, totalPages - 1));
    if (clamped !== page) onPageChange(clamped);
  };

  // No renderizar si no hay datos
  if (totalPages <= 1 && !showRangeInfo) return null;

  // ==============================================================================
  // RENDER — MODO COMPACT
  // ==============================================================================

  if (mode === 'compact') {
    return (
      <nav
        aria-label="Paginación"
        className={cn(
          'flex items-center gap-4 py-4 flex-wrap font-sans',
          centered ? 'justify-center' : 'justify-between',
          className
        )}
      >
        {showRangeInfo && (
          <span className="text-xs text-[var(--text-tertiary)] font-medium">
            {rangeText}
          </span>
        )}

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => goToPage(page - 1)}
            disabled={!hasPreviousPage}
            leftIcon={<ChevronLeft size={14} />}
            aria-label="Página anterior"
          >
            Anterior
          </Button>

          <span className="text-xs text-[var(--text-secondary)] font-semibold px-2">
            Página {page + 1} de {totalPages}
          </span>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => goToPage(page + 1)}
            disabled={!hasNextPage}
            rightIcon={<ChevronRight size={14} />}
            aria-label="Página siguiente"
          >
            Siguiente
          </Button>
        </div>
      </nav>
    );
  }

  // ==============================================================================
  // RENDER — MODO FULL / NUMBERS
  // ==============================================================================

  return (
    <nav
      aria-label="Paginación"
      className={cn(
        'flex items-center gap-4 py-4 flex-wrap font-sans',
        centered ? 'justify-center' : 'justify-between',
        className
      )}
    >
      {showRangeInfo && (
        <span className="text-xs text-[var(--text-tertiary)] font-medium">
          {rangeText}
        </span>
      )}

      <div className="flex items-center gap-1">
        {/* Primera página */}
        {showFirstLast && (
          <button
            type="button"
            onClick={() => goToPage(0)}
            disabled={isFirstPage}
            className={cn(
              'flex items-center justify-center',
              'w-8 h-8 rounded-md border text-xs font-medium',
              'border-[var(--border)] text-[var(--text-secondary)]',
              'transition-colors duration-150',
              isFirstPage
                ? 'opacity-40 cursor-not-allowed'
                : 'cursor-pointer hover:bg-[var(--bg-tertiary)]'
            )}
            aria-label="Ir a la primera página"
            title="Primera página"
          >
            <ChevronsLeft size={14} />
          </button>
        )}

        {/* Anterior */}
        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={!hasPreviousPage}
          className={cn(
            'flex items-center justify-center',
            'w-8 h-8 rounded-md border text-xs font-medium',
            'border-[var(--border)] text-[var(--text-secondary)]',
            'transition-colors duration-150',
            !hasPreviousPage
              ? 'opacity-40 cursor-not-allowed'
              : 'cursor-pointer hover:bg-[var(--bg-tertiary)]'
          )}
          aria-label="Página anterior"
          title="Anterior"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Números de página */}
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-xs text-[var(--text-tertiary)]"
                aria-hidden="true"
              >
                …
              </span>
            );
          }

          const isActive = pageNum === page;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => goToPage(pageNum)}
              className={cn(
                'flex items-center justify-center',
                'min-w-[32px] h-8 px-2 rounded-md border',
                'text-xs font-medium',
                'transition-colors duration-150 cursor-pointer',
                isActive
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              )}
              aria-label={`Página ${pageNum + 1}${isActive ? ' (actual)' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum + 1}
            </button>
          );
        })}

        {/* Siguiente */}
        <button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={!hasNextPage}
          className={cn(
            'flex items-center justify-center',
            'w-8 h-8 rounded-md border text-xs font-medium',
            'border-[var(--border)] text-[var(--text-secondary)]',
            'transition-colors duration-150',
            !hasNextPage
              ? 'opacity-40 cursor-not-allowed'
              : 'cursor-pointer hover:bg-[var(--bg-tertiary)]'
          )}
          aria-label="Página siguiente"
          title="Siguiente"
        >
          <ChevronRight size={14} />
        </button>

        {/* Última página */}
        {showFirstLast && (
          <button
            type="button"
            onClick={() => goToPage(totalPages - 1)}
            disabled={isLastPage}
            className={cn(
              'flex items-center justify-center',
              'w-8 h-8 rounded-md border text-xs font-medium',
              'border-[var(--border)] text-[var(--text-secondary)]',
              'transition-colors duration-150',
              isLastPage
                ? 'opacity-40 cursor-not-allowed'
                : 'cursor-pointer hover:bg-[var(--bg-tertiary)]'
            )}
            aria-label="Ir a la última página"
            title="Última página"
          >
            <ChevronsRight size={14} />
          </button>
        )}
      </div>
    </nav>
  );
}