// lib/finance.ts
// Funções de cálculo financeiro para módulo de custos

import { createLogger } from '@/lib/logger';

const logger = createLogger('Finance');

export interface Purchase {
  id: string;
  user_id: string;
  medication: string;
  brand?: string;
  dosage: number;
  unit: string;
  package_form: string;
  package_qty: number;
  quantity: number;
  currency: string;
  total_price_cents: number;
  unit_price_cents?: number;
  price_source?: string;
  purchase_notes?: string;
  purchase_date: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Formata valor em centavos para formato BRL (R$ 1.234,56)
 */
export function formatCurrency(cents: number): string {
  const reais = cents / 100;
  return reais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Calcula o total gasto (soma de todas as compras)
 */
export function calculateTotalSpent(purchases: Purchase[]): number {
  if (!purchases || purchases.length === 0) {
    return 0;
  }

  const totalCents = purchases.reduce((sum, purchase) => {
    return sum + purchase.total_price_cents;
  }, 0);

  logger.info('Total spent calculated', { totalCents, purchaseCount: purchases.length });
  return totalCents;
}

/**
 * Calcula o gasto semanal médio
 * Baseado em: total gasto / número de semanas desde a primeira compra
 */
export function calculateWeeklySpent(purchases: Purchase[]): number | null {
  if (!purchases || purchases.length === 0) {
    return null;
  }

  // Ordenar por data (mais antiga primeiro)
  const sorted = [...purchases].sort(
    (a, b) => new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime()
  );

  const firstPurchaseDate = new Date(sorted[0].purchase_date);
  const now = new Date();

  // Calcular número de semanas desde primeira compra
  const daysDiff = Math.max(
    1,
    Math.floor((now.getTime() - firstPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const weeksDiff = Math.max(1, daysDiff / 7);

  const totalCents = calculateTotalSpent(purchases);
  const weeklyCents = Math.round(totalCents / weeksDiff);

  logger.info('Weekly spent calculated', {
    weeklyCents,
    weeksDiff: weeksDiff.toFixed(1),
    daysDiff,
  });

  return weeklyCents;
}

/**
 * Calcula o custo por kg perdido (R$/kg)
 * Apenas se opt-in ativado e houver dados de peso suficientes
 * 
 * @param purchases - Lista de compras
 * @param startWeight - Peso inicial (kg)
 * @param currentWeight - Peso atual (kg)
 * @param hasOptIn - Se usuário aceitou opt-in
 * @returns Custo por kg em centavos, ou null se não aplicável
 */
export function calculateCostPerKg(
  purchases: Purchase[],
  startWeight: number | null,
  currentWeight: number | null,
  hasOptIn: boolean
): number | null {
  // Verificar opt-in
  if (!hasOptIn) {
    logger.debug('Cost per kg not calculated: opt-in disabled');
    return null;
  }

  // Verificar dados de peso
  if (!startWeight || !currentWeight) {
    logger.debug('Cost per kg not calculated: missing weight data');
    return null;
  }

  // Verificar se houve perda de peso
  const weightLoss = startWeight - currentWeight;
  if (weightLoss <= 0) {
    logger.debug('Cost per kg not calculated: no weight loss', { startWeight, currentWeight });
    return null;
  }

  // Verificar se há compras
  if (!purchases || purchases.length === 0) {
    logger.debug('Cost per kg not calculated: no purchases');
    return null;
  }

  const totalCents = calculateTotalSpent(purchases);
  const costPerKgCents = Math.round(totalCents / weightLoss);

  logger.info('Cost per kg calculated', {
    costPerKgCents,
    weightLoss: weightLoss.toFixed(2),
    totalCents,
  });

  return costPerKgCents;
}

/**
 * Prediz a data da próxima compra baseado na média de dias entre compras
 * Requer pelo menos 2 compras para calcular
 */
export function predictNextPurchase(purchases: Purchase[]): Date | null {
  if (!purchases || purchases.length < 2) {
    logger.debug('Next purchase not predicted: need at least 2 purchases');
    return null;
  }

  // Ordenar por data (mais antiga primeiro)
  const sorted = [...purchases].sort(
    (a, b) => new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime()
  );

  // Calcular intervalos entre compras consecutivas
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].purchase_date);
    const currDate = new Date(sorted[i].purchase_date);
    const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    intervals.push(daysDiff);
  }

  // Calcular média de dias entre compras
  const avgDays = Math.round(intervals.reduce((sum, days) => sum + days, 0) / intervals.length);

  // Última compra
  const lastPurchaseDate = new Date(sorted[sorted.length - 1].purchase_date);

  // Predizer próxima compra
  const nextPurchaseDate = new Date(lastPurchaseDate);
  nextPurchaseDate.setDate(nextPurchaseDate.getDate() + avgDays);

  logger.info('Next purchase predicted', {
    lastPurchaseDate: lastPurchaseDate.toISOString(),
    nextPurchaseDate: nextPurchaseDate.toISOString(),
    avgDays,
    intervalsCount: intervals.length,
  });

  return nextPurchaseDate;
}

/**
 * Converte valor BRL para centavos
 * Ex: "1.234,56" → 123456
 */
export function parseCurrencyToCents(value: string): number {
  // Remove R$, espaços e pontos (milhares)
  const cleaned = value
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '');

  // Substitui vírgula por ponto
  const normalized = cleaned.replace(/,/g, '.');

  // Converte para centavos
  const reais = parseFloat(normalized);
  return Math.round(reais * 100);
}

