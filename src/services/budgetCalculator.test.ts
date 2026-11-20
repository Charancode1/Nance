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

  // 6. User-Controlled Custom & Independent Weekly Budgets
  describe('User-Controlled Custom & Independent Weekly Budgets', () => {
    it('supports unequal weekly budget allocations (e.g. ₹4,000 rent in Week 1, ₹2,000 in subsequent weeks)', () => {
      // User sets Monthly: ₹10,000
      // Week 1: ₹4,000 (higher for PG rent/deposit)
      // Week 2: ₹2,000
      // Week 3: ₹2,000
      // Week 4: ₹2,000
      // Total = ₹10,000
      const customBudgets: Budget[] = [
        { budget_id: 'b1', user_id: 'u1', period_type: 'weekly', week_index: 1, amount: 4000, from_date: '2026-10-01', to_date: '2026-10-07', is_completed: true },
        { budget_id: 'b2', user_id: 'u1', period_type: 'weekly', week_index: 2, amount: 2000, from_date: '2026-10-08', to_date: '2026-10-14', is_completed: true },
        { budget_id: 'b3', user_id: 'u1', period_type: 'weekly', week_index: 3, amount: 2000, from_date: '2026-10-15', to_date: '2026-10-21', is_completed: false },
        { budget_id: 'b4', user_id: 'u1', period_type: 'weekly', week_index: 4, amount: 2000, from_date: '2026-10-22', to_date: '2026-10-28', is_completed: false },
      ];

      const txns: Transaction[] = [
        // Week 1: spends 3600 of 4000 budget -> under by 400 (10% under budget)
        { txn_id: 'w1_tx1', user_id: 'u1', txn_date: '2026-10-02', txn_time: '10:00:00', amount: 3600, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Bills' },
        // Week 2: spends 2100 of 2000 budget -> over by 100 (5% over budget)
        { txn_id: 'w2_tx1', user_id: 'u1', txn_date: '2026-10-09', txn_time: '12:00:00', amount: 2100, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' },
      ];

      const monthlyRes = calculateMonthly(10000, customBudgets, txns);

      // Verify Week 1
      const w1 = monthlyRes.weeks[0];
      expect(w1.budgetAmount).toBe(4000);
      expect(w1.actualSpending).toBe(3600);
      expect(w1.remainingBudget).toBe(400);
      expect(w1.differencePercentage).toBe(10); // (400 / 4000) * 100 = 10%
      expect(w1.isUnderBudget).toBe(true);
      expect(w1.boxLabel).toBe('+10% Saved');

      // Verify Week 2
      const w2 = monthlyRes.weeks[1];
      expect(w2.budgetAmount).toBe(2000);
      expect(w2.actualSpending).toBe(2100);
      expect(w2.remainingBudget).toBe(-100);
      expect(w2.differencePercentage).toBe(5); // (100 / 2000) * 100 = 5%
      expect(w2.isUnderBudget).toBe(false);
      expect(w2.boxLabel).toBe('5% Over');

      // Verify Monthly Progress from Completed Weeks:
      // Total completed budget = 4000 + 2000 = 6000
      // Total completed spending = 3600 + 2100 = 5700
      // Net saved = 300
      // Percentage = (300 / 6000) * 100 = 5.0%
      expect(monthlyRes.completedWeeklyBudget).toBe(6000);
      expect(monthlyRes.completedWeeklySpending).toBe(5700);
      expect(monthlyRes.completedDifference).toBe(300);
      expect(monthlyRes.monthlyProgressPercentage).toBe(5.0);
      expect(monthlyRes.headlineMessage).toBe('5% SAVED SO FAR');
    });

    it('retains completed week historical budgets and results even if user reallocates upcoming weeks', () => {
      // Suppose Week 1 was completed with budget ₹4,000, actual ₹3,600 (+10% Saved).
      // User then updates remaining budget: Week 3 = ₹3,000, Week 4 = ₹1,000.
      const initialCompletedW1: Budget = {
        budget_id: 'b1',
        user_id: 'u1',
        period_type: 'weekly',
        week_index: 1,
        amount: 4000,
        from_date: '2026-10-01',
        to_date: '2026-10-07',
        is_completed: true,
        completed_at: '2026-10-07T20:00:00Z',
      };

      const updatedBudgets: Budget[] = [
        initialCompletedW1, // Week 1 is locked with original 4000
        { budget_id: 'b2', user_id: 'u1', period_type: 'weekly', week_index: 2, amount: 2000, from_date: '2026-10-08', to_date: '2026-10-14', is_completed: false },
        { budget_id: 'b3', user_id: 'u1', period_type: 'weekly', week_index: 3, amount: 3000, from_date: '2026-10-15', to_date: '2026-10-21', is_completed: false }, // increased
        { budget_id: 'b4', user_id: 'u1', period_type: 'weekly', week_index: 4, amount: 1000, from_date: '2026-10-22', to_date: '2026-10-28', is_completed: false }, // decreased
      ];

      const txns: Transaction[] = [
        { txn_id: 'w1_tx1', user_id: 'u1', txn_date: '2026-10-02', txn_time: '10:00:00', amount: 3600, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Bills' },
      ];

      const res = calculateMonthly(10000, updatedBudgets, txns);
      expect(res.weeks[0].budgetAmount).toBe(4000);
      expect(res.weeks[0].differencePercentage).toBe(10);
      expect(res.weeks[0].boxLabel).toBe('+10% Saved');
      expect(res.weeks[2].budgetAmount).toBe(3000);
      expect(res.weeks[3].budgetAmount).toBe(1000);
    });
  });

  // 7. Initial ₹0 Budget, Week 1 Editing & Zero-Budget Safety
  describe('Initial ₹0 Default Budgets & Zero-Budget Safety', () => {
    const zeroWeeklyBudgets: Budget[] = [
      { budget_id: 'b1', user_id: 'u1', period_type: 'weekly', week_index: 1, amount: 0, from_date: '2026-10-01', to_date: '2026-10-07', is_completed: false },
      { budget_id: 'b2', user_id: 'u1', period_type: 'weekly', week_index: 2, amount: 0, from_date: '2026-10-08', to_date: '2026-10-14', is_completed: false },
      { budget_id: 'b3', user_id: 'u1', period_type: 'weekly', week_index: 3, amount: 0, from_date: '2026-10-15', to_date: '2026-10-21', is_completed: false },
      { budget_id: 'b4', user_id: 'u1', period_type: 'weekly', week_index: 4, amount: 0, from_date: '2026-10-22', to_date: '2026-10-28', is_completed: false },
    ];

    it('Scenario 1: completely new user starts with ₹0 budgets and receives safe neutral states', () => {
      const res = calculateMonthly(0, zeroWeeklyBudgets, []);

      // Check all weeks
      for (const w of res.weeks) {
        expect(w.budgetAmount).toBe(0);
        expect(w.actualSpending).toBe(0);
        expect(w.differencePercentage).toBe(0);
        expect(w.spendingPercentage).toBe(0);
        expect(isNaN(w.differencePercentage)).toBe(false);
        expect(isFinite(w.differencePercentage)).toBe(true);
        expect(w.boxLabel).toBe('Not Set');
        expect(w.resultMessage).toBe('Set your weekly budget to start.');
        expect(w.isCompleted).toBe(false);
      }

      // Monthly neutral state
      expect(res.completedWeeklyBudget).toBe(0);
      expect(res.monthlyProgressPercentage).toBe(0);
      expect(isNaN(res.monthlyProgressPercentage)).toBe(false);
      expect(res.headlineMessage).toBe('SET YOUR BUDGET TO START');
      expect(res.subMessage).toBe('Set your monthly and weekly budgets to start tracking.');
    });

    it('Scenario 2 & 3: Week 1 is editable before completion and saves budget changes', () => {
      // User sets Week 1 to ₹2,500, then edits to ₹3,000 before finishing
      const updatedBudgets: Budget[] = [
        { ...zeroWeeklyBudgets[0], amount: 3000 },
        { ...zeroWeeklyBudgets[1], amount: 2000 },
        { ...zeroWeeklyBudgets[2], amount: 2000 },
        { ...zeroWeeklyBudgets[3], amount: 2000 },
      ];

      const txns: Transaction[] = [
        { txn_id: 'tx_w1', user_id: 'u1', txn_date: '2026-10-02', txn_time: '12:00:00', amount: 2400, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' },
      ];

      const res = calculateMonthly(9000, updatedBudgets, txns);
      const w1 = res.weeks[0];
      expect(w1.budgetAmount).toBe(3000);
      expect(w1.actualSpending).toBe(2400);
      expect(w1.remainingBudget).toBe(600);
      expect(w1.differencePercentage).toBe(20); // (600 / 3000) * 100 = 20%
    });

    it('Scenario 5: Adding expenses without configuring budget never produces NaN or false wins', () => {
      const txns: Transaction[] = [
        { txn_id: 'tx_nobudget', user_id: 'u1', txn_date: '2026-10-03', txn_time: '15:00:00', amount: 500, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' },
      ];

      const res = calculateMonthly(0, zeroWeeklyBudgets, txns);
      const w1 = res.weeks[0];
      expect(w1.budgetAmount).toBe(0);
      expect(w1.actualSpending).toBe(500);
      expect(w1.categoryBreakdown.length).toBe(1);
      expect(w1.categoryBreakdown[0].category).toBe('Food & Dining');
      expect(w1.categoryBreakdown[0].amount).toBe(500);
      expect(w1.categoryBreakdown[0].percentageOfTotal).toBe(100);

      // Verify no NaN or false savings
      expect(w1.differencePercentage).toBe(0);
      expect(isNaN(w1.differencePercentage)).toBe(false);
      expect(w1.boxLabel).toBe('In Progress');
      expect(w1.resultMessage).toContain('₹500 spent. Set your weekly budget to track savings.');
    });

    it('Scenario 7 & 8: Completing Week 1 locks its result while Week 2 remains editable', () => {
      const budgets: Budget[] = [
        { ...zeroWeeklyBudgets[0], amount: 2000, is_completed: true, completed_at: '2026-10-07T20:00:00Z' },
        { ...zeroWeeklyBudgets[1], amount: 2500, is_completed: false },
        { ...zeroWeeklyBudgets[2], amount: 2000, is_completed: false },
        { ...zeroWeeklyBudgets[3], amount: 2500, is_completed: false },
      ];

      const txns: Transaction[] = [
        { txn_id: 'tx_w1', user_id: 'u1', txn_date: '2026-10-03', txn_time: '12:00:00', amount: 1600, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' },
      ];

      const res = calculateMonthly(9000, budgets, txns);
      expect(res.weeks[0].isCompleted).toBe(true);
      expect(res.weeks[0].boxLabel).toBe('+20% Saved');
      expect(res.weeks[0].resultStatus).toBe('win');

      // Week 2 is in progress / upcoming, NOT completed
      expect(res.weeks[1].isCompleted).toBe(false);
      expect(res.weeks[1].budgetAmount).toBe(2500);
    });
  });
});
