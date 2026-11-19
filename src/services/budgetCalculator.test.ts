import { describe, it, expect } from 'vitest';
import {
  isEligibleTransaction,
  getExclusionReason,
  calculateCategoryBreakdown,
  calculateWeek,
  calculateMonthly,
  EXCLUDED_CATEGORIES,
} from './budgetCalculator';
import { Transaction, Budget } from '../types';

describe('Simplified Budget Calculator & Weekly Wins Logic', () => {
  const sampleWeeklyBudgets: Budget[] = [
    { budget_id: 'b_w1', user_id: 'u1', period_type: 'weekly', week_index: 1, amount: 2000, from_date: '2026-10-01', to_date: '2026-10-07', is_completed: false },
    { budget_id: 'b_w2', user_id: 'u1', period_type: 'weekly', week_index: 2, amount: 2500, from_date: '2026-10-08', to_date: '2026-10-14', is_completed: false },
    { budget_id: 'b_w3', user_id: 'u1', period_type: 'weekly', week_index: 3, amount: 2000, from_date: '2026-10-15', to_date: '2026-10-21', is_completed: false },
    { budget_id: 'b_w4', user_id: 'u1', period_type: 'weekly', week_index: 4, amount: 2500, from_date: '2026-10-22', to_date: '2026-10-28', is_completed: false },
  ];

  // 1. Transaction Eligibility & Exclusions
  describe('Transaction Eligibility & Exclusion Rules', () => {
    it('includes legitimate eligible spending across provided taxonomy', () => {
      const categoriesToTest = [
        'Food & Dining', 'Groceries', 'Shopping', 'Bills', 'Travel',
        'Transportation', 'Fuel / EV Charging', 'Entertainment',
        'Subscriptions', 'Housing & Utilities', 'Personal Care',
        'Hospitals & Pharmacy', 'Fitness & Wellness', 'Education',
        'Gifts & Donations', 'Electronics', 'Insurance Premiums', 'EMIs & Loans'
      ];

      for (const cat of categoriesToTest) {
        const tx: Transaction = {
          txn_id: `tx_${cat}`,
          user_id: 'u1',
          txn_date: '2026-10-03',
          txn_time: '12:00:00',
          amount: 100,
          transaction_type: 'debit',
          payment_mode: 'UPI',
          main_category: cat,
        };
        expect(isEligibleTransaction(tx)).toBe(true);
        expect(getExclusionReason(tx)).toBeNull();
      }
    });

    it('excludes money movements to prevent double-counting and false spending', () => {
      for (const cat of EXCLUDED_CATEGORIES) {
        const tx: Transaction = {
          txn_id: `tx_ex_${cat}`,
          user_id: 'u1',
          txn_date: '2026-10-03',
          txn_time: '12:00:00',
          amount: 500,
          transaction_type: 'debit',
          payment_mode: 'UPI',
          main_category: cat,
        };
        expect(isEligibleTransaction(tx)).toBe(false);
        expect(getExclusionReason(tx)).toContain('Excluded');
      }
    });

    it('prevents double-counting credit card bill settlements', () => {
      const settlementTx: Transaction = {
        txn_id: 'tx_cc_settle',
        user_id: 'u1',
        txn_date: '2026-10-05',
        txn_time: '15:00:00',
        amount: 3500,
        transaction_type: 'debit',
        payment_mode: 'Net Banking',
        main_category: 'Credit Card Settlements',
        merchant_name: 'HDFC Credit Card Bill',
      };
      expect(isEligibleTransaction(settlementTx)).toBe(false);
      expect(getExclusionReason(settlementTx)).toContain('double-counting');
    });

    it('excludes income and credit transactions', () => {
      const creditTx: Transaction = {
        txn_id: 'tx_salary',
        user_id: 'u1',
        txn_date: '2026-10-01',
        txn_time: '09:00:00',
        amount: 25000,
        transaction_type: 'credit',
        payment_mode: 'Net Banking',
        main_category: 'Income',
      };
      expect(isEligibleTransaction(creditTx)).toBe(false);
      expect(getExclusionReason(creditTx)).toContain('Credit transaction');
    });
  });

  // 2. Category-Wise Aggregation
  describe('Category-Wise Aggregation', () => {
    it('accurately aggregates spending by category with percentages and counts', () => {
      const txns: Transaction[] = [
        { txn_id: '1', user_id: 'u1', txn_date: '2026-10-02', txn_time: '10:00:00', amount: 450, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' },
        { txn_id: '2', user_id: 'u1', txn_date: '2026-10-03', txn_time: '11:00:00', amount: 500, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' },
        { txn_id: '3', user_id: 'u1', txn_date: '2026-10-04', txn_time: '12:00:00', amount: 200, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Transportation' },
        { txn_id: '4', user_id: 'u1', txn_date: '2026-10-05', txn_time: '13:00:00', amount: 150, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Shopping' },
        { txn_id: '5', user_id: 'u1', txn_date: '2026-10-06', txn_time: '14:00:00', amount: 100, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Entertainment' },
        // Excluded transaction should not appear in category spending
        { txn_id: '6', user_id: 'u1', txn_date: '2026-10-06', txn_time: '15:00:00', amount: 1000, transaction_type: 'debit', payment_mode: 'Cash', main_category: 'Cash Withdrawals' },
      ];

      const breakdown = calculateCategoryBreakdown(txns);
      expect(breakdown.length).toBe(5);

      const totalSpent = breakdown.reduce((sum, c) => sum + c.amount, 0);
      expect(totalSpent).toBe(1400); // 450+500+200+150+100

      const groc = breakdown.find((c) => c.category === 'Groceries');
      expect(groc?.amount).toBe(500);
      expect(groc?.transactionCount).toBe(1);
      expect(groc?.percentageOfTotal).toBe(35.7); // (500 / 1400) * 100 ≈ 35.7%
    });
  });

  // 3. Weekly Calculations: Under Budget vs Overspending
  describe('Weekly Calculations', () => {
    it('calculates 20% under budget and weekly win (Example: Budget ₹2,000, Spent ₹1,600)', () => {
      const weekTxns: Transaction[] = [
        { txn_id: 'w1_1', user_id: 'u1', txn_date: '2026-10-02', txn_time: '10:00:00', amount: 1000, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' },
        { txn_id: 'w1_2', user_id: 'u1', txn_date: '2026-10-04', txn_time: '12:00:00', amount: 600, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' },
      ];

      const res = calculateWeek(1, '2026-10-01', '2026-10-07', 2000, true, '2026-10-07T21:00:00Z', weekTxns);
      expect(res.budgetAmount).toBe(2000);
      expect(res.actualSpending).toBe(1600);
      expect(res.remainingBudget).toBe(400);
      expect(res.differencePercentage).toBe(20); // 400 / 2000 * 100 = 20%
      expect(res.isUnderBudget).toBe(true);
      expect(res.isCompleted).toBe(true);
      expect(res.resultStatus).toBe('win');
      expect(res.resultMessage).toContain('You stayed 20% under budget!');
      expect(res.resultMessage).toContain('₹400');
    });

    it('calculates 10% overspending without shame (Example: Budget ₹2,000, Spent ₹2,200)', () => {
      const weekTxns: Transaction[] = [
        { txn_id: 'w1_1', user_id: 'u1', txn_date: '2026-10-02', txn_time: '10:00:00', amount: 1200, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' },
        { txn_id: 'w1_2', user_id: 'u1', txn_date: '2026-10-04', txn_time: '12:00:00', amount: 1000, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Shopping' },
      ];

      const res = calculateWeek(1, '2026-10-01', '2026-10-07', 2000, true, '2026-10-07T21:00:00Z', weekTxns);
      expect(res.budgetAmount).toBe(2000);
      expect(res.actualSpending).toBe(2200);
      expect(res.remainingBudget).toBe(-200);
      expect(res.differencePercentage).toBe(10); // 200 / 2000 * 100 = 10%
      expect(res.isUnderBudget).toBe(false);
      expect(res.isCompleted).toBe(true);
      expect(res.resultStatus).toBe('over');
      expect(res.resultMessage).toContain("You went 10% over this week's budget. That's okay.");
    });
  });

  // 4. Week Completion & Duplicate Prevention
  describe('Week Completion Handling', () => {
    it('marks a week as completed and locks result status', () => {
      const txns: Transaction[] = [
        { txn_id: 't1', user_id: 'u1', txn_date: '2026-10-02', txn_time: '10:00:00', amount: 500, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' }
      ];

      const beforeFinish = calculateWeek(1, '2026-10-01', '2026-10-07', 2000, false, undefined, txns);
      expect(beforeFinish.isCompleted).toBe(false);
      expect(beforeFinish.resultStatus).toBe('pending');

      const afterFinish = calculateWeek(1, '2026-10-01', '2026-10-07', 2000, true, '2026-10-07T20:00:00', txns);
      expect(afterFinish.isCompleted).toBe(true);
      expect(afterFinish.resultStatus).toBe('win');
    });

    it('handles expenses added after a week is finished by dynamically updating calculations without corrupting state', () => {
      const initialTxns: Transaction[] = [
        { txn_id: 't1', user_id: 'u1', txn_date: '2026-10-02', txn_time: '10:00:00', amount: 1500, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' }
      ];

      const finishedCalc = calculateWeek(1, '2026-10-01', '2026-10-07', 2000, true, '2026-10-07T20:00:00', initialTxns);
      expect(finishedCalc.actualSpending).toBe(1500);
      expect(finishedCalc.remainingBudget).toBe(500);

      // User later adds an unexpected late expense for that week
      const updatedTxns: Transaction[] = [
        ...initialTxns,
        { txn_id: 't_late', user_id: 'u1', txn_date: '2026-10-06', txn_time: '18:00:00', amount: 200, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Transportation' }
      ];

      const recalculated = calculateWeek(1, '2026-10-01', '2026-10-07', 2000, true, '2026-10-07T20:00:00', updatedTxns);
      expect(recalculated.actualSpending).toBe(1700);
      expect(recalculated.remainingBudget).toBe(300);
      expect(recalculated.differencePercentage).toBe(15);
    });
  });

  // 5. Monthly Calculation Across Multiple Weeks & Month-to-Date
  describe('Monthly Calculation Across Weeks', () => {
    it('calculates monthly result (Example: Budget ₹10,000, Spent ₹8,000 -> 20% under budget)', () => {
      // 4 weeks of expenses summing to ₹8,000
      const monthlyTxns: Transaction[] = [
        // Week 1: 1600 (under 2000)
        { txn_id: 'w1', user_id: 'u1', txn_date: '2026-10-03', txn_time: '12:00:00', amount: 1600, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' },
        // Week 2: 2700 (over 2500)
        { txn_id: 'w2', user_id: 'u1', txn_date: '2026-10-10', txn_time: '12:00:00', amount: 2700, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Shopping' },
        // Week 3: 1700 (under 2000)
        { txn_id: 'w3', user_id: 'u1', txn_date: '2026-10-17', txn_time: '12:00:00', amount: 1700, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' },
        // Week 4: 2000 (under 2500)
        { txn_id: 'w4', user_id: 'u1', txn_date: '2026-10-24', txn_time: '12:00:00', amount: 2000, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Bills' },
      ];

      // Mark all 4 weeks completed
      const completedBudgets = sampleWeeklyBudgets.map((b) => ({ ...b, is_completed: true }));

      const monthlyRes = calculateMonthly(10000, completedBudgets, monthlyTxns);
      expect(monthlyRes.monthlyBudget).toBe(10000);
      expect(monthlyRes.totalEligibleSpending).toBe(8000); // 1600+2700+1700+2000 = 8000
      expect(monthlyRes.monthlyDifference).toBe(2000); // 10000 - 8000 = 2000
      expect(monthlyRes.monthlyPercentage).toBe(20); // 2000 / 10000 * 100 = 20%
      expect(monthlyRes.isUnderBudget).toBe(true);
      expect(monthlyRes.allWeeksCompleted).toBe(true);
      expect(monthlyRes.weeklyWinsCount).toBe(3); // W1, W3, W4 won
      expect(monthlyRes.statusLabel).toBe('Final Monthly Result');
      expect(monthlyRes.headlineMessage).toContain('You finished the month 20% under budget!');
    });

    it('clearly distinguishes provisional month-to-date when some weeks are incomplete', () => {
      const partialTxns: Transaction[] = [
        { txn_id: 'w1', user_id: 'u1', txn_date: '2026-10-03', txn_time: '12:00:00', amount: 1600, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' },
        { txn_id: 'w2', user_id: 'u1', txn_date: '2026-10-10', txn_time: '12:00:00', amount: 1000, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Shopping' },
      ];

      // Only Week 1 completed
      const partialBudgets = [
        { ...sampleWeeklyBudgets[0], is_completed: true },
        { ...sampleWeeklyBudgets[1], is_completed: false },
        { ...sampleWeeklyBudgets[2], is_completed: false },
        { ...sampleWeeklyBudgets[3], is_completed: false },
      ];

      const monthlyRes = calculateMonthly(10000, partialBudgets, partialTxns);
      expect(monthlyRes.allWeeksCompleted).toBe(false);
      expect(monthlyRes.completedWeeksCount).toBe(1);
      expect(monthlyRes.statusLabel).toBe('Month-to-Date (Provisional)');
      expect(monthlyRes.totalEligibleSpending).toBe(2600);
      expect(monthlyRes.monthlyDifference).toBe(7400); // 10000 - 2600 = 7400
      expect(monthlyRes.headlineMessage).toContain('Currently 74% under budget month-to-date');
    });
  });
});
