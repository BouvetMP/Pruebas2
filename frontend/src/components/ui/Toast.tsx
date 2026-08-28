// ¿Qué? Sistema de notificaciones Toast globales (Contexto + Componente).
// ¿Para qué? Mostrar mensajes flotantes de éxito, error o información sin usar alert().
// ¿Impacto? Eleva la percepción de calidad del sistema y da respuesta inmediata a las acciones del usuario.

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-4), { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 font-sans pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-xs font-semibold shadow-glow-md transition-all duration-200 animate-slide-up ${
              toast.type === 'success'
                ? 'border-[rgba(6,214,160,0.3)] bg-[var(--bg-secondary)] text-neon-green'
                : toast.type === 'error'
                  ? 'border-[rgba(255,107,107,0.3)] bg-[var(--bg-secondary)] text-[var(--color-danger)]'
                  : 'border-[var(--border-strong)] bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={16} className="shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={16} className="shrink-0" />}
            {toast.type === 'info' && <Info size={16} className="shrink-0 text-indigo-light" />}

            <span>{toast.message}</span>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="ml-2 cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
}