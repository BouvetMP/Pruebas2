// ¿Qué? Círculo SVG animado que muestra un score de riesgo de forma visual.
// ¿Para qué? Indicador circular de score en Dashboard, Analytics y Alertas.
// ¿Impacto? Todos los indicadores circulares de score usan este componente.

import type { ReactNode } from 'react';
import { RISK_COLORS, type RiskLevel } from '@constants/Risk';
import { getRiskLevel } from '@utils/Risk';
import { formatRiskScore } from '@utils/Formatters';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Tamaños disponibles del ring. */
export type ScoreRingSize = 'sm' | 'md' | 'lg' | 'xl';

/** Props del ScoreRing. */
export interface ScoreRingProps {
  score: number;
  size?: ScoreRingSize;
  level?: RiskLevel;
  color?: string;
  showScore?: boolean;
  scoreFormat?: 'percent' | 'raw' | 'compact';
  strokeWidth?: number;
  animate?: boolean;
  animationDuration?: number;
  children?: ReactNode;
  className?: string;
}

// ==============================================================================
// CLASES Y DIMENSIONES POR TAMAÑO
// ==============================================================================

const SIZE_CONFIG: Record<
  ScoreRingSize,
  {
    wrapper: string;
    fontSize: string;
    fontWeight: string;
    pixels: number;
  }
> = {
  sm: { wrapper: 'w-12 h-12', fontSize: 'text-[11px]', fontWeight: 'font-bold', pixels: 48 },
  md: { wrapper: 'w-20 h-20', fontSize: 'text-base', fontWeight: 'font-bold', pixels: 80 },
  lg: {
    wrapper: 'w-[120px] h-[120px]',
    fontSize: 'text-[22px]',
    fontWeight: 'font-extrabold',
    pixels: 120,
  },
  xl: {
    wrapper: 'w-[180px] h-[180px]',
    fontSize: 'text-[32px]',
    fontWeight: 'font-extrabold',
    pixels: 180,
  },
};

// ==============================================================================
// HELPERS
// ==============================================================================

/**
 * Limita un valor entre 0 y 100.
 */
function clampScore(score: number): number {
  if (isNaN(score)) return 0;
  return Math.max(0, Math.min(100, score));
}

/**
 * Formatea el score según el formato indicado.
 */
function formatScore(score: number, format: NonNullable<ScoreRingProps['scoreFormat']>): string {
  const clamped = clampScore(score);
  switch (format) {
    case 'raw':
      return String(Math.round(clamped));
    case 'compact':
      return `${Math.round(clamped)}%`;
    case 'percent':
    default:
      return formatRiskScore(clamped);
  }
}

/**
 * Resuelve el color del ring.
 */
function resolveColor(score: number, level?: RiskLevel, color?: string): string {
  if (color) return color;
  const finalLevel = level ?? getRiskLevel(score);
  return RISK_COLORS[finalLevel];
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ScoreRing({
  score,
  size = 'md',
  level,
  color,
  showScore = true,
  scoreFormat = 'percent',
  strokeWidth = 8,
  animate = true,
  animationDuration = 800,
  children,
  className = '',
}: ScoreRingProps) {
  const config = SIZE_CONFIG[size];
  const clampedScore = clampScore(score);
  const finalColor = resolveColor(clampedScore, level, color);

  // Cálculos del SVG
  const VIEW_BOX = 36;
  const RADIUS = (VIEW_BOX - strokeWidth) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - clampedScore / 100);

  const PATH = `M ${VIEW_BOX / 2} ${strokeWidth / 2}
                a ${RADIUS} ${RADIUS} 0 0 1 0 ${VIEW_BOX - strokeWidth}
                a ${RADIUS} ${RADIUS} 0 0 1 0 -${VIEW_BOX - strokeWidth}`;

  return (
    <div
      className={cn('relative inline-flex shrink-0', config.wrapper, className)}
      role="progressbar"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Score de riesgo: ${formatScore(clampedScore, scoreFormat)}`}
    >
      {/* SVG con el anillo */}
      <svg viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`} className="w-full h-full -rotate-90">
        {/* Círculo de fondo (track) */}
        <path d={PATH} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth={strokeWidth} />
        {/* Círculo animado (progreso) */}
        <path
          d={PATH}
          fill="none"
          stroke={finalColor}
          strokeWidth={strokeWidth}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: animate ? `stroke-dashoffset ${animationDuration}ms ease-out` : 'none',
          }}
        />
      </svg>

      {/* Contenido central (score o children) */}
      {(showScore || children) && (
        <div
          className={cn(
            'absolute inset-0',
            'flex items-center justify-center',
            'font-sans select-none leading-none',
            config.fontSize,
            config.fontWeight,
          )}
          style={{ color: finalColor }}
        >
          {children ? children : formatScore(clampedScore, scoreFormat)}
        </div>
      )}
    </div>
  );
}
