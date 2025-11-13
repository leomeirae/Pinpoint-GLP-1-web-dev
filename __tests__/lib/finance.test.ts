// __tests__/lib/finance.test.ts
// Testes unitários críticos para cálculos financeiros

import {
  calculateTotalSpent,
  calculateWeeklySpent,
  calculateCostPerKg,
  predictNextPurchase,
  formatCurrency,
  parseCurrencyToCents,
} from '@/lib/finance';

describe('lib/finance', () => {
  describe('formatCurrency', () => {
    it('formata valores em centavos para BRL corretamente', () => {
      expect(formatCurrency(123456)).toBe('R$ 1.234,56');
      expect(formatCurrency(100)).toBe('R$ 1,00');
      expect(formatCurrency(0)).toBe('R$ 0,00');
      expect(formatCurrency(999)).toBe('R$ 9,99');
      expect(formatCurrency(1000000)).toBe('R$ 10.000,00');
    });
  });

  describe('parseCurrencyToCents', () => {
    it('converte string BRL para centavos corretamente', () => {
      expect(parseCurrencyToCents('R$ 1.234,56')).toBe(123456);
      expect(parseCurrencyToCents('R$ 1,00')).toBe(100);
      expect(parseCurrencyToCents('R$ 0,00')).toBe(0);
      expect(parseCurrencyToCents('1234,56')).toBe(123456); // sem R$
      expect(parseCurrencyToCents('1.234')).toBe(123400); // sem centavos
    });
  });

  describe('calculateTotalSpent', () => {
    it('calcula total gasto com múltiplas compras', () => {
      const purchases = [
        { id: '1', total_price_cents: 50000, purchase_date: '2025-01-01', user_id: 'user1', medication: 'mounjaro', dosage: 2.5, unit: 'mg', quantity: 1, currency: 'BRL', package_form: 'pen', package_qty: 4, created_at: '2025-01-01', updated_at: '2025-01-01' },
        { id: '2', total_price_cents: 75000, purchase_date: '2025-01-15', user_id: 'user1', medication: 'mounjaro', dosage: 5, unit: 'mg', quantity: 1, currency: 'BRL', package_form: 'pen', package_qty: 4, created_at: '2025-01-15', updated_at: '2025-01-15' },
        { id: '3', total_price_cents: 60000, purchase_date: '2025-02-01', user_id: 'user1', medication: 'mounjaro', dosage: 7.5, unit: 'mg', quantity: 1, currency: 'BRL', package_form: 'pen', package_qty: 4, created_at: '2025-02-01', updated_at: '2025-02-01' },
      ];

      const total = calculateTotalSpent(purchases);
      expect(total).toBe(185000); // R$ 1.850,00
    });

    it('retorna 0 quando não há compras', () => {
      expect(calculateTotalSpent([])).toBe(0);
    });
  });

  describe('calculateWeeklySpent', () => {
    it('calcula gasto semanal médio corretamente', () => {
      const purchases = [
        { id: '1', total_price_cents: 50000, purchase_date: '2025-01-01', user_id: 'user1', medication: 'mounjaro', dosage: 2.5, unit: 'mg', quantity: 1, currency: 'BRL', package_form: 'pen', package_qty: 4, created_at: '2025-01-01', updated_at: '2025-01-01' },
        { id: '2', total_price_cents: 70000, purchase_date: '2025-01-29', user_id: 'user1', medication: 'mounjaro', dosage: 5, unit: 'mg', quantity: 1, currency: 'BRL', package_form: 'pen', package_qty: 4, created_at: '2025-01-29', updated_at: '2025-01-29' }, // 28 dias = 4 semanas
      ];

      const weeklySpent = calculateWeeklySpent(purchases);
      expect(weeklySpent).toBe(30000); // R$ 300,00 por semana
    });

    it('retorna 0 quando não há compras', () => {
      expect(calculateWeeklySpent([])).toBe(0);
    });

    it('retorna total quando há apenas 1 compra', () => {
      const purchases = [
        { id: '1', total_price_cents: 50000, purchase_date: '2025-01-01', user_id: 'user1', medication: 'mounjaro', dosage: 2.5, unit: 'mg', quantity: 1, currency: 'BRL', package_form: 'pen', package_qty: 4, created_at: '2025-01-01', updated_at: '2025-01-01' },
      ];

      const weeklySpent = calculateWeeklySpent(purchases);
      expect(weeklySpent).toBe(50000); // Retorna total
    });
  });

  describe('calculateCostPerKg', () => {
    it('calcula R$/kg corretamente quando há perda de peso', () => {
      const purchases = [
        { id: '1', total_price_cents: 50000, purchase_date: '2025-01-01', user_id: 'user1', medication: 'mounjaro', dosage: 2.5, unit: 'mg', quantity: 1, currency: 'BRL', package_form: 'pen', package_qty: 4, created_at: '2025-01-01', updated_at: '2025-01-01' },
        { id: '2', total_price_cents: 50000, purchase_date: '2025-01-29', user_id: 'user1', medication: 'mounjaro', dosage: 5, unit: 'mg', quantity: 1, currency: 'BRL', package_form: 'pen', package_qty: 4, created_at: '2025-01-29', updated_at: '2025-01-29' },
      ];
      const totalSpent = 100000; // R$ 1.000,00
      const weightLoss = 5; // 5 kg perdidos

      const costPerKg = calculateCostPerKg(totalSpent, weightLoss);
      expect(costPerKg).toBe(20000); // R$ 200,00 por kg
    });

    it('retorna null quando não há perda de peso', () => {
      const totalSpent = 100000;
      const weightLoss = 0;

      const costPerKg = calculateCostPerKg(totalSpent, weightLoss);
      expect(costPerKg).toBeNull();
    });

    it('retorna null quando weightLoss é negativo (ganho de peso)', () => {
      const totalSpent = 100000;
      const weightLoss = -2; // Ganhou peso

      const costPerKg = calculateCostPerKg(totalSpent, weightLoss);
      expect(costPerKg).toBeNull();
    });

    it('retorna null quando totalSpent é 0', () => {
      const totalSpent = 0;
      const weightLoss = 5;

      const costPerKg = calculateCostPerKg(totalSpent, weightLoss);
      expect(costPerKg).toBeNull();
    });
  });

  describe('predictNextPurchase', () => {
    it('prevê próxima compra baseado em média de intervalo', () => {
      const purchases = [
        { id: '1', total_price_cents: 50000, purchase_date: '2025-01-01', user_id: 'user1', medication: 'mounjaro', dosage: 2.5, unit: 'mg', quantity: 1, currency: 'BRL', package_form: 'pen', package_qty: 4, created_at: '2025-01-01', updated_at: '2025-01-01' },
        { id: '2', total_price_cents: 50000, purchase_date: '2025-01-29', user_id: 'user1', medication: 'mounjaro', dosage: 5, unit: 'mg', quantity: 1, currency: 'BRL', package_form: 'pen', package_qty: 4, created_at: '2025-01-29', updated_at: '2025-01-29' }, // 28 dias depois
        { id: '3', total_price_cents: 50000, purchase_date: '2025-02-26', user_id: 'user1', medication: 'mounjaro', dosage: 7.5, unit: 'mg', quantity: 1, currency: 'BRL', package_form: 'pen', package_qty: 4, created_at: '2025-02-26', updated_at: '2025-02-26' }, // 28 dias depois
      ];
      const applications = [
        { id: '1', user_id: 'user1', medication_id: 'med1', date: '2025-03-01', dosage: 2.5, unit: 'mg', notes: '', created_at: '2025-03-01', updated_at: '2025-03-01' },
      ];

      const nextPurchase = predictNextPurchase(purchases, applications);
      
      // Deve prever ~28 dias após última compra (26/02 + 28 = 26/03)
      expect(nextPurchase).not.toBeNull();
      if (nextPurchase) {
        const expectedDate = new Date('2025-02-26');
        expectedDate.setDate(expectedDate.getDate() + 28);
        expect(nextPurchase.getTime()).toBeCloseTo(expectedDate.getTime(), -100000); // Tolerância de ~1 dia
      }
    });

    it('retorna null quando há menos de 2 compras', () => {
      const purchases = [
        { id: '1', total_price_cents: 50000, purchase_date: '2025-01-01', user_id: 'user1', medication: 'mounjaro', dosage: 2.5, unit: 'mg', quantity: 1, currency: 'BRL', package_form: 'pen', package_qty: 4, created_at: '2025-01-01', updated_at: '2025-01-01' },
      ];
      const applications = [];

      const nextPurchase = predictNextPurchase(purchases, applications);
      expect(nextPurchase).toBeNull();
    });
  });
});

