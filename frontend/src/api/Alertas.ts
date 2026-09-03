// ¿Qué? Capa API para endpoints de alertas de fraude.
// ¿Para qué? Centralizar consultas y soportar { items, total } sin romper
//            AlertsPage / Dashboard / contadores.
// ¿Impacto? Fuente de verdad del módulo de alertas con total real (Día 4).

import { get } from './Client';
import { normalizeAlerts, normalizeRecentAlerts } from '@utils/Normalizers';
import type { Alert, AlertRaw, RecentAlert, AlertCriticality, SelectedBankId } from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

// ==============================================================================
// TIPOS DE RESPUESTA (Día 4)
// ==============================================================================

export interface PaginatedAlerts {
  items: Alert[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

type AlertsApiResponse =
  | AlertRaw[]
  | {
      items: AlertRaw[];
      total: number;
      limit?: number;
      offset?: number;
      hasMore?: boolean;
    };

function unwrapAlerts(raw: AlertsApiResponse): {
  items: AlertRaw[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
} {
  if (Array.isArray(raw)) {
    return {
      items: raw,
      total: raw.length,
      limit: raw.length,
      offset: 0,
      hasMore: false,
    };
  }

  const items = Array.isArray(raw.items) ? raw.items : [];
  const total = Number(raw.total ?? items.length);
  const limit = Number(raw.limit ?? items.length);
  const offset = Number(raw.offset ?? 0);
  const hasMore = Boolean(raw.hasMore ?? offset + items.length < total);

  return { items, total, limit, offset, hasMore };
}

// ==============================================================================
// ENDPOINTS PRINCIPALES
// ==============================================================================

export async function getAlertsPage(
  bankId: SelectedBankId = ALL_BANKS_ID,
  limit = 500,
  offset = 0,
): Promise<PaginatedAlerts> {
  const params: Record<string, string | number> = { limit, offset };
  if (bankId !== ALL_BANKS_ID) params.banco = bankId;

  const raw = await get<AlertsApiResponse>('/alertas', params);
  const unwrapped = unwrapAlerts(raw);

  return {
    items: normalizeAlerts(unwrapped.items),
    total: unwrapped.total,
    limit: unwrapped.limit,
    offset: unwrapped.offset,
    hasMore: unwrapped.hasMore,
  };
}

/** Compatibilidad: array normalizado como antes. */
export async function getAlerts(bankId: SelectedBankId = ALL_BANKS_ID): Promise<Alert[]> {
  const page = await getAlertsPage(bankId, 500, 0);
  return page.items;
}

export async function getRecentAlerts(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<RecentAlert[]> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;
  const raw = await get<AlertRaw[]>('/dashboard/alertas-recientes', params);
  return normalizeRecentAlerts(raw);
}

// ==============================================================================
// CONTADORES
// ==============================================================================

export async function getAlertsCount(bankId: SelectedBankId = ALL_BANKS_ID): Promise<number> {
  const page = await getAlertsPage(bankId, 1, 0);
  return page.total;
}

export async function getAlertsCountByLevel(
  level: AlertCriticality,
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<number> {
  const alerts = await getAlerts(bankId);
  return alerts.filter((alert) => alert.alertLevel === level).length;
}

export async function getAlertsCountsByLevel(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<Record<AlertCriticality, number>> {
  const alerts = await getAlerts(bankId);

  return {
    low: alerts.filter((a) => a.alertLevel === 'low').length,
    medium: alerts.filter((a) => a.alertLevel === 'medium').length,
    high: alerts.filter((a) => a.alertLevel === 'high').length,
    critical: alerts.filter((a) => a.alertLevel === 'critical').length,
  };
}

export async function getActiveAlertsCount(bankId: SelectedBankId = ALL_BANKS_ID): Promise<number> {
  const alerts = await getAlerts(bankId);
  return alerts.filter((alert) => alert.alertStatus === 'active').length;
}