// ¿Qué? Tabla genérica reutilizable con sort, selección y estados de carga.
// ¿Para qué? Tabla consistente en Alerts, Transactions, Users y Settings.
// ¿Impacto? Todas las tablas del sistema usan este componente.

import { useMemo, type ReactNode, type CSSProperties } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Dirección del ordenamiento. */
export type SortDirection = 'asc' | 'desc';

/** Configuración de ordenamiento actual. */
export interface SortConfig<T> {
  field: keyof T | string;
  direction: SortDirection;
}

/** Definición de una columna. */
export interface DataTableColumn<T> {
  key: string;
  label: ReactNode;
  render: (item: T, index: number) => ReactNode;
  sortable?: boolean;
  sortAccessor?: (item: T) => string | number | Date | null | undefined;
  align?: 'left' | 'center' | 'right';
  width?: string;
  minWidth?: string;
  headerStyle?: CSSProperties;
  cellStyle?: CSSProperties;
  headerClassName?: string;
  cellClassName?: string;
}

/** Props del DataTable. */
export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (item: T, index: number) => string | number;
  sort?: SortConfig<T>;
  onSortChange?: (sort: SortConfig<T>) => void;
  onRowClick?: (item: T, index: number) => void;
  selectedRow?: T | null;
  isRowSelected?: (item: T) => boolean;
  loading?: boolean;
  emptyMessage?: string;
  emptyComponent?: ReactNode;
  getRowClassName?: (item: T, index: number) => string;
  getRowStyle?: (item: T, index: number) => CSSProperties;
  bordered?: boolean;
  hoverable?: boolean;
  autoSort?: boolean;
  className?: string;
}

// ==============================================================================
// CLASES DE ALINEACIÓN
// ==============================================================================

const ALIGN_CLASSES: Record<string, string> = {
  left:   'text-left',
  center: 'text-center',
  right:  'text-right',
};

// ==============================================================================
// HELPERS
// ==============================================================================

function sortData<T>(
  data: T[],
  sort: SortConfig<T>,
  columns: DataTableColumn<T>[]
): T[] {
  const column = columns.find((col) => col.key === sort.field);
  if (!column) return data;

  const accessor = column.sortAccessor
    ?? ((item: T) => (item as Record<string, unknown>)[sort.field as string]);
  const modifier = sort.direction === 'asc' ? 1 : -1;

  return [...data].sort((a, b) => {
    const aVal = accessor(a);
    const bVal = accessor(b);

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (aVal instanceof Date && bVal instanceof Date) {
      return (aVal.getTime() - bVal.getTime()) * modifier;
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * modifier;
    }

    return String(aVal).localeCompare(String(bVal), 'es', {
      numeric: true,
      sensitivity: 'base',
    }) * modifier;
  });
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  sort,
  onSortChange,
  onRowClick,
  selectedRow,
  isRowSelected,
  loading = false,
  emptyMessage,
  emptyComponent,
  getRowClassName,
  getRowStyle,
  bordered = true,
  hoverable = true,
  autoSort = false,
  className = '',
}: DataTableProps<T>) {

  // Sort
  const sortedData = useMemo(() => {
    if (!autoSort || !sort) return data;
    return sortData(data, sort, columns);
  }, [data, sort, columns, autoSort]);

  const handleSort = (columnKey: string): void => {
    if (!onSortChange) return;
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    if (sort?.field === columnKey) {
      onSortChange({
        field: columnKey,
        direction: sort.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onSortChange({ field: columnKey, direction: 'desc' });
    }
  };

  // Selección
  const checkIsSelected = (item: T): boolean => {
    if (isRowSelected) return isRowSelected(item);
    if (selectedRow) return item === selectedRow;
    return false;
  };

  // Loading
  if (loading) {
    return (
      <div
        className={cn(
          'w-full rounded-lg bg-[var(--bg-secondary)]',
          bordered && 'border border-[var(--border)]',
          className
        )}
      >
        <div className="py-[60px] px-5 flex justify-center">
          <Spinner size="lg" label="Cargando datos..." centered />
        </div>
      </div>
    );
  }

  // Empty
  if (data.length === 0) {
    return (
      <div
        className={cn(
          'w-full rounded-lg bg-[var(--bg-secondary)]',
          bordered && 'border border-[var(--border)]',
          className
        )}
      >
        <div className="py-10 px-5">
          {emptyComponent ?? (
            <EmptyState
              preset="no-data"
              description={emptyMessage ?? 'No hay datos para mostrar.'}
            />
          )}
        </div>
      </div>
    );
  }

  // Tabla
  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-lg bg-[var(--bg-secondary)]',
        bordered && 'border border-[var(--border)]',
        className
      )}
    >
      <table className="w-full border-collapse font-sans text-[13px]">
        {/* HEADER */}
        <thead>
          <tr className={cn(
            'bg-[var(--bg-tertiary)]',
            bordered && 'border-b border-[var(--border)]'
          )}>
            {columns.map((col) => {
              const isSorted = sort?.field === col.key;
              const sortDirection = isSorted ? sort?.direction : null;

              return (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 font-bold text-[11px] uppercase tracking-wider',
                    'text-[var(--text-secondary)] select-none whitespace-nowrap',
                    ALIGN_CLASSES[col.align ?? 'left'],
                    col.sortable && 'cursor-pointer',
                    col.headerClassName
                  )}
                  style={{
                    width: col.width,
                    minWidth: col.minWidth,
                    ...col.headerStyle,
                  }}
                  onClick={() => col.sortable && handleSort(col.key)}
                  aria-sort={
                    isSorted
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : col.sortable ? 'none' : undefined
                  }
                  role={col.sortable ? 'button' : undefined}
                  tabIndex={col.sortable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (col.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(col.key);
                    }
                  }}
                >
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 w-full',
                      col.align === 'right' && 'justify-end',
                      col.align === 'center' && 'justify-center',
                      (!col.align || col.align === 'left') && 'justify-start'
                    )}
                  >
                    {col.label}
                    {col.sortable && (
                      <span className="inline-flex items-center ml-1.5">
                        {sortDirection === 'asc' && <ArrowUp size={11} />}
                        {sortDirection === 'desc' && <ArrowDown size={11} />}
                        {!sortDirection && <ArrowUpDown size={11} className="opacity-40" />}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {sortedData.map((item, index) => {
            const isSelected = checkIsSelected(item);
            const isClickable = Boolean(onRowClick);
            const rowKey = getRowKey(item, index);
            const customClass = getRowClassName?.(item, index) ?? '';
            const customStyle = getRowStyle?.(item, index) ?? {};

            return (
              <tr
                key={rowKey}
                className={cn(
                  'transition-colors duration-150',
                  bordered && 'border-b border-[var(--border)]',
                  isSelected && 'bg-[var(--color-primary)]/[0.08]',
                  isClickable && 'cursor-pointer',
                  hoverable && !isSelected && 'hover:bg-[var(--bg-tertiary)]',
                  customClass
                )}
                style={customStyle}
                onClick={() => onRowClick?.(item, index)}
                aria-selected={isSelected}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-[var(--text-primary)]',
                      ALIGN_CLASSES[col.align ?? 'left'],
                      col.cellClassName
                    )}
                    style={col.cellStyle}
                  >
                    {col.render(item, index)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}