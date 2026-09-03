// ¿Qué? Constantes y utilidades relacionadas al score de riesgo de fraude del sistema TriDa.
// ¿Para qué? Centralizar los colores, labels y umbrales de riesgo para evitar duplicación.
// ¿Impacto? Sincronizado estrictamente con el motor de riesgo del backend (risk.service.ts).

// ==============================================================================
// TYPES / INTERFACES
// ==============================================================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** Estructura de metadatos para cada nivel de riesgo. */
export interface RiskLevelMetadata {
  label: string;
  color: string;
  description: string;
}

/** Rango de score para clasificar transacciones. */
export interface RiskThreshold {
  min: number;
  max: number;
}

// ==============================================================================
// COLORES DE RIESGO
// ==============================================================================

export const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#34D399',
  medium: '#FBBF24',
  high: '#F97316',
  critical: '#EF4444',
};

// ==============================================================================
// METADATOS DE NIVELES DE RIESGO
// ==============================================================================

export const RISK_LEVELS: Record<RiskLevel, RiskLevelMetadata> = {
  low: {
    label: 'Bajo',
    color: RISK_COLORS.low,
    description: 'Operación con bajo nivel de riesgo',
  },
  medium: {
    label: 'Medio',
    color: RISK_COLORS.medium,
    description: 'Riesgo moderado — requiere revisión',
  },
  high: {
    label: 'Alto',
    color: RISK_COLORS.high,
    description: 'Riesgo elevado — alerta generada',
  },
  critical: {
    label: 'Crítico',
    color: RISK_COLORS.critical,
    description: 'Riesgo crítico — bloqueo automático',
  },
};

// ==============================================================================
// UMBRALES DE SCORE DE RIESGO (Coincidentes con risk.service.ts del backend)
// ==============================================================================

export const RISK_THRESHOLDS: Record<RiskLevel, RiskThreshold> = {
  low: { min: 0, max: 49 },
  medium: { min: 50, max: 79 },
  high: { min: 80, max: 94 },
  critical: { min: 95, max: 100 },
};

export const AUTO_BLOCK_THRESHOLD = 95;

// ==============================================================================
// FUNCIONES UTILITARIAS
// ==============================================================================

/**
 * Determina el nivel de riesgo a partir de un score numérico.
 *
 * @param score - Puntaje de riesgo (0-100).
 * @returns Nivel de riesgo tipado ('low' | 'medium' | 'high' | 'critical').
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.critical.min) return 'critical';
  if (score >= RISK_THRESHOLDS.high.min) return 'high';
  if (score >= RISK_THRESHOLDS.medium.min) return 'medium';
  return 'low';
}

/**
 * Obtiene el color asociado a un nivel de riesgo.
 */
export function getRiskColor(level: RiskLevel): string {
  return RISK_COLORS[level];
}

/**
 * Obtiene el color asociado directamente desde un score.
 */
export function getRiskColorFromScore(score: number): string {
  return RISK_COLORS[getRiskLevel(score)];
}

/**
 * Obtiene el label legible en español a partir de un score.
 */
export function getRiskLabelFromScore(score: number): string {
  return RISK_LEVELS[getRiskLevel(score)].label;
}

/**
 * Determina si un score requiere bloqueo automático (≥ 95).
 */
export function shouldAutoBlock(score: number): boolean {
  return score >= AUTO_BLOCK_THRESHOLD;
}