// ¿Qué? Badge especializado para mostrar el nivel de riesgo con score y color.
// ¿Para qué? Indicador visual consistente del nivel de riesgo en toda la app.
// ¿Impacto? Todos los indicadores de riesgo del sistema usan este componente.

import type { ReactNode } from 'react';
import { Badge } from '@components/ui/Badge';
import type { BadgeSize } from '@components/ui/Badge';
import {
  RISK_COLORS,
  RISK_LEVELS,
  type RiskLevel,
} from '@constants/Risk';
import {
  getRiskLevel,
  getRiskLabelFromScore,
} from '@utils/Risk';
import { formatRiskScore } from '@utils/Formatters';

// ==============================================================================
// TYPES
// ==============================================================================

/** Modos de visualización del RiskBadge. */
export type RiskBadgeMode =
  | 'level'       // Solo el label ("Crítico", "Alto", etc.)
  | 'score'       // Solo el score ("85,5 %")
  | 'both'        // Score + label ("85,5 % · Crítico")
  | 'score-only'; // Score sin símbolo de %

/** Props del RiskBadge. */
export interface RiskBadgeProps {
  score?: number;
  level?: RiskLevel;
  mode?: RiskBadgeMode;
  size?: BadgeSize;
  icon?: ReactNode;
  pulse?: boolean;
  rounded?: boolean;
  className?: string;
}

// ==============================================================================
// HELPERS
// ==============================================================================

function resolveLevel(score?: number, level?: RiskLevel): RiskLevel {
  if (level) return level;
  if (typeof score === 'number') return getRiskLevel(score);
  return 'low';
}

function buildContent(
  mode: RiskBadgeMode,
  score: number | undefined,
  level: RiskLevel
): string {
  const hasScore = typeof score === 'number';
  const label = RISK_LEVELS[level].label;
  const scoreText = hasScore ? formatRiskScore(score) : '';

  switch (mode) {
    case 'level':
      return label;
    case 'score':
      return hasScore ? scoreText : label;
    case 'both':
      return hasScore ? `${scoreText} · ${label}` : label;
    case 'score-only':
      return hasScore ? formatRiskScore(score).replace(' %', '') : label;
  }
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function RiskBadge({
  score,
  level,
  mode = 'score',
  size = 'md',
  icon,
  pulse = false,
  rounded = false,
  className = '',
}: RiskBadgeProps) {
  const resolvedLevel = resolveLevel(score, level);
  const color = RISK_COLORS[resolvedLevel];
  const content = buildContent(mode, score, resolvedLevel);

  return (
    <Badge
      variant="custom"
      color={color}
      size={size}
      icon={icon}
      pulse={pulse}
      rounded={rounded}
      className={className}
      title={
        typeof score === 'number'
          ? getRiskLabelFromScore(score)
          : RISK_LEVELS[resolvedLevel].label
      }
    >
      {content}
    </Badge>
  );
}