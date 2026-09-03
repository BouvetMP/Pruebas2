// ¿Qué? Funciones utilitarias avanzadas relacionadas con el score de riesgo y su clasificación.
// ¿Para qué? Centralizar la lógica de clasificación, comparación y mapeo de niveles de riesgo.
// ¿Impacto? Alineado con las constantes de riesgo de TriDa y respuestas del backend.

import {
  RISK_COLORS,
  RISK_LEVELS,
  RISK_THRESHOLDS,
  getRiskLevel as baseGetRiskLevel,
  type RiskLevel,
} from '@constants/Risk';

import type { AlertCriticalityRaw, AlertStatusRaw, TransactionStatusRaw } from '@app-types';

// ==============================================================================
// MAPEOS BACKEND → FRONTEND (niveles de criticidad)
// ==============================================================================

export function mapCriticalityRawToLevel(
  raw: AlertCriticalityRaw | string | null | undefined,
): RiskLevel {
  const normalized = String(raw ?? '')
    .toUpperCase()
    .trim();

  switch (normalized) {
    case 'CRITICA':
    case 'CRÍTICA':
    case 'CRITICAL':
      return 'critical';
    case 'ALTA':
    case 'HIGH':
      return 'high';
    case 'MEDIA':
    case 'MEDIUM':
    case 'MODERATE':
      return 'medium';
    case 'BAJA':
    case 'LOW':
    default:
      return 'low';
  }
}

export function mapLevelToCriticalityRaw(level: RiskLevel): AlertCriticalityRaw {
  const map: Record<RiskLevel, AlertCriticalityRaw> = {
    low: 'BAJA',
    medium: 'MEDIA',
    high: 'ALTA',
    critical: 'CRITICA',
  };
  return map[level];
}

// ==============================================================================
// MAPEOS BACKEND → FRONTEND (estados de alerta / transacción)
// ==============================================================================

export function mapAlertStatusRaw(
  raw: AlertStatusRaw | string | null | undefined,
): 'active' | 'in_review' | 'resolved' | 'dismissed' {
  const normalized = String(raw ?? '')
    .toUpperCase()
    .trim();

  switch (normalized) {
    case 'EN_REVISION':
    case 'IN_REVIEW':
      return 'in_review';
    case 'RESUELTA':
    case 'RESOLVED':
      return 'resolved';
    case 'DESCARTADA':
    case 'DISMISSED':
      return 'dismissed';
    case 'ACTIVA':
    case 'ACTIVE':
    default:
      return 'active';
  }
}

export function mapTransactionStatusRaw(
  raw: TransactionStatusRaw | string | null | undefined,
): 'pending' | 'approved' | 'flagged' | 'blocked' {
  const normalized = String(raw ?? '')
    .toUpperCase()
    .trim();

  switch (normalized) {
    case 'BLOQUEADA':
    case 'BLOCKED':
    case 'RECHAZADA':
      return 'blocked';
    case 'ALERTADA':
    case 'FLAGGED':
    case 'MARCADA':
    case 'SOSPECHOSA':
      return 'flagged';
    case 'APROBADA':
    case 'APPROVED':
      return 'approved';
    case 'PENDIENTE':
    case 'PENDING':
    default:
      return 'pending';
  }
}

// ==============================================================================
// HELPERS DE CLASIFICACIÓN DE RIESGO
// ==============================================================================

export function getRiskLevel(score: number): RiskLevel {
  return baseGetRiskLevel(score);
}

export function getRiskColorFromScore(score: number): string {
  return RISK_COLORS[getRiskLevel(score)];
}

export function getRiskLabelFromScore(score: number): string {
  return RISK_LEVELS[getRiskLevel(score)].label;
}

// ==============================================================================
// HELPERS DE VALIDACIÓN Y COMPARACIÓN
// ==============================================================================

/**
 * Determina si un score requiere bloqueo automático (≥ 95).
 */
export function isAutoBlockScore(score: number): boolean {
  return score >= RISK_THRESHOLDS.critical.min;
}

/**
 * Determina si un score genera alerta en el sistema (≥ 30).
 */
export function shouldGenerateAlert(score: number): boolean {
  return score >= 30;
}

export function compareRiskLevels(a: RiskLevel, b: RiskLevel): number {
  const priority: Record<RiskLevel, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return priority[a] - priority[b];
}

export function isAtLeastLevel(level: RiskLevel, threshold: RiskLevel): boolean {
  return compareRiskLevels(level, threshold) >= 0;
}

// ==============================================================================
// HELPERS DE AGRUPACIÓN Y PRIORIDAD
// ==============================================================================

export function countByRiskLevel<T extends { alertLevel: RiskLevel }>(
  items: T[],
): Record<RiskLevel, number> {
  const counts: Record<RiskLevel, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  for (const item of items) {
    counts[item.alertLevel]++;
  }

  return counts;
}

export function groupByRiskLevel<T extends { alertLevel: RiskLevel }>(
  items: T[],
): Record<RiskLevel, T[]> {
  const groups: Record<RiskLevel, T[]> = {
    low: [],
    medium: [],
    high: [],
    critical: [],
  };

  for (const item of items) {
    groups[item.alertLevel].push(item);
  }

  return groups;
}

export function levelToPriority(level: RiskLevel): number {
  const map: Record<RiskLevel, number> = {
    low: 4,
    medium: 6,
    high: 8,
    critical: 10,
  };
  return map[level];
}