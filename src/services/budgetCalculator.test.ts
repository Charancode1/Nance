import { describe, it, expect } from 'vitest';
import {
  isEligibleTransaction,
  calculateWeek,
  calculateMonthlyProgress,
  EXCLUDED_CATEGORIES,
} from './budgetCalculator';
import { Transaction, Budget, UserFinancialProfile } from '../types';

describe('Budget Calculator Service', () => {
  const dummyProfile: UserFinancialProfile = {
    life_stage: 'College Student',
    living_arrangement: 'PG in Koramangala',
    monthly_allowance: 10000,
    fixed_rent: 5000,
    monthly_savings_target: 500,
  };

  const sampleBudgets: Budget[] = [
    { budget_id: 'b1', main_category: 'Flexible', period_type: 'weekly', amount: 1000, from_date: '2026-10-01', to_date: '2026-10-07' },
    { budget_id: 'b2', main_category: 'Flexible', period_type: 'weekly', amount: 1000, from_date: '2026-10-08', to_date: '2026-10-14' },
    { budget_id: 'b3', main_category: 'Flexible', period_type: 'weekly', amount: 1000, from_date: '2026-10-15', to_date: '2026-10-21' },
    { budget_id: 'b4', main_category: 'Flexible', period_type: 'weekly', amount: 1000, from_date: '2026-10-22', to_date: '2026-10-28' },
  ];

  describe('isEligibleTransaction', () => {
    it('accepts eligible debits', () => {
      const groceryTxn: Transaction = {
        txn_id: 't1',
        txn_date: '2026-10-02',
        txn_time: '12:00:00',
        amount: 240,
        transaction_type: 'debit',
        payment_mode: 'UPI',
        main_category: 'Groceries',
        sub_category: 'Quick Commerce',
        merchant_name: 'Blinkit',
        source: 'SMS',
        arrived_at: '2026-10-02T12:00:10',
      };
      expect(isEligibleTransaction(groceryTxn)).toBe(true);

      const foodTxn: Transaction = { ...groceryTxn, txn_id: 't2', main_category: 'Food & Dining' };
      expect(isEligibleTransaction(foodTxn)).toBe(true);

      const autoTxn: Transaction = { ...groceryTxn, txn_id: 't3', main_category: 'Transportation' };
      expect(isEligibleTransaction(autoTxn)).toBe(true);
    });

    it('excludes rent as a fixed commitment outside flexible budget', () => {
      const rentTxn: Transaction = {
        txn_id: 't_rent',
        txn_date: '2026-10-01',
        txn_time: '09:00:00',
        amount: 5000,
        transaction_type: 'debit',
        payment_mode: 'UPI',
        main_category: 'Rent',
        sub_category: 'PG Accommodation',
        merchant_name: 'PG Landlord',
        source: 'Bank Feed',
        arrived_at: '2026-10-01T09:00:10',
      };
      expect(isEligibleTransaction(rentTxn)).toBe(false);
    });

    it('excludes self transfers, credit card settlements, ATM withdrawals, and loans', () => {
      const baseTxn: Transaction = {
        txn_id: 't_ex',
        txn_date: '2026-10-05',
        txn_time: '10:00:00',
        amount: 500,
        transaction_type: 'debit',
        payment_mode: 'UPI',
        main_category: 'Self Transfers',
        sub_category: 'Wallet Transfer',
        merchant_name: 'Paytm',
        source: 'SMS',
        arrived_at: '2026-10-05T10:00:10',
      };

      for (const cat of EXCLUDED_CATEGORIES) {
        expect(isEligibleTransaction({ ...baseTxn, main_category: cat })).toBe(false);
      }
    });

    it('excludes credit transactions', () => {
      const creditTxn: Transaction = {
        txn_id: 't_cr',
        txn_date: '2026-10-01',
        txn_time: '10:00:00',
        amount: 10000,
        transaction_type: 'credit',
        payment_mode: 'UPI',
        main_category: 'Income',
        sub_category: 'Parent Allowance',
        merchant_name: 'Parents',
        source: 'Bank Feed',
        arrived_at: '2026-10-01T10:00:10',
      };
      expect(isEligibleTransaction(creditTxn)).toBe(false);
    });
  });

  describe('calculateWeek', () => {
    it('correctly calculates under-budget week (Week 1 example)', () => {
      const txns: Transaction[] = [
        {
          txn_id: 't1',
          txn_date: '2026-10-02',
          txn_time: '12:00:00',
          amount: 900,
          transaction_type: 'debit',
          payment_mode: 'UPI',
          main_category: 'Food & Dining',
          sub_category: 'Dining Out',
          merchant_name: 'Canteen & Swiggy',
          source: 'SMS',
          arrived_at: '2026-10-02T12:00:00',
        },
      ];

      const res = calculateWeek(1, 'W1', '2026-10-01', '2026-10-07', 1000, txns);
      expect(res.budgetAmount).toBe(1000);
      expect(res.actualSpending).toBe(900);
      expect(res.underBudgetAmount).toBe(100);
      expect(res.percentageUnderOrOver).toBe(10);
      expect(res.status).toBe('within_budget');
    });

    it('correctly calculates overspending week (Week 2 example: ₹1,100 spent on ₹1,000 budget)', () => {
      const txns: Transaction[] = [
        {
          txn_id: 't1',
          txn_date: '2026-10-09',
          txn_time: '12:00:00',
          amount: 1100,
          transaction_type: 'debit',
          payment_mode: 'UPI',
          main_category: 'Food & Dining',
          sub_category: 'Party',
          merchant_name: 'Restaurant',
          source: 'SMS',
          arrived_at: '2026-10-09T12:00:00',
        },
      ];

      const res = calculateWeek(2, 'W2', '2026-10-08', '2026-10-14', 1000, txns);
      expect(res.budgetAmount).toBe(1000);
      expect(res.actualSpending).toBe(1100);
      expect(res.underBudgetAmount).toBe(-100);
      expect(res.percentageUnderOrOver).toBe(10);
      expect(res.status).toBe('above_budget');
      expect(res.achievementStatus).toBe('Above budget (+₹100)');
    });
  });

  describe('calculateMonthlyProgress & Cumulative Recovery', () => {
    it('verifies the exact canonical student scenario from prompt specification', () => {
      // Prompt specification:
      // Week 1: 900
      // Week 2: 1050
      // Week 3: 800
      // Week 4: 850
      // Total spending: 3,600
      // Total 4-week budget: 4,000
      // Amount under budget: 400
      // Monthly performance: 10% under budget.
      const canonicalTxns: Transaction[] = [
        // Rent excluded
        {
          txn_id: 'rent',
          txn_date: '2026-10-01',
          txn_time: '09:00:00',
          amount: 5000,
          transaction_type: 'debit',
          payment_mode: 'UPI',
          main_category: 'Rent',
          sub_category: 'PG Fee',
          merchant_name: 'PG Owner',
          source: 'Bank Feed',
          arrived_at: '2026-10-01T09:00:00',
        },
        // W1: 900
        {
          txn_id: 'w1_1',
          txn_date: '2026-10-03',
          txn_time: '12:00:00',
          amount: 900,
          transaction_type: 'debit',
          payment_mode: 'UPI',
          main_category: 'Food & Dining',
          sub_category: 'Meals',
          merchant_name: 'Canteen',
          source: 'SMS',
          arrived_at: '2026-10-03T12:00:00',
        },
        // W2: 1050
        {
          txn_id: 'w2_1',
          txn_date: '2026-10-10',
          txn_time: '12:00:00',
          amount: 1050,
          transaction_type: 'debit',
          payment_mode: 'UPI',
          main_category: 'Food & Dining',
          sub_category: 'Weekend',
          merchant_name: 'Truffles',
          source: 'SMS',
          arrived_at: '2026-10-10T12:00:00',
        },
        // W3: 800
        {
          txn_id: 'w3_1',
          txn_date: '2026-10-17',
          txn_time: '12:00:00',
          amount: 800,
          transaction_type: 'debit',
          payment_mode: 'UPI',
          main_category: 'Groceries',
          sub_category: 'Supplies',
          merchant_name: 'Blinkit',
          source: 'SMS',
          arrived_at: '2026-10-17T12:00:00',
        },
        // W4: 850
        {
          txn_id: 'w4_1',
          txn_date: '2026-10-24',
          txn_time: '12:00:00',
          amount: 850,
          transaction_type: 'debit',
          payment_mode: 'UPI',
          main_category: 'Shopping',
          sub_category: 'Stationery',
          merchant_name: 'Bookstore',
          source: 'SMS',
          arrived_at: '2026-10-24T12:00:00',
        },
      ];

      const res = calculateMonthlyProgress(dummyProfile, sampleBudgets, canonicalTxns);

      expect(res.monthlyAllowance).toBe(10000);
      expect(res.fixedRent).toBe(5000);
      expect(res.flexibleMonthlyPool).toBe(5000);
      expect(res.totalPlannedWeeklyBudget).toBe(4000);
      expect(res.totalActualEligibleSpending).toBe(3600);
      expect(res.monthlyUnderBudgetAmount).toBe(400);
      expect(res.monthlyPerformancePercentage).toBe(10);
      expect(res.weeklyWinsCount).toBe(3);

      // Verify cumulative recovery timeline
      expect(res.cumulativeTimeline.length).toBe(4);

      // W1: cumulative budget 1000, spent 900, under-budget 100
      expect(res.cumulativeTimeline[0].cumulativeBudget).toBe(1000);
      expect(res.cumulativeTimeline[0].cumulativeSpent).toBe(900);
      expect(res.cumulativeTimeline[0].cumulativeUnderBudget).toBe(100);

      // W2: cumulative budget 2000, spent 1950, under-budget 50 (overspent in W2, but net cumulative progress still positive!)
      expect(res.cumulativeTimeline[1].cumulativeBudget).toBe(2000);
      expect(res.cumulativeTimeline[1].cumulativeSpent).toBe(1950);
      expect(res.cumulativeTimeline[1].cumulativeUnderBudget).toBe(50);

      // W3: cumulative budget 3000, spent 2750, under-budget 250 (Recovered!)
      expect(res.cumulativeTimeline[2].cumulativeBudget).toBe(3000);
      expect(res.cumulativeTimeline[2].cumulativeSpent).toBe(2750);
      expect(res.cumulativeTimeline[2].cumulativeUnderBudget).toBe(250);
      expect(res.cumulativeTimeline[2].recoveredThisWeek).toBe(true);

      // W4: cumulative budget 4000, spent 3600, under-budget 400
      expect(res.cumulativeTimeline[3].cumulativeBudget).toBe(4000);
      expect(res.cumulativeTimeline[3].cumulativeSpent).toBe(3600);
      expect(res.cumulativeTimeline[3].cumulativeUnderBudget).toBe(400);
    });
  });
});
