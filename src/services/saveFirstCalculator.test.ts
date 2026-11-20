import { describe, it, expect } from 'vitest';
import {
  calculateWeeklySavings,
  calculateMonthlySavings,
} from './saveFirstCalculator';
import { WeeklySavingsBudget } from '../types/saveFirst';
import { Transaction } from '../types';

describe('Save First Habit Feature - Automatic Savings Logic Tests', () => {
  // Scenario 1: ₹1,000 budget, ₹100 goal, ₹900 spent → ₹100 saved, goal achieved
  it('Scenario 1: ₹1,000 budget, ₹100 goal, ₹900 spent → ₹100 saved, goal achieved', () => {
    const txns: Transaction[] = [
      { txn_id: 't1', user_id: 'u1', txn_date: '2026-10-02', txn_time: '12:00:00', amount: 900, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' },
    ];

    const res = calculateWeeklySavings(1, '2026-10-01', '2026-10-07', 1000, 100, true, '2026-10-07T21:00:00Z', txns);

    expect(res.budgetAmount).toBe(1000);
    expect(res.savingsGoal).toBe(100);
    expect(res.spendingLimit).toBe(900); // 1000 - 100
    expect(res.actualSpending).toBe(900);
    expect(res.amountSaved).toBe(100); // max(0, 1000 - 900) = 100
    expect(res.extraSaved).toBe(0);
    expect(res.shortfall).toBe(0);
    expect(res.savingsPercentage).toBe(100);
    expect(res.isGoalAchieved).toBe(true);
    expect(res.resultStatus).toBe('achieved');
    expect(res.resultMessage).toContain('Congratulations! 🎉 You set aside ₹100 this week. Your savings goal is achieved!');
  });

  // Scenario 2: ₹1,000 budget, ₹100 goal, ₹850 spent → ₹150 saved, ₹50 extra
  it('Scenario 2: ₹1,000 budget, ₹100 goal, ₹850 spent → ₹150 saved, ₹50 extra', () => {
    const txns: Transaction[] = [
      { txn_id: 't2', user_id: 'u1', txn_date: '2026-10-03', txn_time: '14:00:00', amount: 850, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' },
    ];

    const res = calculateWeeklySavings(1, '2026-10-01', '2026-10-07', 1000, 100, true, '2026-10-07T21:00:00Z', txns);

    expect(res.actualSpending).toBe(850);
    expect(res.amountSaved).toBe(150); // max(0, 1000 - 850) = 150
    expect(res.extraSaved).toBe(50); // 150 - 100 = 50 extra!
    expect(res.shortfall).toBe(0);
    expect(res.savingsPercentage).toBe(150);
    expect(res.isGoalAchieved).toBe(true);
    expect(res.resultStatus).toBe('achieved');
    expect(res.boxLabel).toBe('+₹50 Extra!');
    expect(res.resultMessage).toContain('₹50 extra saved!');
  });

  // Scenario 3: ₹1,000 budget, ₹100 goal, ₹950 spent → ₹50 saved, goal not achieved
  it('Scenario 3: ₹1,000 budget, ₹100 goal, ₹950 spent → ₹50 saved, goal not achieved', () => {
    const txns: Transaction[] = [
      { txn_id: 't3', user_id: 'u1', txn_date: '2026-10-04', txn_time: '16:00:00', amount: 950, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Shopping' },
    ];

    const res = calculateWeeklySavings(1, '2026-10-01', '2026-10-07', 1000, 100, true, '2026-10-07T21:00:00Z', txns);

    expect(res.actualSpending).toBe(950);
    expect(res.amountSaved).toBe(50); // max(0, 1000 - 950) = 50
    expect(res.extraSaved).toBe(0);
    expect(res.shortfall).toBe(50); // 100 - 50 = 50 short
    expect(res.savingsPercentage).toBe(50);
    expect(res.isGoalAchieved).toBe(false);
    expect(res.isPartiallyAchieved).toBe(true);
    expect(res.resultStatus).toBe('partial');
    expect(res.resultMessage).toContain("You're getting there! You managed to keep ₹50 aside this week. You were ₹50 short of your goal.");
  });

  // Scenario 4: ₹1,000 budget, ₹100 goal, ₹1,050 spent → ₹0 saved, overspent by ₹50
  it('Scenario 4: ₹1,000 budget, ₹100 goal, ₹1,050 spent → ₹0 saved, overspent by ₹50', () => {
    const txns: Transaction[] = [
      { txn_id: 't4', user_id: 'u1', txn_date: '2026-10-05', txn_time: '18:00:00', amount: 1050, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Bills' },
    ];

    const res = calculateWeeklySavings(1, '2026-10-01', '2026-10-07', 1000, 100, true, '2026-10-07T21:00:00Z', txns);

    expect(res.actualSpending).toBe(1050);
    expect(res.amountSaved).toBe(0); // max(0, 1000 - 1050) = 0 (prevents negative savings)
    expect(res.overspentAmount).toBe(50);
    expect(res.savingsPercentage).toBe(0);
    expect(res.isGoalAchieved).toBe(false);
    expect(res.isPartiallyAchieved).toBe(false);
    expect(res.isOverspent).toBe(true);
    expect(res.resultStatus).toBe('missed');
    expect(res.resultMessage).toContain("Don't worry! This week didn't go as planned. Every new week is another opportunity to save. Keep going!");
  });

  // Scenario 5: ₹0 budget → neutral state, no false savings
  it('Scenario 5: ₹0 budget produces neutral state without division-by-zero or false wins', () => {
    const res = calculateWeeklySavings(1, '2026-10-01', '2026-10-07', 0, 0, false, undefined, []);

    expect(res.budgetAmount).toBe(0);
    expect(res.savingsGoal).toBe(0);
    expect(res.spendingLimit).toBe(0);
    expect(res.amountSaved).toBe(0);
    expect(res.savingsPercentage).toBe(0);
    expect(isNaN(res.savingsPercentage)).toBe(false);
    expect(res.isGoalAchieved).toBe(false);
    expect(res.boxLabel).toBe('Not Set');
    expect(res.resultMessage).toBe('Set your weekly budget and savings goal to start.');
  });

  // Scenario 6 & Section 5: Monthly summary calculates total amount kept aside across completed weeks only
  it('Scenario 6: Monthly summary counts ONLY completed weeks (e.g. ₹100, ₹150, ₹50, ₹200 = ₹500)', () => {
    // Prompt Section 5 Example:
    // Week 1: ₹100 kept aside
    // Week 2: ₹150 kept aside
    // Week 3: ₹50 kept aside
    // Week 4: ₹200 kept aside (budget 1000, spent 800)
    // Total kept aside: ₹500
    // Total completed budget: ₹4000
    // Percentage of budget kept aside: (500 / 4000) * 100 = 12.5%
    const budgets: WeeklySavingsBudget[] = [
      { budget_id: 'w1', week_index: 1, from_date: '2026-10-01', to_date: '2026-10-07', budget_amount: 1000, savings_target: 100, is_completed: true },
      { budget_id: 'w2', week_index: 2, from_date: '2026-10-08', to_date: '2026-10-14', budget_amount: 1000, savings_target: 100, is_completed: true },
      { budget_id: 'w3', week_index: 3, from_date: '2026-10-15', to_date: '2026-10-21', budget_amount: 1000, savings_target: 100, is_completed: true },
      { budget_id: 'w4', week_index: 4, from_date: '2026-10-22', to_date: '2026-10-28', budget_amount: 1000, savings_target: 100, is_completed: true },
    ];

    const txns: Transaction[] = [
      { txn_id: 't1', user_id: 'u1', txn_date: '2026-10-02', txn_time: '12:00:00', amount: 900, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' }, // 1000 - 900 = 100
      { txn_id: 't2', user_id: 'u1', txn_date: '2026-10-09', txn_time: '12:00:00', amount: 850, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' }, // 1000 - 850 = 150
      { txn_id: 't3', user_id: 'u1', txn_date: '2026-10-16', txn_time: '12:00:00', amount: 950, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' }, // 1000 - 950 = 50
      { txn_id: 't4', user_id: 'u1', txn_date: '2026-10-23', txn_time: '12:00:00', amount: 800, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' }, // 1000 - 800 = 200
    ];

    const monthly = calculateMonthlySavings(4000, 400, budgets, txns);
    expect(monthly.totalAmountKeptAside).toBe(500); // 100 + 150 + 50 + 200 = 500
    expect(monthly.totalCompletedBudget).toBe(4000);
    expect(monthly.percentOfBudgetKeptAside).toBe(12.5); // (500 / 4000) * 100 = 12.5%
    expect(monthly.allWeeksCompleted).toBe(true);
    expect(monthly.headlineMessage).toContain('YOU KEPT ₹500 ASIDE THIS MONTH!');
  });

  // Only completed weeks are counted in monthly summary
  it('Only counts completed weeks and excludes uncompleted weeks from monthly kept aside total', () => {
    const budgets: WeeklySavingsBudget[] = [
      { budget_id: 'w1', week_index: 1, from_date: '2026-10-01', to_date: '2026-10-07', budget_amount: 1000, savings_target: 100, is_completed: true },
      { budget_id: 'w2', week_index: 2, from_date: '2026-10-08', to_date: '2026-10-14', budget_amount: 1000, savings_target: 100, is_completed: true },
      { budget_id: 'w3', week_index: 3, from_date: '2026-10-15', to_date: '2026-10-21', budget_amount: 1000, savings_target: 100, is_completed: false }, // NOT completed
      { budget_id: 'w4', week_index: 4, from_date: '2026-10-22', to_date: '2026-10-28', budget_amount: 1000, savings_target: 100, is_completed: false }, // NOT completed
    ];

    const txns: Transaction[] = [
      { txn_id: 't1', user_id: 'u1', txn_date: '2026-10-02', txn_time: '12:00:00', amount: 900, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' }, // saved 100
      { txn_id: 't2', user_id: 'u1', txn_date: '2026-10-09', txn_time: '12:00:00', amount: 850, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' }, // saved 150
      { txn_id: 't3', user_id: 'u1', txn_date: '2026-10-16', txn_time: '12:00:00', amount: 800, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Groceries' }, // not completed
    ];

    const monthly = calculateMonthlySavings(4000, 400, budgets, txns);
    // Should ONLY count completed weeks (W1 + W2 = 100 + 150 = 250)
    expect(monthly.totalAmountKeptAside).toBe(250);
    expect(monthly.completedWeeksCount).toBe(2);
    expect(monthly.allWeeksCompleted).toBe(false);
  });

  // Pre-Completion Rule: Potential Savings and neutral encouraging message (no false 400% or "Goal Met")
  it('Pre-completion (₹0 spending): shows Potential Savings = ₹1,000, neutral message, boxLabel Not Started', () => {
    // Weekly budget: ₹1,000, Savings goal: ₹250, Actual spending: ₹0
    const res = calculateWeeklySavings(1, '2026-10-01', '2026-10-07', 1000, 250, false, undefined, []);

    expect(res.isCompleted).toBe(false);
    expect(res.potentialSavings).toBe(1000);
    expect(res.spendingLimit).toBe(750); // 1000 - 250
    expect(res.actualSpending).toBe(0);
    expect(res.boxLabel).toBe('Not Started');
    expect(res.resultMessage).toBe('Stay within your spending limit to reach your ₹250 savings goal!');
  });

  it('Pre-completion (₹530 spending): shows Potential Savings = ₹470, encouraging on-track message, boxLabel In Progress', () => {
    // Weekly budget: ₹1,000, Savings goal: ₹250, Actual spending: ₹530
    const txns: Transaction[] = [
      { txn_id: 't_demo', user_id: 'u1', txn_date: '2026-10-02', txn_time: '12:00:00', amount: 530, transaction_type: 'debit', payment_mode: 'UPI', main_category: 'Food & Dining' },
    ];

    const res = calculateWeeklySavings(1, '2026-10-01', '2026-10-07', 1000, 250, false, undefined, txns);

    expect(res.isCompleted).toBe(false);
    expect(res.potentialSavings).toBe(470); // 1000 - 530 = 470
    expect(res.actualSpending).toBe(530);
    expect(res.boxLabel).toBe('In Progress');
    expect(res.resultMessage).toBe("You're on track! Keep spending mindfully to reach your savings goal.");
  });
});
