// ¿Qué? Grid responsivo que organiza las StatsCards del Dashboard.
// ¿Para qué? Encapsular la composición de las cards de métricas principales.
// ¿Impacto? Muestra información transparente sobre el motor antifraude de 7 factores.

import { DollarSign, AlertTriangle, Ban, ShieldCheck, Zap } from 'lucide-react';
import { StatsCard } from './StatsCards';
import type { DashboardStats } from '@app-types';
import { formatCurrency, formatPercent, formatNumber } from '@utils/Formatters';

// ==============================================================================
// TYPES
// ==============================================================================

export interface StatsCardsGridProps {
  stats: DashboardStats;
  isLive?: boolean;
  transactionsPerSecond?: number;
  onFraudClick?: () => void;
  onBlockedClick?: () => void;
  className?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function StatsCardsGrid({
  stats,
  isLive = false,
  transactionsPerSecond = 0,
  onFraudClick,
  onBlockedClick,
  className = '',
}: StatsCardsGridProps) {
  // ==============================================================================
  // VALORES DERIVADOS
  // ==============================================================================

  const fraudDisplay =
    stats.totalFrauds > 0
      ? `${formatNumber(stats.totalFrauds)} (${formatPercent(stats.fraudRate, 1)})`
      : '0';

  const tpsDisplay = isLive ? formatNumber(transactionsPerSecond) : '0';

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`stats-cards-grid grid w-full grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 ${className}`}
      role="region"
      aria-label="Métricas principales del sistema"
    >
      {/* 1. Monto total procesado */}
      <StatsCard
        icon={DollarSign}
        value={formatCurrency(stats.totalAmount)}
        label="Monto total"
        variant="info"
      />

      {/* 2. Fraudes detectados */}
      <StatsCard
        icon={AlertTriangle}
        value={fraudDisplay}
        label="Fraudes detectados"
        variant="danger"
        animated={stats.totalFrauds > 0}
        onClick={onFraudClick}
      />

      {/* 3. Transacciones bloqueadas */}
      <StatsCard
        icon={Ban}
        value={formatNumber(stats.totalBlocked)}
        label="Bloqueadas"
        variant="warning"
        onClick={onBlockedClick}
      />

      {/* 4. Estado del Motor Antifraude (Verídico) */}
      <StatsCard
        icon={ShieldCheck}
        value="Activo"
        label="Motor Antifraude"
        variant="success"
        subtitle="7 factores ponderados"
      />

      {/* 5. Transacciones por segundo */}
      <StatsCard
        icon={Zap}
        value={tpsDisplay}
        label="TXN/seg"
        variant={isLive ? 'warning' : 'primary'}
        animated={isLive}
        subtitle={isLive ? 'Simulado en vivo' : 'Sistema pausado'}
      />
    </div>
  );
}