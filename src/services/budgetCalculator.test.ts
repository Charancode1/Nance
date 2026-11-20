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

describe('Mobile-First Weekly Habit Tracker Calculation Engine', () => {
  const sampleWeeklyBudgets: Budget[] = [
    { budget_id: 'b_w1', user_id: 'u1', period_type: 'weekly', week_index: 1, amount: 2000, from_date: '2026-10-01', to_date: '2026-10-07', is_completed: false },
    { budget_id: 'b_w2', user_id: 'u1', period_type: 'weekly', week_index: 2, amount: 2500, from_date: '2026-10-08', to_date: '2026-10-14', is_completed: false },
    { budget_id: 'b_w3', user_id: 'u1', period_type: 'weekly', week_index: 3, amount: 2000, from_date: '2026-10-15', to_date: '2026-10-21', is_completed: false },
    { budget_id: 'b_w4', user_id: 'u1', period_type: 'weekly', week_index: 4, amount: 2500, from_date: '2026-10-22', to_date: '2026-10-28', is_completed: false },
  ];

  // 1. Transaction Eligibility & Exclusions
  describe('Transaction Eligibility & Exclusions', () => {
    it('includes valid spending categories from schema', () => {
      const categories = ['Food & Dining', 'Groceries', 'Shopping', 'Bills', 'Transportation'];
      for (const cat of categories) {
        const tx: Transaction = {
          txn_id: `tx_${cat}`,
          user_id: 'u1',
          txn_date: '2026-10-03',
          txn_time: '12:00:00',
          amount: 150,
          transaction_type: 'debit',
          payment_mode: 'UPI',
          main_category: cat,
        };
        expect(isEligibleTransaction(tx)).toBe(true);
        expect(getExclusionReason(tx)).toBeNull();
      }
    });

    it('excludes money movements to avoid distorted spending and double-counting', () => {
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
  });

  // 2. Category Breakdown
  describe('Category Breakdown', () => {
    it('groups expenses by category with accurate percentages and counts', () => {
      const txns: Transaction[] = [
        { txn_id: '1', user_id: 'u1', txn_date: '2026-10-02', txn_time: '10:00:00', amount: 450, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' },
        { txn_id: '2', user_id: 'u1', txn_date: '2026-10-03', txn_time: '11:00:00', amount: 500, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' },
        { txn_id: '3', user_id: 'u1', txn_date: '2026-10-04', txn_time: '12:00:00', amount: 200, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Transportation' },
        { txn_id: '4', user_id: 'u1', txn_date: '2026-10-05', txn_time: '13:00:00', amount: 150, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Shopping' },
      ];

      const breakdown = calculateCategoryBreakdown(txns);
      expect(breakdown.length).toBe(4);
      expect(breakdown[0].category).toBe('Groceries');
      expect(breakdown[0].amount).toBe(500);
      expect(breakdown[1].category).toBe('Food & Dining');
      expect(breakdown[1].amount).toBe(450);
    });
  });

  // 3. Weekly Calculations: Under Budget vs Over Budget
  describe('Weekly Box & Calculations', () => {
    it('calculates 20% under budget (+20% Saved) for Week 1', () => {
      const txns: Transaction[] = [
        { txn_id: 'w1_1', user_id: 'u1', txn_date: '2026-10-02', txn_time: '10:00:00', amount: 1000, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' },
        { txn_id: 'w1_2', user_id: 'u1', txn_date: '2026-10-04', txn_time: '12:00:00', amount: 600, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' },
      ];

      const res = calculateWeek(1, '2026-10-01', '2026-10-07', 2000, true, '2026-10-07T21:00:00Z', txns);
      expect(res.actualSpending).toBe(1600);
      expect(res.remainingBudget).toBe(400);
      expect(res.differencePercentage).toBe(20);
      expect(res.isUnderBudget).toBe(true);
      expect(res.boxLabel).toBe('+20% Saved');
      expect(res.resultStatus).toBe('win');
    });

    it('calculates 8% over budget (8% Over) for Week 2', () => {
      const txns: Transaction[] = [
        { txn_id: 'w2_1', user_id: 'u1', txn_date: '2026-10-09', txn_time: '12:00:00', amount: 2700, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Shopping' },
      ];

      const res = calculateWeek(2, '2026-10-08', '2026-10-14', 2500, true, '2026-10-14T21:00:00Z', txns);
      expect(res.actualSpending).toBe(2700);
      expect(res.remainingBudget).toBe(-200);
      expect(res.differencePercentage).toBe(8); // (200 / 2500) * 100 = 8%
      expect(res.isUnderBudget).toBe(false);
      expect(res.boxLabel).toBe('8% Over');
      expect(res.resultStatus).toBe('over');
      expect(res.resultMessage).toContain("A little over budget this week. Don't worry!");
    });
  });

  // 4. Monthly Calculation Using ONLY Completed Weeks (Section 3 Requirement)
  describe('Monthly Progress: Percentage First (Completed Weeks Formula)', () => {
    it('correctly calculates 7.7% Saved So Far using 3 completed weeks', () => {
      // Prompt Section 3 example:
      // Week 1: Budget ₹2,000, spent ₹1,600.
      // Week 2: Budget ₹2,500, spent ₹2,700.
      // Week 3: Budget ₹2,000, spent ₹1,700.
      // Week 4: Not completed.
      // Total completed weekly budget = ₹6,500.
      // Total spending = ₹6,000.
      // Monthly-to-date progress = 7.69% under budget -> approx 7.7% Saved So Far.
      const txns: Transaction[] = [
        { txn_id: 'w1', user_id: 'u1', txn_date: '2026-10-03', txn_time: '12:00:00', amount: 1600, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' },
        { txn_id: 'w2', user_id: 'u1', txn_date: '2026-10-10', txn_time: '12:00:00', amount: 2700, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Shopping' },
        { txn_id: 'w3', user_id: 'u1', txn_date: '2026-10-17', txn_time: '12:00:00', amount: 1700, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' },
        // Week 4 transaction (week is not completed yet)
        { txn_id: 'w4', user_id: 'u1', txn_date: '2026-10-24', txn_time: '12:00:00', amount: 500, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' },
      ];

      const budgets: Budget[] = [
        { ...sampleWeeklyBudgets[0], is_completed: true },
        { ...sampleWeeklyBudgets[1], is_completed: true },
        { ...sampleWeeklyBudgets[2], is_completed: true },
        { ...sampleWeeklyBudgets[3], is_completed: false },
      ];

      const monthlyRes = calculateMonthly(10000, budgets, txns);
      expect(monthlyRes.completedWeeklyBudget).toBe(6500); // 2000 + 2500 + 2000
      expect(monthlyRes.completedWeeklySpending).toBe(6000); // 1600 + 2700 + 1700
      expect(monthlyRes.completedDifference).toBe(500); // 6500 - 6000 = 500
      expect(monthlyRes.monthlyProgressPercentage).toBe(7.7); // (500 / 6500) * 100 = 7.69% -> 7.7%
      expect(monthlyRes.completedWeeksCount).toBe(3);
      expect(monthlyRes.headlineMessage).toBe('7.7% SAVED SO FAR');
      expect(monthlyRes.subMessage).toBe('You are doing great! Keep your momentum going.');
    });

    it('correctly calculates 11.1% Saved for Final Monthly Completion (Section 6 Requirement)', () => {
      // Prompt Section 6 example:
      // Week 1: ₹2,000 budget, ₹1,600 spent
      // Week 2: ₹2,500 budget, ₹2,700 spent
      // Week 3: ₹2,000 budget, ₹1,700 spent
      // Week 4: ₹2,500 budget, ₹2,000 spent
      // Total: ₹9,000 budget, ₹8,000 spending
      // Final result: ((9000 - 8000) / 9000) * 100 = 11.11% -> 11.1%
      const txns: Transaction[] = [
        { txn_id: 'w1', user_id: 'u1', txn_date: '2026-10-03', txn_time: '12:00:00', amount: 1600, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' },
        { txn_id: 'w2', user_id: 'u1', txn_date: '2026-10-10', txn_time: '12:00:00', amount: 2700, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Shopping' },
        { txn_id: 'w3', user_id: 'u1', txn_date: '2026-10-17', txn_time: '12:00:00', amount: 1700, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' },
        { txn_id: 'w4', user_id: 'u1', txn_date: '2026-10-24', txn_time: '12:00:00', amount: 2000, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Bills' },
      ];

      const budgets: Budget[] = sampleWeeklyBudgets.map((b) => ({ ...b, is_completed: true }));

      const monthlyRes = calculateMonthly(10000, budgets, txns);
      expect(monthlyRes.completedWeeklyBudget).toBe(9000); // 2000 + 2500 + 2000 + 2500
      expect(monthlyRes.completedWeeklySpending).toBe(8000); // 1600 + 2700 + 1700 + 2000
      expect(monthlyRes.completedDifference).toBe(1000);
      expect(monthlyRes.monthlyProgressPercentage).toBe(11.1); // 1000 / 9000 * 100 = 11.11% -> 11.1%
      expect(monthlyRes.allWeeksCompleted).toBe(true);
      expect(monthlyRes.headlineMessage).toBe('11.1% BUDGET SAVED THIS MONTH!');
      expect(monthlyRes.weeklyWinsCount).toBe(3); // W1, W3, W4 won
    });

    it('shows friendly starting state when 0 weeks are completed', () => {
      const budgets: Budget[] = sampleWeeklyBudgets.map((b) => ({ ...b, is_completed: false }));
      const monthlyRes = calculateMonthly(10000, budgets, []);
      expect(monthlyRes.completedWeeksCount).toBe(0);
      expect(monthlyRes.monthlyProgressPercentage).toBe(0);
      expect(monthlyRes.headlineMessage).toBe('START YOUR FIRST WEEK');
      expect(monthlyRes.subMessage).toBe('Your first weekly win starts here!');
    });
  });

  // 5. Recovery Logic
  describe('Recovery Logic Verification (Section 7 Requirement)', () => {
    it('demonstrates that overspending reduces running progress without erasing it, and subsequent weeks recover', () => {
      // Example from Section 7:
      // Week 1: +₹400 under budget
      // Week 2: -₹200 over budget
      // Week 3: +₹300 under budget
      // Week 4: +₹200 under budget
      // Running net: +400 -> +200 -> +500 -> +700
      const txns: Transaction[] = [
        { txn_id: 'w1', user_id: 'u1', txn_date: '2026-10-03', txn_time: '12:00:00', amount: 1600, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' }, // budget 2000 -> +400
        { txn_id: 'w2', user_id: 'u1', txn_date: '2026-10-10', txn_time: '12:00:00', amount: 2700, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Shopping' }, // budget 2500 -> -200
        { txn_id: 'w3', user_id: 'u1', txn_date: '2026-10-17', txn_time: '12:00:00', amount: 1700, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' }, // budget 2000 -> +300
        { txn_id: 'w4', user_id: 'u1', txn_date: '2026-10-24', txn_time: '12:00:00', amount: 2300, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Bills' }, // budget 2500 -> +200
      ];

      const budgets: Budget[] = sampleWeeklyBudgets.map((b) => ({ ...b, is_completed: true }));
      const monthlyRes = calculateMonthly(10000, budgets, txns);

      expect(monthlyRes.recoveryPoints.length).toBe(4);
      expect(monthlyRes.recoveryPoints[0].runningCumulativeNet).toBe(400);
      expect(monthlyRes.recoveryPoints[1].runningCumulativeNet).toBe(200); // 400 - 200 = 200 (overspent, not erased!)
      expect(monthlyRes.recoveryPoints[2].runningCumulativeNet).toBe(500); // 200 + 300 = 500 (recovered!)
      expect(monthlyRes.recoveryPoints[2].isRecovered).toBe(true);
      expect(monthlyRes.recoveryPoints[3].runningCumulativeNet).toBe(700); // 500 + 200 = 700
    });
  });
});
