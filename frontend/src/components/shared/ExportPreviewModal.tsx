// ¿Qué? Modal que muestra vista previa de los datos antes de exportar.
// ¿Para qué? Preview consistente antes de descargar en Alerts y Transactions.
// ¿Impacto? Todos los previews de exportación usan este modal.

import { useMemo } from 'react';
import { Eye, FileSpreadsheet, FileText, FileJson } from 'lucide-react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/ui/EmptyState';
import { cn } from '@utils/cn';
import type { ExportFormat, ExportMetadata } from '@app-types/index';
import type { DataTableColumn } from './DataTable';

// ==============================================================================
// TYPES
// ==============================================================================

/** Props del ExportPreviewModal. */
export interface ExportPreviewModalProps<T> {
  open: boolean;
  onClose: () => void;
  preview: ExportMetadata | null;
  onDownload: (format: ExportFormat) => void;
  columns: DataTableColumn<T>[];
  title?: string;
  description?: string;
  downloading?: boolean;
}

// ==============================================================================
// HELPERS
// ==============================================================================

function getFormatMeta(format: ExportFormat): { icon: React.ReactNode; label: string } {
  switch (format) {
    case 'csv':  return { icon: <FileSpreadsheet size={14} />, label: 'CSV' };
    case 'pdf':  return { icon: <FileText size={14} />,        label: 'PDF' };
    case 'json': return { icon: <FileJson size={14} />,        label: 'JSON' };
    case 'xlsx': return { icon: <FileSpreadsheet size={14} />, label: 'Excel' };
    default:     return { icon: <FileText size={14} />,        label: String(format).toUpperCase() };
  }
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ExportPreviewModal<T>({
  open,
  onClose,
  preview,
  onDownload,
  columns,
  title,
  description,
  downloading = false,
}: ExportPreviewModalProps<T>) {

  const formatMeta = useMemo(
    () => preview ? getFormatMeta(preview.format) : null,
    [preview]
  );

  const modalTitle = title ?? (
    formatMeta ? `Vista previa — ${formatMeta.label}` : 'Vista previa de exportación'
  );

  const modalDescription = description ?? (
    preview ? `${preview.count.toLocaleString('es-CO')} registros serán exportados` : undefined
  );

  const sampleData = (preview?.sample ?? []) as T[];
  const showingCount = sampleData.length;
  const totalCount = preview?.count ?? 0;
  const hasMore = totalCount > showingCount;

  const handleDownload = (): void => {
    if (!preview) return;
    onDownload(preview.format);
  };

  if (!preview) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      description={modalDescription}
      size="xl"
      disableClose={downloading}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={downloading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            leftIcon={formatMeta?.icon}
            onClick={handleDownload}
            loading={downloading}
          >
            Descargar {formatMeta?.label}
          </Button>
        </>
      }
    >
      {/* Barra de info */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-[var(--bg-tertiary)] rounded-md mb-3 text-xs text-[var(--text-secondary)] font-medium">
        <div className="flex items-center gap-1.5">
          <Eye size={13} />
          <span>Mostrando primeros {showingCount} registros</span>
        </div>
        <span className="px-2 py-0.5 bg-[var(--color-primary)]/15 text-[var(--color-primary-light)] rounded text-[11px] font-bold tabular-nums">
          Total: {totalCount.toLocaleString('es-CO')}
        </span>
      </div>

      {/* Tabla de preview */}
      {sampleData.length === 0 ? (
        <EmptyState
          preset="no-data"
          title="Sin datos para exportar"
          description="Aplica menos filtros para obtener resultados."
          size="sm"
        />
      ) : (
        <div className="border border-[var(--border)] rounded-md overflow-hidden bg-[var(--bg-primary)]">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full border-collapse text-xs font-sans">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        'px-3 py-2.5 bg-[var(--bg-tertiary)]',
                        'text-[var(--text-secondary)] font-bold',
                        'text-[10px] uppercase tracking-wider',
                        'border-b border-[var(--border)]',
                        'whitespace-nowrap sticky top-0 z-[1]',
                        ALIGN_CLASSES_PREVIEW[col.align ?? 'left']
                      )}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleData.map((item, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-3 py-2 text-[var(--text-primary)]',
                          'border-b border-[var(--border)]',
                          'whitespace-nowrap max-w-[250px] overflow-hidden text-ellipsis',
                          ALIGN_CLASSES_PREVIEW[col.align ?? 'left']
                        )}
                      >
                        {col.render(item, rowIndex)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nota de más registros */}
      {hasMore && (
        <p className="text-[11px] text-[var(--text-tertiary)] mt-2.5 text-center italic">
          … y {(totalCount - showingCount).toLocaleString('es-CO')} registros más se incluirán en el archivo descargado.
        </p>
      )}

      {/* Nombre del archivo */}
      {preview.filename && (
        <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5 text-center italic">
          Nombre de archivo: <strong>{preview.filename}</strong>
        </p>
      )}
    </Modal>
  );
}

// Helper local para alineación en la tabla de preview
const ALIGN_CLASSES_PREVIEW: Record<string, string> = {
  left:   'text-left',
  center: 'text-center',
  right:  'text-right',
};