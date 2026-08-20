// ¿Qué? Input de búsqueda con ícono, debounce integrado y botón de limpiar.
// ¿Para qué? Búsqueda consistente y optimizada en todas las tablas y listados.
// ¿Impacto? Todas las búsquedas del sistema usan este componente.

import { useEffect, useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@hooks/useDebounce';
import { Input } from '@components/ui/Input';
import type { InputProps } from '@components/ui/Input';

// ==============================================================================
// TYPES
// ==============================================================================

/** Props del SearchInput. */
export interface SearchInputProps extends Omit<InputProps, 'onChange' | 'value' | 'leftIcon' | 'rightIcon' | 'type'> {
  value: string;
  onSearch: (debouncedValue: string) => void;
  onChange?: (value: string) => void;
  debounceDelay?: number;
  showClearButton?: boolean;
  onClear?: () => void;
  minLength?: number;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function SearchInput({
  value,
  onSearch,
  onChange,
  debounceDelay = 300,
  showClearButton = true,
  onClear,
  minLength = 0,
  placeholder = 'Buscar...',
  disabled,
  ...restProps
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, debounceDelay);
  const isFirstRender = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar con valor externo
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Disparar onSearch con debounce
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debouncedValue.length >= minLength || debouncedValue.length === 0) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, minLength, onSearch]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleClear = (): void => {
    setLocalValue('');
    onChange?.('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape' && localValue) {
      e.preventDefault();
      handleClear();
    }
  };

  const showClear = showClearButton && localValue.length > 0 && !disabled;

  return (
    <Input
      ref={inputRef}
      {...restProps}
      type="search"
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      leftIcon={<Search size={16} />}
      rightIcon={
        showClear ? (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center justify-center p-1 bg-transparent border-none cursor-pointer text-[var(--text-tertiary)] rounded hover:text-[var(--text-secondary)] transition-colors duration-150"
            aria-label="Limpiar búsqueda"
            title="Limpiar (Esc)"
          >
            <X size={14} />
          </button>
        ) : undefined
      }
      autoComplete="off"
      aria-label={restProps.label || placeholder}
    />
  );
}