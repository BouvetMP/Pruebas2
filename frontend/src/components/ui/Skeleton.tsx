// ¿Qué? Componente Skeleton animado para estados de carga fantasma.
// ¿Para qué? Renderizar estructuras de contenido temporal mientras cargan los datos.
// ¿Impacto? Elimina los spinners globales y evita saltos de diseño (layout shifts) en la UI.

import type { HTMLAttributes } from 'react';
import { cn } from '@utils/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...rest }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[var(--bg-tertiary)] opacity-70',
        className,
      )}
      {...rest}
    />
  );
}