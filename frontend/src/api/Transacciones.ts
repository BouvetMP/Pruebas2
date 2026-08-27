// ¿Qué? Capa API para endpoints de transacciones bancarias.
// ¿Para qué? Centralizar consultas y soportar respuesta paginada { items, total }
//            sin romper páginas que esperan Transaction[].
// ¿Impacto? Fuente de datos de Dashboard, Sidebar, Transacciones y métricas derivadas.

import { get } from './Client';
import { normalizeTransactions } from '@utils/Normalizers';
import type { Transaction, TransactionRaw, SelectedBankId } from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

// ==============================================================================
// TIPOS DE RESPUESTA (Día 4)
// ==============================================================================

export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

type TransactionsApiResponse =
  | TransactionRaw[]
  | {
      items: TransactionRaw[];
      total: number;
      limit?: number;
      offset?: number;
      hasMore?: boolean;
    };

function unwrapTransactions(raw: TransactionsApiResponse): {
  items: TransactionRaw[];
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

/**
 * Listado paginado (preferido para UI consciente de totales).
 */
export async function getTransactionsPage(
  bankId: SelectedBankId = ALL_BANKS_ID,
  limit = 500,
  offset = 0,
): Promise<PaginatedTransactions> {
  const params: Record<string, string | number> = {
    limit,
    offset,
  };
  if (bankId !== ALL_BANKS_ID) params.banco = bankId;

  const raw = await get<TransactionsApiResponse>('/transacciones', params);
  const unwrapped = unwrapTransactions(raw);

  return {
    items: normalizeTransactions(unwrapped.items),
    total: unwrapped.total,
    limit: unwrapped.limit,
    offset: unwrapped.offset,
    hasMore: unwrapped.hasMore,
  };
}

/**
 * Compatibilidad: devuelve solo el array normalizado (como antes).
 * Internamente usa la respuesta paginada del backend.
 */
export async function getTransactions(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<Transaction[]> {
  const page = await getTransactionsPage(bankId, 500, 0);
  return page.items;
}

// ==============================================================================
// FUNCIONES DERIVADAS
// ==============================================================================

export async function getTransactionsCount(bankId: SelectedBankId = ALL_BANKS_ID): Promise<number> {
  const page = await getTransactionsPage(bankId, 1, 0);
  return page.total;
}

export async function getBlockedTransactionsCount(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<number> {
  const transactions = await getTransactions(bankId);
  return transactions.filter((tx) => tx.status === 'blocked').length;
}

export async function getFraudTransactionsCount(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<number> {
  const transactions = await getTransactions(bankId);
  return transactions.filter((tx) => tx.isFraud).length;
}

export async function getTotalAmount(bankId: SelectedBankId = ALL_BANKS_ID): Promise<number> {
  const transactions = await getTransactions(bankId);
  return transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
}

export async function getCriticalAlertsCount(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<number> {
  const transactions = await getTransactions(bankId);
  return transactions.filter((tx) => tx.alertLevel === 'critical' || tx.alertLevel === 'high')
    .length;
}